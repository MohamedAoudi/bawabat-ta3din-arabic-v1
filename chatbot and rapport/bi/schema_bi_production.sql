-- ============================================================================
-- bi schema — PRODUCTION semantic layer (Power BI + reusable read-model)
-- ----------------------------------------------------------------------------
-- Read-only star-schema views over amip_db.public. Touches NO public data.
-- Scope: production only (arab_production + world_production). Trade/bilateral
-- intentionally excluded. Re-runnable (CREATE OR REPLACE).
--
-- Grain:
--   bi.fact_arab_production   country x mineral x year
--   bi.fact_world_production  mineral x year   (world benchmark)
-- Aggregate ONLY on production_value_base, and ONLY within a single unit
-- family (mass vs volume) — never sum across minerals/units blindly.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS bi;

-- ── Dimensions ──────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW bi.dim_country AS
SELECT id            AS country_id,
       iso_code,
       name_en,
       name_fr,
       name_ar,
       display_order
FROM   public.countries;

CREATE OR REPLACE VIEW bi.dim_mineral_production AS
SELECT id            AS mineral_production_id,
       hs_codes,
       mineral_name_en,
       mineral_name_fr,
       mineral_name_ar
FROM   public.mineral_production;

-- Year spine covering both production fact tables, for Power BI time-intelligence.
CREATE OR REPLACE VIEW bi.dim_date AS
SELECT y                              AS year,
       make_date(y, 1, 1)             AS date_key,
       make_date(y, 12, 31)           AS date_key_end
FROM generate_series(
        (SELECT COALESCE(MIN(year), 2010) FROM (
            SELECT year FROM public.arab_production
            UNION ALL
            SELECT year FROM public.world_production
        ) AS yrs),
        (SELECT COALESCE(MAX(year), 2024) FROM (
            SELECT year FROM public.arab_production
            UNION ALL
            SELECT year FROM public.world_production
        ) AS yrs)
     ) AS gs(y);

-- ── Facts ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW bi.fact_arab_production AS
SELECT country_id,
       mineral_production_id,
       year,
       make_date(year, 1, 1)          AS date_key,
       production_value,
       production_value_base,
       unit_en,
       unit_ar
FROM   public.arab_production;

CREATE OR REPLACE VIEW bi.fact_world_production AS
SELECT mineral_production_id,
       year,
       make_date(year, 1, 1)          AS date_key,
       production_value,
       production_value_base,
       unit_en,
       unit_ar
FROM   public.world_production;

-- ── Permissions ─────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA bi TO postgres;
GRANT SELECT ON ALL TABLES IN SCHEMA bi TO postgres;
