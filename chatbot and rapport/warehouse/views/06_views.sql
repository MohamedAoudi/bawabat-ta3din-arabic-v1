-- ─────────────────────────────────────────────────────────────────────────────
-- 06_views.sql  –  Reporting views
-- ─────────────────────────────────────────────────────────────────────────────

SET search_path TO minerals, public;

-- ── v_arab_production ─────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_arab_production AS
SELECT
    c.country_name_ar,
    c.country_name_en,
    m.mineral_name_ar,
    m.mineral_name_en,
    m.mineral_group_en,
    fap.year,
    fap.production_value,
    fap.production_value_norm,
    fap.unit,
    fap.source
FROM fact_arab_production fap
JOIN dim_countries c ON c.country_id = fap.country_id
JOIN dim_minerals  m ON m.mineral_id = fap.mineral_id;

-- ── v_world_production ────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_world_production AS
SELECT
    m.mineral_name_ar,
    m.mineral_name_en,
    m.mineral_group_en,
    fwp.year,
    fwp.production_value,
    fwp.production_value_norm,
    fwp.unit
FROM fact_world_production fwp
JOIN dim_minerals m ON m.mineral_id = fwp.mineral_id;

-- ── v_production_vs_world ─────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_production_vs_world AS
SELECT
    m.mineral_name_en,
    m.mineral_group_en,
    ap.year,
    SUM(ap.production_value_norm)   AS arab_total_norm,
    wp.production_value_norm        AS world_total_norm,
    CASE
        WHEN wp.production_value_norm > 0
        THEN ROUND(
            (SUM(ap.production_value_norm) / wp.production_value_norm * 100)::NUMERIC,
            2
        )
    END                             AS arab_share_pct
FROM fact_arab_production ap
JOIN fact_world_production wp
    ON  wp.mineral_id = ap.mineral_id
    AND wp.year       = ap.year
JOIN dim_minerals m ON m.mineral_id = ap.mineral_id
GROUP BY
    m.mineral_name_en,
    m.mineral_group_en,
    ap.year,
    wp.production_value_norm;

-- ── v_trade_aggregate ─────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_trade_aggregate AS
SELECT
    c.country_name_en,
    m.mineral_group_en,
    h.hs_code,
    h.hs_description,
    fta.year,
    fta.flow,
    CASE fta.flow
        WHEN 1 THEN 'Export'
        WHEN 2 THEN 'Import'
        ELSE        'Unknown'
    END             AS flow_label,
    fta.value_usd
FROM fact_trade_aggregate fta
JOIN  dim_countries c ON c.country_id = fta.country_id
LEFT JOIN dim_minerals m ON m.mineral_id = fta.mineral_id
LEFT JOIN dim_hs_codes h ON h.hs_code   = fta.hs_code;

-- ── v_bilateral_import ────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_bilateral_import AS
SELECT
    c.country_name_en           AS reporter,
    p.partner_name,
    p.partner_type,
    fbi.year,
    fbi.product_group,
    fbi.import_value_usd_thousand,
    fbi.import_share_pct
FROM fact_trade_bilateral_import fbi
JOIN dim_countries c ON c.country_id = fbi.country_id
JOIN dim_partners  p ON p.partner_id = fbi.partner_id;

-- ── v_bilateral_export ────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_bilateral_export AS
SELECT
    c.country_name_en        AS reporter,
    p.partner_name,
    p.partner_type,
    fbe.year,
    fbe.product_group,
    fbe.export_share_pct,
    fbe.export_value_usd,
    fbe.export_value_computed
FROM fact_trade_bilateral_export fbe
JOIN dim_countries c ON c.country_id = fbe.country_id
JOIN dim_partners  p ON p.partner_id = fbe.partner_id;

-- ── v_top_producers ───────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_top_producers AS
SELECT
    m.mineral_name_en,
    m.mineral_group_en,
    c.country_name_en,
    fap.year,
    fap.production_value_norm,
    RANK() OVER (
        PARTITION BY fap.mineral_id, fap.year
        ORDER BY fap.production_value_norm DESC NULLS LAST
    ) AS rank
FROM fact_arab_production fap
JOIN dim_minerals  m ON m.mineral_id = fap.mineral_id
JOIN dim_countries c ON c.country_id = fap.country_id;
