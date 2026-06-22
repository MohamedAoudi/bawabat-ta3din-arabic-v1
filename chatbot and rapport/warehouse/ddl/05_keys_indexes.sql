-- ─────────────────────────────────────────────────────────────────────────────
-- 05_keys_indexes.sql  –  Performance indexes
-- ─────────────────────────────────────────────────────────────────────────────

SET search_path TO minerals, public;

-- ── fact_arab_production ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ap_country_year
    ON fact_arab_production (country_id, year);

CREATE INDEX IF NOT EXISTS idx_ap_mineral_year
    ON fact_arab_production (mineral_id, year);

-- ── fact_world_production ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_wp_mineral_year
    ON fact_world_production (mineral_id, year);

-- ── fact_trade_aggregate ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ta_country_year
    ON fact_trade_aggregate (country_id, year);

CREATE INDEX IF NOT EXISTS idx_ta_country_mineral_year
    ON fact_trade_aggregate (country_id, mineral_id, year);

CREATE INDEX IF NOT EXISTS idx_ta_flow
    ON fact_trade_aggregate (flow);

-- ── fact_trade_bilateral_import ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tbi_country_partner_year
    ON fact_trade_bilateral_import (country_id, partner_id, year);

CREATE INDEX IF NOT EXISTS idx_tbi_country_year
    ON fact_trade_bilateral_import (country_id, year);

-- ── fact_trade_bilateral_export ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tbe_country_partner_year
    ON fact_trade_bilateral_export (country_id, partner_id, year);

CREATE INDEX IF NOT EXISTS idx_tbe_country_year
    ON fact_trade_bilateral_export (country_id, year);

CREATE INDEX IF NOT EXISTS idx_tbe_computed
    ON fact_trade_bilateral_export (export_value_computed);
