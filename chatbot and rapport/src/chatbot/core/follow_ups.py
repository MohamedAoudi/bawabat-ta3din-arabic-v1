"""
Follow-up suggestion engine for the AMIP chatbot.

Generates up to three clickable, self-contained follow-up queries after every
answer. Clicking a suggestion simply re-sends its text as the next user
message, so each suggestion is a real natural-language query that flows back
through the normal pipeline (intent classification → entity detection →
handler). No new endpoint or special protocol is required.

Design (adapted from a single-domain reference, hardened for AMIP):
  * Deterministic — no LLM. A stable hash of the query context seeds which
    "other" entity is offered, so the same question always yields the same
    chips (testable), while different questions vary.
  * Trilingual (ar / fr / en). French phrasing uses dashes / parentheticals to
    avoid gendered country prepositions; Arabic uses the invariant "في".
  * Grounded — swap pools contain only well-populated minerals / countries
    (verified against live row counts), so a clicked chip never dead-ends on
    empty data. This also lets a *no-data* chart recover by suggesting
    populated alternatives.
  * Every CHART suggestion embeds an explicit chart-type keyword recognised by
    both the intent classifier (forces CHART routing) and the chart handler's
    `_detect_chart_request` (sets the chart type).
"""

from __future__ import annotations

import hashlib
import re
import unicodedata
from typing import Any, Optional

from src.chatbot.core.chart_handler import (
    _COUNTRIES,
    _MINERALS,
    _PRODUCT_HINTS,
    _detect_entities,
    _detect_year,
)

_LANGS = frozenset({"ar", "fr", "en"})
_DEFAULT_YEAR = 2023
_LIMIT = 3

# ---------------------------------------------------------------------------
# Grounded entity pools — ordered by live DB data richness (richest first).
# Swaps draw from these so a suggested chip always lands on populated data.
# ---------------------------------------------------------------------------
_RICH_MINERALS = ["phosphate", "gold", "iron", "gypsum", "salt", "cement"]
_RICH_PROD_COUNTRIES = ["Saudi Arabia", "Egypt", "Algeria", "Morocco", "Oman", "Tunisia"]
_RICH_TRADE_COUNTRIES = ["United Arab Emirates", "Egypt", "Morocco", "Tunisia", "Oman", "Saudi Arabia"]

# Clean trilingual display names (the chart filters store these canonical keys).
_MINERAL_DISPLAY: dict[str, dict[str, str]] = {
    "phosphate": {"en": "phosphate", "fr": "phosphate", "ar": "الفوسفات"},
    "gold": {"en": "gold", "fr": "or", "ar": "الذهب"},
    "iron": {"en": "iron ore", "fr": "minerai de fer", "ar": "خام الحديد"},
    "gypsum": {"en": "gypsum", "fr": "gypse", "ar": "الجبس"},
    "salt": {"en": "salt", "fr": "sel", "ar": "الملح"},
    "cement": {"en": "cement", "fr": "ciment", "ar": "الإسمنت"},
    "copper": {"en": "copper", "fr": "cuivre", "ar": "النحاس"},
    "zinc": {"en": "zinc", "fr": "zinc", "ar": "الزنك"},
}
_COUNTRY_DISPLAY: dict[str, dict[str, str]] = {
    "Morocco": {"en": "Morocco", "fr": "Maroc", "ar": "المغرب"},
    "Algeria": {"en": "Algeria", "fr": "Algérie", "ar": "الجزائر"},
    "Egypt": {"en": "Egypt", "fr": "Égypte", "ar": "مصر"},
    "Saudi Arabia": {"en": "Saudi Arabia", "fr": "Arabie saoudite", "ar": "السعودية"},
    "Tunisia": {"en": "Tunisia", "fr": "Tunisie", "ar": "تونس"},
    "Oman": {"en": "Oman", "fr": "Oman", "ar": "عُمان"},
    "United Arab Emirates": {"en": "the UAE", "fr": "Émirats arabes unis", "ar": "الإمارات"},
}

# French requires a (gendered) article before a country in a sentence position.
# Used only where the name is the grammatical subject/object of a FR question.
_FR_ARTICLE: dict[str, str] = {
    "Morocco": "le Maroc",
    "Algeria": "l'Algérie",
    "Egypt": "l'Égypte",
    "Saudi Arabia": "l'Arabie saoudite",
    "Tunisia": "la Tunisie",
    "Oman": "Oman",
    "United Arab Emirates": "les Émirats arabes unis",
}

# Chart-type keywords detected by BOTH the LLM classifier (→ forces CHART) and
# chart_handler._detect_chart_request (→ sets the type).
_KW = {
    "bar": {"en": "bar chart", "fr": "graphique à barres", "ar": "مبيان أعمدة"},
    "line": {"en": "line chart", "fr": "graphique linéaire", "ar": "مبيان خطي"},
    "table": {"en": "table", "fr": "tableau", "ar": "جدول"},
    "donut": {"en": "donut chart", "fr": "graphique circulaire", "ar": "مخطط دائري"},
}


# ---------------------------------------------------------------------------
# Normalization / hygiene (kept from the reference, trimmed)
# ---------------------------------------------------------------------------

def _normalize(text: str) -> str:
    """Fold diacritics, Arabic letter variants and casing for safe comparison."""
    if not text:
        return ""
    value = unicodedata.normalize("NFKD", str(text))
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = value.lower()
    for src, dst in {"أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا", "ى": "ي", "ة": "ه", "ـ": ""}.items():
        value = value.replace(src, dst)
    value = re.sub(r"[^\w\s؀-ۿ]", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def _lang(language: Optional[str]) -> str:
    return language if language in _LANGS else "en"


def _seed(key: str) -> int:
    return int(hashlib.md5(key.encode("utf-8")).hexdigest(), 16)


def _pick_other(pool: list[str], current: Optional[str], seed: int) -> Optional[str]:
    """Deterministically pick an entity from *pool* that differs from *current*."""
    if not pool:
        return None
    offset = seed % len(pool)
    rotated = pool[offset:] + pool[:offset]
    for item in rotated:
        if item != current:
            return item
    return rotated[0]


def _clean_and_pick(candidates: list[str], original: str, limit: int = _LIMIT) -> list[str]:
    """Drop blanks, duplicates and the user's own question; keep order; cap."""
    out: list[str] = []
    seen: set[str] = set()
    original_norm = _normalize(original)
    for cand in candidates:
        text = str(cand).strip()
        if not text:
            continue
        norm = _normalize(text)
        if not norm or norm == original_norm or norm in seen:
            continue
        seen.add(norm)
        out.append(text)
        if len(out) >= limit:
            break
    return out


def _m(key: Optional[str], lang: str) -> Optional[str]:
    if not key:
        return None
    return _MINERAL_DISPLAY.get(key, {}).get(lang, key)


def _c(name: Optional[str], lang: str) -> Optional[str]:
    if not name:
        return None
    return _COUNTRY_DISPLAY.get(name, {}).get(lang, name)


def _first(value: Any) -> Optional[str]:
    """filters_used may store a CSV (e.g. 'Morocco, Algeria'); take the first."""
    if not value:
        return None
    return str(value).split(",")[0].strip()


# ---------------------------------------------------------------------------
# Sentence builders — one localized self-contained query each.
# FR/AR append the chart keyword in parentheses to sidestep grammar agreement.
# ---------------------------------------------------------------------------

def _sug_top(mineral: str, year: int, ctype: str, lang: str) -> str:
    m, kw = _m(mineral, lang), _KW[ctype][lang]
    if lang == "ar":
        return f"أكبر منتجي {m} في {year} ({kw})"
    if lang == "fr":
        return f"Principaux producteurs de {m} en {year} ({kw})"
    return f"Top {m} producers in {year} ({kw})"


def _sug_trend(country: Optional[str], mineral: Optional[str], lang: str, ctype: str = "line") -> str:
    m, c, kw = _m(mineral, lang), _c(country, lang), _KW[ctype][lang]
    if lang == "ar":
        head = f"تطور إنتاج {m}" if m else "تطور الإنتاج"
        head += f" في {c}" if c else ""
        return f"{head} ({kw})"
    if lang == "fr":
        head = f"Évolution de la production de {m}" if m else "Évolution de la production"
        head += f" — {c}" if c else ""
        return f"{head} ({kw})"
    head = f"{m} production trend" if m else "Production trend"
    head = f"{c}'s {head}" if c else head
    return f"{head} ({kw})"


def _sug_vs_world(mineral: Optional[str], year: int, lang: str, ctype: str = "bar") -> str:
    m, kw = _m(mineral, lang), _KW[ctype][lang]
    if lang == "ar":
        subj = f"إنتاج {m}" if m else "الإنتاج"
        return f"{subj} العربي مقارنة بالعالم في {year} ({kw})"
    if lang == "fr":
        subj = f"de {m}" if m else ""
        return f"Production arabe {subj} vs mondiale en {year} ({kw})".replace("  ", " ")
    subj = f"{m} " if m else ""
    return f"Arab vs world {subj}production in {year} ({kw})".replace("  ", " ")


def _sug_partners(country: Optional[str], mineral: Optional[str], year: int, lang: str, ctype: str = "donut") -> str:
    c, m, kw = _c(country, lang), _m(mineral, lang), _KW[ctype][lang]
    if lang == "ar":
        head = f"شركاء {c} التجاريون" if c else "شركاء التجارة الثنائية"
        head += f" في {m}" if m else ""
        return f"{head} عام {year} ({kw})"
    if lang == "fr":
        head = "Partenaires commerciaux bilatéraux"
        head += f" — {c}" if c else ""
        head += f" ({m})" if m else ""
        return f"{head} en {year} ({kw})"
    head = f"{c}'s bilateral trade partners" if c else "Bilateral trade partners"
    head += f" for {m}" if m else ""
    return f"{head} in {year} ({kw})"


def _sug_trade_trend(country: Optional[str], lang: str, ctype: str = "line") -> str:
    c, kw = _c(country, lang), _KW[ctype][lang]
    if lang == "ar":
        head = f"تطور تجارة {c}" if c else "تطور التجارة"
        return f"{head} عبر السنوات ({kw})"
    if lang == "fr":
        head = f"Évolution du commerce — {c}" if c else "Évolution du commerce"
        return f"{head} ({kw})"
    head = f"{c}'s trade trend" if c else "Trade trend"
    return f"{head} over the years ({kw})"


def _sug_trade_products(country: Optional[str], year: int, lang: str, ctype: str = "bar") -> str:
    c, kw = _c(country, lang), _KW[ctype][lang]
    if lang == "ar":
        head = f"صادرات {c}" if c else "الصادرات"
        return f"{head} حسب المنتج في {year} ({kw})"
    if lang == "fr":
        head = f"Exportations par produit — {c}" if c else "Exportations par produit"
        return f"{head} en {year} ({kw})"
    head = f"{c}'s exports by product" if c else "Exports by product"
    return f"{head} in {year} ({kw})"


def _sug_summary(country: Optional[str], lang: str, ctype: str = "bar") -> str:
    c, kw = _c(country, lang), _KW[ctype][lang]
    if lang == "ar":
        head = f"ملخص تجارة {c}" if c else "ملخص التجارة"
        return f"{head} ({kw})"
    if lang == "fr":
        head = f"Résumé du commerce — {c}" if c else "Résumé du commerce"
        return f"{head} ({kw})"
    head = f"{c}'s trade summary" if c else "Trade summary"
    return f"{head} ({kw})"


def _sug_table(chart_intent: str, filters: dict[str, Any], lang: str) -> Optional[str]:
    """Re-state the *current* chart as a table (a representation switch)."""
    year = _coerce_year(filters.get("year"))
    mineral = filters.get("mineral")
    country = _first(filters.get("country"))
    if chart_intent == "top_producers" and mineral:
        return _sug_top(mineral, year, "table", lang)
    if chart_intent in {"trade_by_product"} and country:
        return _sug_trade_products(country, year, lang, ctype="table")
    if chart_intent in {"bilateral_partner_breakdown"} and country:
        return _sug_partners(country, mineral, year, lang, ctype="table")
    return None


# ---------------------------------------------------------------------------
# Per-intent candidate generation
# ---------------------------------------------------------------------------

def _coerce_year(value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return _DEFAULT_YEAR


def _chart_candidates(chart_intent: str, filters: dict[str, Any], chart_type: Optional[str], lang: str) -> list[str]:
    filters = filters or {}
    mineral = filters.get("mineral")
    country = _first(filters.get("country"))
    year = _coerce_year(filters.get("year") or filters.get("year_to"))
    seed = _seed(f"{chart_intent}|{mineral}|{country}|{year}")
    other_mineral = _pick_other(_RICH_MINERALS, mineral, seed)
    other_prod_country = _pick_other(_RICH_PROD_COUNTRIES, country, seed)
    other_trade_country = _pick_other(_RICH_TRADE_COUNTRIES, country, seed)

    out: list[str] = []
    if chart_intent == "top_producers":
        out.append(_sug_trend(None, mineral, lang))               # pivot → trend
        out.append(_sug_vs_world(mineral, year, lang))            # pivot → vs world
        if other_mineral:
            out.append(_sug_top(other_mineral, year, "bar", lang))  # swap mineral
        tbl = _sug_table("top_producers", filters, lang)
        if tbl:
            out.append(tbl)
    elif chart_intent == "production_trend":
        if other_prod_country:
            out.append(_sug_trend(other_prod_country, mineral, lang))  # swap country
        out.append(_sug_top(mineral or "phosphate", year, "bar", lang))  # pivot → ranking
        out.append(_sug_vs_world(mineral, year, lang))                   # pivot → vs world
    elif chart_intent == "production_vs_world":
        out.append(_sug_top(mineral or "phosphate", year, "bar", lang))
        out.append(_sug_trend(None, mineral, lang))
        if other_mineral:
            out.append(_sug_vs_world(other_mineral, year, lang))
    elif chart_intent == "bilateral_partner_breakdown":
        out.append(_sug_summary(country, lang))                    # pivot → summary
        out.append(_sug_trade_products(country, year, lang))       # pivot → by product
        if other_trade_country:
            out.append(_sug_partners(other_trade_country, mineral, year, lang))  # swap country
    elif chart_intent in {"trade_by_product", "trade_trend"}:
        out.append(_sug_trade_trend(country, lang) if chart_intent == "trade_by_product" else _sug_trade_products(country, year, lang))
        out.append(_sug_partners(country, None, year, lang))       # pivot → partners
        if other_trade_country:
            out.append(_sug_trade_products(other_trade_country, year, lang))
    elif chart_intent == "country_trade_summary":
        out.append(_sug_trade_trend(country, lang))
        out.append(_sug_partners(country, None, year, lang))
        if other_trade_country:
            out.append(_sug_summary(other_trade_country, lang))
    else:  # price_trend, data_quality_summary (no data) → steer to populated charts
        out.append(_sug_top("phosphate", _DEFAULT_YEAR, "bar", lang))
        out.append(_sug_trend("Morocco", "phosphate", lang))
        out.append(_sug_partners("United Arab Emirates", None, _DEFAULT_YEAR, lang))
    return out


def _detect_message_entities(message: str) -> tuple[Optional[str], Optional[str]]:
    """Light entity sniff on a free-form message (reuses the chart catalogues)."""
    countries = _detect_entities(message, _COUNTRIES)
    minerals = _detect_entities(message, _MINERALS)
    if not minerals:
        # trade questions may name a product via the product-hint catalogue
        hits = [h for h in _detect_entities(message, _PRODUCT_HINTS) if h != "minerals"]
        minerals = hits
    return (countries[0] if countries else None, minerals[0] if minerals else None)


def _sql_candidates(message: str, lang: str) -> list[str]:
    """After a text data answer, the highest-value follow-up is 'visualize this'."""
    country, mineral = _detect_message_entities(message)
    year = _detect_year(message) or _DEFAULT_YEAR
    out: list[str] = []
    if mineral:
        out.append(_sug_top(mineral, year, "bar", lang))
        if country:
            out.append(_sug_trend(country, mineral, lang))
            out.append(_sug_partners(country, mineral, year, lang))
        else:
            out.append(_sug_trend(None, mineral, lang))
            out.append(_sug_vs_world(mineral, year, lang))
    elif country:
        out.append(_sug_summary(country, lang))
        out.append(_sug_trade_partners_q(country, lang))
        out.append(_sug_top("phosphate", year, "bar", lang))
    else:
        out.extend(_starter_candidates(lang))
    return out


def _sug_trade_partners_q(country: str, lang: str) -> str:
    return _sug_partners(country, None, _DEFAULT_YEAR, lang)


def _concept_candidates(message: str, lang: str) -> list[str]:
    """After a RAG/LIST answer: a related concept question + a data pivot."""
    country, mineral = _detect_message_entities(message)
    out: list[str] = []
    if country:
        c = _c(country, lang)
        if lang == "ar":
            out.append(f"ما هي المعادن التي ينتجها {c}؟")
            out.append(f"حدثني عن قطاع التعدين في {c}")
        elif lang == "fr":
            art = _FR_ARTICLE.get(country, c)
            out.append(f"Quels minéraux produit {art} ?")
            out.append(f"Parlez-moi du secteur minier — {c}")
        else:
            out.append(f"Which minerals does {c} produce?")
            out.append(f"Tell me about {c}'s mining sector")
        out.append(_sug_summary(country, lang))
    elif mineral:
        m = _m(mineral, lang)
        if lang == "ar":
            out.append(f"ما أهمية {m} في الدول العربية؟")
        elif lang == "fr":
            out.append(f"Quelle est l'importance du {m} dans les pays arabes ?")
        else:
            out.append(f"Why does {m} matter for Arab countries?")
        out.append(_sug_top(mineral, _DEFAULT_YEAR, "bar", lang))
        out.append(_sug_trend(None, mineral, lang))
    else:
        out.extend(_starter_candidates(lang))
    return out


def _starter_candidates(lang: str) -> list[str]:
    """Conversation starters (greeting / no detectable entity)."""
    out = [
        _sug_top("phosphate", _DEFAULT_YEAR, "bar", lang),
        _sug_trend("Morocco", "phosphate", lang),
    ]
    if lang == "ar":
        out.append("ما هي الدول العربية التي تنتج الذهب؟")
    elif lang == "fr":
        out.append("Quels pays arabes produisent de l'or ?")
    else:
        out.append("Which Arab countries produce gold?")
    return out


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def suggest_follow_ups(
    *,
    intent: Optional[str],
    language: Optional[str],
    message: str = "",
    filters_used: Optional[dict[str, Any]] = None,
    chart_type: Optional[str] = None,
    chart_intent: Optional[str] = None,
    limit: int = _LIMIT,
) -> list[str]:
    """
    Return up to *limit* localized, clickable follow-up queries for a turn.

    Each suggestion is a self-contained natural-language query; the frontend
    sends it verbatim as the next message. Returns ``[]`` for intents where a
    suggestion would be noise (refusals, clarification prompts, errors).
    """
    lang = _lang(language)
    try:
        if intent == "CHART":
            candidates = _chart_candidates(chart_intent or "", filters_used or {}, chart_type, lang)
        elif intent == "SQL":
            candidates = _sql_candidates(message, lang)
        elif intent in {"RAG", "LIST"}:
            candidates = _concept_candidates(message, lang)
        elif intent == "GREETING":
            candidates = _starter_candidates(lang)
        else:  # REFUSED, ERROR, clarify, …
            return []
    except Exception:  # suggestions must never break a response
        return []
    return _clean_and_pick(candidates, message, limit=limit)
