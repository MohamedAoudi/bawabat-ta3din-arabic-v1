from __future__ import annotations

import asyncio
import logging
import re
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any

from sqlalchemy import text

from src.chatbot.config import get_engine
from src.chatbot.guardrails.sql_validator import validate_sql
from src.chatbot.i18n import t

logger = logging.getLogger(__name__)

_VALID_LANGUAGES = frozenset(["ar", "fr", "en"])
_DEFAULT_YEAR = 2023
_DEFAULT_TOP_N = 10
_MAX_CHART_ROWS = 50
_CHART_REQUESTS = frozenset(["line", "bar", "table", "donut"])

# `production_value_base` is normalised to a single base unit per measurement
# family (see pipelines/config.UNIT_DEFINITIONS and load_public_production):
# mass minerals collapse to TONNES, volume minerals to CUBIC METRES (m³). The
# DB keeps each row's *original* reported unit, so a production spec carries
# this sentinel and the real, user-facing unit is resolved from the data right
# before the response is built — internal teams never see "base unit" anymore.
_BASE_PRODUCTION_UNIT = "base production unit"
_DEFAULT_MEASUREMENT_TYPE = "mass"
_BASE_UNIT_LABELS = {
    "mass": {"en": "tonnes", "fr": "tonnes", "ar": "طن"},
    "volume": {"en": "m³", "fr": "m³", "ar": "متر مكعب"},
}
# The exact `unit_en` strings the loader stores for volume measures.
_VOLUME_UNITS_SQL = "('m³','thousand m³','million m³')"


def _measurement_type_expr(unit_col: str) -> str:
    """SQL fragment classifying a reported unit column into its base-unit family."""
    return f"CASE WHEN {unit_col} IN {_VOLUME_UNITS_SQL} THEN 'volume' ELSE 'mass' END"


def _resolve_base_unit(data: list[dict[str, Any]], language: str) -> str:
    """Pick the real production unit (tonnes / m³) from the rows' measurement type.

    Defaults to mass/tonnes when the type is unknown or rows mix families, since
    mass dominates AMIP's solid-mineral data and tonnes is the safe label.
    """
    types = {row.get("measurement_type") for row in (data or []) if row.get("measurement_type")}
    measurement = "volume" if types == {"volume"} else _DEFAULT_MEASUREMENT_TYPE
    labels = _BASE_UNIT_LABELS[measurement]
    return labels.get(language) or labels["en"]


def _display_unit(spec: "ChartSpec", data: list[dict[str, Any]], language: str) -> str:
    """Swap the internal base-unit sentinel for a user-facing real unit."""
    if spec.unit == _BASE_PRODUCTION_UNIT:
        return _resolve_base_unit(data, language)
    return spec.unit

_COUNTRIES = {
    "Morocco": {
        "en": ["morocco"],
        "fr": ["maroc"],
        "ar": ["المغرب", "مغربية"],
    },
    "Algeria": {"en": ["algeria"], "fr": ["algérie", "algerie"], "ar": ["الجزائر"]},
    "Egypt": {"en": ["egypt"], "fr": ["égypte", "egypte"], "ar": ["مصر"]},
    "Saudi Arabia": {"en": ["saudi", "saudi arabia"], "fr": ["arabie saoudite"], "ar": ["السعودية"]},
    "Tunisia": {"en": ["tunisia"], "fr": ["tunisie"], "ar": ["تونس"]},
    "Libya": {"en": ["libya"], "fr": ["libye"], "ar": ["ليبيا"]},
    "Mauritania": {"en": ["mauritania"], "fr": ["mauritanie"], "ar": ["موريتانيا"]},
    "Sudan": {"en": ["sudan"], "fr": ["soudan"], "ar": ["السودان"]},
    "United Arab Emirates": {"en": ["uae", "united arab emirates", "emirates"], "fr": ["émirats", "emirats"], "ar": ["الإمارات", "الامارات"]},
    "Qatar": {"en": ["qatar"], "fr": ["qatar"], "ar": ["قطر"]},
    "Bahrain": {"en": ["bahrain"], "fr": ["bahreïn", "bahrein"], "ar": ["البحرين"]},
    "Kuwait": {"en": ["kuwait"], "fr": ["koweït", "koweit"], "ar": ["الكويت"]},
    "Oman": {"en": ["oman"], "fr": ["oman"], "ar": ["عمان", "سلطنة عمان"]},
    "Yemen": {"en": ["yemen"], "fr": ["yémen", "yemen"], "ar": ["اليمن"]},
    "Iraq": {"en": ["iraq"], "fr": ["irak"], "ar": ["العراق"]},
    "Jordan": {"en": ["jordan"], "fr": ["jordanie"], "ar": ["الأردن", "الاردن"]},
    "Lebanon": {"en": ["lebanon"], "fr": ["liban"], "ar": ["لبنان"]},
    "Syria": {"en": ["syria"], "fr": ["syrie"], "ar": ["سوريا"]},
    "Palestine": {"en": ["palestine"], "fr": ["palestine"], "ar": ["فلسطين"]},
    "Djibouti": {"en": ["djibouti"], "fr": ["djibouti"], "ar": ["جيبوتي"]},
    "Somalia": {"en": ["somalia"], "fr": ["somalie"], "ar": ["الصومال"]},
}

_MINERALS = {
    "phosphate": {"en": ["phosphate", "phosphates", "phosophate", "phosphorous"], "fr": ["phosphate"], "ar": ["فوسفات", "الفوسفات"]},
    "iron": {"en": ["iron", "iron ore"], "fr": ["fer", "minerai de fer"], "ar": ["حديد", "خام الحديد"]},
    "gold": {"en": ["gold"], "fr": ["or"], "ar": ["ذهب", "الذهب"]},
    "copper": {"en": ["copper"], "fr": ["cuivre"], "ar": ["نحاس", "النحاس"]},
    "gypsum": {"en": ["gypsum"], "fr": ["gypse"], "ar": ["جبس", "الجبس"]},
    "salt": {"en": ["salt"], "fr": ["sel"], "ar": ["ملح", "الملح"]},
    "zinc": {"en": ["zinc"], "fr": ["zinc"], "ar": ["زنك", "الزنك"]},
    "cement": {"en": ["cement"], "fr": ["ciment"], "ar": ["أسمنت", "اسمنت", "الإسمنت"]},
}

_PRODUCT_HINTS = {
    "phosphate": _MINERALS["phosphate"],
    "iron": _MINERALS["iron"],
    "gold": _MINERALS["gold"],
    "copper": _MINERALS["copper"],
    "gypsum": _MINERALS["gypsum"],
    "salt": _MINERALS["salt"],
    "zinc": _MINERALS["zinc"],
    "cement": _MINERALS["cement"],
    "minerals": {"en": ["mineral", "minerals"], "fr": ["minéral", "minéraux"], "ar": ["معدن", "معادن", "المعدنية"]},
}

_TITLE_TEMPLATES = {
    "top_producers": {
        "en": "Top Arab Producers",
        "fr": "Principaux producteurs arabes",
        "ar": "أكبر المنتجين العرب",
    },
    "production_trend": {
        "en": "Production Trend",
        "fr": "Évolution de la production",
        "ar": "تطور الإنتاج",
    },
    "production_vs_world": {
        "en": "Arab Production vs World Production",
        "fr": "Production arabe vs production mondiale",
        "ar": "الإنتاج العربي مقارنة بالإنتاج العالمي",
    },
    "trade_trend": {
        "en": "Import/Export Trade Trend",
        "fr": "Évolution des importations/exportations",
        "ar": "تطور الواردات والصادرات",
    },
    "trade_by_product": {
        "en": "Trade by Product",
        "fr": "Commerce par produit",
        "ar": "التجارة حسب المنتج",
    },
    "bilateral_partner_breakdown": {
        "en": "Bilateral Trade Partner Breakdown",
        "fr": "Répartition des partenaires commerciaux bilatéraux",
        "ar": "توزيع شركاء التجارة الثنائية",
    },
    "country_trade_summary": {
        "en": "Country Trade Summary",
        "fr": "Résumé du commerce du pays",
        "ar": "ملخص تجارة الدولة",
    },
    "price_trend": {
        "en": "Mineral Price Trend",
        "fr": "Évolution des prix des minéraux",
        "ar": "تطور أسعار المعادن",
    },
    "data_quality_summary": {
        "en": "Data Quality Summary",
        "fr": "Résumé de la qualité des données",
        "ar": "ملخص جودة البيانات",
    },
}


@dataclass(frozen=True)
class ChartSpec:
    intent: str
    chart_type: str
    source_view: str
    x_axis: str
    y_axis: str
    unit: str
    sql: str
    filters_used: dict[str, Any] = field(default_factory=dict)
    series: list[str] = field(default_factory=list)
    title_key: str | None = None
    clarification: dict[str, Any] | None = None


def _label_expr(base: str, language: str) -> str:
    if language == "ar":
        order = [f"{base}_ar", f"{base}_en", f"{base}_fr"]
    elif language == "fr":
        order = [f"{base}_fr", f"{base}_en", f"{base}_ar"]
    else:
        order = [f"{base}_en", f"{base}_fr", f"{base}_ar"]
    return "COALESCE(" + ", ".join(order) + ")"


# Arabic attaches proclitics (و ف ل ب ك) — and the article ال — directly onto
# the following word, so a literal word boundary never survives: "لشركاء"
# ("for partners") would not match the signal "شركاء". For Arabic terms we
# allow an optional run of leading proclitic letters (plus article) before the
# term, anchored so it only fires at a word start. For ASCII we keep
# word-boundary matching but tolerate a trailing plural "s" (French
# "partenaires" vs the signal "partenaire", English "prices" vs "price").
_ARABIC_CHAR = re.compile(r"[؀-ۿ]")
_AR_PROCLITIC_PREFIX = r"(?<![؀-ۿ])[ولبكف]{0,3}(?:ال)?"


def _term_pattern(term: str) -> str:
    if _ARABIC_CHAR.search(term):
        return _AR_PROCLITIC_PREFIX + re.escape(term)
    return rf"(?<!\w){re.escape(term)}s?(?!\w)"


def _contains_any(text: str, signals: list[str]) -> bool:
    return any(re.search(_term_pattern(signal), text) for signal in signals)


def _detect_year(message: str) -> int | None:
    # Skip the first year in a range so single-year and range-start don't collide
    range_match = re.search(
        r"\b((?:19|20)\d{2})\s*(?:to|until|through|à|au|إلى|حتى|-|–)\s*((?:19|20)\d{2})\b",
        message,
    )
    if range_match:
        return None  # defer to _detect_year_range
    match = re.search(r"\b(19|20)\d{2}\b", message)
    return int(match.group(0)) if match else None


def _detect_year_range(message: str) -> tuple[int, int] | None:
    """Return (start, end) when the message contains a year range."""
    patterns = [
        r"\b((?:19|20)\d{2})\s*(?:to|until|through|à|au|إلى|حتى)\s*((?:19|20)\d{2})\b",
        r"\b((?:19|20)\d{2})\s*[-–]\s*((?:19|20)\d{2})\b",
        r"between\s+((?:19|20)\d{2})\s+and\s+((?:19|20)\d{2})",
        r"من\s+((?:19|20)\d{2})\s+(?:إلى|حتى)\s+((?:19|20)\d{2})",
    ]
    for pat in patterns:
        m = re.search(pat, message)
        if m:
            a, b = int(m.group(1)), int(m.group(2))
            return (min(a, b), max(a, b))
    return None


def _detect_top_n(message: str, default: int = _DEFAULT_TOP_N) -> int:
    lowered = message.lower()
    match = re.search(r"(?:top|أكبر|افضل|أفضل|premiers?|top)\s+(\d{1,2})", lowered)
    if not match:
        match = re.search(r"\b(\d{1,2})\b", lowered)
    if not match:
        return default
    return max(1, min(int(match.group(1)), _MAX_CHART_ROWS))


def _detect_flow(message: str) -> str | None:
    lowered = message.lower()
    export_signals = ["export", "exports", "exportations", "exportation", "صادرات", "تصدير"]
    import_signals = ["import", "imports", "importations", "importation", "واردات", "استيراد"]
    has_export = _contains_any(lowered, export_signals)
    has_import = _contains_any(lowered, import_signals)
    if has_export and not has_import:
        return "Export"
    if has_import and not has_export:
        return "Import"
    return None


def _detect_chart_request(message: str) -> str | None:
    lowered = message.lower()
    normalized = lowered.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")

    table_signals = [
        "table", "tableau", "جدول", "قائمة", "tabular",
    ]
    line_signals = [
        "line chart", "line graph", "line plot", "curve", "trend line",
        "مخطط خطي", "رسم خطي", "منحنى", "خطي", "courbe", "ligne",
    ]
    donut_signals = [
        "donut", "doughnut", "pie chart", "pie", "share chart",
        "دائري", "حلقي", "حصة", "نسبة", "camembert", "circulaire",
    ]
    bar_signals = [
        "bar chart", "bar graph", "column chart", "columns",
        "مخطط اعمدة", "رسم اعمدة", "اعمدة", "عمودي", "مبيان اعمدة",
        "barres", "histogramme",
    ]

    checks = [
        ("table", table_signals),
        ("line", line_signals),
        ("donut", donut_signals),
        ("bar", bar_signals),
    ]
    for chart_type, signals in checks:
        if _contains_any(normalized, signals):
            return chart_type
    return None


def _apply_chart_request(spec: ChartSpec, message: str) -> ChartSpec:
    requested = _detect_chart_request(message)
    if not requested:
        return spec

    chart_type = requested
    if requested == "donut" and spec.intent not in {"bilateral_partner_breakdown", "trade_by_product", "top_producers"}:
        chart_type = "bar"
    if requested == "line" and spec.x_axis != "year":
        chart_type = "bar"

    clarification = dict(spec.clarification or {})
    clarification["requested_chart_type"] = requested
    if chart_type != requested:
        clarification["chart_type_adjustment"] = chart_type

    return ChartSpec(
        intent=spec.intent,
        chart_type=chart_type,
        source_view=spec.source_view,
        x_axis=spec.x_axis,
        y_axis=spec.y_axis,
        unit=spec.unit,
        sql=spec.sql,
        filters_used=spec.filters_used,
        series=spec.series,
        title_key=spec.title_key,
        clarification=clarification,
    )


def _detect_entity(message: str, catalogue: dict[str, dict[str, list[str]]]) -> str | None:
    matches = _detect_entities(message, catalogue)
    return matches[0] if matches else None


def _detect_entities(message: str, catalogue: dict[str, dict[str, list[str]]]) -> list[str]:
    lowered = message.lower()
    matches: list[tuple[int, str]] = []
    for canonical, languages in catalogue.items():
        positions = []
        for aliases in languages.values():
            for alias in aliases:
                match = re.search(_term_pattern(alias.lower()), lowered)
                if match:
                    positions.append(match.start())
        if positions:
            matches.append((min(positions), canonical))
    return [canonical for _, canonical in sorted(matches)]


def _ilike_filter(column: str, values: list[str]) -> str:
    checks = [f"{column} ILIKE '%{value}%'" for value in values]
    return checks[0] if len(checks) == 1 else "(" + " OR ".join(checks) + ")"


def _language(language: str) -> str:
    return language if language in _VALID_LANGUAGES else "en"


def _run_query(sql: str) -> tuple[list[str], list]:
    ok, reason = validate_sql(sql)
    if not ok:
        raise ValueError(f"Unsafe chart SQL blocked: {reason}")
    with get_engine().connect() as conn:
        result = conn.execute(text(sql))
        return list(result.keys()), result.fetchall()


def _classify_intent(message: str) -> str:
    lowered = message.lower()
    chart_request = _detect_chart_request(message)
    trend_signals = [
        "trend", "over time", "over years", "time series", "evolution", "history",
        "تطور", "سنوات", "années", "évolution",
    ]
    if _contains_any(lowered, ["quality", "جودة", "qualité", "issue", "duplicate", "مكرر", "doublon"]):
        return "data_quality_summary"
    if _contains_any(lowered, ["price", "prices", "سعر", "أسعار", "prix"]):
        return "price_trend"
    if _contains_any(lowered, ["world", "global", "العالمي", "العالم", "mondial", "monde", "share", "حصة"]):
        return "production_vs_world"
    if _contains_any(lowered, ["partner", "partners", "bilateral", "شريك", "شركاء", "ثنائي", "partenaire", "bilatéral"]):
        return "bilateral_partner_breakdown"
    if _contains_any(lowered, ["summary", "ملخص", "résumé", "balance", "اجمالي", "إجمالي"]):
        return "country_trade_summary"
    if _contains_any(lowered, ["trade", "export", "exports", "import", "imports", "commerce", "صادرات", "واردات", "تجارة"]):
        if _contains_any(lowered, trend_signals) or chart_request == "line":
            return "trade_trend"
        return "trade_by_product"
    if _contains_any(lowered, trend_signals):
        return "production_trend"
    if chart_request == "line" and _contains_any(lowered, ["production", "produce", "produced", "إنتاج", "production"]):
        return "production_trend"
    # Year range in the message (e.g. "from 2014 to 2020") → time-series trend
    if _detect_year_range(message):
        return "production_trend"
    return "top_producers"


def _build_top_producers(message: str, language: str) -> ChartSpec:
    year = _detect_year(message) or _DEFAULT_YEAR
    mineral = _detect_entity(message, _MINERALS)
    limit = _detect_top_n(message, default=5)
    label = _label_expr("country_name", language)
    mineral_label = _label_expr("mineral_name", language)
    filters: list[str] = [f"year = {year}"]
    filters_used: dict[str, Any] = {"year": year, "top_n": limit}
    clarification = None
    if mineral:
        filters.append(f"mineral_name_en ILIKE '%{mineral}%'")
        filters_used["mineral"] = mineral
    else:
        clarification = {"missing_filters": ["mineral"], "assumption": "showing top producers across all minerals"}
    where_sql = " AND ".join(filters)
    sql = f"""
        SELECT {label} AS label,
               {mineral_label} AS series,
               year,
               total_production_base AS value,
               measurement_type,
               production_rank
        FROM (
            SELECT c.name_en AS country_name_en, c.name_fr AS country_name_fr, c.name_ar AS country_name_ar,
                   mp.mineral_name_en, mp.mineral_name_fr, mp.mineral_name_ar,
                   ap.year,
                   SUM(ap.production_value_base) AS total_production_base,
                   MAX({_measurement_type_expr('ap.unit_en')}) AS measurement_type,
                   RANK() OVER (PARTITION BY ap.mineral_production_id, ap.year
                                ORDER BY SUM(ap.production_value_base) DESC NULLS LAST) AS production_rank
            FROM public.arab_production ap
            JOIN public.countries c ON c.id = ap.country_id
            JOIN public.mineral_production mp ON mp.id = ap.mineral_production_id
            GROUP BY c.name_en, c.name_fr, c.name_ar,
                     mp.mineral_name_en, mp.mineral_name_fr, mp.mineral_name_ar,
                     ap.year, ap.mineral_production_id
        ) AS v_top_arab_producers
        WHERE {where_sql}
        ORDER BY production_rank ASC, value DESC NULLS LAST
        LIMIT {limit}
    """
    return ChartSpec(
        intent="top_producers",
        chart_type="bar",
        source_view="public.arab_production",
        x_axis="country",
        y_axis="total_production_base",
        unit=_BASE_PRODUCTION_UNIT,
        sql=sql,
        filters_used=filters_used,
        series=["mineral"],
        clarification=clarification,
    )


def _build_production_trend(message: str, language: str) -> ChartSpec:
    countries = _detect_entities(message, _COUNTRIES)
    minerals = _detect_entities(message, _MINERALS)
    year_range = _detect_year_range(message)
    country_label = _label_expr("country_name", language)
    mineral_label = _label_expr("mineral_name", language)
    if len(countries) > 1 and len(minerals) <= 1:
        series_expr = country_label
        series_fields = ["country"]
    elif len(countries) <= 1 and len(minerals) > 1:
        series_expr = mineral_label
        series_fields = ["mineral"]
    elif len(countries) > 1 and len(minerals) > 1:
        series_expr = f"CONCAT({country_label}, ' · ', {mineral_label})"
        series_fields = ["country", "mineral"]
    else:
        series_expr = country_label if countries else mineral_label
        series_fields = ["country"] if countries else ["mineral"]
    filters = []
    filters_used: dict[str, Any] = {}
    missing = []
    if countries:
        filters.append(_ilike_filter("country_name_en", countries))
        filters_used["country"] = ", ".join(countries)
    else:
        missing.append("country")
    if minerals:
        filters.append(_ilike_filter("mineral_name_en", minerals))
        filters_used["mineral"] = ", ".join(minerals)
    else:
        missing.append("mineral")
    if year_range:
        filters.append(f"year BETWEEN {year_range[0]} AND {year_range[1]}")
        filters_used["year_from"] = year_range[0]
        filters_used["year_to"] = year_range[1]
    where_sql = f"WHERE {' AND '.join(filters)}" if filters else ""
    sql = f"""
        SELECT year,
               year::text AS label,
               {country_label} AS country,
               {mineral_label} AS mineral,
               {series_expr} AS series,
               SUM(production_value_base) AS value,
               COALESCE(unit_{language}, unit_en, unit_ar, unit_fr) AS unit,
               measurement_type
        FROM (
            SELECT c.name_en AS country_name_en, c.name_fr AS country_name_fr, c.name_ar AS country_name_ar,
                   mp.mineral_name_en, mp.mineral_name_fr, mp.mineral_name_ar,
                   ap.year, ap.production_value_base,
                   ap.unit_en, ap.unit_fr, ap.unit_ar,
                   CASE WHEN ap.unit_en IN ('tonne','thousand tonnes','kg') THEN 'mass'
                        WHEN ap.unit_en IN ('m³','thousand m³','million m³') THEN 'volume'
                        ELSE 'other' END AS measurement_type
            FROM public.arab_production ap
            JOIN public.countries c ON c.id = ap.country_id
            JOIN public.mineral_production mp ON mp.id = ap.mineral_production_id
        ) AS v_arab_production
        {where_sql}
        GROUP BY year, label, country, mineral, series, unit, measurement_type
        ORDER BY year, country, mineral
        LIMIT {_MAX_CHART_ROWS}
    """
    return ChartSpec(
        intent="production_trend",
        chart_type="line",
        source_view="public.arab_production",
        x_axis="year",
        y_axis="production_value_base",
        unit=_BASE_PRODUCTION_UNIT,
        sql=sql,
        filters_used=filters_used,
        series=series_fields,
        clarification={"missing_filters": missing} if missing else None,
    )


def _build_production_vs_world(message: str, language: str) -> ChartSpec:
    year = _detect_year(message)
    mineral = _detect_entity(message, _MINERALS)
    mineral_label = _label_expr("mineral_name", language)
    filters = []
    filters_used: dict[str, Any] = {}
    if year:
        filters.append(f"year = {year}")
        filters_used["year"] = year
    if mineral:
        filters.append(f"mineral_name_en ILIKE '%{mineral}%'")
        filters_used["mineral"] = mineral
    where_sql = f"WHERE {' AND '.join(filters)}" if filters else ""
    sql = f"""
        SELECT year,
               {mineral_label} AS label,
               arab_total_base,
               world_production_base,
               arab_share_pct,
               measurement_type
        FROM (
            SELECT mp.mineral_name_en, mp.mineral_name_fr, mp.mineral_name_ar,
                   ap.year, ap.arab_total_base, ap.measurement_type,
                   wp.production_value_base AS world_production_base,
                   CASE WHEN wp.production_value_base > 0
                        THEN ROUND((ap.arab_total_base / wp.production_value_base * 100)::numeric, 2)
                        END AS arab_share_pct
            FROM ( SELECT mineral_production_id, year, SUM(production_value_base) AS arab_total_base,
                          MAX({_measurement_type_expr('unit_en')}) AS measurement_type
                   FROM public.arab_production GROUP BY mineral_production_id, year ) ap
            JOIN public.world_production wp
              ON wp.mineral_production_id = ap.mineral_production_id AND wp.year = ap.year
            JOIN public.mineral_production mp ON mp.id = ap.mineral_production_id
        ) AS v_production_vs_world
        {where_sql}
        ORDER BY year, label
        LIMIT {_MAX_CHART_ROWS}
    """
    return ChartSpec(
        intent="production_vs_world",
        chart_type="grouped_bar" if year else "line",
        source_view="public.arab_production + public.world_production",
        x_axis="mineral" if year else "year",
        y_axis="production_value_base",
        unit=_BASE_PRODUCTION_UNIT,
        sql=sql,
        filters_used=filters_used,
        series=["arab_total_base", "world_production_base", "arab_share_pct"],
        clarification={"missing_filters": ["mineral"], "assumption": "showing all minerals"} if not mineral else None,
    )


def _build_trade_trend(message: str, language: str) -> ChartSpec:
    country = _detect_entity(message, _COUNTRIES)
    product = _detect_entity(message, _PRODUCT_HINTS)
    label = _label_expr("country_name", language)
    product_label = _label_expr("product_name", language)
    filters = []
    filters_used: dict[str, Any] = {}
    if country:
        filters.append(f"country_name_en ILIKE '%{country}%'")
        filters_used["country"] = country
    if product and product != "minerals":
        filters.append(f"product_name_en ILIKE '%{product}%'")
        filters_used["trade_product"] = product
    where_sql = f"WHERE {' AND '.join(filters)}" if filters else ""
    sql = f"""
        SELECT year,
               {label} AS label,
               flow AS series,
               {product_label} AS product,
               SUM(value_usd) AS value
        FROM (
            SELECT c.name_en AS country_name_en, c.name_fr AS country_name_fr, c.name_ar AS country_name_ar,
                   mt.mineral_name_en AS product_name_en, mt.mineral_name_fr AS product_name_fr, mt.mineral_name_ar AS product_name_ar,
                   tw.year,
                   CASE WHEN tw.type_trade = 'export' THEN 'Export'
                        WHEN tw.type_trade = 'import' THEN 'Import' END AS flow,
                   tw.value_usd
            FROM public.trade_world tw
            JOIN public.countries c ON c.id = tw.reporter_country_id
            JOIN public.mineral_trade mt ON mt.id = tw.mineral_trade_id
        ) AS v_trade_world
        {where_sql}
        GROUP BY year, label, series, product
        ORDER BY year, label, series, product
        LIMIT {_MAX_CHART_ROWS}
    """
    return ChartSpec(
        intent="trade_trend",
        chart_type="line",
        source_view="public.trade_world",
        x_axis="year",
        y_axis="value_usd",
        unit="USD",
        sql=sql,
        filters_used=filters_used,
        series=["flow", "product"],
        clarification={"missing_filters": ["country"], "assumption": "showing all countries"} if not country else None,
    )


def _build_trade_by_product(message: str, language: str) -> ChartSpec:
    year = _detect_year(message) or _DEFAULT_YEAR
    country = _detect_entity(message, _COUNTRIES)
    product = _detect_entity(message, _PRODUCT_HINTS)
    flow = _detect_flow(message)
    country_label = _label_expr("country_name", language)
    product_label = _label_expr("product_name", language)
    filters = [f"year = {year}"]
    filters_used: dict[str, Any] = {"year": year}
    if country:
        filters.append(f"country_name_en ILIKE '%{country}%'")
        filters_used["country"] = country
    if product and product != "minerals":
        filters.append(f"product_name_en ILIKE '%{product}%'")
        filters_used["trade_product"] = product
    if flow:
        filters.append(f"flow = '{flow}'")
        filters_used["flow"] = flow
    sql = f"""
        SELECT {product_label} AS label,
               flow AS series,
               {country_label} AS country,
               year,
               SUM(value_usd) AS value
        FROM (
            SELECT c.name_en AS country_name_en, c.name_fr AS country_name_fr, c.name_ar AS country_name_ar,
                   mt.mineral_name_en AS product_name_en, mt.mineral_name_fr AS product_name_fr, mt.mineral_name_ar AS product_name_ar,
                   tw.year,
                   CASE WHEN tw.type_trade = 'export' THEN 'Export'
                        WHEN tw.type_trade = 'import' THEN 'Import' END AS flow,
                   tw.value_usd
            FROM public.trade_world tw
            JOIN public.countries c ON c.id = tw.reporter_country_id
            JOIN public.mineral_trade mt ON mt.id = tw.mineral_trade_id
        ) AS v_trade_world
        WHERE {' AND '.join(filters)}
        GROUP BY label, series, country, year
        ORDER BY value DESC NULLS LAST
        LIMIT {_detect_top_n(message)}
    """
    return ChartSpec(
        intent="trade_by_product",
        chart_type="grouped_bar" if not flow else "bar",
        source_view="public.trade_world",
        x_axis="trade_product",
        y_axis="value_usd",
        unit="USD",
        sql=sql,
        filters_used=filters_used,
        series=["flow"],
        clarification={"missing_filters": ["country"], "assumption": "showing all countries"} if not country else None,
    )


def _build_bilateral_partner_breakdown(message: str, language: str) -> ChartSpec:
    year = _detect_year(message) or _DEFAULT_YEAR
    country = _detect_entity(message, _COUNTRIES)
    flow = _detect_flow(message)
    country_label = _label_expr("country_name", language)
    partner_label = _label_expr("partner_name", language)
    filters = [f"year = {year}"]
    filters_used: dict[str, Any] = {"year": year}
    if country:
        filters.append(f"country_name_en ILIKE '%{country}%'")
        filters_used["country"] = country
    if flow:
        filters.append(f"flow = '{flow}'")
        filters_used["flow"] = flow
    sql = f"""
        SELECT {partner_label} AS label,
               flow AS series,
               {country_label} AS country,
               year,
               SUM(value_usd) AS value,
               AVG(share_pct) AS share_pct
        FROM (
            SELECT c.name_en AS country_name_en, c.name_fr AS country_name_fr, c.name_ar AS country_name_ar,
                   tp.name_en AS partner_name_en, tp.name_fr AS partner_name_fr, tp.name_ar AS partner_name_ar,
                   pt.year,
                   CASE WHEN pt.type_trade = 'export' THEN 'Export'
                        WHEN pt.type_trade = 'import' THEN 'Import' END AS flow,
                   pt.value_usd,
                   ROUND(100.0 * pt.value_usd
                         / NULLIF(SUM(pt.value_usd) OVER (PARTITION BY pt.reporter_country_id, pt.year, pt.type_trade), 0), 2) AS share_pct
            FROM public.partner_trade pt
            JOIN public.countries c ON c.id = pt.reporter_country_id
            JOIN public.trade_partners tp ON tp.id = pt.partner_id
        ) AS v_bilateral_trade
        WHERE {' AND '.join(filters)}
        GROUP BY label, series, country, year
        ORDER BY value DESC NULLS LAST
        LIMIT {_detect_top_n(message)}
    """
    return ChartSpec(
        intent="bilateral_partner_breakdown",
        chart_type="donut" if flow else "grouped_bar",
        source_view="public.partner_trade",
        x_axis="partner",
        y_axis="value_usd",
        unit="USD",
        sql=sql,
        filters_used=filters_used,
        series=["flow"],
        clarification={"missing_filters": ["country"], "assumption": "showing all countries"} if not country else None,
    )


def _build_country_trade_summary(message: str, language: str) -> ChartSpec:
    country = _detect_entity(message, _COUNTRIES)
    label = _label_expr("country_name", language)
    where_sql = f"WHERE country_name_en ILIKE '%{country}%'" if country else ""
    sql = f"""
        SELECT {label} AS label,
               year,
               export_value_usd,
               import_value_usd,
               bilateral_export_usd,
               bilateral_import_usd
        FROM (
            SELECT c.name_en AS country_name_en, c.name_fr AS country_name_fr, c.name_ar AS country_name_ar,
                   tw.year,
                   SUM(tw.value_usd) FILTER (WHERE tw.type_trade = 'export') AS export_value_usd,
                   SUM(tw.value_usd) FILTER (WHERE tw.type_trade = 'import') AS import_value_usd,
                   (SELECT SUM(pt.value_usd) FROM public.partner_trade pt
                     WHERE pt.reporter_country_id = tw.reporter_country_id AND pt.year = tw.year AND pt.type_trade = 'export') AS bilateral_export_usd,
                   (SELECT SUM(pt.value_usd) FROM public.partner_trade pt
                     WHERE pt.reporter_country_id = tw.reporter_country_id AND pt.year = tw.year AND pt.type_trade = 'import') AS bilateral_import_usd
            FROM public.trade_world tw
            JOIN public.countries c ON c.id = tw.reporter_country_id
            GROUP BY c.name_en, c.name_fr, c.name_ar, tw.year, tw.reporter_country_id
        ) AS v_country_trade_summary
        {where_sql}
        ORDER BY year, label
        LIMIT {_MAX_CHART_ROWS}
    """
    return ChartSpec(
        intent="country_trade_summary",
        chart_type="grouped_bar",
        source_view="public.trade_world + public.partner_trade",
        x_axis="year",
        y_axis="trade_values",
        unit="USD",
        sql=sql,
        filters_used={"country": country} if country else {},
        series=["export_value_usd", "import_value_usd", "bilateral_export_usd", "bilateral_import_usd"],
        clarification={"missing_filters": ["country"], "assumption": "showing all countries"} if not country else None,
    )


def _build_data_quality_summary(message: str, language: str) -> ChartSpec:
    sql = """
        SELECT mineral_name_en AS label,
               NULL::text AS series,
               'mineral' AS entity_type,
               NULL::bigint AS value
        FROM public.mineral_production
        WHERE 1 = 0
        LIMIT 30
    """
    return ChartSpec(
        intent="data_quality_summary",
        chart_type="bar",
        source_view="public (no data-quality diagnostics)",
        x_axis="issue_type",
        y_axis="issue_count",
        unit="issues",
        sql=sql,
        filters_used={},
        series=["severity", "entity_type"],
        clarification={"note": "Data-quality diagnostics are not available for the current schema."},
    )


def _build_price_trend(message: str, language: str) -> ChartSpec:
    # Price facts are part of Warehouse V2, but no chatbot-facing price view exists yet.
    sql = """
        SELECT mineral_name_en AS label,
               NULL::int AS year,
               NULL::numeric AS value,
               NULL::text AS series
        FROM public.mineral_production
        WHERE 1 = 0
        LIMIT 50
    """
    return ChartSpec(
        intent="price_trend",
        chart_type="line",
        source_view="public (no price data loaded)",
        x_axis="year",
        y_axis="avg_price",
        unit="price",
        sql=sql,
        filters_used={},
        series=["asset", "quote_currency"],
        clarification={"note": "Price data is not loaded in this database; price charts are unavailable."},
    )


def _build_spec(message: str, language: str) -> ChartSpec:
    intent = _classify_intent(message)
    builders = {
        "top_producers": _build_top_producers,
        "production_trend": _build_production_trend,
        "production_vs_world": _build_production_vs_world,
        "trade_trend": _build_trade_trend,
        "trade_by_product": _build_trade_by_product,
        "bilateral_partner_breakdown": _build_bilateral_partner_breakdown,
        "country_trade_summary": _build_country_trade_summary,
        "price_trend": _build_price_trend,
        "data_quality_summary": _build_data_quality_summary,
    }
    return _apply_chart_request(builders[intent](message, language), message)


def _title(intent: str, language: str, filters_used: dict[str, Any]) -> str:
    template = _TITLE_TEMPLATES.get(intent, _TITLE_TEMPLATES["top_producers"])
    title = template.get(language) or template["en"]
    parts = []
    for key in ["country", "mineral", "trade_product", "flow"]:
        value = filters_used.get(key)
        if value:
            parts.append(str(value))
    if "year_from" in filters_used and "year_to" in filters_used:
        parts.append(f"{filters_used['year_from']}–{filters_used['year_to']}")
    elif filters_used.get("year"):
        parts.append(str(filters_used["year"]))
    if parts:
        return f"{title} ({', '.join(parts)})"
    return title


def _rows_to_dicts(columns: list[str], rows: list) -> list[dict[str, Any]]:
    data = [
        {column: _json_value(value) for column, value in zip(columns, row)}
        for row in rows
    ]
    if len(data) > _MAX_CHART_ROWS:
        return data[:_MAX_CHART_ROWS]
    return data


def _json_value(value: Any) -> Any:
    if isinstance(value, Decimal):
        return int(value) if value == value.to_integral_value() else float(value)
    return value


def _insight(data: list[dict[str, Any]], spec: ChartSpec, language: str, unit: str | None = None) -> str:
    if not data:
        return t("chart_no_data", language)
    value_rows = [row for row in data if isinstance(row.get("value"), (int, float)) and row.get("value") is not None]
    if not value_rows:
        return "Data is available, but the result is better displayed as a table."
    top = max(value_rows, key=lambda row: row["value"])
    label = top.get("country") or top.get("series") or top.get("label") or "top item"
    value = top.get("value")
    suffix = f" {unit}" if unit else ""
    if language == "ar":
        return f"أعلى قيمة في النتائج هي {value}{suffix} لـ {label}."
    if language == "fr":
        return f"La valeur la plus élevée dans les résultats est {value}{suffix} pour {label}."
    return f"The highest value in the result is {value}{suffix} for {label}."


def _no_data_response(spec: ChartSpec, language: str) -> dict[str, Any]:
    title = _title(spec.intent, language, spec.filters_used)
    return {
        "answer": t("chart_no_data", language),
        "chart_type": "table",
        "chart_title": title,
        "chart_intent": spec.intent,
        "x_axis": spec.x_axis,
        "y_axis": spec.y_axis,
        "series": spec.series,
        "unit": _display_unit(spec, [], language),
        "data": [],
        "chart_data": [],
        "insight": t("chart_no_data", language),
        "source_view": spec.source_view,
        "filters_used": spec.filters_used,
        "clarification": spec.clarification,
        "sql": spec.sql.strip(),
    }


async def handle_chart(message: str, language: str) -> dict[str, Any]:
    language = _language(language)
    spec = _build_spec(message, language)
    title = _title(spec.intent, language, spec.filters_used)

    try:
        columns, rows = await asyncio.to_thread(_run_query, spec.sql)
        data = _rows_to_dicts(columns, rows)
        if not data:
            return _no_data_response(spec, language)

        chart_type = spec.chart_type if spec.x_axis else "table"

        display_unit = _display_unit(spec, data, language)
        insight = _insight(data, spec, language, display_unit)
        return {
            "answer": t("chart_answer", language, title=title),
            "chart_type": chart_type,
            "chart_title": title,
            "chart_intent": spec.intent,
            "x_axis": spec.x_axis,
            "y_axis": spec.y_axis,
            "series": spec.series,
            "unit": display_unit,
            "data": data,
            "chart_data": data,
            "insight": insight,
            "source_view": spec.source_view,
            "filters_used": spec.filters_used,
            "clarification": spec.clarification,
            "sql": spec.sql.strip(),
        }

    except Exception:
        logger.exception("Chart query failed")
        return {
            "answer": "An internal error occurred. Please try again.",
            "chart_type": None,
            "chart_title": None,
            "chart_intent": spec.intent,
            "x_axis": None,
            "y_axis": None,
            "series": [],
            "unit": None,
            "data": None,
            "chart_data": None,
            "insight": None,
            "source_view": spec.source_view,
            "filters_used": spec.filters_used,
            "clarification": spec.clarification,
            "sql": spec.sql.strip(),
        }
