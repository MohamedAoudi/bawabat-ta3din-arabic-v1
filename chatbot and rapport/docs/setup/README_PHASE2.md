# Phase 2 — Setup and Status

Phase 2 adds production-grade infrastructure on top of the Phase 1 chatbot:
Redis session persistence, rate limiting, SQL result caching, and streaming responses.

**As of 2026-05-16**: Task 1 (Redis session store) is complete and verified.

---

## Status

| Task | Feature | Status |
|------|---------|--------|
| 2.1 | Redis session store | ✅ Done — 14/14 tests passing |
| 2.2 | Rate limiting (`slowapi`) | ⏳ Next |
| 2.3 | SQL result caching | ⏳ Pending |
| 2.4 | Streaming responses | ⏳ Pending |

---

## Prerequisites

- Python **3.12.x** (verified: 3.12.13 on macOS 25.3.0)
  - 3.13+ causes asyncio import hangs at startup — do not use
- Docker — for Redis and LightRAG
- Everything from Phase 1 working (see `QUICK_START.md`)

---

## Redis setup (Task 1)

### Start Redis

```bash
docker compose -f docker-compose.redis.yml up -d
```

### Verify Redis is reachable

```bash
redis-cli -p 6380 ping
# Expected: PONG

curl -s http://localhost:8000/health | python3 -m json.tool
# Expected: {"status": "ok", "backend": "redis", "redis_reachable": true}
```

### Configure Redis in `.env`

These vars have sensible defaults — you only need to set them if you deviate:

```bash
REDIS_URL=redis://localhost:6380/0        # dedicated AMIP Redis service
REDIS_ENABLED=true                        # default — set false to disable
REDIS_SESSION_TTL_SECONDS=3600            # default — 1-hour rolling TTL
REDIS_SESSION_PREFIX=amip:session:        # default — key namespace
RATE_LIMIT_STORAGE_URL=redis://localhost:6380/0
```

---

## Run Phase 2 tests

```bash
source .venv/bin/activate

# Redis must be running for the Redis test class
python -m pytest tests/chatbot/test_session_store.py -v
```

Expected output:

```
PASSED tests/chatbot/test_session_store.py::TestInMemorySessionStore::test_create_new_session
PASSED tests/chatbot/test_session_store.py::TestInMemorySessionStore::test_get_existing_session
PASSED tests/chatbot/test_session_store.py::TestInMemorySessionStore::test_round_trip_with_save_turn
PASSED tests/chatbot/test_session_store.py::TestInMemorySessionStore::test_save_persists_new_session
PASSED tests/chatbot/test_session_store.py::TestInMemorySessionStore::test_touch_is_noop
PASSED tests/chatbot/test_session_store.py::TestRedisSessionStore::test_create_new_session
PASSED tests/chatbot/test_session_store.py::TestRedisSessionStore::test_round_trip
PASSED tests/chatbot/test_session_store.py::TestRedisSessionStore::test_user_context_survives_round_trip
PASSED tests/chatbot/test_session_store.py::TestRedisSessionStore::test_ttl_is_set_after_save
PASSED tests/chatbot/test_session_store.py::TestRedisSessionStore::test_ttl_refreshed_on_read
PASSED tests/chatbot/test_session_store.py::TestRedisSessionStore::test_touch_refreshes_ttl
PASSED tests/chatbot/test_session_store.py::TestRedisSessionStore::test_extra_fields_in_history
PASSED tests/chatbot/test_session_store.py::TestBuildSessionStoreFallback::test_returns_in_memory_when_redis_disabled
PASSED tests/chatbot/test_session_store.py::TestBuildSessionStoreFallback::test_falls_back_to_in_memory_on_bad_url

14 passed in X.XXs
```

---

## What changed in Task 1

### New files

| File | Description |
|------|-------------|
| `tests/chatbot/test_session_store.py` | 14 pytest tests — InMemorySessionStore, RedisSessionStore, build_session_store fallback |

### Modified files

| File | What changed |
|------|-------------|
| `src/chatbot/config.py` | Added `REDIS_URL`, `REDIS_ENABLED`, `REDIS_SESSION_TTL_SECONDS`, `REDIS_SESSION_PREFIX` env vars; added `get_redis_client()` singleton factory with 2-second connect timeout |
| `src/chatbot/api/app.py` | Added `lifespan()` context manager — logs session backend + reachability at startup; added `GET /health` endpoint returning `{"status", "backend", "redis_reachable"}` |
| `src/chatbot/core/session.py` | Full rewrite: replaced bare `dict` with `SessionStore` Protocol; added `InMemorySessionStore` (dict-backed), `RedisSessionStore` (JSON + rolling TTL), `build_session_store()` factory with TCP probe; added `save_turn()` and `update_sector_interest()` public helpers |
| `src/chatbot/core/scope_guard.py` | Expanded `_ON_TOPIC_FRAGMENTS` with mineral/trade/report keywords in 3 languages |
| `src/chatbot/router/intent_classifier.py` | Added `CHART` as 4th routing label with keyword detection rules and priority over SQL |
| `knowledge/static/knowledge_base.yaml` | Expanded Q&A entries |
| `requirements.txt` | Declares Redis, SlowAPI, HTTPX, and PyYAML runtime dependencies |

---

## Session behaviour

- **New session**: omit `session_id` in the request → server generates a UUID, stores it in Redis, returns it in the response
- **Continue session**: pass the `session_id` from a prior response → server loads history from Redis
- **TTL**: rolling — every read/write resets the 1-hour timer
- **Fallback**: if Redis is unreachable at startup, the server falls back to in-memory automatically (logs a warning). Sessions will not survive a server restart in fallback mode.

---

## Next task — Rate limiting (Task 2)

Goal: prevent API abuse with per-IP rate limits using `slowapi`.

```bash
pip install slowapi
```

Plan:
- Add `slowapi` limiter to `chatbot/api/app.py`
- Rate limit `POST /chat` to `RATE_LIMIT_PER_MINUTE` per IP
- Store counters in the dedicated AMIP Redis service
- Add `RATE_LIMIT_ENABLED` env var to toggle
- Return `HTTP 429` with a message in the request language

See `ENVIRONMENT.md` for the planned env vars (`RATE_LIMIT_*`).
