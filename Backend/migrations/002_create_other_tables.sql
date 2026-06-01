

-- Drop triggers and function
DROP TRIGGER IF EXISTS trg_countries_updated_at ON countries;
DROP TRIGGER IF EXISTS trg_minerals_updated_at ON minerals;
DROP TRIGGER IF EXISTS trg_trade_partners_updated_at ON trade_partners;
DROP TRIGGER IF EXISTS trg_mineral_production_updated_at ON mineral_production;
DROP TRIGGER IF EXISTS trg_trade_transactions_updated_at ON trade_transactions;
DROP FUNCTION IF EXISTS set_updated_at();

-- Create function for updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create countries table
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

-- Create minerals table
CREATE TABLE IF NOT EXISTS minerals (
  id SERIAL PRIMARY KEY,
  hs_minerals VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_fr VARCHAR(255) NOT NULL,
  category_name_ar VARCHAR(255),
  category_name_en VARCHAR(255),
  category_name_fr VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create trade_partners table
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

-- Create mineral_production table
CREATE TABLE IF NOT EXISTS mineral_production (
  id BIGSERIAL PRIMARY KEY,
  country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL,
  mineral_id INTEGER NOT NULL REFERENCES minerals(id) ON DELETE RESTRICT,
  year INTEGER NOT NULL,
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

-- Create trade_transactions table
CREATE TABLE IF NOT EXISTS trade_transactions (
  id BIGSERIAL PRIMARY KEY,
  country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
  mineral_id INTEGER NOT NULL REFERENCES minerals(id) ON DELETE RESTRICT,
  partners_id INTEGER REFERENCES trade_partners(id) ON DELETE SET NULL,
  year INTEGER NOT NULL,
  trade_type VARCHAR(10) NOT NULL CHECK (trade_type IN ('import', 'export')),
  trade_value_usd NUMERIC(20, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- Create triggers for updated_at
CREATE TRIGGER trg_countries_updated_at
BEFORE UPDATE ON countries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_minerals_updated_at
BEFORE UPDATE ON minerals
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_trade_partners_updated_at
BEFORE UPDATE ON trade_partners
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_mineral_production_updated_at
BEFORE UPDATE ON mineral_production
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_trade_transactions_updated_at
BEFORE UPDATE ON trade_transactions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
