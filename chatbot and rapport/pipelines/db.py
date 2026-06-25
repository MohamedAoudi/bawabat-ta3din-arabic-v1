from __future__ import annotations

import os
import threading
from contextlib import contextmanager
from pathlib import Path
from typing import Iterable

import psycopg2
import psycopg2.extras
import psycopg2.pool
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

from pipelines.config import DB


DDL_FILES = [
    Path("warehouse/ddl/01_schema.sql"),
    Path("warehouse/ddl/02_dimensions.sql"),
    Path("warehouse/ddl/03_facts.sql"),
    Path("warehouse/ddl/04_aggregations.sql"),
    Path("warehouse/ddl/05_keys_indexes.sql"),
    Path("warehouse/ddl/06_canonical_mineral_marts.sql"),
    Path("warehouse/views/06_views.sql"),
    Path("warehouse/views/07_mart_views.sql"),
]

V2_MARKER_TABLES = {
    "dim_country_aliases",
    "dim_trade_products",
    "fact_trade_world",
    "fact_bilateral_trade",
    "etl_load_runs",
    "data_quality_issues",
}

V1_ONLY_TABLES = {
    "fact_trade_aggregate",
    "fact_trade_bilateral_import",
    "fact_trade_bilateral_export",
    "agg_production_by_country_year",
    "agg_trade_by_country_year",
}


def get_connection(dbname: str | None = None):
    params = dict(DB)
    if dbname:
        params["dbname"] = dbname
    return psycopg2.connect(**params)


@contextmanager
def get_cursor(commit: bool = True, dbname: str | None = None):
    conn = get_connection(dbname=dbname)
    try:
        with conn:
            with conn.cursor() as cur:
                yield cur
            if commit:
                conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# ─── Read-only connection pool (hot read paths: report API) ───────────────────
# The plain get_cursor() above opens a fresh psycopg2 connection per call and
# closes it — fine for one-shot ETL scripts, but on a long-lived web service it
# re-pays connection setup (≈5–100 ms, worse over TLS/remote) on *every* request.
# get_pooled_cursor() reuses connections from a process-local pool instead.
# Read-only / autocommit, so it must only be used for SELECT-only paths.
_READ_POOL: psycopg2.pool.ThreadedConnectionPool | None = None
_READ_POOL_LOCK = threading.Lock()
_READ_POOL_MAXCONN = int(os.getenv("DB_READ_POOL_MAXCONN", "8"))


def _read_pool() -> psycopg2.pool.ThreadedConnectionPool:
    global _READ_POOL
    if _READ_POOL is None:
        with _READ_POOL_LOCK:
            if _READ_POOL is None:
                _READ_POOL = psycopg2.pool.ThreadedConnectionPool(
                    1, _READ_POOL_MAXCONN, **DB
                )
    return _READ_POOL


@contextmanager
def get_pooled_cursor():
    """Read-only cursor backed by a process-local connection pool.

    For SELECT-only hot paths (e.g. the report API). Connections are autocommit;
    a connection that raises is discarded (closed) rather than returned to the
    pool, so a broken socket never poisons a later request.
    """
    pool = _read_pool()
    conn = pool.getconn()
    discard = False
    try:
        conn.autocommit = True
        with conn.cursor() as cur:
            yield cur
    except Exception:
        discard = True
        raise
    finally:
        pool.putconn(conn, close=discard)


def close_read_pool() -> None:
    """Close all pooled connections (call on service shutdown)."""
    global _READ_POOL
    if _READ_POOL is not None:
        _READ_POOL.closeall()
        _READ_POOL = None


def create_database_if_absent() -> bool:
    """Create the target database if it is absent. Never drops or replaces a DB."""
    target = DB["dbname"]
    admin_params = dict(DB)
    admin_params["dbname"] = "postgres"
    admin_params.pop("options", None)

    conn = psycopg2.connect(**admin_params)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (target,))
            if cur.fetchone():
                return False
            cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(target)))
            return True
    finally:
        conn.close()


def execute_sql_file(path: Path):
    with get_cursor() as cur:
        cur.execute(path.read_text(encoding="utf-8"))


def execute_ddl_files(paths: Iterable[Path] = DDL_FILES):
    for path in paths:
        execute_sql_file(path)


def get_existing_schema_tables(schema: str = "minerals") -> set[str]:
    with get_cursor(commit=False) as cur:
        cur.execute(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = %s AND table_type = 'BASE TABLE'
            """,
            (schema,),
        )
        return {row[0] for row in cur.fetchall()}


def assert_safe_v2_build_target(schema: str = "minerals"):
    """Refuse to apply V2 over an incompatible V1 schema without explicit reset approval."""
    existing = get_existing_schema_tables(schema)
    if not existing:
        return
    if V2_MARKER_TABLES.issubset(existing):
        return
    v1_hits = sorted(existing & V1_ONLY_TABLES)
    raise RuntimeError(
        "Existing minerals schema is not an empty/V2 warehouse. "
        "Refusing non-destructive V2 build over incompatible tables. "
        f"V1 tables detected: {v1_hits or sorted(existing)}. "
        f"Create/use an empty {DB['dbname']} database or explicitly approve a schema reset/migration."
    )


def execute_values(cursor, insert_sql: str, values: list[tuple], page_size: int = 1000):
    if values:
        psycopg2.extras.execute_values(cursor, insert_sql, values, page_size=page_size)


def upsert(cursor, table: str, rows: list[dict], conflict_cols: list[str]):
    if not rows:
        return
    cols = list(rows[0].keys())
    update_cols = [c for c in cols if c not in conflict_cols]
    if update_cols:
        update_sql = ", ".join(f"{c} = EXCLUDED.{c}" for c in update_cols)
        conflict_sql = f"DO UPDATE SET {update_sql}"
    else:
        conflict_sql = "DO NOTHING"
    insert_sql = f"""
        INSERT INTO {table} ({', '.join(cols)})
        VALUES %s
        ON CONFLICT ({', '.join(conflict_cols)}) {conflict_sql}
    """
    values = [tuple(row[col] for col in cols) for row in rows]
    psycopg2.extras.execute_values(cursor, insert_sql, values)


def fetch_lookup(table: str, key_col: str, val_col: str, where_sql: str | None = None) -> dict:
    query = f"SELECT {val_col}, {key_col} FROM {table}"
    if where_sql:
        query += f" WHERE {where_sql}"
    with get_cursor(commit=False) as cur:
        cur.execute(query)
        return {row[0]: row[1] for row in cur.fetchall() if row[0] is not None}


def table_row_count(table: str) -> int:
    with get_cursor(commit=False) as cur:
        cur.execute(sql.SQL("SELECT COUNT(*) FROM {}").format(sql.Identifier(table)))
        return cur.fetchone()[0]
