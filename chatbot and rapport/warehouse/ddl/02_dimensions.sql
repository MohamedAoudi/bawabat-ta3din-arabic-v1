-- ─────────────────────────────────────────────────────────────────────────────
-- 02_dimensions.sql  –  Dimension tables
-- ─────────────────────────────────────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS minerals;
SET search_path TO minerals, public;

-- ── dim_time ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_time (
    year    INTEGER PRIMARY KEY,
    decade  INTEGER NOT NULL
);

-- ── dim_countries ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_countries (
    country_id      SERIAL  PRIMARY KEY,
    country_name_ar TEXT    NOT NULL,
    country_name_en TEXT,
    country_name_fr TEXT,
    display_order   INTEGER,
    CONSTRAINT uq_countries_ar UNIQUE (country_name_ar)
);

-- ── dim_minerals ──────────────────────────────────────────────────────────────
-- Both arabic and english group names are nullable so each can be populated
-- independently by separate loaders; non-NULL values must be unique.
CREATE TABLE IF NOT EXISTS dim_minerals (
    mineral_id       SERIAL PRIMARY KEY,
    mineral_name_ar  TEXT,
    mineral_name_en  TEXT,
    mineral_name_fr  TEXT,
    mineral_group_en TEXT,
    CONSTRAINT uq_minerals_ar  UNIQUE (mineral_name_ar),
    CONSTRAINT uq_minerals_gen UNIQUE (mineral_group_en)
);

-- ── dim_hs_codes ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_hs_codes (
    hs_code           VARCHAR(6) PRIMARY KEY,
    mineral_id        INTEGER    REFERENCES dim_minerals(mineral_id) ON DELETE SET NULL,
    hs_description    TEXT,
    aggregate_product TEXT
);

-- ── dim_partners ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_partners (
    partner_id   SERIAL PRIMARY KEY,
    partner_name TEXT NOT NULL,
    partner_type TEXT NOT NULL CHECK (partner_type IN ('world', 'region', 'country')),
    CONSTRAINT uq_partners_name UNIQUE (partner_name)
);
