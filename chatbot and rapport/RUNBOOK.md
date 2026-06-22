# AMIP Runbook

This runbook starts the local AMIP demo stack:

- PostgreSQL warehouse (`arab_minerals_dw` on port `5432`, schema `minerals`)
- Redis for sessions, SQL cache, and rate limiting
- LightRAG for document RAG
- Chatbot API
- Report API

Run commands from `arab-minerals-dw/` unless noted.

## Prerequisites

- Python 3.12 or the project `.venv`
- Docker and Docker Compose
- PostgreSQL listening on the configured `DB_HOST`/`DB_PORT`
- Local raw workbooks in `data/raw/`
- OpenAI API key in local `.env`
- Optional external LightRAG folder at `../lightrag-server-amip/`

## Environment Setup

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env locally. Do not commit .env.
```

Important env values:

```text
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arab_minerals_dw
DB_SCHEMA=minerals
REDIS_URL=redis://localhost:6380/0
LIGHTRAG_BASE_URL=http://localhost:9622
OPENAI_API_KEY=<your-openai-api-key>
```

## Start PostgreSQL Warehouse

Start PostgreSQL using your local service manager, then create and verify the
warehouse structure:

```bash
source .venv/bin/activate
python scripts/create_warehouse.py
```

This command creates structure only and does not load source data.

To verify an existing warehouse without making changes:

```bash
python scripts/create_warehouse.py --check-only
```

To apply DDL only through a manual psql flow:

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

## Start Redis

```bash
docker compose -f docker-compose.redis.yml up -d
docker compose -f docker-compose.redis.yml ps
```

If Redis is unavailable, the chatbot falls back to in-memory sessions, but persistence, cache, and rate-limit storage are not demo-complete.

## Start LightRAG

```bash
cd ../lightrag-server-amip
docker compose up -d
cd ../arab-minerals-dw
```

Index AMIP documents when needed:

```bash
source .venv/bin/activate
python knowledge/ingestion/index_documents.py --source all --batch-delay 0.5
```

Avoid RAG demo questions if LightRAG is unavailable.

## Start Chatbot API

```bash
source .venv/bin/activate
gunicorn -c gunicorn.conf.py src.chatbot.api.app:app
```

Production note: `--reload` must never be used in production.

Health check:

```bash
curl -s http://localhost:8000/health | python3 -m json.tool
```

Demo SQL question:

```bash
curl -s -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "ما هي المعادن التي ينتجها المغرب؟", "language": "ar"}' \
  | python3 -m json.tool
```

## Start Report API

```bash
source .venv/bin/activate
gunicorn -c gunicorn.conf.py src.reports.api:app
```

Open API docs locally:

```text
http://localhost:8001/docs
```

## Run ETL

Full pipeline:

```bash
source .venv/bin/activate
python -m pipelines.pipeline
```

Single step:

```bash
python -m pipelines.pipeline --step 03
```

The expected top-level raw file names are declared in `pipelines/config.py`.
Bilateral country folders should use:

```text
fact_bilateral_export_usd.xlsx
fact_bilateral_export_pct.xlsx
fact_bilateral_import_usd.xlsx
fact_bilateral_import_pct.xlsx
```

The bilateral loader also accepts the older short names `export_usd.xlsx`,
`export_pct.xlsx`, `import_usd.xlsx`, and `import_pct.xlsx`.

The price step is currently a safe no-op and logs `price_loader_no_source`.

After a full ETL run, validation writes `warehouse/warehouse_build_report.md`.
The report includes table and view row counts, raw-file presence, foreign-key
orphan checks, aggregate sanity checks, quality issue summaries, and an explicit
warning when the price module is unpopulated.
Canonical mineral mapping validation also writes
`data/processed/canonical_mapping_gaps.csv`; review that file to curate any
production minerals, trade products, or HS codes that are not yet connected to
`dim_canonical_minerals`.

## Run Tests

Collection:

```bash
source .venv/bin/activate
python -m pytest --collect-only -q
```

Fast unit tests:

```bash
python -m pytest tests/chatbot tests/test_insights.py -q
```

Warehouse smoke tests, requiring PostgreSQL:

```bash
python -m pytest tests/warehouse/test_schema.py -q
```

Warehouse validation report:

```bash
python - <<'PY'
from pipelines.validation import validate_warehouse, write_validation_report
write_validation_report(validate_warehouse())
PY
```

Arabic QA evaluation:

```bash
PYTHONPATH=. .venv/bin/python tests/chatbot/eval_runner.py \
  --file tests/chatbot/test_questions_detailed_ar.json \
  --output-json logs/eval_arabic_questions_results.json
```

## Demo Guidance

Use `docs/demo/DEMO_QUESTIONS.md` for questions known to be safer in the latest Arabic evaluation. Prefer SQL-backed questions while PostgreSQL and OpenAI are healthy. Treat RAG questions as unsafe until LightRAG is running and verified.

Avoid reserve/reserve-lifespan, current market price, oil/Gulf-region, and
unit-value or price-pressure questions in live demos unless a real data module
has been added and validated. Those domains are documented as unsupported or
partial in Warehouse V2.
