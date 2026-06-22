from __future__ import annotations

import re

ALLOWED_TABLES: frozenset[str] = frozenset([
    # New simplified AMIP schema (public namespace).
    "countries",
    "mineral_production",
    "trade_partners",
    "arab_production",
    "world_production",
    "mineral_trade",
    "trade_world",
    "partner_trade",
    # Legacy warehouse schema support (for backwards compatibility).
    # Chatbot-facing V2 reporting views.
   
])

ALLOWED_SCHEMAS: frozenset[str] = frozenset([
    "public",  # New simplified AMIP schema
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
