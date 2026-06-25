# AMIP Report and Chatbot Services Setup

This guide explains how to get the AMIP report generator and chatbot working with the current website codebase.

The important folders are:

```text
Backend/                 Node/Express API and public PostgreSQL schema
Frontend/                Vite/React website
chatbot and repport/     Python FastAPI chatbot, report API, ETL loaders, Redis/LightRAG config
```

The folder name `chatbot and repport` is misspelled in the repo. Keep using that exact path in commands.

## What Must Be Running

For the report and chatbot features to work fully, these services must be healthy:

| Service | Default URL / port | Purpose |
|---|---:|---|
| PostgreSQL | `localhost:5432` or `localhost:5434` | Shared AMIP data tables |
| Backend API | `http://localhost:5001` | Main website CRUD/admin API; also runs migrations and seeds countries |
| Redis | `redis://localhost:6380/0` | Chatbot sessions, SQL cache, and rate limits |
| LightRAG | `http://localhost:9622` | Knowledge-base answers for concept/RAG questions |
| Chatbot API | `http://localhost:8000` | Chatbot `/chat`, `/chat/stream`, `/health`, `/feedback` |
| Report API | `http://localhost:8001` | Report `/report`, `/options`, `/availability` |
| Frontend | `http://localhost:5173` | Website UI |

## Database Choice

The website and report screen currently use the simplified `public` schema:

```text
public.countries
public.mineral_production
public.arab_production
public.world_production
public.mineral_trade
public.trade_world
public.partner_trade
public.trade_partners
```

The older Warehouse V2 docs inside `chatbot and repport/RUNBOOK.md` mention `arab_minerals_dw` and schema `minerals`. That is useful for the standalone warehouse pipeline, but the active frontend report service and chatbot schema context are wired to the simplified `public` schema. For the full website, use `DB_NAME=amip_db` and `DB_SCHEMA=public`.

## 1. Install Prerequisites

Install these locally:

```text
Node.js 20+
npm
Python 3.12 recommended
Docker Desktop or Docker Compose
PostgreSQL client tools are useful but optional
An OpenAI API key
```

The chatbot needs the OpenAI key for SQL generation, narration, and some chart/RAG flows. LightRAG also needs an OpenAI key unless you reconfigure it to another model provider.

## 2. Start PostgreSQL

You can use either a local PostgreSQL service or the root Docker Compose file.

### Option A: Use Docker PostgreSQL

From the repo root:

```bash
docker compose up -d postgres
```

The root `docker-compose.yml` exposes PostgreSQL on host port `5434` by default:

```text
Host: localhost
Port: 5434
Database: amip_db
User: postgres
Password: root
Schema: public
```

If you want Docker PostgreSQL on host port `5432` instead:

```bash
AMIP_POSTGRES_PORT=5432 docker compose up -d postgres
```

Only do that if nothing else is already using port `5432`.

### Option B: Use Local PostgreSQL

Create a database named `amip_db`, or reuse an existing one:

```bash
createdb amip_db
```

Use whichever local user/password you normally use, then put those values in the `.env` files below.

## 3. Configure Backend Environment

Create `Backend/.env` from the example:

```bash
cd Backend
cp .env.example .env
```

For Docker PostgreSQL on host port `5434`, use:

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

For local PostgreSQL on `5432`, use `DB_PORT=5432` instead.

## 4. Start the Backend API

Install dependencies and start the server:

```bash
cd Backend
npm install
npm run dev
```

If `nodemon` is not available or you prefer a normal process:

```bash
npm start
```

The backend does two important things on startup:

1. Runs SQL migrations from `Backend/migrations/`.
2. Seeds the 21 AMIP countries into `public.countries`.

Check it:

```bash
curl http://localhost:5001/
```

Expected response:

```text
API is running...
```

## 5. Configure the Python Services

Create the Python service environment:

```bash
cd "chatbot and repport"
cp .env.example .env
```

Set these values in `chatbot and repport/.env`.

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

REDIS_ENABLED=true
REDIS_URL=redis://localhost:6380/0

LIGHTRAG_BASE_URL=http://localhost:9622
LIGHTRAG_TIMEOUT=30
LIGHTRAG_MODE=hybrid

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

For local PostgreSQL on `5432`, use `DB_PORT=5432`.

Do not commit `.env` files. They contain secrets.

## 6. Install Python Dependencies

From `chatbot and repport/`:

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

If your system command is `python3` instead of `python3.12`, this is usually fine:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 7. Load Production and Trade Data

The report and chatbot need data in the `public` schema, not only empty tables.

Run these loaders from `chatbot and repport/`:

```bash
source .venv/bin/activate
python -m pipelines.loaders.load_public_production
python -m pipelines.loaders.load_public_trade
python -m pipelines.loaders.load_public_bilateral
```

What they load:

| Loader | Tables populated |
|---|---|
| `load_public_production` | `mineral_production`, `arab_production`, `world_production` |
| `load_public_trade` | `trade_partners`, `mineral_trade`, `trade_world` |
| `load_public_bilateral` | `trade_partners`, sentinel `mineral_trade`, `partner_trade` |

Expected source files are already present in this repo:

```text
chatbot and repport/data/raw/fact_arab_production.xlsx
chatbot and repport/data/raw/fact_world_production.xlsx
chatbot and repport/data/raw/fact_trade_export.xlsx
chatbot and repport/data/raw/fact_trade_import.xlsx
chatbot and repport/data/raw/ref_minerals_hs.xlsx
chatbot and repport/data/staging/ref_countries.xlsx
chatbot and repport/data/processed/bilateral/*/*.csv
```

The loaders are designed to be idempotent. You can rerun them after fixing an environment or database issue.

## 8. Verify Data Counts

Use `psql`, TablePlus, pgAdmin, or any PostgreSQL client. For Docker PostgreSQL on port `5434`:

```bash
psql "postgresql://postgres:root@localhost:5434/amip_db"
```

Then run:

```sql
SELECT count(*) FROM public.countries;
SELECT count(*) FROM public.mineral_production;
SELECT count(*) FROM public.arab_production;
SELECT count(*) FROM public.world_production;
SELECT count(*) FROM public.mineral_trade;
SELECT count(*) FROM public.trade_world;
SELECT count(*) FROM public.partner_trade;
```

Healthy local counts should be roughly:

```text
countries: 21
mineral_production: about 111
arab_production: about 2881
world_production: about 255
mineral_trade: about 26, including "All Minerals"
trade_world: about 6050
partner_trade: depends on processed bilateral CSVs, but should be greater than 0
```

The exact `partner_trade` count depends on the processed bilateral files available locally.

## 9. Start Redis

From `chatbot and repport/`:

```bash
docker compose -f docker-compose.redis.yml up -d
```

Check it:

```bash
docker compose -f docker-compose.redis.yml ps
```

This starts Redis on host port `6380`, which matches:

```text
REDIS_URL=redis://localhost:6380/0
```

If Redis is down, the chatbot can still answer some requests using in-memory sessions, but the full service is not complete: sessions, cache, and rate-limit state will not persist correctly.

## 10. Start LightRAG

Configure LightRAG:

```bash
cd "chatbot and repport/lightrag-server-amip"
cp .env.example .env
```

Set at least:

```text
LLM_BINDING_API_KEY=your_api_key_here
EMBEDDING_BINDING_API_KEY=your_api_key_here
LLM_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIM=1536
```

Start it:

```bash
docker compose up -d
```

Check it:

```bash
curl http://localhost:9622
```

The local compose maps container port `9621` to host port `9622`. The chatbot `.env` should therefore use:

```text
LIGHTRAG_BASE_URL=http://localhost:9622
```

The repo includes a pre-indexed LightRAG storage folder at:

```text
chatbot and repport/lightrag-server-amip/data/rag_storage
```

You normally do not need to re-index for local demos. If you change knowledge documents and want to re-index, run from `chatbot and repport/`:

```bash
source .venv/bin/activate
python knowledge/ingestion/index_documents.py --source all --batch-delay 0.5
```

## 11. Start the Chatbot API

Open a new terminal:

```bash
cd "chatbot and repport"
source .venv/bin/activate
gunicorn -c gunicorn.conf.py src.chatbot.api.app:app
```

By default, `gunicorn.conf.py` binds to:

```text
0.0.0.0:8000
```

Health checks:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/docs
```

Test a normal chatbot request:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Top 5 Arab phosphate producers in 2023","language":"en","session_id":"local-test","user_type":"anonymous"}'
```

Test Arabic:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"ما هي المعادن التي ينتجها المغرب؟","language":"ar","session_id":"local-test","user_type":"anonymous"}'
```

The chatbot endpoint always tries to return a JSON body. If something fails internally, you may get HTTP 200 with:

```json
{
  "error": "internal_error"
}
```

In that case, inspect the terminal logs where Gunicorn is running.

## 12. Start the Report API

Open another terminal:

```bash
cd "chatbot and repport"
source .venv/bin/activate
GUNICORN_BIND=0.0.0.0:8001 gunicorn -c gunicorn.conf.py src.reports.api:app
```

The report API must use port `8001` because the chatbot already uses `8000`.

Open the local API docs:

```text
http://localhost:8001/docs
```

Check report options:

```bash
curl "http://localhost:8001/options?lang=en"
curl "http://localhost:8001/availability"
```

Generate a PDF report:

```bash
curl -X POST http://localhost:8001/report \
  -H "Content-Type: application/json" \
  -d '{"country":"Kingdom of Morocco","mineral":"Phosphate rock","year_from":2019,"year_to":2023,"lang":"en"}' \
  --output amip-report.pdf
```

Report parameters:

| Field | Notes |
|---|---|
| `country` | Must match `public.countries.name_en`, or a value returned by `/options?lang=en` |
| `mineral` | Must match a mineral returned by `/options?lang=en` |
| `year_from` | Minimum accepted year is `2010` |
| `year_to` | Maximum accepted year is `2024` |
| `lang` | One of `en`, `fr`, `ar` |

Generated PDFs are cached for 24 hours in:

```text
chatbot and repport/artifacts/reports/
```

## 13. Configure the Frontend

Create `Frontend/.env`:

```bash
cd Frontend
cp .env.example .env
```

Use:

```text
VITE_API_URL=http://localhost:5001
VITE_REPORT_API_URL=http://localhost:8001
```

The current chatbot service is hardcoded in `Frontend/src/services/chatbotService.js` to:

```text
http://localhost:8000
```

So the chatbot API must be running on `8000` unless you update that service file to read from an env variable.

## 14. Start the Frontend

Open another terminal:

```bash
cd Frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

Check the UI:

1. Open the chatbot modal and confirm the health indicator is good.
2. Ask a production or trade question.
3. Open the report page.
4. Confirm country/mineral options load.
5. Generate a PDF report.

## 15. Recommended Terminal Layout

Use separate terminals so logs are easy to read:

| Terminal | Command |
|---:|---|
| 1 | `docker compose up -d postgres` from repo root |
| 2 | `npm run dev` from `Backend/` |
| 3 | `docker compose -f docker-compose.redis.yml up -d` from `chatbot and repport/` |
| 4 | `docker compose up -d` from `chatbot and repport/lightrag-server-amip/` |
| 5 | `gunicorn -c gunicorn.conf.py src.chatbot.api.app:app` from `chatbot and repport/` |
| 6 | `GUNICORN_BIND=0.0.0.0:8001 gunicorn -c gunicorn.conf.py src.reports.api:app` from `chatbot and repport/` |
| 7 | `npm run dev` from `Frontend/` |

## 16. End-to-End Startup Checklist

Use this order on a fresh machine. Edit each `.env` before starting the service that reads it.

Terminal 1, from the repo root:

```bash
docker compose up -d postgres
```

Terminal 2, backend API:

```bash
cd Backend
cp .env.example .env
npm install
npm run dev
```

Terminal 3, Python environment and data load:

```bash
cd "chatbot and repport"
cp .env.example .env
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m pipelines.loaders.load_public_production
python -m pipelines.loaders.load_public_trade
python -m pipelines.loaders.load_public_bilateral
```

Terminal 4, Redis:

```bash
cd "chatbot and repport"
docker compose -f docker-compose.redis.yml up -d
```

Terminal 5, LightRAG:

```bash
cd "chatbot and repport/lightrag-server-amip"
cp .env.example .env
docker compose up -d
```

Terminal 6, chatbot API:

```bash
cd "chatbot and repport"
source .venv/bin/activate
gunicorn -c gunicorn.conf.py src.chatbot.api.app:app
```

Terminal 7, report API:

```bash
cd "chatbot and repport"
source .venv/bin/activate
GUNICORN_BIND=0.0.0.0:8001 gunicorn -c gunicorn.conf.py src.reports.api:app
```

Terminal 8, frontend:

```bash
cd Frontend
npm install
npm run dev
```

## 17. Troubleshooting

### Report page loads but country/mineral dropdowns are empty

Check:

```bash
curl "http://localhost:8001/options?lang=en"
curl "http://localhost:8001/availability"
```

If those return empty arrays or errors:

1. Confirm `chatbot and repport/.env` points to the same DB as `Backend/.env`.
2. Confirm `DB_SCHEMA=public`.
3. Rerun the public loaders:

```bash
cd "chatbot and repport"
source .venv/bin/activate
python -m pipelines.loaders.load_public_production
python -m pipelines.loaders.load_public_trade
python -m pipelines.loaders.load_public_bilateral
```

### Report API returns 404 for a PDF

The requested `(country, mineral, year range)` has no production/trade data. Use:

```bash
curl http://localhost:8001/availability
```

Pick a country/mineral pair listed there. The frontend report page also uses `/availability` to avoid invalid combinations.

### Report API returns connection errors

Usually one of these is wrong in `chatbot and repport/.env`:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
DB_SCHEMA
```

If you used root Docker Compose without overriding the port, `DB_PORT` should be `5434`, not `5432`.

### Chatbot says internal error

Check:

1. `OPENAI_API_KEY` is set in `chatbot and repport/.env`.
2. PostgreSQL is reachable from the chatbot process.
3. `DB_SCHEMA=public`.
4. Data tables have rows.
5. The Gunicorn terminal logs show the real exception.

Run:

```bash
curl http://localhost:8000/health
```

Then test:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"How many countries are in the database?","language":"en"}'
```

### Chatbot works for SQL questions but not explanation/RAG questions

Check LightRAG:

```bash
curl http://localhost:9622
docker compose -f "chatbot and repport/lightrag-server-amip/docker-compose.yml" ps
```

Also confirm:

```text
LIGHTRAG_BASE_URL=http://localhost:9622
```

### Chatbot works, but sessions or cache do not persist

Check Redis:

```bash
cd "chatbot and repport"
docker compose -f docker-compose.redis.yml ps
```

Confirm:

```text
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6380/0
```

### Browser blocks frontend requests

Check CORS.

For chatbot:

```text
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

For reports, `src.reports.api` currently allows:

```text
http://localhost:5173
http://localhost:5174
```

If Vite uses a different port, either restart Vite on `5173` or update the report API CORS list in `chatbot and repport/src/reports/api.py`.

### Port already in use

Use these defaults:

```text
Backend: 5001
Chatbot: 8000
Report: 8001
Frontend: 5173
Redis: 6380
LightRAG: 9622
Postgres Docker: 5434
```

If you change a port, update all dependent `.env` files and frontend service URLs.

## 18. Production Notes

For production-like deployment:

1. Never use `CORS_ALLOWED_ORIGINS=*`.
2. Use real frontend origins.
3. Use a strong `JWT_SECRET`.
4. Use managed PostgreSQL or a durable Docker volume.
5. Use a private Redis instance.
6. Keep `.env` values in server secrets, not in Git.
7. Run the chatbot and report API on separate process definitions or containers.
8. Keep the report API on a separate port or route prefix from the chatbot.
9. Set `APP_ENV=production` only after all required environment values are present.
10. Do not use `--reload` in production.

The combined `chatbot and repport/docker-compose.yml` currently starts the chatbot API, Redis, and LightRAG, but not the separate report API. For the website report feature, make sure `src.reports.api:app` is also deployed and exposed, usually on `8001` or behind a reverse proxy route such as `/report-api`.

## 19. Quick Health Matrix

Use this when something feels half-working:

| Check | Healthy result |
|---|---|
| `curl http://localhost:5001/` | `API is running...` |
| `curl http://localhost:8000/health` | JSON with `"status":"ok"` |
| `curl http://localhost:8001/options?lang=en` | JSON with non-empty countries/minerals |
| `curl http://localhost:8001/availability` | JSON with non-empty `pairs` |
| `curl http://localhost:9622` | LightRAG responds |
| Redis compose `ps` | `amip-redis` running |
| Frontend page | Report page loads options and chatbot opens |
