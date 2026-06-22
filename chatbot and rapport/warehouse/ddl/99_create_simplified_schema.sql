-- Create simplified AMIP schema (public namespace)
-- This replaces the complex warehouse schema with a simpler 8-table model

-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║                              COUNTRIES TABLE                              ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.countries (
    id SERIAL PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    iso_code VARCHAR(3) UNIQUE,
    display_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║                       MINERAL_PRODUCTION TABLE                            ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.mineral_production (
    id SERIAL PRIMARY KEY,
    hs_codes VARCHAR(255),
    mineral_name_ar VARCHAR(255) NOT NULL,
    mineral_name_en VARCHAR(255) NOT NULL,
    mineral_name_fr VARCHAR(255) NOT NULL,
    source_system VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║                       ARAB_PRODUCTION TABLE                               ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.arab_production (
    id SERIAL PRIMARY KEY,
    country_id INT NOT NULL REFERENCES public.countries(id),
    mineral_production_id INT NOT NULL REFERENCES public.mineral_production(id),
    year INT NOT NULL,
    production_value DECIMAL(15, 2),
    production_value_base DECIMAL(15, 2),
    unit_ar VARCHAR(50),
    unit_en VARCHAR(50),
    unit_fr VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_arab_production_country_id ON public.arab_production(country_id);
CREATE INDEX IF NOT EXISTS idx_arab_production_mineral_id ON public.arab_production(mineral_production_id);
CREATE INDEX IF NOT EXISTS idx_arab_production_year ON public.arab_production(year);

-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║                       WORLD_PRODUCTION TABLE                              ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.world_production (
    id SERIAL PRIMARY KEY,
    mineral_production_id INT NOT NULL REFERENCES public.mineral_production(id),
    year INT NOT NULL,
    production_value DECIMAL(15, 2),
    production_value_base DECIMAL(15, 2),
    unit_ar VARCHAR(50),
    unit_en VARCHAR(50),
    unit_fr VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_world_production_mineral_id ON public.world_production(mineral_production_id);
CREATE INDEX IF NOT EXISTS idx_world_production_year ON public.world_production(year);

-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║                       TRADE_PARTNERS TABLE                                ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.trade_partners (
    id SERIAL PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    partner_category_ar VARCHAR(100),
    partner_category_en VARCHAR(100),
    partner_category_fr VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║                       MINERAL_TRADE TABLE                                 ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.mineral_trade (
    id SERIAL PRIMARY KEY,
    hs_codes VARCHAR(255),
    mineral_name_ar VARCHAR(255) NOT NULL,
    mineral_name_en VARCHAR(255) NOT NULL,
    mineral_name_fr VARCHAR(255) NOT NULL,
    source_system VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║                       TRADE_WORLD TABLE                                   ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.trade_world (
    id SERIAL PRIMARY KEY,
    reporter_country_id INT NOT NULL REFERENCES public.countries(id),
    partner_id INT NOT NULL REFERENCES public.trade_partners(id),
    mineral_trade_id INT NOT NULL REFERENCES public.mineral_trade(id),
    year INT NOT NULL,
    value_usd DECIMAL(15, 2),
    value_share DECIMAL(5, 2),
    type_trade VARCHAR(20) CHECK (type_trade IN ('exports', 'imports')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trade_world_reporter_id ON public.trade_world(reporter_country_id);
CREATE INDEX IF NOT EXISTS idx_trade_world_partner_id ON public.trade_world(partner_id);
CREATE INDEX IF NOT EXISTS idx_trade_world_mineral_id ON public.trade_world(mineral_trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_world_year ON public.trade_world(year);
CREATE INDEX IF NOT EXISTS idx_trade_world_type ON public.trade_world(type_trade);

-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║                       PARTNER_TRADE TABLE                                 ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.partner_trade (
    id SERIAL PRIMARY KEY,
    reporter_country_id INT NOT NULL REFERENCES public.countries(id),
    partner_id INT NOT NULL REFERENCES public.trade_partners(id),
    mineral_trade_id INT NOT NULL REFERENCES public.mineral_trade(id),
    year INT NOT NULL,
    value_usd DECIMAL(15, 2),
    type_trade VARCHAR(20) CHECK (type_trade IN ('exports', 'imports')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_partner_trade_reporter_id ON public.partner_trade(reporter_country_id);
CREATE INDEX IF NOT EXISTS idx_partner_trade_partner_id ON public.partner_trade(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_trade_mineral_id ON public.partner_trade(mineral_trade_id);
CREATE INDEX IF NOT EXISTS idx_partner_trade_year ON public.partner_trade(year);
CREATE INDEX IF NOT EXISTS idx_partner_trade_type ON public.partner_trade(type_trade);
