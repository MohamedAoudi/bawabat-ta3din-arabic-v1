CREATE TABLE IF NOT EXISTS countries (
    id BIGSERIAL PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    iso_code VARCHAR(10) UNIQUE NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mineral_production (
    id BIGSERIAL PRIMARY KEY,
    hs_codes VARCHAR(100),
    mineral_name_ar VARCHAR(255) NOT NULL,
    mineral_name_en VARCHAR(255) NOT NULL,
    mineral_name_fr VARCHAR(255) NOT NULL,
    source_system VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trade_partners (
    id BIGSERIAL PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    partner_category_ar VARCHAR(255),
    partner_category_en VARCHAR(255),
    partner_category_fr VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS arab_production (
    id BIGSERIAL PRIMARY KEY,
    country_id BIGINT NOT NULL,
    mineral_production_id BIGINT NOT NULL,
    year INTEGER NOT NULL,
    production_value NUMERIC(20,4),
    production_value_base NUMERIC(20,4),
    unit_ar VARCHAR(100),
    unit_fr VARCHAR(100),
    unit_en VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
    FOREIGN KEY (mineral_production_id) REFERENCES mineral_production(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS world_production (
    id BIGSERIAL PRIMARY KEY,
    mineral_production_id BIGINT NOT NULL,
    year INTEGER NOT NULL,
    production_value NUMERIC(20,4),
    production_value_base NUMERIC(20,4),
    unit_ar VARCHAR(100),
    unit_fr VARCHAR(100),
    unit_en VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mineral_production_id) REFERENCES mineral_production(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mineral_trade (
    id BIGSERIAL PRIMARY KEY,
    hs_codes TEXT,
    mineral_name_ar VARCHAR(255) NOT NULL,
    mineral_name_en VARCHAR(255) NOT NULL,
    mineral_name_fr VARCHAR(255) NOT NULL,
    source_system VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trade_world (
    id BIGSERIAL PRIMARY KEY,
    reporter_country_id BIGINT NOT NULL,
    partner_id BIGINT NOT NULL,
    mineral_trade_id BIGINT NOT NULL,
    year INTEGER NOT NULL,
    value_usd NUMERIC(20,2),
    value_share NUMERIC(10,4),
    type_trade VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_country_id) REFERENCES countries(id),
    FOREIGN KEY (partner_id) REFERENCES trade_partners(id),
    FOREIGN KEY (mineral_trade_id) REFERENCES mineral_trade(id)
);

CREATE TABLE IF NOT EXISTS partner_trade (
    id BIGSERIAL PRIMARY KEY,
    reporter_country_id BIGINT NOT NULL,
    partner_id BIGINT NOT NULL,
    mineral_trade_id BIGINT NOT NULL,
    year INTEGER NOT NULL,
    value_usd NUMERIC(20,2),
    type_trade VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_country_id) REFERENCES countries(id),
    FOREIGN KEY (partner_id) REFERENCES trade_partners(id),
    FOREIGN KEY (mineral_trade_id) REFERENCES mineral_trade(id)
);



CREATE INDEX IF NOT EXISTS idx_arab_production_country ON arab_production(country_id);
CREATE INDEX IF NOT EXISTS idx_arab_production_mineral ON arab_production(mineral_production_id);

CREATE INDEX IF NOT EXISTS idx_world_production_mineral ON world_production(mineral_production_id);

CREATE INDEX IF NOT EXISTS idx_trade_world_year ON trade_world(year);
CREATE INDEX IF NOT EXISTS idx_trade_world_country ON trade_world(reporter_country_id);
CREATE INDEX IF NOT EXISTS idx_trade_world_partner ON trade_world(partner_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_trade_partners_en ON trade_partners(name_en);
CREATE UNIQUE INDEX IF NOT EXISTS ux_mineral_trade_en ON mineral_trade(mineral_name_en);
CREATE UNIQUE INDEX IF NOT EXISTS ux_trade_world_key
ON trade_world(reporter_country_id, partner_id, mineral_trade_id, year, type_trade);
