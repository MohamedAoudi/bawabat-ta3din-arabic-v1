# AMIP - Arab Mining Indicators Portal

AMIP (بوابة المؤشرات التعدينية العربية / Arab Mining Indicators Portal / Portail arabe des indicateurs miniers) is a mineral indicators portal and analytics prototype for Arab mining data. It combines a PostgreSQL warehouse, Python ETL pipelines, FastAPI chatbot and report APIs, Text-to-SQL, LIST/FAQ retrieval, LightRAG-backed document retrieval, chart generation, Redis-backed sessions/cache/rate limiting, and multilingual PDF reports.

The platform focuses on countries, minerals, production, trade, HS codes, partners, data quality, reports, and AI assistance. Price tables exist in Warehouse V2, but price loading is currently a documented placeholder until a local warehouse-scoped price source is provided.

## Stack
- **Database**: PostgreSQL Warehouse V2 in schema `minerals` (10 dimensions, 5 facts, 8 aggregate tables, 8 reporting views)
- **ETL**: Python + pandas + psycopg2
- **AI layer**: FastAPI chatbot using OpenAI, LightRAG, Redis, and PostgreSQL

## Project structure
```
arab-minerals-dw/
├── warehouse/   # SQL scripts for warehouse DDL and reporting views
├── data/raw/    # Source Excel workbooks for AMIP ETL
├── pipelines/   # Data cleaning and warehouse loading pipelines
├── src/chatbot/  # Canonical chatbot runtime package
├── src/reports/  # Report generation API and PDF builder
├── knowledge/    # Prompt assets, static knowledge, and RAG ingestion docs
├── ../lightrag-server-amip/ # External LightRAG service folder used during demos
├── archive/      # Preserved legacy code, snapshots, and generated artifacts
└── tests/       # Validation tests
```

## Setup

### 1. Clone and install dependencies
```bash
git clone <repo>
cd arab-minerals-dw
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with local PostgreSQL, OpenAI, Redis, and LightRAG settings
```

### 3. Create the database
Recommended bootstrap command:

```bash
python scripts/create_warehouse.py
```

This creates the configured database when absent, applies all warehouse DDL and
views in dependency order, and verifies schemas, tables, views, foreign keys,
and indexes. It creates structure only and does not load source data.

Manual `psql` alternative:

```bash
createdb -p 5432 arab_minerals_dw
psql -p 5432 arab_minerals_dw < warehouse/ddl/01_schema.sql
psql -p 5432 arab_minerals_dw < warehouse/ddl/02_dimensions.sql
psql -p 5432 arab_minerals_dw < warehouse/ddl/03_facts.sql
psql -p 5432 arab_minerals_dw < warehouse/ddl/04_aggregations.sql
psql -p 5432 arab_minerals_dw < warehouse/ddl/05_keys_indexes.sql
psql -p 5432 arab_minerals_dw < warehouse/ddl/06_canonical_mineral_marts.sql
psql -p 5432 arab_minerals_dw < warehouse/views/06_views.sql
psql -p 5432 arab_minerals_dw < warehouse/views/07_mart_views.sql
```

### 4. Place source files
```
data/raw/fact_arab_production.xlsx
data/raw/fact_world_production.xlsx
data/raw/fact_trade_export.xlsx
data/raw/fact_trade_import.xlsx
data/raw/ref_countries.xlsx
data/raw/ref_minerals_hs.xlsx
data/raw/bilateral/Morocco/fact_bilateral_export_usd.xlsx
data/raw/bilateral/Morocco/fact_bilateral_export_pct.xlsx
data/raw/bilateral/Morocco/fact_bilateral_import_usd.xlsx
data/raw/bilateral/Morocco/fact_bilateral_import_pct.xlsx
# ... one folder per supported country
```

### 5. Run the ETL pipeline
```bash
# Full pipeline (all steps)
python -m pipelines.pipeline

# Single step
python -m pipelines.pipeline --step 01
```

### 6. Run the chatbot
```bash
gunicorn -c gunicorn.conf.py src.chatbot.api.app:app
```
> **Note**: The canonical chatbot runtime now lives under `src/chatbot/`.
> **Production note**: `--reload` must never be used in production.

### 7. Run the report API
```bash
gunicorn -c gunicorn.conf.py src.reports.api:app
```

## ETL step reference
| Step | Script | Description |
|------|--------|-------------|
| 00 | `load_dims_static.py` | Seed dim_time, dim_countries, dim_partners |
| 01 | `load_arab_production.py` | Arab production to fact_arab_production |
| 02 | `load_world_production.py` | World production to fact_world_production |
| 03 | `load_trade_aggregate.py` | Trade files to fact_trade_world |
| 04 | `load_bilateral_trade.py` | Country partner files to fact_bilateral_trade |
| 05 | `load_canonical_minerals.py` | Canonical mineral hub and production/trade/HS bridge mappings |
| 06 | `load_prices.py` | Safe no-op price placeholder; logs `price_loader_no_source` |
| 07 | `refresh_aggregations.py` | Recompute aggregate tables |

## Warehouse V2 inventory

Dimensions: `dim_time`, `dim_countries`, `dim_country_aliases`, `dim_units`, `dim_sources`, `dim_minerals`, `dim_canonical_minerals`, `dim_mineral_aliases`, `dim_trade_products`, `dim_hs_codes`, `dim_partners`, `dim_price_assets`.

Facts: `fact_arab_production`, `fact_world_production`, `fact_trade_world`, `fact_bilateral_trade`, `fact_mineral_price_ticks`, `fact_mineral_reserves`.

Aggregates: production by Arab country/mineral/year, world production by mineral/year, world trade by country/product/year/flow, bilateral trade by country/partner/year/flow, country-year trade totals, daily/monthly/quarterly/yearly price aggregates, and reserve aggregates.

Reporting views: `v_arab_production`, `v_world_production`, `v_production_vs_world`, `v_trade_world`, `v_bilateral_trade`, `v_country_trade_summary`, `v_top_arab_producers`, `v_data_quality_summary`, plus mart schemas `mart_production`, `mart_trade`, `mart_price`, `mart_reserve`, and `mart_mineral_360`.

Implemented analytics are strongest for Arab production, top producers, production trends, Arab-vs-world production share, aggregate import/export values, country trade summaries, HS/product export breakdowns, and bilateral partner values for countries with complete bilateral workbooks. Reserves are unsupported. Price tables exist, but the default local pipeline loads zero price rows until a real warehouse-scoped local price source is added. Trade facts do not include quantities, so unit-value and price-pressure analytics are not supported.

## Adding a new country
1. Create `data/raw/bilateral/{country_name_en}/`
2. Place `fact_bilateral_export_usd.xlsx`, `fact_bilateral_export_pct.xlsx`, `fact_bilateral_import_usd.xlsx`, and `fact_bilateral_import_pct.xlsx` in that folder. The loader also accepts older short names such as `export_usd.xlsx` for compatibility.
3. Run step 04 only: `python -m pipelines.pipeline --step 04`

## Running tests
```bash
pytest tests/ -v
```
