# Running AMIP — Team Guide

How to get the **AMIP** stack running locally from a fresh clone: the PostgreSQL
warehouse, the ETL pipeline, the LightRAG service, the **chatbot API**, and the
**report-generator API**.

> Run all commands from `arab-minerals-dw/` unless stated otherwise.

---

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Python | 3.12 | Used for the venv, ETL, and both APIs |
| Docker + Docker Compose | recent | Runs Redis and LightRAG |
| PostgreSQL | 14+ | Listening on `localhost:5432` |
| OpenAI API key | — | Required by the chatbot and by LightRAG |

What's already in the repo (you do **not** need to source it separately):
- **Source datasets** — `data/raw.zip` (raw bilateral workbooks), `data/staging/`, `data/processed/`
- **LightRAG knowledge base** — `lightrag-server-amip/data/rag_storage/` (pre-indexed graph + vector DBs)

What is **not** in the repo (you must provide it):
- Every `.env` file (secrets). Copy from the `.env.example` templates and fill in.

---

## 2. Clone, virtualenv, dependencies

```bash
git clone https://github.com/benchekrounamine/AMIP-DATA-Plateform.git
cd AMIP-DATA-Plateform/arab-minerals-dw

python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt        # use requirements-prod.txt for prod images
```

---

## 3. Configure environment (`.env`)

```bash
cp .env.example .env
```

Then edit `.env` and set at minimum:

```text
APP_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arab_minerals_dw
DB_USER=<your-postgres-user>
DB_PASSWORD=<your-postgres-password>
DB_SCHEMA=minerals
OPENAI_API_KEY=<your-openai-api-key>
REDIS_URL=redis://localhost:6380/0
LIGHTRAG_BASE_URL=http://localhost:9622
CORS_ALLOWED_ORIGINS=*          # set to the real portal origin in production
```

Every variable is documented inline in `.env.example`. In `production`, startup
fails fast if DB credentials are missing or `CORS_ALLOWED_ORIGINS=*`.

> ⚠️ **Never commit a `.env` file.** They are gitignored on purpose. If a key is
> ever shared or leaked, rotate it.

---

## 4. Start Redis

```bash
docker compose -f docker-compose.redis.yml up -d
docker compose -f docker-compose.redis.yml ps
```

Redis (port **6380**) backs sessions, the SQL cache, and rate limiting. If it's
down the chatbot still runs but degrades to in-memory sessions with no cache.

---

## 5. Start LightRAG

The RAG knowledge base ships pre-indexed in `lightrag-server-amip/data/rag_storage/`,
so you only need to provide its `.env` and start the container.

```bash
cd lightrag-server-amip
cp .env.example .env          # then set LLM_BINDING_API_KEY and EMBEDDING_BINDING_API_KEY
docker compose up -d
cd ..
```

LightRAG listens on port **9622** (matches `LIGHTRAG_BASE_URL`). Because the
storage is already populated, **re-indexing is not required** to answer
concept/RAG questions.

---

## 6. Build the warehouse

Start PostgreSQL, then create the schema, tables, and views:

```bash
source .venv/bin/activate
python scripts/create_warehouse.py
```

This creates structure only — it does **not** load data. To verify an existing
warehouse without changing it: `python scripts/create_warehouse.py --check-only`.

---

## 7. Load the data (ETL)

The raw bilateral workbooks are bundled as a zip — unpack them into `data/raw/`
first, then run the pipeline:

```bash
unzip -o data/raw.zip -d data/raw
source .venv/bin/activate
python -m pipelines.pipeline           # full pipeline (all steps)
# or a single step, e.g.:  python -m pipelines.pipeline --step 03
```

After a full run, validation writes `warehouse/warehouse_build_report.md`
(row counts, FK orphan checks, data-quality summary). The price step is a
documented no-op until a local price source is added.

| Step | Loader | Loads |
|---|---|---|
| 00 | `load_dims_static` | Time / country / partner dimensions |
| 01 | `load_arab_production` | Arab production facts |
| 03 | `load_trade_aggregate` | World trade facts |
| 04 | `load_bilateral_trade` | Bilateral partner facts |
| 05 | `load_canonical_minerals` | Canonical mineral bridges |
| 07 | `refresh_aggregations` | Recompute aggregate tables |

---

## 8. Run the Chatbot API

```bash
source .venv/bin/activate
gunicorn -c gunicorn.conf.py src.chatbot.api.app:app
```

Serves on **http://localhost:8000**. Quick checks:

```bash
curl -s http://localhost:8000/health | python3 -m json.tool
curl -s http://localhost:8000/ready                 # 503 until DB is reachable

curl -s -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Top 5 Arab phosphate producers in 2023"}' | python3 -m json.tool
```

---

## 9. Run the Report-generator API

Bind it to a **different port** (8001) so it doesn't collide with the chatbot:

```bash
source .venv/bin/activate
GUNICORN_BIND=0.0.0.0:8001 gunicorn -c gunicorn.conf.py src.reports.api:app
```

Local API docs (development only): **http://localhost:8001/docs**.

---

## 10. Run the tests

```bash
source .venv/bin/activate
python -m pytest tests/chatbot tests/test_insights.py -q   # fast unit tests
python -m pytest tests/warehouse/test_schema.py -q         # needs PostgreSQL
```

---

## Service / port reference

| Service | Port | Started by |
|---|---|---|
| PostgreSQL warehouse | 5432 | local PostgreSQL |
| Redis | 6380 | `docker-compose.redis.yml` |
| LightRAG | 9622 | `lightrag-server-amip/docker-compose.yml` |
| Chatbot API | 8000 | `gunicorn … src.chatbot.api.app:app` |
| Report API | 8001 | `GUNICORN_BIND=0.0.0.0:8001 gunicorn … src.reports.api:app` |

---

## Production / Docker

For containerized deployment of the chatbot (multi-stage build, read-only DB
role, health probes, rollback, CORS) see **`DEPLOY.md`**. For the full local
demo stack and evaluation commands see **`RUNBOOK.md`**.

## Wiring into the website

Both APIs are plain HTTP/JSON services. Point the portal frontend at:
- `POST /chat` on the chatbot API (8000) for the assistant
- the report API (8001) endpoints for PDF generation (see `/docs`)

Set `CORS_ALLOWED_ORIGINS` to the portal's real origin(s) before going live.
