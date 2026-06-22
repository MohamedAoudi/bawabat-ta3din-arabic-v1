# Quick Start - AMIP Chatbot

## What is this?

AMIP (بوابة المؤشرات التعدينية العربية / Arab Mining Indicators Portal / Portail arabe des indicateurs miniers) is a mineral indicators portal and analytics platform for Arab mining data. The chatbot combines Text-to-SQL, LIST/FAQ retrieval, LightRAG document retrieval, and chart generation over the AMIP warehouse and knowledge assets.

It answers questions about countries, minerals, production, trade, HS codes, partners, data quality, reports, and AMIP portal coverage in Arabic, French, and English.

---

## Prerequisites

- Python 3.12 or the local project `.venv`
- Docker for Redis and LightRAG
- PostgreSQL database `arab_minerals_dw` on port `5432`
- OpenAI API key for chatbot LLM calls
- Optional external LightRAG folder: `../lightrag-server-amip/`

---

## First-time setup

Run from the `arab-minerals-dw/` project root:

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with local DB credentials, OPENAI_API_KEY, REDIS_URL, and LIGHTRAG_BASE_URL.
```

Expected raw workbook names:

```text
data/raw/fact_arab_production.xlsx
data/raw/fact_world_production.xlsx
data/raw/fact_trade_export.xlsx
data/raw/fact_trade_import.xlsx
data/raw/ref_countries.xlsx
data/raw/ref_minerals_hs.xlsx
data/raw/bilateral/<Country>/fact_bilateral_export_usd.xlsx
data/raw/bilateral/<Country>/fact_bilateral_export_pct.xlsx
data/raw/bilateral/<Country>/fact_bilateral_import_usd.xlsx
data/raw/bilateral/<Country>/fact_bilateral_import_pct.xlsx
```

---

## 30-second startup

```bash
# Terminal 1 - dedicated AMIP Redis
docker compose -f docker-compose.redis.yml up -d

# Terminal 2 - LightRAG (optional; required for RAG questions)
cd ../lightrag-server-amip
docker compose up -d

# Terminal 3 - Chatbot API
cd ../arab-minerals-dw
source .venv/bin/activate
gunicorn -c gunicorn.conf.py src.chatbot.api.app:app

# Production note: --reload must never be used in production.

# Terminal 4 - Report API
cd ../arab-minerals-dw
source .venv/bin/activate
gunicorn -c gunicorn.conf.py src.reports.api:app
```

If Redis is unavailable, the chatbot falls back to in-memory sessions. If LightRAG is unavailable, SQL/LIST/CHART paths can still work, but RAG answers are not demo-safe.

---

## Verify it works

```bash
curl -s http://localhost:8000/health | python3 -m json.tool

curl -s -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "ما هي المعادن التي ينتجها المغرب؟", "language": "ar"}' \
  | python3 -m json.tool
```

Expected behavior:

- `/health` returns `{"status": "ok", ...}`.
- The Arabic question routes through SQL and returns Morocco mineral production information when PostgreSQL and OpenAI are available.

---

## Run ETL

```bash
source .venv/bin/activate
python -m pipelines.pipeline

# Single step example
python -m pipelines.pipeline --step 03
```

The price step is currently a safe no-op and logs `price_loader_no_source`; it does not load external price data.

---

## Run tests

```bash
source .venv/bin/activate
python -m pytest --collect-only -q
python -m pytest tests/chatbot tests/test_insights.py -q
```

Warehouse schema smoke tests require PostgreSQL:

```bash
python -m pytest tests/warehouse/test_schema.py -q
```

Arabic demo evaluation requires PostgreSQL and OpenAI; LightRAG is needed for RAG-routed cases:

```bash
PYTHONPATH=. .venv/bin/python tests/chatbot/eval_runner.py \
  --file tests/chatbot/test_questions_detailed_ar.json \
  --output-json logs/eval_arabic_questions_results.json
```

---

## Common issues

| Problem | Fix |
|---------|-----|
| `gunicorn: command not found` | Activate `.venv` or install dependencies with `pip install -r requirements.txt` |
| `/health` reports `backend: in-memory` | Start Redis with `docker compose -f docker-compose.redis.yml up -d` |
| `OPENAI_API_KEY is not set` | Copy `.env.example` to `.env` and set a real key locally |
| PostgreSQL connection refused | Check `DB_HOST`, `DB_PORT`, and that `arab_minerals_dw` is running on port `5432` |
| LightRAG timeout/refused | Start `../lightrag-server-amip`; avoid RAG demo questions until it is healthy |

---

## Next docs

- `RUNBOOK.md` - full service runbook
- `docs/demo/DEMO_QUESTIONS.md` - demo-safe question guide
- `docs/setup/ENVIRONMENT.md` - environment variable reference
- `docs/architecture/ARCHITECTURE.md` - request flow and component map
