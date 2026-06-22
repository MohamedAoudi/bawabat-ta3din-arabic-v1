-- ─────────────────────────────────────────────────────────────────────────────
-- 04_aggregations.sql  –  Pre-computed aggregation tables
-- (Truncated and reloaded by loader 06; no FK constraints to avoid truncate issues)
-- ─────────────────────────────────────────────────────────────────────────────

SET search_path TO minerals, public;

-- ── agg_production_by_country_year ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agg_production_by_country_year (
    country_id            INTEGER NOT NULL,
    year                  INTEGER NOT NULL,
    mineral_id            INTEGER NOT NULL,
    total_production_norm NUMERIC,
    unit                  TEXT,
    CONSTRAINT uq_apcy UNIQUE (country_id, mineral_id, year)
);

-- ── agg_trade_by_country_year ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agg_trade_by_country_year (
    country_id                INTEGER  NOT NULL,
    year                      INTEGER  NOT NULL,
    flow                      SMALLINT NOT NULL,
    total_value_usd           NUMERIC,
    total_import_usd_thousand NUMERIC,
    total_export_usd          NUMERIC,
    CONSTRAINT uq_atcy UNIQUE (country_id, year, flow)
);
