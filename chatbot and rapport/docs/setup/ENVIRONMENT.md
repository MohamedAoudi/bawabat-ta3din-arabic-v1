# Environment Variables

Variables are loaded from `.env` by `chatbot/config.py` via `python-dotenv`.
The project root `.env` is loaded first. The legacy
`ai/07_ai_layer_CANONICAL/.env` file is accepted only as a non-overriding
fallback for older local launches.

Copy `.env.example` from the project root to `.env` and fill in real local values. Do not commit `.env` or any other real env file.

---

## Required (no default — server will crash without these)

```bash
OPENAI_API_KEY=<your-openai-api-key>     # OpenAI API key
DB_USER=<your-postgres-user>             # PostgreSQL warehouse user
DB_PASSWORD=<your-postgres-password>     # Password for the warehouse user
```

---

## Optional — PostgreSQL Warehouse V2

```bash
DB_HOST=localhost                   # Default: localhost
DB_PORT=5432                        # Default: 5432
DB_NAME=arab_minerals_dw            # Default: arab_minerals_dw
DB_SCHEMA=minerals                  # Default: minerals
```

The chatbot connects to the `minerals` schema inside this database.
The connection is forced read-only at the session level (`SET default_transaction_read_only = on`).

---

## Optional — OpenAI

```bash
OPENAI_MODEL=gpt-4o                 # Default: gpt-4o. Used for SQL gen, intent, scope, narrator.
```

---

## Optional — Query safety limits

```bash
QUERY_TIMEOUT_SECONDS=10            # Default: 10. DB connection/query timeout in seconds.
MAX_RESULT_ROWS=500                 # Default: 500. SQL results are capped at this row count.
```

---

## Optional — LightRAG (RAG intent)

```bash
LIGHTRAG_BASE_URL=http://localhost:9622   # Default: http://localhost:9622 for ../lightrag-server-amip
LIGHTRAG_TIMEOUT=30                       # Default: 30 seconds
LIGHTRAG_MODE=hybrid                      # Default: hybrid. Options: local | global | hybrid
```

If LightRAG is unreachable, RAG-intent queries fail gracefully. SQL/LIST/CHART still work.

---

## Phase 2 — Redis session store

```bash
REDIS_URL=redis://localhost:6380/0        # Dedicated AMIP Redis service
REDIS_ENABLED=true                        # Default: true. Set false to force in-memory.
REDIS_SESSION_TTL_SECONDS=3600            # Default: 3600 (1 hour). Rolling TTL per session.
REDIS_SESSION_PREFIX=amip:session:        # Default: amip:session: Key prefix in Redis.
```

**Fallback behaviour:** If `REDIS_ENABLED=true` but Redis is unreachable at startup,
the server falls back to an in-memory dict store automatically. Sessions will not
persist across server restarts in fallback mode.

---

## Phase 2 — Rate limiting

```bash
RATE_LIMIT_ENABLED=true             # Enable/disable rate limiting
RATE_LIMIT_PER_MINUTE=20            # Requests per minute per IP (0 = disabled)
RATE_LIMIT_PER_HOUR=0               # Requests per hour per IP (0 = disabled)
RATE_LIMIT_PER_DAY=500              # Requests per day per IP (0 = disabled)
RATE_LIMIT_STORAGE_URL=redis://localhost:6380/0  # Dedicated AMIP Redis service
```

Multiple limits stack: if both per-minute and per-hour are set, whichever
limit is hit first will trigger a 429. Set to 0 to disable a particular limit.

---

## Phase 2 — SQL result caching

```bash
SQL_CACHE_ENABLED=true                # Default: true. Enable/disable SQL result caching.
SQL_CACHE_TTL_SECONDS=86400           # Default: 86400 (24 hours). Cache entry expiry.
SQL_CACHE_PREFIX=amip:sql_cache:      # Default: amip:sql_cache: Redis key prefix.
```

When enabled, identical SQL queries return cached results, skipping SQL generation,
execution, and narrator enrichment. Cache keys are 12-character SHA-256 prefixes of
the query text. The `from_cache: true` field in the response indicates a cache hit.

**Fallback behaviour:** If Redis is unreachable, caching is silently disabled and
queries execute normally. Set `SQL_CACHE_ENABLED=false` to disable explicitly.

---

## Verifying your config

```bash
source .venv/bin/activate
python -c "import src.chatbot.config as c; print(c.OPENAI_MODEL, c.DB_HOST, c.REDIS_ENABLED)"
```

Expected output (with defaults):
```
gpt-4o localhost True
```
