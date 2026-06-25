# Load the Database From the Data Folder

This guide explains how to fill the PostgreSQL database using the data files and loader scripts in:

```text
chatbot and repport/data/
```

Use this guide for the current website, report service, and chatbot. Those services use the simplified PostgreSQL `public` schema in `amip_db`.

## What Gets Loaded

The current data load uses these scripts:

| Script | Source data | Target tables |
|---|---|---|
| `python -m pipelines.loaders.load_public_production` | Production workbooks and country references | `countries`, `mineral_production`, `arab_production`, `world_production` |
| `python -m pipelines.loaders.load_public_trade` | Aggregate import/export workbooks | `trade_partners`, `mineral_trade`, `trade_world` |
| `python -m pipelines.loaders.load_public_bilateral` | Clean bilateral partner CSVs | `trade_partners`, `mineral_trade`, `partner_trade` |

Run the scripts in this order:

```text
1. load_public_production
2. load_public_trade
3. load_public_bilateral
```

The order matters because trade and bilateral loads depend on countries already existing in the database.

## Expected Data Files

The loader scripts expect these files:

```text
chatbot and repport/data/raw/fact_arab_production.xlsx
chatbot and repport/data/raw/fact_world_production.xlsx
chatbot and repport/data/raw/ref_minerals_hs.xlsx
chatbot and repport/data/raw/fact_trade_export.xlsx
chatbot and repport/data/raw/fact_trade_import.xlsx
chatbot and repport/data/staging/ref_countries.xlsx
chatbot and repport/data/processed/translations_countries_lookup.json
chatbot and repport/data/processed/translations_minerals_public.json
chatbot and repport/data/processed/translations_mineral_trade_public.json
chatbot and repport/data/processed/bilateral/<country>/export_clean.csv
chatbot and repport/data/processed/bilateral/<country>/import_clean.csv
```

If a translation cache is missing, the production/trade loaders may call OpenAI to create translations. Keep `OPENAI_API_KEY` configured even if the cache files are present.

## 1. Start PostgreSQL

From the repository root:

```bash
docker compose up -d postgres
```

The root `docker-compose.yml` exposes PostgreSQL on host port `5434` by default:

```text
DB_HOST=localhost
DB_PORT=5434
DB_NAME=amip_db
DB_USER=postgres
DB_PASSWORD=root
DB_SCHEMA=public
```

If you use a local PostgreSQL server instead, use your local port and credentials.

## 2. Create the Public Schema Tables

The easiest path is to start the Node backend once. It runs migrations and creates the public tables.

Create `Backend/.env`:

```bash
cd Backend
cp .env.example .env
```

For the Docker PostgreSQL service, use:

```text
DB_HOST=localhost
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=root
DB_NAME=amip_db
DB_SCHEMA=public
JWT_SECRET=replace-with-a-local-development-secret
PORT=5001
```

Start the backend:

```bash
npm install
npm run dev
```

Leave it running until you see that the server started. It will:

```text
- create tables from Backend/migrations/
- create indexes
- seed the 21 countries into public.countries
```

Quick check:

```bash
curl http://localhost:5001/
```

Expected:

```text
API is running...
```

## 3. Configure the Loader Environment

Create `chatbot and repport/.env`:

```bash
cd "../chatbot and repport"
cp .env.example .env
```

Set the database values to the same database used by `Backend/.env`.

For Docker PostgreSQL on host port `5434`:

```text
APP_ENV=development
DB_HOST=localhost
DB_PORT=5434
DB_NAME=amip_db
DB_USER=postgres
DB_PASSWORD=root
DB_SCHEMA=public

OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o
OPENAI_TIMEOUT_SECONDS=90
OPENAI_MAX_RETRIES=2
```

The loaders use `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`. They force `search_path=public` internally.

## 4. Install Python Dependencies

From `chatbot and repport/`:

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

If your machine uses `python3`:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 5. Confirm the Data Folder Is Present

From `chatbot and repport/`:

```bash
find data -maxdepth 4 -type f | sort
```

At minimum, confirm these exist:

```bash
test -f data/raw/fact_arab_production.xlsx
test -f data/raw/fact_world_production.xlsx
test -f data/raw/ref_minerals_hs.xlsx
test -f data/raw/fact_trade_export.xlsx
test -f data/raw/fact_trade_import.xlsx
test -f data/staging/ref_countries.xlsx
test -f data/processed/translations_countries_lookup.json
test -d data/processed/bilateral
```

If any command exits with no message, that check passed. If it prints an error, the file or folder is missing.

## 6. Run the Load Scripts

Run all scripts from `chatbot and repport/` with the virtual environment active:

```bash
source .venv/bin/activate
python -m pipelines.loaders.load_public_production
python -m pipelines.loaders.load_public_trade
python -m pipelines.loaders.load_public_bilateral
```

The scripts print summary information after each run. They are designed to be safe to rerun:

```text
- dimensions are upserted
- fact rows are upserted by natural keys
- supporting indexes are created with IF NOT EXISTS
- bilateral load checks that production and aggregate trade counts did not change
```

## 7. What Each Script Does

### `load_public_production`

Reads:

```text
data/raw/fact_arab_production.xlsx
data/raw/fact_world_production.xlsx
data/raw/ref_minerals_hs.xlsx
data/staging/ref_countries.xlsx
data/processed/translations_countries_lookup.json
data/processed/translations_minerals_public.json
```

Writes:

```text
public.countries
public.mineral_production
public.arab_production
public.world_production
```

Important details:

```text
- repairs/seeds country names from ref_countries.xlsx
- normalizes units into production_value_base
- creates/upserts mineral names in Arabic, English, and French
- uses translation cache or OpenAI for missing mineral translations
- creates unique indexes for idempotent reruns
```

### `load_public_trade`

Reads:

```text
data/raw/fact_trade_export.xlsx
data/raw/fact_trade_import.xlsx
data/processed/translations_mineral_trade_public.json
```

Writes:

```text
public.trade_partners
public.mineral_trade
public.trade_world
```

Important details:

```text
- loads aggregate import/export trade against partner "World"
- groups HS-level rows into mineral trade groups
- stores values in value_usd
- stores flow in type_trade as "export" or "import"
- widens/uses mineral_trade.hs_codes as TEXT through current migrations
```

### `load_public_bilateral`

Reads:

```text
data/processed/bilateral/<country>/export_clean.csv
data/processed/bilateral/<country>/import_clean.csv
```

Writes:

```text
public.trade_partners
public.mineral_trade
public.partner_trade
```

Important details:

```text
- only loads rows where partner_type is "country"
- skips region and world aggregate rows
- converts values from thousand USD to full USD
- stores all rows under a sentinel mineral named "All Minerals"
- excludes that sentinel from the report API mineral dropdown
```

## 8. Verify the Loaded Data

Connect to PostgreSQL.

For Docker PostgreSQL on host port `5434`:

```bash
psql "postgresql://postgres:root@localhost:5434/amip_db"
```

Then run:

```sql
SELECT count(*) AS countries FROM public.countries;
SELECT count(*) AS production_minerals FROM public.mineral_production;
SELECT count(*) AS arab_production_rows FROM public.arab_production;
SELECT count(*) AS world_production_rows FROM public.world_production;
SELECT count(*) AS trade_minerals FROM public.mineral_trade;
SELECT count(*) AS world_trade_rows FROM public.trade_world;
SELECT count(*) AS partner_trade_rows FROM public.partner_trade;
SELECT count(*) AS trade_partners FROM public.trade_partners;
```

Expected approximate counts with the committed data:

```text
countries: 21
production_minerals: about 111
arab_production_rows: about 2881
world_production_rows: about 255
trade_minerals: about 26, including "All Minerals"
world_trade_rows: about 6050
partner_trade_rows: greater than 0 when bilateral CSVs are present
trade_partners: greater than 1 when bilateral CSVs are present
```

Check for missing core data:

```sql
SELECT c.name_en, count(*) AS rows
FROM public.arab_production ap
JOIN public.countries c ON c.id = ap.country_id
GROUP BY c.name_en
ORDER BY c.name_en;

SELECT type_trade, count(*) AS rows, sum(value_usd) AS total_value_usd
FROM public.trade_world
GROUP BY type_trade
ORDER BY type_trade;

SELECT type_trade, count(*) AS rows, sum(value_usd) AS total_value_usd
FROM public.partner_trade
GROUP BY type_trade
ORDER BY type_trade;
```

## 9. Verify the Report API Can See the Data

Start the report API from `chatbot and repport/`:

```bash
source .venv/bin/activate
GUNICORN_BIND=0.0.0.0:8001 gunicorn -c gunicorn.conf.py src.reports.api:app
```

Then check:

```bash
curl "http://localhost:8001/options?lang=en"
curl "http://localhost:8001/availability"
```

Both responses should contain countries and minerals. If they are empty, the database is either empty or the report API is connected to a different database than the loaders.

## 10. Verify the Chatbot Can Query the Data

Start the chatbot API from `chatbot and repport/`:

```bash
source .venv/bin/activate
gunicorn -c gunicorn.conf.py src.chatbot.api.app:app
```

Then test:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"How many countries are in the database?","language":"en","session_id":"db-load-test","user_type":"anonymous"}'
```

You can also test a production question:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Top 5 Arab phosphate producers in 2023","language":"en","session_id":"db-load-test","user_type":"anonymous"}'
```

## 11. Rerunning the Load

You can rerun the loaders after editing source files:

```bash
cd "chatbot and repport"
source .venv/bin/activate
python -m pipelines.loaders.load_public_production
python -m pipelines.loaders.load_public_trade
python -m pipelines.loaders.load_public_bilateral
```

Reruns update existing rows rather than blindly duplicating them. If you need a completely clean reload, create a fresh database or truncate the target tables intentionally before rerunning. Do not truncate tables unless you understand the foreign-key order.

## 12. Troubleshooting

### `relation "public.countries" does not exist`

The backend migrations have not run yet. Start the backend once:

```bash
cd Backend
npm run dev
```

### `connection refused`

PostgreSQL is not running, or the port is wrong.

If using root Docker Compose, the default host port is `5434`, not `5432`:

```text
DB_PORT=5434
```

### `password authentication failed`

The loader `.env` and PostgreSQL credentials do not match. Check:

```text
DB_USER
DB_PASSWORD
DB_NAME
DB_PORT
```

### `OPENAI_API_KEY is not configured`

A translation cache was missing or incomplete, so the loader tried to call OpenAI. Add `OPENAI_API_KEY` to `chatbot and repport/.env`, or restore the translation cache files under `data/processed/`.

### `Missing required production source files`

One of these files is missing:

```text
data/raw/fact_arab_production.xlsx
data/raw/fact_world_production.xlsx
data/raw/ref_minerals_hs.xlsx
data/staging/ref_countries.xlsx
data/processed/translations_countries_lookup.json
```

### `Missing required trade source files`

One of these files is missing:

```text
data/raw/fact_trade_export.xlsx
data/raw/fact_trade_import.xlsx
```

### Bilateral load reports zero rows

Check that the processed bilateral folder exists:

```bash
find data/processed/bilateral -maxdepth 2 -type f | sort
```

Each country folder should contain files like:

```text
export_clean.csv
import_clean.csv
```

The bilateral loader only loads rows where `partner_type` is `country`, so region/world rows are skipped by design.

## 13. Do Not Use the Warehouse V2 Pipeline for the Website DB

The command below belongs to the older standalone warehouse flow:

```bash
python -m pipelines.pipeline
```

That flow targets the Warehouse V2 schema, usually:

```text
DB_NAME=arab_minerals_dw
DB_SCHEMA=minerals
```

The current website report page and chatbot schema context use:

```text
DB_NAME=amip_db
DB_SCHEMA=public
```

For the website database, use the three `load_public_*` scripts in this guide.

