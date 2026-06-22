"""
Warehouse V2 schema context selector for the AMIP Chatbot.

The chatbot should generate SQL only against the AMIP Warehouse V2 mineral
analytics model. This module maps user topics in Arabic, French, and English to
views/tables that are safe and useful for Text-to-SQL prompts.
"""

from __future__ import annotations

from collections import OrderedDict
from collections.abc import Iterable

SCHEMA_NAME = "minerals"

# ---------------------------------------------------------------------------
# Views first: these expose multilingual labels and hide most join complexity.
# ---------------------------------------------------------------------------
V2_VIEWS: dict[str, list[str]] = {
    "minerals.v_arab_production": [
        "production_fact_id",
        "country_id",
        "country_name_ar, country_name_en, country_name_fr",
        "mineral_id",
        "mineral_name_ar, mineral_name_en, mineral_name_fr",
        "year",
        "production_value       -- original source quantity",
        "production_value_base  -- normalized quantity in the base unit for its measurement_type",
        "unit_ar, unit_en, unit_fr",
        "measurement_type       -- mass | volume | count | unknown",
        "source_name, source_file, source_row_number",
        "duplicate_group_count, is_conflicting_duplicate",
    ],
    "minerals.v_world_production": [
        "world_production_fact_id",
        "mineral_id",
        "mineral_name_ar, mineral_name_en, mineral_name_fr",
        "year",
        "production_value",
        "production_value_base",
        "unit_ar, unit_en, unit_fr",
        "measurement_type",
        "source_file, source_row_number",
        "NOTE: no country_id or country_name_* columns; this is global production by mineral/year only",
    ],
    "minerals.v_production_vs_world": [
        "mineral_id",
        "mineral_name_ar, mineral_name_en, mineral_name_fr",
        "year",
        "arab_total_base        -- sum of Arab production in normalized base units",
        "world_production_base  -- world production in normalized base units",
        "arab_share_pct         -- Arab share of world production",
    ],
    "minerals.v_trade_world": [
        "trade_world_fact_id",
        "country_id",
        "country_name_ar, country_name_en, country_name_fr",
        "flow                  -- Export | Import",
        "trade_product_id",
        "product_name_ar, product_name_en, product_name_fr",
        "hs_code",
        "hs_description_ar, hs_description_en, hs_description_fr",
        "year",
        "value_usd             -- aggregate/world trade value in US dollars",
        "NOTE: no export_value_usd/import_value_usd columns; filter flow and aggregate value_usd instead",
        "source_file, source_row_number",
    ],
    "minerals.v_bilateral_trade": [
        "bilateral_trade_fact_id",
        "country_id",
        "country_name_ar, country_name_en, country_name_fr",
        "partner_id",
        "partner_name_ar, partner_name_en, partner_name_fr",
        "partner_type          -- world | region | country | unknown",
        "flow                  -- Export | Import",
        "product_group",
        "NOTE: no product_name_ar/product_name_en/product_name_fr columns; use product_group for bilateral product labels",
        "year",
        "value_usd_thousand    -- bilateral trade value in US$ thousands",
        "share_pct             -- partner share percentage when available",
        "source_file_value, source_file_share",
    ],
    "minerals.v_country_trade_summary": [
        "country_id",
        "country_name_ar, country_name_en, country_name_fr",
        "year",
        "export_value_usd",
        "import_value_usd",
        "bilateral_export_usd_thousand",
        "bilateral_import_usd_thousand",
    ],
    "minerals.v_top_arab_producers": [
        "country_id",
        "country_name_ar, country_name_en, country_name_fr",
        "mineral_id",
        "mineral_name_ar, mineral_name_en, mineral_name_fr",
        "year",
        "total_production_base",
        "production_rank",
    ],
    "minerals.v_data_quality_summary": [
        "run_id",
        "severity",
        "issue_type",
        "entity_type",
        "issue_count",
    ],
}

# ---------------------------------------------------------------------------
# Base tables: include only when detailed joins, lineage, or IDs are needed.
# ---------------------------------------------------------------------------
V2_TABLES: dict[str, list[str]] = {
    "minerals.dim_time": [
        "year PRIMARY KEY",
        "decade",
        "year_start",
        "year_end",
    ],
    "minerals.dim_countries": [
        "country_id PRIMARY KEY",
        "country_name_ar, country_name_en, country_name_fr",
        "display_order",
        "is_arab_country",
        "source_file",
    ],
    "minerals.dim_minerals": [
        "mineral_id PRIMARY KEY",
        "mineral_name_ar, mineral_name_en, mineral_name_fr",
        "mineral_group",
        "source_system",
    ],
    "minerals.dim_trade_products": [
        "trade_product_id PRIMARY KEY",
        "product_name_ar, product_name_en, product_name_fr",
        "source_system",
    ],
    "minerals.dim_hs_codes": [
        "hs_code PRIMARY KEY",
        "trade_product_id FK -> dim_trade_products",
        "description_ar, description_en, description_fr",
        "source_system",
    ],
    "minerals.dim_partners": [
        "partner_id PRIMARY KEY",
        "partner_name_ar, partner_name_en, partner_name_fr",
        "partner_type",
        "source_system",
    ],
    "minerals.fact_arab_production": [
        "production_fact_id PRIMARY KEY",
        "country_id FK -> dim_countries",
        "mineral_id FK -> dim_minerals",
        "year FK -> dim_time",
        "production_value, production_value_base",
        "unit_id FK -> dim_units",
        "source_id FK -> dim_sources",
        "source_file, source_sheet, source_row_number",
        "ingestion_run_id, record_hash, raw_payload",
        "duplicate_group_count, is_conflicting_duplicate",
    ],
    "minerals.fact_world_production": [
        "world_production_fact_id PRIMARY KEY",
        "mineral_id FK -> dim_minerals",
        "year FK -> dim_time",
        "production_value, production_value_base",
        "unit_id FK -> dim_units",
        "source_file, source_sheet, source_row_number",
        "ingestion_run_id, record_hash, raw_payload",
    ],
    "minerals.fact_trade_world": [
        "trade_world_fact_id PRIMARY KEY",
        "reporter_country_id FK -> dim_countries",
        "partner_id FK -> dim_partners",
        "flow -- Export | Import",
        "trade_product_id FK -> dim_trade_products",
        "hs_code FK -> dim_hs_codes",
        "year FK -> dim_time",
        "value_usd",
        "source_file, source_sheet, source_row_number",
        "ingestion_run_id, record_hash, raw_payload",
    ],
    "minerals.fact_bilateral_trade": [
        "bilateral_trade_fact_id PRIMARY KEY",
        "reporter_country_id FK -> dim_countries",
        "partner_id FK -> dim_partners",
        "flow -- Export | Import",
        "product_group",
        "year FK -> dim_time",
        "value_usd_thousand",
        "share_pct",
        "source_file_value, source_file_share, source_sheet, source_row_number",
        "ingestion_run_id, record_hash, raw_payload",
    ],
    "minerals.dim_price_assets": [
        "price_asset_id PRIMARY KEY",
        "asset_symbol",
        "asset_name_ar, asset_name_en, asset_name_fr",
        "commodity_group",
        "quote_currency",
        "price_unit_ar, price_unit_en, price_unit_fr",
        "source_platform, source_asset_id",
        "NOTE: present for future price monitoring, but empty in the current local build unless a real local price source is configured",
    ],
    "minerals.fact_mineral_price_ticks": [
        "price_tick_id PRIMARY KEY",
        "price_asset_id FK -> dim_price_assets",
        "observed_at",
        "price_value",
        "quote_currency, price_unit",
        "source_platform",
        "ingestion_run_id, record_hash",
        "NOTE: no current price rows are loaded by the default V2 pipeline",
    ],
    "minerals.agg_mineral_price_yearly": [
        "price_asset_id FK -> dim_price_assets",
        "year FK -> dim_time",
        "avg_price, min_price, max_price",
        "observation_count",
        "NOTE: returns rows only when fact_mineral_price_ticks is populated",
    ],
}

SCHEMA_TOPICS: dict[str, dict[str, object]] = {
    "production": {
        "keywords": {
            "ar": ["إنتاج", "انتاج", "أنتج", "ينتج", "كمية", "حجم الإنتاج", "منتج", "ترتيب المنتجين"],
            "fr": ["production", "produire", "produit", "quantité", "volume", "producteurs", "classement"],
            "en": ["production", "produce", "produced", "output", "volume", "quantity", "producer", "producers", "rank"],
        },
        "views": [
            "minerals.v_arab_production",
            "minerals.v_top_arab_producers",
            "minerals.v_world_production",
            "minerals.v_production_vs_world",
        ],
        "tables": ["minerals.dim_countries", "minerals.dim_minerals", "minerals.fact_arab_production", "minerals.fact_world_production"],
    },
    "trade": {
        "keywords": {
            "ar": ["تجارة", "صادرات", "واردات", "تصدير", "استيراد", "شريك", "ثنائي", "رمز جمركي", "ميزان تجاري"],
            "fr": ["commerce", "exportations", "importations", "exporter", "importer", "partenaire", "bilatéral", "code hs"],
            "en": ["trade", "export", "exports", "import", "imports", "partner", "bilateral", "hs code", "product", "trade balance"],
        },
        "views": [
            "minerals.v_trade_world",
            "minerals.v_bilateral_trade",
            "minerals.v_country_trade_summary",
        ],
        "tables": ["minerals.dim_trade_products", "minerals.dim_hs_codes", "minerals.dim_partners", "minerals.fact_trade_world", "minerals.fact_bilateral_trade"],
    },
    "countries": {
        "keywords": {
            "ar": ["دولة", "دول", "بلد", "المغرب", "الجزائر", "مصر", "السعودية", "موريتانيا", "السودان", "تونس", "ليبيا", "العراق", "الأردن"],
            "fr": ["pays", "maroc", "algérie", "égypte", "arabie saoudite", "mauritanie", "soudan", "tunisie", "libye", "irak", "jordanie"],
            "en": ["country", "countries", "morocco", "algeria", "egypt", "saudi", "mauritania", "sudan", "tunisia", "libya", "iraq", "jordan", "arab"],
        },
        "views": [
            "minerals.v_arab_production",
            "minerals.v_country_trade_summary",
            "minerals.v_bilateral_trade",
        ],
        "tables": ["minerals.dim_countries", "minerals.dim_time"],
    },
    "minerals": {
        "keywords": {
            "ar": ["معدن", "معادن", "خام", "فوسفات", "حديد", "ذهب", "نحاس", "جبس", "ملح", "زنك", "كاولين", "أسمنت", "بنتونيت"],
            "fr": ["minéral", "minéraux", "minerai", "phosphate", "fer", "or", "cuivre", "gypse", "sel", "zinc", "kaolin", "ciment", "bentonite"],
            "en": ["mineral", "minerals", "ore", "phosphate", "iron", "gold", "copper", "gypsum", "salt", "zinc", "barite", "feldspar", "kaolin", "cement", "bentonite"],
        },
        "views": [
            "minerals.v_arab_production",
            "minerals.v_world_production",
            "minerals.v_production_vs_world",
        ],
        "tables": ["minerals.dim_minerals", "minerals.dim_trade_products", "minerals.dim_hs_codes"],
    },
    "quality": {
        "keywords": {
            "ar": ["جودة", "خطأ", "أخطاء", "تكرار", "مكرر", "تعارض", "مصدر"],
            "fr": ["qualité", "erreur", "doublon", "conflit", "source"],
            "en": ["quality", "issue", "error", "duplicate", "conflict", "source", "lineage"],
        },
        "views": ["minerals.v_data_quality_summary", "minerals.v_arab_production"],
        "tables": ["minerals.fact_arab_production", "minerals.fact_trade_world", "minerals.fact_bilateral_trade"],
    },
    "reserves": {
        "keywords": {
            "ar": ["احتياطي", "احتياطيات", "تكفي", "العمر المتوقع"],
            "fr": ["réserve", "réserves", "durée de vie"],
            "en": ["reserve", "reserves", "lifespan", "reserve life"],
        },
        "views": [
            "minerals.v_arab_production",
        ],
        "tables": ["minerals.dim_countries", "minerals.dim_minerals"],
    },
    "prices": {
        "keywords": {
            "ar": ["سعر", "أسعار", "ثمن", "قيمة سوقية", "السوق", "الدولي"],
            "fr": ["prix", "cours", "valeur de marché", "marché"],
            "en": ["price", "prices", "market price", "commodity price", "market"],
        },
        "views": [],
        "tables": ["minerals.dim_price_assets", "minerals.fact_mineral_price_ticks", "minerals.agg_mineral_price_yearly"],
    },
    "overview": {
        "keywords": {
            "ar": ["نظرة عامة", "ملخص", "إجمالي", "احصاء", "إحصاء", "مؤشر", "بوابة", "amip"],
            "fr": ["aperçu", "résumé", "total", "statistique", "indicateur", "portail", "amip"],
            "en": ["overview", "summary", "total", "kpi", "portal", "stats", "statistics", "dashboard", "how many", "amip"],
        },
        "views": [
            "minerals.v_arab_production",
            "minerals.v_world_production",
            "minerals.v_trade_world",
            "minerals.v_bilateral_trade",
            "minerals.v_country_trade_summary",
        ],
        "tables": ["minerals.dim_time", "minerals.dim_countries", "minerals.dim_minerals", "minerals.dim_trade_products"],
    },
}

ALWAYS_INCLUDE_VIEWS = ["minerals.v_country_trade_summary"]
ALWAYS_INCLUDE_TABLES = ["minerals.dim_time", "minerals.dim_countries"]

_RULES_NOTE = """
-- AMIP WAREHOUSE V2 SQL RULES:
-- Use only the minerals schema. Prefer the reporting views listed above.
-- Do NOT use legacy APIP/company-dashboard schemas, date dimensions, status filters,
-- or company/contact/view-count tables. They are not part of AMIP Warehouse V2.
-- Time is represented directly by integer column year. Join dim_time only when decade/date bounds are needed.
-- Countries, minerals, trade products, partners, HS descriptions, and units have multilingual labels:
-- use *_ar for Arabic, *_fr for French, and *_en for English output.
-- Production minerals and trade products are separate domains:
-- use dim_minerals/mineral_name_* for production, and dim_trade_products/product_name_* or HS codes for trade.
-- Do not join production mineral_id directly to trade_product_id unless a curated mapping exists.
-- Aggregate/world trade values are value_usd. Bilateral trade values are value_usd_thousand.
-- v_trade_world does not expose export_value_usd or import_value_usd columns; use value_usd with flow='Export'/'Import' or v_country_trade_summary.
-- v_bilateral_trade does not expose product_name_* columns; use product_group for bilateral product labels.
-- v_world_production has no country columns; use v_top_arab_producers for Arab country rankings and v_production_vs_world for Arab-vs-world shares.
-- Current Warehouse V2 has no reserves fact/table. For reserve volume or reserve-lifespan questions, return CANNOT_GENERATE instead of inventing tables or columns.
-- Price schema exists, but the default local pipeline loads 0 price rows because no warehouse-scoped price source is configured. For current market price questions, return CANNOT_GENERATE unless the price tables are populated.
-- fact_trade_world has value_usd only; there are no quantity columns, so unit-value or price-pressure analytics are unsupported.
-- production_value is the original source value; production_value_base is normalized to the base unit.
-- Preserve duplicate/conflict signals when discussing production quality.
-- Default LIMIT 100 for list-style queries unless the user asks for a specific number.
"""

_COUNTRY_NAMES_NOTE = """
-- COMMON ARAB COUNTRY LABELS AVAILABLE IN dim_countries/v_* views:
-- Arabic, French, and English names are stored separately. Common English examples include:
-- Morocco, Algeria, Tunisia, Libya, Egypt, Sudan, Mauritania, Saudi Arabia,
-- United Arab Emirates, Qatar, Bahrain, Kuwait, Oman, Yemen, Iraq, Jordan,
-- Lebanon, Syria, Palestine, Djibouti, Somalia.
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
    lines = [f"-- {title}"]
    for object_name in selected:
        columns = catalogue.get(object_name)
        if not columns:
            continue
        lines.append(f"{object_name}(")
        for column in columns:
            lines.append(f"  {column},")
        lines.append(")")
    return lines


def get_schema_for_question(question: str) -> str:
    """
    Detect the question topic and return Warehouse V2 schema guidance for the SQL prompt.

    Args:
        question: The user's natural-language question in Arabic, French, or English.

    Returns:
        A multi-line string describing the relevant Warehouse V2 views/tables and rules.
    """
    topic = _detect_topic(question)
    topic_info = SCHEMA_TOPICS[topic]

    views = _unique([*topic_info["views"], *ALWAYS_INCLUDE_VIEWS])
    tables = _unique([*topic_info["tables"], *ALWAYS_INCLUDE_TABLES])

    lines = [
        f"-- Relevant AMIP Warehouse V2 schema for topic: {topic}",
        f"-- Schema: {SCHEMA_NAME}",
        "-- Prefer views for chatbot SQL unless a base table is explicitly needed.",
    ]
    lines.extend(_format_objects("Preferred reporting views", views, V2_VIEWS))
    lines.extend(_format_objects("Key base tables", tables, V2_TABLES))
    lines.append(_RULES_NOTE.strip())
    lines.append(_COUNTRY_NAMES_NOTE.strip())
    return "\n".join(lines)
