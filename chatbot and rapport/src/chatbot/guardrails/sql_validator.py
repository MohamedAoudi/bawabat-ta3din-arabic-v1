from __future__ import annotations

import re

ALLOWED_TABLES: frozenset[str] = frozenset([
    # Chatbot-facing V2 reporting views.
    "v_arab_production",
    "v_world_production",
    "v_production_vs_world",
    "v_trade_world",
    "v_bilateral_trade",
    "v_country_trade_summary",
    "v_top_arab_producers",
    "v_data_quality_summary",
    "v_production_by_canonical_mineral",
    "v_world_production_by_canonical_mineral",
    "v_trade_by_canonical_mineral",
    "v_bilateral_trade_partner_summary",
    "v_price_ticks_by_canonical_mineral",
    "v_price_daily_by_canonical_mineral",
    "v_price_monthly_by_canonical_mineral",
    "v_price_quarterly_by_canonical_mineral",
    "v_price_yearly_by_canonical_mineral",
    "v_reserves_by_canonical_mineral",
    "v_country_mineral_year_summary",
    "v_mineral_year_price_summary",
    # Dimensions.
    "dim_time",
    "dim_countries",
    "dim_country_aliases",
    "dim_minerals",
    "dim_canonical_minerals",
    "dim_mineral_aliases",
    "dim_trade_products",
    "dim_hs_codes",
    "dim_partners",
    "dim_units",
    "dim_sources",
    "dim_price_assets",
    # Facts.
    "fact_arab_production",
    "fact_world_production",
    "fact_trade_world",
    "fact_bilateral_trade",
    "fact_mineral_price_ticks",
    "fact_mineral_reserves",
    # Aggregates and audit tables.
    "agg_arab_production_by_country_mineral_year",
    "agg_world_production_by_mineral_year",
    "agg_trade_world_by_country_product_year_flow",
    "agg_bilateral_trade_by_country_partner_year_flow",
    "agg_country_year_trade_totals",
    "agg_mineral_price_monthly",
    "agg_mineral_price_quarterly",
    "agg_mineral_price_yearly",
    "agg_mineral_price_daily",
    "agg_reserves_by_country_mineral_year",
    # Canonical mapping bridges.
    "bridge_dim_minerals_canonical",
    "bridge_trade_products_canonical",
    "bridge_hs_codes_canonical",
    "bridge_price_assets_canonical",
    "etl_load_runs",
    "data_quality_issues",
])

ALLOWED_SCHEMAS: frozenset[str] = frozenset([
    "minerals",
    "mart_production",
    "mart_trade",
    "mart_price",
    "mart_reserve",
    "mart_mineral_360",
])

_BLOCKED_PATTERNS: list[str] = [
    # DML / DDL
    r"\bDROP\b", r"\bDELETE\b", r"\bUPDATE\b", r"\bINSERT\b", r"\bALTER\b",
    r"\bTRUNCATE\b", r"\bCREATE\b", r"\bREPLACE\b", r"\bGRANT\b", r"\bREVOKE\b",
    # Dangerous functions / procedures
    r"\bxp_", r"\bEXEC\b", r"\bEXECUTE\b", r"\bCALL\b",
    r"\bLOAD\b", r"\bOUTFILE\b", r"\bINFILE\b", r"\bCOPY\b",
    # Set operations that bypass the table allowlist
    r"\bUNION\b", r"\bINTERSECT\b", r"\bEXCEPT\b",
    # Output redirection
    r"\bINTO\b",
    # Comment delimiters
    r"--", r"/\*",
    # System functions/catalogs (pg_sleep, pg_read_file, pg_catalog, …)
    r"\bpg_\w+", r"\bdblink\b", r"\blo_import\b", r"\blo_export\b",
    r"\bset_config\b", r"\binformation_schema\b",
]

_BLOCKED_RE = re.compile("|".join(_BLOCKED_PATTERNS), re.IGNORECASE)
_TABLE_REF_RE = re.compile(
    r"""
    \b(?:FROM|JOIN)\s+
    (?!\()
    (?:
        (?:"(?P<schema_quoted>[^"]+)"|`?(?P<schema>\w+)`?)\.
    )?
    (?:"(?P<table_quoted>[^"]+)"|`?(?P<table>\w+)`?)
    """,
    re.IGNORECASE | re.VERBOSE,
)
_MULTI_STMT_RE = re.compile(r";\s*\S")


def _extract_references(sql: str) -> tuple[set[str], set[str]]:
    """Return referenced table/view names and invalid schemas found in the SQL."""
    referenced_tables: set[str] = set()
    invalid_schemas: set[str] = set()

    for match in _TABLE_REF_RE.finditer(sql):
        schema = (match.group("schema_quoted") or match.group("schema") or "").lower()
        table = (match.group("table_quoted") or match.group("table") or "").lower()
        if schema and schema not in ALLOWED_SCHEMAS:
            invalid_schemas.add(schema)
        if table:
            referenced_tables.add(table)

    return referenced_tables, invalid_schemas


def validate_sql(sql: str) -> tuple[bool, str]:
    stripped = sql.strip().rstrip(";")

    if not stripped:
        return False, "Empty SQL statement."

    if _MULTI_STMT_RE.search(stripped):
        return False, "Multiple SQL statements are not allowed."

    match = _BLOCKED_RE.search(stripped)
    if match:
        return False, f"Blocked keyword detected: '{match.group()}'."

    if not re.match(r"^\s*SELECT\b", stripped, re.IGNORECASE):
        return False, "Only SELECT statements are allowed."

    referenced_tables, invalid_schemas = _extract_references(stripped)
    if invalid_schemas:
        return False, f"References disallowed schema(s): {', '.join(sorted(invalid_schemas))}."

    unknown = referenced_tables - {t.lower() for t in ALLOWED_TABLES}
    if unknown:
        return False, f"References unknown table(s): {', '.join(sorted(unknown))}."

    return True, ""


_LIMIT_RE = re.compile(r"\bLIMIT\s+\d+", re.IGNORECASE)
DEFAULT_LIMIT: int = 500


def enforce_limit(sql: str, max_rows: int = DEFAULT_LIMIT) -> str:
    """Append a LIMIT clause when the statement has none.

    The executor already caps fetched rows, so this is defence in depth:
    it keeps unbounded scans from hammering the database in the first place.
    Statements that contain any LIMIT (even in a subquery) are left untouched.
    """
    stripped = sql.strip().rstrip(";")
    if _LIMIT_RE.search(stripped):
        return stripped
    return f"{stripped} LIMIT {max_rows}"
