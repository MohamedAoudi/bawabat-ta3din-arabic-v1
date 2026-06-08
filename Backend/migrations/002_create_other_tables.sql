-- AMIP Warehouse V2 - schema bootstrap and audit tables

CREATE TABLE IF NOT EXISTS etl_load_runs (
    run_id              BIGSERIAL PRIMARY KEY,
    pipeline_name       TEXT NOT NULL,
    started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at         TIMESTAMPTZ,
    status              TEXT NOT NULL DEFAULT 'running'
                        CHECK (status IN ('running', 'success', 'failed')),
    source_root         TEXT,
    notes               TEXT,
    rows_loaded         INTEGER NOT NULL DEFAULT 0,
    quality_issue_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS data_quality_issues (
    issue_id          BIGSERIAL PRIMARY KEY,
    run_id            BIGINT REFERENCES etl_load_runs(run_id) ON DELETE SET NULL,
    severity          TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error')),
    issue_type        TEXT NOT NULL,
    entity_type       TEXT,
    entity_key        TEXT,
    source_file       TEXT,
    source_sheet      TEXT,
    source_row_number INTEGER,
    issue_message     TEXT NOT NULL,
    raw_payload       JSONB,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dqi_run_severity
    ON data_quality_issues (run_id, severity);

CREATE INDEX IF NOT EXISTS idx_dqi_type
    ON data_quality_issues (issue_type);

-- AMIP Warehouse V2 - dimensions

SET search_path TO minerals, public;

CREATE TABLE IF NOT EXISTS dim_time (
    year       INTEGER PRIMARY KEY,
    decade     INTEGER NOT NULL,
    year_start DATE NOT NULL,
    year_end   DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS dim_countries (
    country_id      SERIAL PRIMARY KEY,
    country_name_ar TEXT,
    country_name_en TEXT,
    country_name_fr TEXT,
    display_order   INTEGER,
    is_arab_country BOOLEAN NOT NULL DEFAULT TRUE,
    source_file     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_countries_ar UNIQUE (country_name_ar),
    CONSTRAINT ck_country_has_name CHECK (
        country_name_ar IS NOT NULL OR country_name_en IS NOT NULL OR country_name_fr IS NOT NULL
    )
);

CREATE TABLE IF NOT EXISTS dim_country_aliases (
    alias_id       SERIAL PRIMARY KEY,
    country_id     INTEGER NOT NULL REFERENCES dim_countries(country_id) ON DELETE CASCADE,
    alias_name     TEXT NOT NULL,
    language_code  TEXT NOT NULL DEFAULT 'unknown' CHECK (language_code IN ('ar', 'en', 'fr', 'unknown')),
    alias_type     TEXT NOT NULL,
    source_system  TEXT,
    is_primary     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_country_alias UNIQUE (alias_name, language_code, alias_type)
);

CREATE TABLE IF NOT EXISTS dim_units (
    unit_id            SERIAL PRIMARY KEY,
    unit_ar            TEXT,
    unit_en            TEXT,
    unit_fr            TEXT,
    measurement_type   TEXT NOT NULL CHECK (measurement_type IN ('mass', 'volume', 'count', 'currency', 'ratio', 'unknown')),
    multiplier_to_base NUMERIC NOT NULL DEFAULT 1,
    base_unit_ar       TEXT,
    base_unit_en       TEXT,
    base_unit_fr       TEXT,
    notes              TEXT,
    CONSTRAINT uq_units_ar UNIQUE (unit_ar),
    CONSTRAINT ck_unit_has_name CHECK (unit_ar IS NOT NULL OR unit_en IS NOT NULL OR unit_fr IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS dim_sources (
    source_id   SERIAL PRIMARY KEY,
    source_name TEXT NOT NULL UNIQUE,
    source_type TEXT,
    source_url  TEXT,
    notes       TEXT
);

CREATE TABLE IF NOT EXISTS dim_minerals (
    mineral_id      SERIAL PRIMARY KEY,
    mineral_name_ar TEXT,
    mineral_name_en TEXT,
    mineral_name_fr TEXT,
    mineral_group   TEXT,
    source_system   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_mineral_ar UNIQUE (mineral_name_ar),
    CONSTRAINT ck_mineral_has_name CHECK (
        mineral_name_ar IS NOT NULL OR mineral_name_en IS NOT NULL OR mineral_name_fr IS NOT NULL
    )
);

CREATE TABLE IF NOT EXISTS dim_trade_products (
    trade_product_id SERIAL PRIMARY KEY,
    product_name_ar  TEXT,
    product_name_en  TEXT,
    product_name_fr  TEXT,
    source_system    TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_trade_product_en UNIQUE (product_name_en),
    CONSTRAINT ck_trade_product_has_name CHECK (
        product_name_ar IS NOT NULL OR product_name_en IS NOT NULL OR product_name_fr IS NOT NULL
    )
);

CREATE TABLE IF NOT EXISTS dim_hs_codes (
    hs_code          VARCHAR(6) PRIMARY KEY,
    trade_product_id INTEGER REFERENCES dim_trade_products(trade_product_id) ON DELETE SET NULL,
    description_ar   TEXT,
    description_en   TEXT,
    description_fr   TEXT,
    source_system    TEXT,
    CONSTRAINT ck_hs_code_6_digits CHECK (hs_code ~ '^[0-9]{6}$')
);

CREATE TABLE IF NOT EXISTS dim_partners (
    partner_id      SERIAL PRIMARY KEY,
    partner_name_ar TEXT,
    partner_name_en TEXT,
    partner_name_fr TEXT,
    partner_type    TEXT NOT NULL CHECK (partner_type IN ('world', 'region', 'country', 'unknown')),
    source_system   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_partner_en UNIQUE (partner_name_en),
    CONSTRAINT ck_partner_has_name CHECK (
        partner_name_ar IS NOT NULL OR partner_name_en IS NOT NULL OR partner_name_fr IS NOT NULL
    )
);

CREATE TABLE IF NOT EXISTS dim_price_assets (
    price_asset_id       SERIAL PRIMARY KEY,
    asset_symbol         TEXT,
    asset_name_ar        TEXT,
    asset_name_en        TEXT,
    asset_name_fr        TEXT,
    commodity_group      TEXT,
    quote_currency       TEXT DEFAULT 'USD',
    price_unit_ar        TEXT,
    price_unit_en        TEXT,
    price_unit_fr        TEXT,
    source_platform      TEXT,
    source_asset_id      TEXT,
    source_metadata      JSONB,
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_price_asset_source UNIQUE (source_platform, source_asset_id),
    CONSTRAINT ck_price_asset_has_name CHECK (
        asset_name_ar IS NOT NULL OR asset_name_en IS NOT NULL OR asset_name_fr IS NOT NULL OR asset_symbol IS NOT NULL
    )
);

-- AMIP Warehouse V2 - facts

SET search_path TO minerals, public;

CREATE TABLE IF NOT EXISTS fact_arab_production (
    production_fact_id       BIGSERIAL PRIMARY KEY,
    country_id               INTEGER NOT NULL REFERENCES dim_countries(country_id),
    mineral_id               INTEGER NOT NULL REFERENCES dim_minerals(mineral_id),
    year                     INTEGER NOT NULL REFERENCES dim_time(year),
    production_value         NUMERIC,
    production_value_base    NUMERIC,
    unit_id                  INTEGER REFERENCES dim_units(unit_id),
    source_id                INTEGER REFERENCES dim_sources(source_id),
    source_file              TEXT NOT NULL,
    source_sheet             TEXT,
    source_row_number        INTEGER NOT NULL,
    ingestion_run_id         BIGINT REFERENCES etl_load_runs(run_id) ON DELETE SET NULL,
    record_hash              TEXT NOT NULL UNIQUE,
    duplicate_group_count    INTEGER NOT NULL DEFAULT 1,
    is_conflicting_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
    raw_payload              JSONB,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fact_world_production (
    world_production_fact_id BIGSERIAL PRIMARY KEY,
    mineral_id               INTEGER NOT NULL REFERENCES dim_minerals(mineral_id),
    year                     INTEGER NOT NULL REFERENCES dim_time(year),
    production_value         NUMERIC,
    production_value_base    NUMERIC,
    unit_id                  INTEGER REFERENCES dim_units(unit_id),
    source_file              TEXT NOT NULL,
    source_sheet             TEXT,
    source_row_number        INTEGER NOT NULL,
    ingestion_run_id         BIGINT REFERENCES etl_load_runs(run_id) ON DELETE SET NULL,
    record_hash              TEXT NOT NULL UNIQUE,
    raw_payload              JSONB,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_world_production_mineral_year UNIQUE (mineral_id, year)
);

CREATE TABLE IF NOT EXISTS fact_trade_world (
    trade_world_fact_id BIGSERIAL PRIMARY KEY,
    reporter_country_id INTEGER NOT NULL REFERENCES dim_countries(country_id),
    partner_id          INTEGER REFERENCES dim_partners(partner_id),
    flow                TEXT NOT NULL CHECK (flow IN ('Export', 'Import')),
    trade_product_id    INTEGER REFERENCES dim_trade_products(trade_product_id),
    hs_code             VARCHAR(6) REFERENCES dim_hs_codes(hs_code),
    year                INTEGER NOT NULL REFERENCES dim_time(year),
    value_usd           NUMERIC,
    source_file         TEXT NOT NULL,
    source_sheet        TEXT,
    source_row_number   INTEGER NOT NULL,
    ingestion_run_id    BIGINT REFERENCES etl_load_runs(run_id) ON DELETE SET NULL,
    record_hash         TEXT NOT NULL UNIQUE,
    raw_payload         JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fact_bilateral_trade (
    bilateral_trade_fact_id BIGSERIAL PRIMARY KEY,
    reporter_country_id     INTEGER NOT NULL REFERENCES dim_countries(country_id),
    partner_id              INTEGER NOT NULL REFERENCES dim_partners(partner_id),
    flow                    TEXT NOT NULL CHECK (flow IN ('Export', 'Import')),
    product_group           TEXT NOT NULL DEFAULT 'Minerals',
    year                    INTEGER NOT NULL REFERENCES dim_time(year),
    value_usd_thousand      NUMERIC,
    share_pct               NUMERIC,
    source_file_value       TEXT,
    source_file_share       TEXT,
    source_sheet            TEXT,
    source_row_number       INTEGER,
    ingestion_run_id        BIGINT REFERENCES etl_load_runs(run_id) ON DELETE SET NULL,
    record_hash             TEXT NOT NULL UNIQUE,
    raw_payload             JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_bilateral_trade_grain UNIQUE (reporter_country_id, partner_id, flow, product_group, year)
);

CREATE TABLE IF NOT EXISTS fact_mineral_price_ticks (
    price_tick_id      BIGSERIAL PRIMARY KEY,
    price_asset_id     INTEGER NOT NULL REFERENCES dim_price_assets(price_asset_id),
    observed_at        TIMESTAMPTZ NOT NULL,
    price_value        NUMERIC,
    quote_currency     TEXT DEFAULT 'USD',
    price_unit         TEXT,
    source_platform    TEXT,
    source_payload     JSONB,
    ingestion_run_id   BIGINT REFERENCES etl_load_runs(run_id) ON DELETE SET NULL,
    record_hash        TEXT NOT NULL UNIQUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AMIP Warehouse V2 - aggregate tables

SET search_path TO minerals, public;

CREATE TABLE IF NOT EXISTS agg_arab_production_by_country_mineral_year (
    country_id               INTEGER NOT NULL REFERENCES dim_countries(country_id),
    mineral_id               INTEGER NOT NULL REFERENCES dim_minerals(mineral_id),
    year                     INTEGER NOT NULL REFERENCES dim_time(year),
    total_production_base    NUMERIC,
    source_record_count      INTEGER NOT NULL DEFAULT 0,
    conflicting_record_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (country_id, mineral_id, year)
);

CREATE TABLE IF NOT EXISTS agg_world_production_by_mineral_year (
    mineral_id            INTEGER NOT NULL REFERENCES dim_minerals(mineral_id),
    year                  INTEGER NOT NULL REFERENCES dim_time(year),
    world_production_base NUMERIC,
    PRIMARY KEY (mineral_id, year)
);

CREATE TABLE IF NOT EXISTS agg_trade_world_by_country_product_year_flow (
    country_id        INTEGER NOT NULL REFERENCES dim_countries(country_id),
    trade_product_id  INTEGER NOT NULL REFERENCES dim_trade_products(trade_product_id),
    year              INTEGER NOT NULL REFERENCES dim_time(year),
    flow              TEXT NOT NULL CHECK (flow IN ('Export', 'Import')),
    total_value_usd   NUMERIC,
    source_row_count  INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (country_id, trade_product_id, year, flow)
);

CREATE TABLE IF NOT EXISTS agg_bilateral_trade_by_country_partner_year_flow (
    country_id             INTEGER NOT NULL REFERENCES dim_countries(country_id),
    partner_id             INTEGER NOT NULL REFERENCES dim_partners(partner_id),
    year                   INTEGER NOT NULL REFERENCES dim_time(year),
    flow                   TEXT NOT NULL CHECK (flow IN ('Export', 'Import')),
    total_value_usd_thousand NUMERIC,
    avg_share_pct          NUMERIC,
    source_row_count       INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (country_id, partner_id, year, flow)
);

CREATE TABLE IF NOT EXISTS agg_country_year_trade_totals (
    country_id                     INTEGER NOT NULL REFERENCES dim_countries(country_id),
    year                           INTEGER NOT NULL REFERENCES dim_time(year),
    export_value_usd               NUMERIC,
    import_value_usd               NUMERIC,
    bilateral_export_usd_thousand  NUMERIC,
    bilateral_import_usd_thousand  NUMERIC,
    PRIMARY KEY (country_id, year)
);

CREATE TABLE IF NOT EXISTS agg_mineral_price_monthly (
    price_asset_id   INTEGER NOT NULL REFERENCES dim_price_assets(price_asset_id),
    month_start      DATE NOT NULL,
    avg_price        NUMERIC,
    min_price        NUMERIC,
    max_price        NUMERIC,
    observation_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (price_asset_id, month_start)
);

CREATE TABLE IF NOT EXISTS agg_mineral_price_quarterly (
    price_asset_id    INTEGER NOT NULL REFERENCES dim_price_assets(price_asset_id),
    quarter_start     DATE NOT NULL,
    avg_price         NUMERIC,
    min_price         NUMERIC,
    max_price         NUMERIC,
    observation_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (price_asset_id, quarter_start)
);

CREATE TABLE IF NOT EXISTS agg_mineral_price_yearly (
    price_asset_id    INTEGER NOT NULL REFERENCES dim_price_assets(price_asset_id),
    year              INTEGER NOT NULL REFERENCES dim_time(year),
    avg_price         NUMERIC,
    min_price         NUMERIC,
    max_price         NUMERIC,
    observation_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (price_asset_id, year)
);

-- AMIP Warehouse V2 - indexes

SET search_path TO minerals, public;

CREATE INDEX IF NOT EXISTS idx_country_alias_lookup
    ON dim_country_aliases (LOWER(alias_name));

CREATE INDEX IF NOT EXISTS idx_minerals_names
    ON dim_minerals (LOWER(mineral_name_ar), LOWER(mineral_name_en));

CREATE INDEX IF NOT EXISTS idx_trade_products_name_en
    ON dim_trade_products (LOWER(product_name_en));

CREATE INDEX IF NOT EXISTS idx_hs_trade_product
    ON dim_hs_codes (trade_product_id);

CREATE INDEX IF NOT EXISTS idx_partners_name_en
    ON dim_partners (LOWER(partner_name_en));

CREATE INDEX IF NOT EXISTS idx_arab_prod_country_year
    ON fact_arab_production (country_id, year);

CREATE INDEX IF NOT EXISTS idx_arab_prod_mineral_year
    ON fact_arab_production (mineral_id, year);

CREATE INDEX IF NOT EXISTS idx_arab_prod_duplicate
    ON fact_arab_production (is_conflicting_duplicate);

CREATE INDEX IF NOT EXISTS idx_world_prod_mineral_year
    ON fact_world_production (mineral_id, year);

CREATE INDEX IF NOT EXISTS idx_trade_world_country_year_flow
    ON fact_trade_world (reporter_country_id, year, flow);

CREATE INDEX IF NOT EXISTS idx_trade_world_product_year
    ON fact_trade_world (trade_product_id, year);

CREATE INDEX IF NOT EXISTS idx_trade_world_hs
    ON fact_trade_world (hs_code);

CREATE INDEX IF NOT EXISTS idx_bilateral_country_year_flow
    ON fact_bilateral_trade (reporter_country_id, year, flow);

CREATE INDEX IF NOT EXISTS idx_bilateral_partner_year
    ON fact_bilateral_trade (partner_id, year);

CREATE INDEX IF NOT EXISTS idx_price_ticks_asset_time
    ON fact_mineral_price_ticks (price_asset_id, observed_at DESC);

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
