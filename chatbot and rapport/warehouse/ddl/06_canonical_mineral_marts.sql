-- AMIP Warehouse V2 - canonical mineral hub and mart foundations

CREATE SCHEMA IF NOT EXISTS mart_production;
CREATE SCHEMA IF NOT EXISTS mart_trade;
CREATE SCHEMA IF NOT EXISTS mart_price;
CREATE SCHEMA IF NOT EXISTS mart_reserve;
CREATE SCHEMA IF NOT EXISTS mart_mineral_360;

SET search_path TO minerals, public;

CREATE TABLE IF NOT EXISTS dim_canonical_minerals (
    canonical_mineral_id SERIAL PRIMARY KEY,
    canonical_slug       TEXT NOT NULL UNIQUE,
    mineral_name_ar      TEXT,
    mineral_name_en      TEXT NOT NULL,
    mineral_name_fr      TEXT,
    mineral_group        TEXT,
    description          TEXT,
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_canonical_mineral_has_name CHECK (
        mineral_name_ar IS NOT NULL OR mineral_name_en IS NOT NULL OR mineral_name_fr IS NOT NULL
    )
);

CREATE TABLE IF NOT EXISTS dim_mineral_aliases (
    mineral_alias_id      BIGSERIAL PRIMARY KEY,
    canonical_mineral_id  INTEGER NOT NULL REFERENCES dim_canonical_minerals(canonical_mineral_id) ON DELETE CASCADE,
    alias_name            TEXT NOT NULL,
    language_code         TEXT NOT NULL DEFAULT 'unknown'
                          CHECK (language_code IN ('ar', 'en', 'fr', 'symbol', 'hs', 'unknown')),
    alias_type            TEXT NOT NULL,
    source_system         TEXT,
    source_field          TEXT,
    confidence_score      NUMERIC CHECK (confidence_score IS NULL OR confidence_score BETWEEN 0 AND 1),
    is_primary            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_mineral_alias UNIQUE (alias_name, language_code, alias_type, source_system)
);

CREATE TABLE IF NOT EXISTS bridge_dim_minerals_canonical (
    mineral_id            INTEGER NOT NULL REFERENCES dim_minerals(mineral_id) ON DELETE CASCADE,
    canonical_mineral_id  INTEGER NOT NULL REFERENCES dim_canonical_minerals(canonical_mineral_id) ON DELETE CASCADE,
    mapping_method        TEXT NOT NULL DEFAULT 'curated',
    source_system         TEXT,
    confidence_score      NUMERIC CHECK (confidence_score IS NULL OR confidence_score BETWEEN 0 AND 1),
    notes                 TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (mineral_id, canonical_mineral_id)
);

CREATE TABLE IF NOT EXISTS bridge_trade_products_canonical (
    trade_product_id      INTEGER NOT NULL REFERENCES dim_trade_products(trade_product_id) ON DELETE CASCADE,
    canonical_mineral_id  INTEGER NOT NULL REFERENCES dim_canonical_minerals(canonical_mineral_id) ON DELETE CASCADE,
    mapping_method        TEXT NOT NULL DEFAULT 'curated',
    source_system         TEXT,
    confidence_score      NUMERIC CHECK (confidence_score IS NULL OR confidence_score BETWEEN 0 AND 1),
    notes                 TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (trade_product_id, canonical_mineral_id)
);

CREATE TABLE IF NOT EXISTS bridge_hs_codes_canonical (
    hs_code               VARCHAR(6) NOT NULL REFERENCES dim_hs_codes(hs_code) ON DELETE CASCADE,
    canonical_mineral_id  INTEGER NOT NULL REFERENCES dim_canonical_minerals(canonical_mineral_id) ON DELETE CASCADE,
    mapping_method        TEXT NOT NULL DEFAULT 'curated',
    source_system         TEXT,
    confidence_score      NUMERIC CHECK (confidence_score IS NULL OR confidence_score BETWEEN 0 AND 1),
    notes                 TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (hs_code, canonical_mineral_id)
);

CREATE TABLE IF NOT EXISTS bridge_price_assets_canonical (
    price_asset_id        INTEGER NOT NULL REFERENCES dim_price_assets(price_asset_id) ON DELETE CASCADE,
    canonical_mineral_id  INTEGER NOT NULL REFERENCES dim_canonical_minerals(canonical_mineral_id) ON DELETE CASCADE,
    mapping_method        TEXT NOT NULL DEFAULT 'curated',
    source_system         TEXT,
    confidence_score      NUMERIC CHECK (confidence_score IS NULL OR confidence_score BETWEEN 0 AND 1),
    notes                 TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (price_asset_id, canonical_mineral_id)
);

ALTER TABLE fact_mineral_price_ticks
    ADD COLUMN IF NOT EXISTS price_change NUMERIC,
    ADD COLUMN IF NOT EXISTS price_value_change NUMERIC;

CREATE TABLE IF NOT EXISTS agg_mineral_price_daily (
    price_asset_id       INTEGER NOT NULL REFERENCES dim_price_assets(price_asset_id) ON DELETE CASCADE,
    price_date           DATE NOT NULL,
    open_price           NUMERIC,
    close_price          NUMERIC,
    avg_price            NUMERIC,
    min_price            NUMERIC,
    max_price            NUMERIC,
    avg_change           NUMERIC,
    avg_value_change     NUMERIC,
    observation_count    INTEGER NOT NULL DEFAULT 0,
    ingestion_run_id     BIGINT REFERENCES etl_load_runs(run_id) ON DELETE SET NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (price_asset_id, price_date)
);

CREATE TABLE IF NOT EXISTS fact_mineral_reserves (
    reserve_fact_id        BIGSERIAL PRIMARY KEY,
    country_id             INTEGER NOT NULL REFERENCES dim_countries(country_id),
    canonical_mineral_id   INTEGER NOT NULL REFERENCES dim_canonical_minerals(canonical_mineral_id),
    year                   INTEGER NOT NULL REFERENCES dim_time(year),
    reserve_value          NUMERIC,
    reserve_value_base     NUMERIC,
    unit_id                INTEGER REFERENCES dim_units(unit_id),
    reserve_category       TEXT,
    source_id              INTEGER REFERENCES dim_sources(source_id),
    source_file            TEXT,
    source_sheet           TEXT,
    source_row_number      INTEGER,
    ingestion_run_id       BIGINT REFERENCES etl_load_runs(run_id) ON DELETE SET NULL,
    record_hash            TEXT NOT NULL UNIQUE,
    raw_payload            JSONB,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agg_reserves_by_country_mineral_year (
    country_id             INTEGER NOT NULL REFERENCES dim_countries(country_id),
    canonical_mineral_id   INTEGER NOT NULL REFERENCES dim_canonical_minerals(canonical_mineral_id),
    year                   INTEGER NOT NULL REFERENCES dim_time(year),
    reserve_value_base     NUMERIC,
    source_record_count    INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (country_id, canonical_mineral_id, year)
);

CREATE INDEX IF NOT EXISTS idx_canonical_minerals_name_en
    ON dim_canonical_minerals (LOWER(mineral_name_en));

CREATE INDEX IF NOT EXISTS idx_mineral_alias_lookup
    ON dim_mineral_aliases (LOWER(alias_name), language_code);

CREATE INDEX IF NOT EXISTS idx_bridge_dim_minerals_canonical_canonical
    ON bridge_dim_minerals_canonical (canonical_mineral_id);

CREATE INDEX IF NOT EXISTS idx_bridge_trade_products_canonical_canonical
    ON bridge_trade_products_canonical (canonical_mineral_id);

CREATE INDEX IF NOT EXISTS idx_bridge_hs_codes_canonical_canonical
    ON bridge_hs_codes_canonical (canonical_mineral_id);

CREATE INDEX IF NOT EXISTS idx_bridge_price_assets_canonical_canonical
    ON bridge_price_assets_canonical (canonical_mineral_id);

CREATE INDEX IF NOT EXISTS idx_price_daily_date
    ON agg_mineral_price_daily (price_date);

CREATE INDEX IF NOT EXISTS idx_reserves_country_year
    ON fact_mineral_reserves (country_id, year);

CREATE INDEX IF NOT EXISTS idx_reserves_canonical_year
    ON fact_mineral_reserves (canonical_mineral_id, year);

COMMENT ON TABLE dim_canonical_minerals IS
    'Curated mineral identity hub used to connect production, trade HS/product data, price assets, and reserves.';

COMMENT ON TABLE dim_mineral_aliases IS
    'Multilingual/source-specific aliases and symbols for canonical minerals.';

COMMENT ON TABLE bridge_hs_codes_canonical IS
    'Curated bridge from HS trade codes to canonical minerals. HS codes help trade integration but are not the only mineral identity.';

COMMENT ON TABLE bridge_price_assets_canonical IS
    'Curated bridge from API price assets to canonical minerals.';

COMMENT ON TABLE fact_mineral_reserves IS
    'Reserve mart fact placeholder. It remains empty until AMIP reserve source files are approved and loaded.';

COMMENT ON TABLE agg_mineral_price_daily IS
    'Daily price aggregate mart. Intended to be populated from live/historical API price observations later.';
