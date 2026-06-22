-- ─────────────────────────────────────────────────────────────────────────────
-- 03_facts.sql  –  Fact tables
-- ─────────────────────────────────────────────────────────────────────────────

SET search_path TO minerals, public;

-- ── fact_arab_production ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fact_arab_production (
    production_id         BIGSERIAL PRIMARY KEY,
    country_id            INTEGER   NOT NULL REFERENCES dim_countries(country_id),
    mineral_id            INTEGER   NOT NULL REFERENCES dim_minerals(mineral_id),
    year                  INTEGER   NOT NULL REFERENCES dim_time(year),
    production_value      NUMERIC,
    production_value_norm NUMERIC,
    unit                  TEXT,
    unit_multiplier       NUMERIC,
    source                TEXT,
    CONSTRAINT uq_ap_country_mineral_year UNIQUE (country_id, mineral_id, year)
);

-- ── fact_world_production ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fact_world_production (
    production_id         BIGSERIAL PRIMARY KEY,
    mineral_id            INTEGER   NOT NULL REFERENCES dim_minerals(mineral_id),
    year                  INTEGER   NOT NULL REFERENCES dim_time(year),
    production_value      NUMERIC,
    production_value_norm NUMERIC,
    unit                  TEXT,
    unit_multiplier       NUMERIC,
    CONSTRAINT uq_wp_mineral_year UNIQUE (mineral_id, year)
);

-- ── fact_trade_aggregate ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fact_trade_aggregate (
    trade_id   BIGSERIAL  PRIMARY KEY,
    country_id INTEGER    NOT NULL REFERENCES dim_countries(country_id),
    mineral_id INTEGER    REFERENCES dim_minerals(mineral_id) ON DELETE SET NULL,
    hs_code    VARCHAR(6) REFERENCES dim_hs_codes(hs_code)   ON DELETE SET NULL,
    year       INTEGER    NOT NULL REFERENCES dim_time(year),
    flow       SMALLINT   NOT NULL,
    value_usd  NUMERIC,
    CONSTRAINT uq_ta_country_hs_year_flow UNIQUE (country_id, hs_code, year, flow)
);

-- ── fact_trade_bilateral_import ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fact_trade_bilateral_import (
    import_id                 BIGSERIAL PRIMARY KEY,
    country_id                INTEGER   NOT NULL REFERENCES dim_countries(country_id),
    partner_id                INTEGER   NOT NULL REFERENCES dim_partners(partner_id),
    year                      INTEGER   NOT NULL REFERENCES dim_time(year),
    product_group             TEXT,
    import_value_usd_thousand NUMERIC,
    import_share_pct          NUMERIC,
    CONSTRAINT uq_tbi_country_partner_year UNIQUE (country_id, partner_id, year)
);

-- ── fact_trade_bilateral_export ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fact_trade_bilateral_export (
    export_id             BIGSERIAL PRIMARY KEY,
    country_id            INTEGER   NOT NULL REFERENCES dim_countries(country_id),
    partner_id            INTEGER   NOT NULL REFERENCES dim_partners(partner_id),
    year                  INTEGER   NOT NULL REFERENCES dim_time(year),
    product_group         TEXT,
    export_share_pct      NUMERIC,
    export_value_usd      NUMERIC,
    export_value_computed BOOLEAN   NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_tbe_country_partner_year UNIQUE (country_id, partner_id, year)
);
