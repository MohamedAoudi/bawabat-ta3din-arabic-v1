# Local Setup Report

Date: 2026-06-22

## Project structure

This checkout has three main application folders:

- `Frontend`: React + Vite frontend.
- `Backend`: Node.js + Express API backed by PostgreSQL.
- `chatbot and repport`: Python FastAPI chatbot/report/ETL module. The folder name on disk is spelled `repport`.

No root `.git` repository was detected from this folder, so no Git commit was made.

## Detected tech stack

### Frontend

- Package manager: npm, using `package-lock.json`.
- Framework/build: React 19, Vite 7, Tailwind CSS Vite plugin.
- Key dependencies: axios, react-router-dom, Firebase, Chart.js, xlsx/xlsx-js-style, lucide-react, Font Awesome.
- Config files found: `package.json`, `package-lock.json`, `vite.config.js`, `.env`, `.env.example`, `README.md`.

### Backend

- Runtime: Node.js CommonJS.
- Framework: Express 5.
- Database: PostgreSQL via `pg`.
- Auth/uploads: bcrypt, jsonwebtoken, passport Google OAuth, multer.
- Startup behavior: connects to PostgreSQL, runs idempotent SQL migrations, then seeds countries with upsert logic.
- Config files found: `package.json`, `package-lock.json`, `.env`, `.env.example`, `server.js`, `db.js`, `migrate.js`, `seed.js`, `migrations/*.sql`.

### Chatbot/report module

- Runtime: Python virtual environment.
- Frameworks/tools: FastAPI, uvicorn/gunicorn, pandas, SQLAlchemy, psycopg2, OpenAI SDK, Redis, ReportLab, pytest.
- Database/services: PostgreSQL, Redis, optional LightRAG, OpenAI API.
- Config files found: `requirements.txt`, `requirements-prod.txt`, `.env.example`, `Dockerfile`, `docker-compose.yml`, `docker-compose.redis.yml`, `gunicorn.conf.py`, `RUNNING.md`, `RUNBOOK.md`, `DEPLOY.md`.

## Dependencies installed

- `Frontend/node_modules` installed with `npm ci`.
- `Backend/node_modules` installed with `npm ci`.
- `chatbot and repport/.venv` created and populated with `pip install -r requirements.txt`.

Network access was required for npm/PyPI installs.

## Environment configuration

### Frontend

Local file: `Frontend/.env`

Required variables:

- `VITE_API_URL=http://localhost:5001`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

The existing Firebase values were left in place and not copied into this report.

### Backend

Local file: `Backend/.env`

Required variables:

- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_USER=postgres`
- `DB_PASSWORD=root`
- `DB_NAME=amip_db`
- `JWT_SECRET=replace-with-a-local-development-secret`
- `PORT=5001`

`PORT=5001` is used because port `5000` is occupied on this Mac by an Apple AirTunes service. The backend code now reads `process.env.PORT` and falls back to `5000` only if unset.

Manual step: replace `JWT_SECRET` with a local random development secret before real auth testing.

### Chatbot/report

Local file created: `chatbot and repport/.env`

Required/manual variables:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SCHEMA`
- `OPENAI_API_KEY` must be replaced with a real key for LLM/chat requests.
- `LIGHTRAG_BASE_URL` should point to LightRAG if RAG mode is used.
- `REDIS_URL` should point to Redis if persistent sessions/cache/rate limiting are desired.
- `CORS_ALLOWED_ORIGINS` should be narrowed from `*` before production.

Current local defaults point at the fresh PostgreSQL database on `localhost:5432`, database `amip_db`, user `postgres`, schema `public`, and Redis on `localhost:6380`.

## Database and services

### PostgreSQL

- Required by the Node backend.
- The previous database was preserved as `amip_db_backup_before_fresh_20260622`.
- A new PostgreSQL login `postgres` was created with the requested local password.
- A brand-new empty `amip_db` owned by `postgres` was created.
- `Backend/schema.sql` contains the canonical schema supplied for the project and was applied directly to the new database.
- The fresh database contains exactly the nine requested application tables, all with zero rows, plus the six requested secondary indexes.
- Column nullability/defaults and all nine foreign keys were audited against the canonical script.
- `Backend/migrations/001_create_users_table.sql` was aligned with the canonical `users` table so backend-only setup does not introduce different constraints.
- Fresh Docker PostgreSQL volumes also initialize from `Backend/schema.sql` through `/docker-entrypoint-initdb.d/001-schema.sql`.

### Redis

- Required for best chatbot behavior.
- An existing Docker container `amip-redis` is already running on host port `6380`.
- Chatbot `/health` reports Redis reachable.

### LightRAG

- Optional for RAG/concept mode.
- Existing containers were detected on ports `9621` and `9622`.
- The chatbot `.env` points to `http://localhost:9622`.

### Optional root Docker services

Created root `docker-compose.yml` for local-only PostgreSQL and Redis. To avoid conflicts with existing services, it defaults to:

- PostgreSQL: host port `5434`
- Redis: host port `6381`

If using this optional compose file instead of the already-running local services, update env files accordingly.

## Exact run commands

### Start services

For the current machine, PostgreSQL is already running on `localhost:5432`, Redis on `localhost:6380`, and LightRAG on `localhost:9622`.

Optional isolated services:

```bash
docker compose up -d postgres redis
```

If using the optional compose services, set backend/chatbot DB port to `5434`, DB user/password to `postgres`/`root`, and Redis URL to `redis://localhost:6381/0`.

### Backend

```bash
cd Backend
npm run dev
```

Backend URL:

```text
http://localhost:5001
```

Production-style run:

```bash
cd Backend
npm start
```

### Frontend

```bash
cd Frontend
npm run dev
```

Default Vite URL:

```text
http://localhost:5173
```

Build command:

```bash
cd Frontend
npm run build
```

### Chatbot API

```bash
cd "chatbot and repport"
source .venv/bin/activate
gunicorn -c gunicorn.conf.py src.chatbot.api.app:app
```

Chatbot URL:

```text
http://localhost:8000
```

Health check:

```bash
curl http://localhost:8000/health
```

### Report API

Run on a different port from the chatbot:

```bash
cd "chatbot and repport"
source .venv/bin/activate
GUNICORN_BIND=0.0.0.0:8001 gunicorn -c gunicorn.conf.py src.reports.api:app
```

Report API docs:

```text
http://localhost:8001/docs
```

## Verification performed

- `npm ci` completed for frontend and backend.
- Python `.venv` created and `requirements.txt` installed.
- `docker compose config` validates at root.
- The backend connected read-only to the fresh database as `postgres` in database `amip_db`, schema `public`.
- Before the database recreation, backend startup/migration and HTTP smoke tests passed. The backend was not restarted after recreation so the canonical database remains empty and contains only the supplied schema.
- The first normal backend start will add its `schema_migrations` tracking table and run the existing country seed routine.
- Frontend production build passed.
- Python chatbot/report imports passed.
- Chatbot FastAPI `/health` passed in-process with Redis reachable.
- Report API docs route passed in-process.
- Focused Python tests passed:

```text
25 passed
```

## Problems found

- Port `5000` is already used by macOS AirTunes, returning `403` before requests reach Express.
- Local PostgreSQL initially had no `postgres` role. The requested role was created and verified.
- The Python docs reference `scripts/create_warehouse.py`, but no `scripts/create_warehouse.py` file exists in this checkout.
- `src/reports/api.py` expected top-level `src.reports.*` modules, while the implementation was nested under `src/reports/reports`.
- `tests/test_insights.py` needed private helpers `_hhi` and `_linear_next` from `src.reports.data`; star imports do not expose underscore-prefixed names.
- Initial Docker compose attempt conflicted with an existing `amip-redis` container and occupied Postgres port `5432`.
- A created-but-not-running Docker container named `amip-postgres` remains from the first failed compose attempt. It was not deleted because deletion requires your approval.

## Fixes applied

- Installed frontend dependencies.
- Installed backend dependencies.
- Created Python virtual environment and installed chatbot/report dependencies.
- Created safe local `chatbot and repport/.env`.
- Added `JWT_SECRET` and `PORT` to backend env files.
- Changed frontend API URL to `http://localhost:5001`.
- Updated backend `server.js` to read `PORT` from environment.
- Added root `docker-compose.yml` for optional local PostgreSQL/Redis on non-conflicting default ports.
- Added lightweight report compatibility wrappers under `src/reports/*` to point to the existing nested implementation.
- Added `DB_SCHEMA` export to `pipelines/config.py`.
- Re-exported `_hhi` and `_linear_next` explicitly for existing tests.
- Added canonical `Backend/schema.sql` from the supplied SQL.
- Preserved the former `amip_db` as `amip_db_backup_before_fresh_20260622`.
- Created a fresh `amip_db` with `postgres/root` credentials and applied only the canonical schema.
- Aligned backend migrations and Docker initialization with the same schema file.

## Remaining manual steps

- Replace `JWT_SECRET` in `Backend/.env` with a real local secret.
- Keep or replace the existing Firebase frontend values as appropriate.
- Set a real `OPENAI_API_KEY` in `chatbot and repport/.env` before using LLM/chat features.
- Use the fresh local PostgreSQL database on port `5432`; the optional Docker database remains available on port `5434` for isolated testing.
- If you want the unused created container `amip-postgres` removed, approve deletion first.
- Load real production/trade data if the dashboard should show more than seeded countries.
- The report API may need the larger `minerals` warehouse schema/data for full report generation; the current website backend DB uses the simpler public schema.
