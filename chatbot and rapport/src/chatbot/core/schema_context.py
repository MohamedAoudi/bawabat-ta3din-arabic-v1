"""
Schema context selector for the AMIP Chatbot.

Maps user topics to the new simplified database schema.
"""

from __future__ import annotations

from collections import OrderedDict
from collections.abc import Iterable

SCHEMA_NAME = "public"

# ---------------------------------------------------------------------------
# Tables for the chatbot
# ---------------------------------------------------------------------------
V2_VIEWS: dict[str, list[str]] = {}

V2_TABLES: dict[str, list[str]] = {
    "countries": [
        "id PRIMARY KEY",
        "name_ar, name_en, name_fr",
        "iso_code UNIQUE",
        "display_order",
        "created_at, updated_at",
    ],
    "mineral_production": [
        "id PRIMARY KEY",
        "hs_codes",
        "mineral_name_ar, mineral_name_en, mineral_name_fr",
        "source_system",
        "created_at, updated_at",
    ],
    "trade_partners": [
        "id PRIMARY KEY",
        "name_ar, name_en, name_fr",
        "partner_category_ar, partner_category_en, partner_category_fr",
        "created_at, updated_at",
    ],
    "arab_production": [
        "id PRIMARY KEY",
        "country_id FK -> countries(id)",
        "mineral_production_id FK -> mineral_production(id)",
        "year",
        "production_value",
        "production_value_base",
        "unit_ar, unit_en, unit_fr",
        "created_at, updated_at",
    ],
    "world_production": [
        "id PRIMARY KEY",
        "mineral_production_id FK -> mineral_production(id)",
        "year",
        "production_value",
        "production_value_base",
        "unit_ar, unit_en, unit_fr",
        "created_at, updated_at",
    ],
    "mineral_trade": [
        "id PRIMARY KEY",
        "hs_codes",
        "mineral_name_ar, mineral_name_en, mineral_name_fr",
        "source_system",
        "created_at, updated_at",
    ],
    "trade_world": [
        "id PRIMARY KEY",
        "reporter_country_id FK -> countries(id)",
        "partner_id FK -> trade_partners(id)",
        "mineral_trade_id FK -> mineral_trade(id)",
        "year",
        "value_usd",
        "value_share",
        "type_trade (exports | imports)",
        "created_at, updated_at",
    ],
    "partner_trade": [
        "id PRIMARY KEY",
        "reporter_country_id FK -> countries(id)",
        "partner_id FK -> trade_partners(id)",
        "mineral_trade_id FK -> mineral_trade(id)",
        "year",
        "value_usd",
        "type_trade (exports | imports)",
        "created_at, updated_at",
    ],
}

SCHEMA_TOPICS: dict[str, dict[str, object]] = {
    "production": {
        "keywords": {
            "ar": ["إنتاج", "انتاج", "أنتج", "ينتج", "كمية", "حجم الإنتاج", "منتج", "ترتيب المنتجين"],
            "fr": ["production", "produire", "produit", "quantité", "volume", "producteurs", "classement"],
            "en": ["production", "produce", "produced", "output", "volume", "quantity", "producer", "producers", "rank"],
        },
        "tables": ["countries", "mineral_production", "arab_production", "world_production"],
    },
    "trade": {
        "keywords": {
            "ar": ["تجارة", "صادرات", "واردات", "تصدير", "استيراد", "شريك", "ثنائي", "رمز جمركي", "ميزان تجاري"],
            "fr": ["commerce", "exportations", "importations", "exporter", "importer", "partenaire", "bilatéral", "code hs"],
            "en": ["trade", "export", "exports", "import", "imports", "partner", "bilateral", "hs code", "product", "trade balance"],
        },
        "tables": ["countries", "trade_partners", "mineral_trade", "trade_world", "partner_trade"],
    },
    "countries": {
        "keywords": {
            "ar": ["دولة", "دول", "بلد", "المغرب", "الجزائر", "مصر", "السعودية", "موريتانيا", "السودان", "تونس", "ليبيا", "العراق", "الأردن"],
            "fr": ["pays", "maroc", "algérie", "égypte", "arabie saoudite", "mauritanie", "soudan", "tunisie", "libye", "irak", "jordanie"],
            "en": ["country", "countries", "morocco", "algeria", "egypt", "saudi", "mauritania", "sudan", "tunisia", "libya", "iraq", "jordan", "arab"],
        },
        "tables": ["countries", "arab_production", "trade_world", "partner_trade"],
    },
    "minerals": {
        "keywords": {
            "ar": ["معدن", "معادن", "خام", "فوسفات", "حديد", "ذهب", "نحاس", "جبس", "ملح", "زنك", "كاولين", "أسمنت", "بنتونيت"],
            "fr": ["minéral", "minéraux", "minerai", "phosphate", "fer", "or", "cuivre", "gypse", "sel", "zinc", "kaolin", "ciment", "bentonite"],
            "en": ["mineral", "minerals", "ore", "phosphate", "iron", "gold", "copper", "gypsum", "salt", "zinc", "barite", "feldspar", "kaolin", "cement", "bentonite"],
        },
        "tables": ["mineral_production", "mineral_trade", "arab_production", "world_production"],
    },
    "overview": {
        "keywords": {
            "ar": ["نظرة عامة", "ملخص", "إجمالي", "احصاء", "إحصاء", "مؤشر", "بوابة", "amip"],
            "fr": ["aperçu", "résumé", "total", "statistique", "indicateur", "portail", "amip"],
            "en": ["overview", "summary", "total", "kpi", "portal", "stats", "statistics", "dashboard", "how many", "amip"],
        },
        "tables": ["countries", "mineral_production", "mineral_trade", "arab_production", "world_production", "trade_world", "partner_trade"],
    },
}

ALWAYS_INCLUDE_TABLES = ["countries"]

_RULES_NOTE = """
-- SQL Generation Rules for AMIP Database:
--
-- Tables:
--   countries: id, name_ar, name_en, name_fr, iso_code, display_order
--   mineral_production: id, hs_codes, mineral_name_ar/en/fr, source_system
--   trade_partners: id, name_ar/en/fr, partner_category_ar/en/fr
--   arab_production: id, country_id, mineral_production_id, year, production_value, production_value_base, unit_*
--   world_production: id, mineral_production_id, year, production_value, production_value_base, unit_*
--   mineral_trade: id, hs_codes, mineral_name_ar/en/fr, source_system
--   trade_world: id, reporter_country_id, partner_id, mineral_trade_id, year, value_usd, value_share, type_trade
--   partner_trade: id, reporter_country_id, partner_id, mineral_trade_id, year, value_usd, type_trade
--
-- Key Rules:
--   1. Always use JOINs to get multilingual names from countries and mineral_production tables
--   2. For production: use arab_production + countries + mineral_production
--   3. For world production: use world_production + mineral_production
--   4. For trade: use trade_world or partner_trade + countries + trade_partners + mineral_trade
--   5. Filter type_trade = 'exports' or 'imports' for trade queries
--   6. Use production_value_base for normalized aggregations
--   7. Always include appropriate LIMIT clause (default: 100)
--   8. Order by year DESC for time-based queries
"""

_COUNTRY_NAMES_NOTE = """
-- Available countries are in the countries table with name_ar, name_en, name_fr
"""


def _detect_topic(question: str) -> str:
    """Return the best-matching topic key for the given question."""
    question_lower = question.lower()
    best_topic = "overview"
    best_score = 0

    for topic, info in SCHEMA_TOPICS.items():
        score = 0
        keywords = info["keywords"]
        for lang_keywords in keywords.values():
            for keyword in lang_keywords:
                if keyword.lower() in question_lower:
                    score += 1
        if score > best_score:
            best_score = score
            best_topic = topic

    return best_topic


def _unique(items: Iterable[str]) -> list[str]:
    return list(OrderedDict.fromkeys(items))


def _format_objects(title: str, selected: Iterable[str], catalogue: dict[str, list[str]]) -> list[str]:
    lines = [f"-- {title}:"]
    for table_name in selected:
        columns = catalogue.get(table_name)
        if not columns:
            continue
        lines.append(f"--   {table_name}(")
        for column in columns:
            lines.append(f"--     {column}")
        lines.append("--   )")
    return lines


def get_schema_for_question(question: str) -> str:
    """
    Detect the question topic and return schema guidance for the SQL prompt.

    Args:
        question: The user's natural-language question.

    Returns:
        A multi-line string describing relevant tables and rules.
    """
    topic = _detect_topic(question)
    topic_info = SCHEMA_TOPICS[topic]

    tables = _unique([*topic_info.get("tables", []), *ALWAYS_INCLUDE_TABLES])

    lines = [
        f"-- AMIP Database Schema for topic: {topic}",
        f"-- Schema: {SCHEMA_NAME}",
        "",
    ]
    lines.extend(_format_objects("Available tables", tables, V2_TABLES))
    lines.append("")
    lines.extend(_RULES_NOTE.splitlines())
    lines.append("")
    lines.extend(_COUNTRY_NAMES_NOTE.splitlines())

    return "\n".join(lines)
