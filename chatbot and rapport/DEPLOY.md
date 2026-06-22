# AMIP Chatbot — Deployment Runbook

Short operational guide for running the chatbot API in production.
For the full local dev stack (warehouse build, LightRAG, report API) see `RUNBOOK.md`.

## 1. Build

```bash
cd arab-minerals-dw
docker build -t amip-chatbot:<version> .
```

Multi-stage build: wheels are compiled in a builder stage; the runtime image
has no compiler and contains **no secrets** (`.env*` is excluded by
`.dockerignore` and never copied).

## 2. Required environment

Inject at runtime (`--env-file` or orchestrator secrets). Every variable is
documented in `.env.example`. The minimum for production:

| Variable | Purpose |
|---|---|
| `APP_ENV=production` | Enforces prod validation, disables `/docs` |
| `OPENAI_API_KEY` | GPT-4o calls |
| `DB_HOST` / `DB_PORT` / `DB_NAME` | PostgreSQL warehouse |
| `DB_USER` / `DB_PASSWORD` | **Use a read-only role** (see §6) |
| `LIGHTRAG_BASE_URL` | RAG/concept-explanation mode |
| `REDIS_URL` | Sessions, SQL caches, rate limiting |
| `CORS_ALLOWED_ORIGINS` | Real frontend origin(s) — startup fails on `*` in production |

Startup fails fast with a clear message when required values are missing
(`config.validate_env()`).

## 3. Run

```bash
docker run -d --name amip-chatbot \
  --env-file /etc/amip/chatbot.env \
  -p 8000:8000 \
  --restart unless-stopped \
  amip-chatbot:<version>
```

Tuning: `GUNICORN_WORKERS` (default 4 uvicorn workers — the app is I/O-bound,
don't oversize), `GUNICORN_TIMEOUT` (default 120s).

## 4. Health checks

| Endpoint | Meaning |
|---|---|
| `GET /health` | Liveness: process up, session-store backend info. Wired into the image `HEALTHCHECK`. |
| `GET /ready` | Readiness: runs `SELECT 1` against the warehouse (503 if it fails) and pings Redis (reported, non-fatal — the app degrades to in-memory sessions without cache). |
| `GET /metrics` | Prometheus metrics (intents, languages, LLM calls, cache hits, latencies). |

Point the load balancer / orchestrator readiness probe at `/ready`.

## 5. Rollback

Images are immutable and state lives in Postgres/Redis, so rollback is
re-running the previous tag:

```bash
docker stop amip-chatbot && docker rm amip-chatbot
docker run -d --name amip-chatbot --env-file /etc/amip/chatbot.env \
  -p 8000:8000 --restart unless-stopped amip-chatbot:<previous-version>
```

If a bad SQL prompt/few-shot change shipped, also flush cached SQL so stale
generations don't outlive the rollback:

```bash
redis-cli -u "$REDIS_URL" --scan --pattern 'amip:sql_cache:*' | xargs -r redis-cli -u "$REDIS_URL" del
redis-cli -u "$REDIS_URL" --scan --pattern 'amip:qsql:*'      | xargs -r redis-cli -u "$REDIS_URL" del
```

## 6. One-time manual setup

**Read-only DB role** (the app also sets `default_transaction_read_only=on`
and a statement timeout per connection, but enforce it at the role level too):

```sql
CREATE ROLE amip_chatbot_ro LOGIN PASSWORD '<strong-password>';
GRANT CONNECT ON DATABASE arab_minerals_dw TO amip_chatbot_ro;
GRANT USAGE ON SCHEMA minerals, mart_production, mart_trade, mart_price, mart_reserve, mart_mineral_360 TO amip_chatbot_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA minerals, mart_production, mart_trade, mart_price, mart_reserve, mart_mineral_360 TO amip_chatbot_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA minerals, mart_production, mart_trade, mart_price, mart_reserve, mart_mineral_360 GRANT SELECT ON TABLES TO amip_chatbot_ro;
ALTER ROLE amip_chatbot_ro SET statement_timeout = '15s';
```

Then set `DB_USER=amip_chatbot_ro` in the runtime env.

**CORS**: set `CORS_ALLOWED_ORIGINS=https://<your-portal-domain>` (comma-separated
for several origins).

## 7. Smoke test after deploy

```bash
curl -fsS http://<host>:8000/ready
curl -fsS -X POST http://<host>:8000/chat -H 'Content-Type: application/json' \
  -d '{"message": "Top 5 Arab phosphate producers in 2023"}' | head -c 400
```

Or run the full regression set against the live service:

```bash
python -m tests.chatbot.eval_runner --mode http --chat-url http://<host>:8000/chat
```
