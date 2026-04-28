CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_fr VARCHAR(255) NOT NULL,
  iso_code VARCHAR(10) NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS minerals (
  id SERIAL PRIMARY KEY,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_fr VARCHAR(255) NOT NULL,
  category_name_ar VARCHAR(255),
  category_name_en VARCHAR(255),
  category_name_fr VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hs_products (
  code VARCHAR(50) PRIMARY KEY,
  mineral_id INTEGER NOT NULL REFERENCES minerals(id) ON DELETE RESTRICT,
  product_name_ar VARCHAR(255) NOT NULL,
  product_name_en VARCHAR(255) NOT NULL,
  product_name_fr VARCHAR(255) NOT NULL,
  product_category_ar VARCHAR(255),
  product_category_en VARCHAR(255),
  product_category_fr VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trade_partners (
  id SERIAL PRIMARY KEY,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_fr VARCHAR(255) NOT NULL,
  partner_category_ar VARCHAR(255),
  partner_category_en VARCHAR(255),
  partner_category_fr VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS years (
  year INTEGER PRIMARY KEY,
  decade INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS mineral_production (
  id BIGSERIAL PRIMARY KEY,
  country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL,
  mineral_id INTEGER NOT NULL REFERENCES minerals(id) ON DELETE RESTRICT,
  year INTEGER NOT NULL REFERENCES years(year) ON DELETE RESTRICT,
  production_quantity NUMERIC(20, 4),
  normalized_quantity NUMERIC(20, 4),
  unit_name_ar VARCHAR(100),
  unit_name_en VARCHAR(100),
  unit_name_fr VARCHAR(100),
  conversion_factor NUMERIC(20, 8),
  data_source TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_mineral_production UNIQUE (country_id, mineral_id, year)
);

CREATE TABLE IF NOT EXISTS trade_transactions (
  id BIGSERIAL PRIMARY KEY,
  country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
  mineral_id INTEGER NOT NULL REFERENCES minerals(id) ON DELETE RESTRICT,
  hs_product_code VARCHAR(50) REFERENCES hs_products(code) ON DELETE SET NULL,
  year INTEGER NOT NULL REFERENCES years(year) ON DELETE RESTRICT,
  trade_type VARCHAR(10) NOT NULL CHECK (trade_type IN ('import', 'export')),
  trade_value_usd NUMERIC(20, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bilateral_trade (
  id BIGSERIAL PRIMARY KEY,
  country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
  partner_id INTEGER NOT NULL REFERENCES trade_partners(id) ON DELETE RESTRICT,
  year INTEGER NOT NULL REFERENCES years(year) ON DELETE RESTRICT,
  trade_type VARCHAR(10) NOT NULL CHECK (trade_type IN ('import', 'export')),
  trade_value_usd NUMERIC(20, 2) NOT NULL DEFAULT 0,
  trade_share_percent NUMERIC(7, 4),
  is_estimated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_bilateral_trade UNIQUE (country_id, partner_id, year, trade_type)
);

CREATE TABLE IF NOT EXISTS country_production_summary (
  country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  year INTEGER NOT NULL REFERENCES years(year) ON DELETE CASCADE,
  mineral_id INTEGER NOT NULL REFERENCES minerals(id) ON DELETE CASCADE,
  total_production NUMERIC(20, 4),
  unit_name_ar VARCHAR(100),
  unit_name_en VARCHAR(100),
  unit_name_fr VARCHAR(100),
  PRIMARY KEY (country_id, year, mineral_id)
);

CREATE TABLE IF NOT EXISTS country_trade_summary (
  country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  year INTEGER NOT NULL REFERENCES years(year) ON DELETE CASCADE,
  trade_type VARCHAR(10) NOT NULL CHECK (trade_type IN ('import', 'export')),
  total_trade_usd NUMERIC(20, 2) NOT NULL DEFAULT 0,
  total_import_usd NUMERIC(20, 2) NOT NULL DEFAULT 0,
  total_export_usd NUMERIC(20, 2) NOT NULL DEFAULT 0,
  PRIMARY KEY (country_id, year, trade_type)
);

CREATE INDEX IF NOT EXISTS idx_countries_iso_code ON countries(iso_code);
CREATE INDEX IF NOT EXISTS idx_minerals_category_name_ar ON minerals(category_name_ar);
CREATE INDEX IF NOT EXISTS idx_minerals_category_name_en ON minerals(category_name_en);
CREATE INDEX IF NOT EXISTS idx_minerals_category_name_fr ON minerals(category_name_fr);
CREATE INDEX IF NOT EXISTS idx_hs_products_mineral_id ON hs_products(mineral_id);
CREATE INDEX IF NOT EXISTS idx_trade_partners_category_ar ON trade_partners(partner_category_ar);
CREATE INDEX IF NOT EXISTS idx_trade_partners_category_en ON trade_partners(partner_category_en);
CREATE INDEX IF NOT EXISTS idx_trade_partners_category_fr ON trade_partners(partner_category_fr);
CREATE INDEX IF NOT EXISTS idx_mineral_production_country_year ON mineral_production(country_id, year);
CREATE INDEX IF NOT EXISTS idx_mineral_production_mineral_year ON mineral_production(mineral_id, year);
CREATE INDEX IF NOT EXISTS idx_trade_transactions_country_year ON trade_transactions(country_id, year);
CREATE INDEX IF NOT EXISTS idx_trade_transactions_mineral_year ON trade_transactions(mineral_id, year);
CREATE INDEX IF NOT EXISTS idx_trade_transactions_hs_product_code ON trade_transactions(hs_product_code);
CREATE INDEX IF NOT EXISTS idx_bilateral_trade_country_year ON bilateral_trade(country_id, year);
CREATE INDEX IF NOT EXISTS idx_bilateral_trade_partner_year ON bilateral_trade(partner_id, year);
CREATE INDEX IF NOT EXISTS idx_country_production_summary_year ON country_production_summary(year);
CREATE INDEX IF NOT EXISTS idx_country_trade_summary_year ON country_trade_summary(year);

DROP TRIGGER IF EXISTS trg_countries_updated_at ON countries;
CREATE TRIGGER trg_countries_updated_at
BEFORE UPDATE ON countries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_minerals_updated_at ON minerals;
CREATE TRIGGER trg_minerals_updated_at
BEFORE UPDATE ON minerals
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_hs_products_updated_at ON hs_products;
CREATE TRIGGER trg_hs_products_updated_at
BEFORE UPDATE ON hs_products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_trade_partners_updated_at ON trade_partners;
CREATE TRIGGER trg_trade_partners_updated_at
BEFORE UPDATE ON trade_partners
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_mineral_production_updated_at ON mineral_production;
CREATE TRIGGER trg_mineral_production_updated_at
BEFORE UPDATE ON mineral_production
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_trade_transactions_updated_at ON trade_transactions;
CREATE TRIGGER trg_trade_transactions_updated_at
BEFORE UPDATE ON trade_transactions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_bilateral_trade_updated_at ON bilateral_trade;
CREATE TRIGGER trg_bilateral_trade_updated_at
BEFORE UPDATE ON bilateral_trade
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
