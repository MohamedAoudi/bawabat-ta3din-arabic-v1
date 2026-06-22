# AMIP Chatbot Deployment Checklist

**Target:** SSH deployment to dedicated server  
**Source:** `/Users/aminebenchekroun/Desktop/PFE/amip/arab-minerals-dw`  
**Date:** 2026-05-18  
**Status:** Needs rerun after environment setup; see `RUNBOOK.md`

---

## Priority Legend

- 🔴 **BLOCKER** — Must fix before going live. Security/stability risk.
- 🟡 **HIGH** — Should fix in first week of production. Performance/UX impact.
- 🟢 **MEDIUM** — Can ship without, fix within first month.
- ⚪ **LOW/PHASE-3** — Architectural prep or nice-to-haves. No rush.

---

## Section 1: Pre-Deployment Fixes (Do These BEFORE Deployment)

### 🔴 1.1: Pin All Dependencies

**Problem:** `requirements.txt` uses unpinned ranges (`>=`). Non-reproducible installs.

**Risk:** A breaking dependency update could make the app undeployable on the server.

**File:** `requirements.txt`

**Fix:**
```bash
cd /Users/aminebenchekroun/Desktop/PFE/amip/arab-minerals-dw
pip install pip-tools
pip-compile requirements.txt -o requirements.lock
```

Then replace `requirements.txt` with the pinned `requirements.lock` content, or use both (lock for prod, txt for dev).

**Test:** `pip install -r requirements.lock` in a fresh venv should work.

---

### 🔴 1.2: Validate Production Environment Variables

**Problem:** The app will start even if critical env vars are missing. `config.validate_env()` was added but may not catch everything.

**Risk:** Server starts but crashes on first request.

**File:** `chatbot/config.py`

**Fix:** Review `validate_env()` function. Ensure it checks:
- `OPENAI_API_KEY` (required)
- `DB_*` warehouse variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SCHEMA`)
- `LIGHTRAG_BASE_URL` (required)
- `REDIS_URL` (required if `REDIS_ENABLED=true`)
- `CORS_ALLOWED_ORIGINS` (must NOT be `*` if `APP_ENV=production`)

Add any missing checks. The function should `raise ValueError()` with a clear message if validation fails.

**Test:** Run with a missing env var:
```bash
unset OPENAI_API_KEY
python -m uvicorn src.chatbot.api.app:app
# Should fail immediately with clear error
```

---

### 🔴 1.3: Create Production `.env` Template

**Problem:** `.env.example` exists but may have placeholder values that aren't obvious.

**Risk:** You fill in the wrong format or forget a variable on the server.

**File:** `.env.example`

**Fix:** Review every variable in `.env.example`. For each:
- Ensure the placeholder is CLEARLY fake (`your_key_here`, `changeme`, etc.)
- Add a comment explaining what it does
- Mark which ones are REQUIRED vs OPTIONAL

Example format:
```bash
# REQUIRED: OpenAI API key for LLM calls
OPENAI_API_KEY=sk-proj-...

# REQUIRED: PostgreSQL connection (AMIP Warehouse V2)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arab_minerals_dw
DB_USER=<your-postgres-user>
DB_PASSWORD=changeme
DB_SCHEMA=minerals

# OPTIONAL: Defaults to production if not set
APP_ENV=production
```

**Test:** Copy `.env.example` to `.env.production`, fill it with real server values, verify all required vars are present.

---

### 🔴 1.4: Set Up LightRAG on Server

**Problem:** The canonical codebase expects LightRAG at `LIGHTRAG_BASE_URL`, but it's not deployed yet.

**Risk:** All RAG queries will fail. Users asking knowledge questions get errors.

**Files:** `docs/lightrag_setup.md`, `ingestion/`

**Fix:**
1. SSH into your server
2. Install Docker if not present
3. Follow `docs/lightrag_setup.md` to:
   - Pull/run the LightRAG Docker container
   - Mount persistent volume for the index
   - Expose on `localhost:9622` (or configure a different port)
4. Run the ingestion script to load your knowledge base:
   ```bash
   cd ingestion/
   python index_documents.py
   ```
5. Test that LightRAG responds:
   ```bash
   curl -X POST http://localhost:9622/query \
     -H "Content-Type: application/json" \
     -d '{"query": "What is AMIP?", "mode": "mix"}'
   ```

**Blocker if:** You don't have the AMIP knowledge documents ready. If not, create a minimal `amip_knowledge.md` with 5-10 FAQ answers as a placeholder.

---

### 🔴 1.5: Schema and User List Alignment

**Problem:** The technical report flagged that `dim_users` table and schema details are not finalized with the project head.

**Risk:** Queries might reference tables/columns that don't exist, or expose data that shouldn't be public.

**Files:** `chatbot/core/schema_context.py`, `chatbot/guardrails/sql_validator.py`

**Fix:**
1. Get the **final approved schema** from the project head
2. Update `SCHEMA_TOPICS` in `schema_context.py` to match actual tables/columns
3. Update `ALLOWED_TABLES` in `sql_validator.py` to only include tables the chatbot should access
4. If `dim_users` contains PII (emails, names), either:
   - Remove it from `ALLOWED_TABLES` entirely, OR
   - Filter out PII columns in `SCHEMA_TOPICS` (don't show `user_email`, `user_name` to the LLM)
5. Update `few_shot_examples.json` if any examples reference removed/renamed tables

**Test:** Generate SQL for a few common queries and verify they work against the real warehouse.

**Blocker if:** Schema is not confirmed. You can deploy with current schema but must update immediately after confirmation.

---

### 🔴 1.6: Verify Redis is Running on Server

**Problem:** The app requires Redis for sessions, caching, and rate limiting.

**Risk:** App starts but all sessions/cache operations fail silently or loudly.

**Fix:**
1. SSH into server
2. Install Redis: `sudo apt install redis-server`
3. Start Redis: `sudo systemctl start redis-server`
4. Enable on boot: `sudo systemctl enable redis-server`
5. Test: `redis-cli ping` → should return `PONG`
6. Set `REDIS_URL` in production `.env`:
   ```
   REDIS_URL=redis://localhost:6379
   ```

**Test:** From the server, run:
```bash
python -c "import redis; r = redis.from_url('redis://localhost:6379'); r.set('test', 'ok'); print(r.get('test'))"
# Should print: b'ok'
```

---

### 🟡 1.7: Add Server Process Manager Config

**Problem:** No systemd service file exists. After SSH disconnect, uvicorn will stop.

**Risk:** Server crashes or SSH session ends → chatbot goes offline.

**Fix:** Create `/etc/systemd/system/amip-chatbot.service`:

```ini
[Unit]
Description=AMIP Chatbot API
After=network.target postgresql.service redis-server.service

[Service]
Type=notify
User=amip
Group=amip
WorkingDirectory=/home/amip/amip-chatbot
Environment="PATH=/home/amip/amip-chatbot/.venv/bin"
EnvironmentFile=/home/amip/amip-chatbot/.env
ExecStart=/home/amip/amip-chatbot/.venv/bin/gunicorn -c gunicorn.conf.py src.chatbot.api.app:app
Restart=on-failure
RestartSec=5s
StandardOutput=append:/var/log/amip-chatbot/app.log
StandardError=append:/var/log/amip-chatbot/error.log

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable amip-chatbot
sudo systemctl start amip-chatbot
sudo systemctl status amip-chatbot
```

**Why High Priority:** Without this, every server reboot or crash leaves the chatbot down until you manually restart it.

---

### 🟡 1.8: Add Reverse Proxy (Nginx) Config

**Problem:** Uvicorn is exposed directly. No TLS, no buffering control, no static file serving.

**Risk:** SSE streaming might buffer incorrectly, no HTTPS, potential DDoS vector.

**Fix:** Create `/etc/nginx/sites-available/amip-chatbot`:

```nginx
server {
    listen 80;
    server_name chatbot.amip-portal;  # Change to your actual domain

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name chatbot.amip-portal;

    ssl_certificate /etc/letsencrypt/live/chatbot.amip-portal/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chatbot.amip-portal/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Disable buffering for SSE
        proxy_buffering off;
        proxy_cache off;

        # Timeouts for long-running queries
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    location /chat/stream {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # Critical for SSE
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
        chunked_transfer_encoding on;
    }
}
```

Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/amip-chatbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Get SSL cert:
```bash
sudo certbot --nginx -d chatbot.amip-portal
```

**Why High Priority:** Users will connect over HTTPS. SSE won't work reliably without proper proxy config.

---

### 🟡 1.9: Set Up Log Rotation

**Problem:** Eval logs at `~/.amip-chatbot/logs/eval.jsonl` will grow forever.

**Risk:** Disk fills up, server crashes.

**Fix:** Create `/etc/logrotate.d/amip-chatbot`:

```
/home/amip/.amip-chatbot/logs/*.jsonl {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    missingok
    create 0640 amip amip
}

/var/log/amip-chatbot/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0640 amip amip
    sharedscripts
    postrotate
        systemctl reload amip-chatbot > /dev/null 2>&1 || true
    endscript
}
```

Test:
```bash
sudo logrotate -f /etc/logrotate.d/amip-chatbot
```

---

### 🟢 1.10: Add Health Check Monitoring

**Problem:** `/health` exists but nobody is checking it.

**Risk:** Server goes down, you don't know until users complain.

**Fix:** Set up a cron job or external monitor (UptimeRobot, Pingdom, etc.) to:
- Hit `https://chatbot.amip-portal/health` every 5 minutes
- Alert you (email/SMS) if it returns non-200 or times out

Simple cron approach:
```bash
*/5 * * * * curl -f https://chatbot.amip-portal/health || echo "AMIP Chatbot down!" | mail -s "Alert" your-email@domain.com
```

---

## Section 2: Deployment Steps (Execute These on Server)

### Step 2.1: Create Non-Root User

```bash
sudo adduser amip
sudo usermod -aG sudo amip  # Optional: if you need sudo access
```

All following steps run as the `amip` user.

---

### Step 2.2: Transfer Code to Server

From your Mac:
```bash
cd /Users/aminebenchekroun/Desktop/PFE/amip
rsync -avz --exclude='.venv' --exclude='__pycache__' --exclude='.git' \
  arab-minerals-dw/ amip@your-server-ip:/home/amip/amip-chatbot/
```

---

### Step 2.3: Set Up Python Environment on Server

SSH into server:
```bash
ssh amip@your-server-ip
cd /home/amip/amip-chatbot

# Install Python 3.12+ if not present
sudo apt update
sudo apt install python3.12 python3.12-venv python3-pip

# Create venv
python3.12 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt  # Or requirements.lock if you created it
```

---

### Step 2.4: Create Production `.env`

```bash
cd /home/amip/amip-chatbot
cp .env.example .env
nano .env  # Fill in real values
```

Ensure these are set:
- `APP_ENV=production`
- `OPENAI_API_KEY=sk-proj-...`
- `DB_HOST=...` and the remaining warehouse variables (`DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SCHEMA`)
- `LIGHTRAG_BASE_URL=http://localhost:9622`
- `REDIS_URL=redis://localhost:6379`
- `CORS_ALLOWED_ORIGINS=https://amip-portal`
- `EVAL_LOG_PATH=/home/amip/.amip-chatbot/logs/eval.jsonl`

Set proper permissions:
```bash
chmod 600 .env  # Only owner can read
```

---

### Step 2.5: Run Tests on Server

```bash
source .venv/bin/activate
python -m pytest tests/chatbot -v
```

All 135 should pass. If not, check:
- Redis is running
- PostgreSQL is accessible
- OpenAI API key is valid

---

### Step 2.6: Start the Service

```bash
sudo systemctl start amip-chatbot
sudo systemctl status amip-chatbot

# Check logs
sudo journalctl -u amip-chatbot -f
```

---

### Step 2.7: Verify Health Check

```bash
curl http://localhost:8000/health
# Should return: {"status":"ok","backend":"redis","redis_reachable":true}
```

---

### Step 2.8: Test a Chat Request

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "ما هي المعادن التي ينتجها المغرب؟", "language": "ar"}'
```

Should return a JSON response with an answer.

---

### Step 2.9: Enable HTTPS via Nginx

Follow Step 1.8 above. After nginx is configured:

```bash
curl https://chatbot.amip-portal/health
```

---

### Step 2.10: Integrate with AMIP Frontend

Update your WordPress or frontend code to point to:
```
https://chatbot.amip-portal/chat
https://chatbot.amip-portal/chat/stream
```

Test from the live site.

---

## Section 3: Post-Deployment Monitoring (First Week)

### 🟡 3.1: Watch Eval Logs for Errors

```bash
tail -f ~/.amip-chatbot/logs/eval.jsonl
```

Look for:
- `"intent": "error"` entries
- SQL generation failures (`"sql": "CANNOT_GENERATE"`)
- Repeated RAG failures
- Unexpectedly high `row_count` values (query is too broad)

---

### 🟡 3.2: Monitor OpenAI API Usage

Check your OpenAI dashboard daily:
- Token usage per day
- Cost per day
- Error rate

If costs spike, investigate:
- Are users asking very long questions?
- Is the chatbot stuck in a loop?
- Is the aggregation handler generating too many follow-ups?

---

### 🟡 3.3: Check Redis Memory Usage

```bash
redis-cli info memory
```

If `used_memory` grows unbounded, check:
- Session TTLs are working (`chatbot/core/session.py`)
- SQL cache TTLs are working (`chatbot/core/sql_cache.py`)
- Rate limit storage isn't leaking keys

---

### 🟡 3.4: Review Rate Limiting Effectiveness

Check logs for `429 Too Many Requests` responses. If you see:
- **Too many 429s:** Limits are too strict, users are getting blocked
- **No 429s but high costs:** Limits are too loose, abuse is happening

Tune `RATE_LIMIT_PER_MINUTE` in config.py.

---

### 🟡 3.5: Collect User Feedback

Add a feedback mechanism (could be as simple as a "Was this helpful?" button) and log:
- Which intents get thumbs down most often
- Which questions result in "I don't understand" from users
- Which SQL queries fail validation most often

Use this to:
- Expand the YAML KB
- Add more few-shot examples
- Tune the intent classifier

---

## Section 4: High-Impact Improvements (First Month)

### 🟡 4.1: Implement Real Authentication

**Problem:** `wp_token` is accepted but unused. Anyone can call the API.

**Current State:** `chatbot/api/app.py` line ~115, `wp_token` in request model but never validated.

**Fix:**
1. Add a FastAPI dependency `get_current_user()` that validates the WordPress JWT token
2. Apply it to `/chat` and `/chat/stream` routes
3. Store the verified user ID in the session
4. Remove client-controlled `user_type` — derive it server-side from the WordPress user profile

**Why High Impact:** Once you have real users, you need to:
- Prevent API abuse
- Track per-user costs
- Apply per-user rate limits
- Support premium features for paid users

**Files to change:**
- `chatbot/api/app.py` (add auth dependency)
- `chatbot/core/session.py` (store verified user ID)
- `chatbot/config.py` (add `WP_JWT_SECRET` env var)

---

### 🟡 4.2: Add Structured Logging

**Problem:** Logs are print statements and default server logs. Hard to parse in production.

**Fix:**
1. Replace `print()` with `logging.info()`, `logging.warning()`, `logging.error()`
2. Configure JSON logging at startup:
   ```python
   import logging
   import json
   
   class JSONFormatter(logging.Formatter):
       def format(self, record):
           return json.dumps({
               "timestamp": self.formatTime(record),
               "level": record.levelname,
               "message": record.getMessage(),
               "module": record.module,
               "function": record.funcName,
           })
   
   handler = logging.StreamHandler()
   handler.setFormatter(JSONFormatter())
   logging.basicConfig(level=logging.INFO, handlers=[handler])
   ```
3. Add request IDs to every log entry (use `contextvars`)

**Why High Impact:** When debugging production issues, structured logs are searchable and parseable. You can grep for errors, trace requests, build dashboards.

---

### 🟡 4.3: Add Prometheus Metrics

**Problem:** No real-time visibility into performance.

**Fix:**
1. Add `prometheus-fastapi-instrumentator` to requirements
2. In `chatbot/api/app.py`:
   ```python
   from prometheus_fastapi_instrumentator import Instrumentator
   
   Instrumentator().instrument(app).expose(app)
   ```
3. Expose `/metrics` endpoint
4. Set up Grafana dashboard to track:
   - Request count by intent
   - Latency percentiles (p50, p95, p99)
   - OpenAI token usage
   - SQL cache hit rate
   - Error rate

**Why High Impact:** You'll see slowdowns and errors in real-time, not after users complain.

---

### 🟢 4.4: Optimize SQL Generation Latency

**Problem:** Every SQL query hits OpenAI twice (SQL gen + answer formatting), plus DB execution.

**Fix:**
1. Cache SQL generation: if the question is semantically similar to a previous one, reuse the SQL
2. Use prompt caching (OpenAI's newer feature) for the schema context
3. Pre-generate SQL for the top 20 most common questions and serve from a lookup table

**Expected Impact:** 30-50% latency reduction for common queries.

---

### 🟢 4.5: Add Query Complexity Limits

**Problem:** A user could ask for every mineral trade row across every country, partner, HS code, and year, generating an overly broad query.

**Fix:**
1. In `chatbot/core/sql_executor.py`, check `row_count` after execution
2. If > 1000 rows, return an error: "Query too broad. Please be more specific."
3. Add a SQL rewriting step that injects `LIMIT 1000` before execution if no LIMIT is present

**Why Medium Priority:** Current `MAX_RESULT_ROWS` already caps fetch, but the DB still processes all rows. This fix protects the DB.

---

## Section 5: Phase 3 Preparation (Can Defer)

### ⚪ 5.1: Extract Tools for MCP/Agent Brain

**Goal:** Convert SQL, RAG, List, Chart handlers into explicit tool interfaces for Phase 3 agent orchestration.

**Files:**
- Create `src/chatbot/tools/` directory
- Define `Tool` protocol with `execute()`, `schema()`, `requires_auth()`
- Refactor handlers to implement `Tool`

**Blocked by:** Nothing, just architectural work.

---

### ⚪ 5.2: User Identity Level 2

**Goal:** Server-verified identity, roles, organization ownership, and access tier.

**Depends on:** Fix 4.1 (real authentication) must be done first.

---

### ⚪ 5.3: Recommendation Engine

**Goal:** Suggest countries, minerals, HS products, reports, or follow-up analyses based on user behavior.

**Depends on:** User identity, event tracking schema, ML model.

---

### ⚪ 5.4: Anomaly Detector

**Goal:** Alert users to unusual data patterns such as sudden production changes, trade shifts, or data-quality anomalies.

**Depends on:** Scheduled jobs, baseline computation, alerting system.

---

### ⚪ 5.5: Decision Tree / Guided Flow

**Goal:** Multi-turn clarification with explicit state machine.

**Current State:** Clarification handler exists but is single-turn. Guided flow needs session state slots and transitions.

---

## Section 6: Known Issues to Address Later

### Issue 6.1: Schema/Users Blocked by Project Head

**Status:** Waiting on final schema confirmation.

**Impact:** Queries might fail if schema changes. PII might be exposed.

**Action:** Update immediately after schema is confirmed (see Fix 1.5).

---

### Issue 6.2: Feedback Endpoint Not Wired to Frontend

**Status:** `/feedback` endpoint exists in API but frontend doesn't call it.

**Impact:** Cache eviction and eval improvement don't work until frontend integration is done.

**Action:** Add thumbs up/down buttons to chat UI, wire to `/feedback`.

---

### Issue 6.3: LightRAG Knowledge Base Incomplete

**Status:** You need to generate/confirm the AMIP knowledge documents.

**Impact:** RAG queries might give generic answers or "I don't know" responses.

**Action:** Write or collect AMIP FAQ/docs, run `knowledge/ingestion/index_documents.py`.

---

## Section 7: Rollback Plan

If something goes wrong after deployment:

### Quick Rollback (If Service Won't Start)

```bash
sudo systemctl stop amip-chatbot

# Restore from backup (assumes you made one before deploying)
cd /home/amip
rm -rf amip-chatbot
cp -a amip-chatbot.backup amip-chatbot

sudo systemctl start amip-chatbot
```

---

### Partial Rollback (If Specific Feature Breaks)

1. SSH into server
2. Edit the broken file
3. Restart: `sudo systemctl restart amip-chatbot`
4. Test: `curl http://localhost:8000/health`

---

### Full Rollback (If Critical Issue)

1. Point nginx back to the old chatbot (if you had one)
2. Update DNS if needed
3. Fix the issue locally, re-test, re-deploy

---

## Section 8: Success Criteria

You know the deployment succeeded when:

✅ `/health` returns 200 with `redis_reachable: true`  
✅ Test chat request returns a valid answer  
✅ SSE streaming works (tokens appear incrementally)  
✅ Frontend can call the API from `amip-portal`  
✅ Rate limiting blocks excessive requests (test with 100 rapid requests)  
✅ Eval logs are being written to `~/.amip-chatbot/logs/eval.jsonl`  
✅ SQL queries execute and return correct results  
✅ RAG queries return knowledge-based answers  
✅ List bot answers FAQ questions correctly  
✅ No errors in `sudo journalctl -u amip-chatbot` for 24 hours  

---

## Appendix A: File Checklist for Server Transfer

Make sure these files are in the server directory:

```
/home/amip/amip-chatbot/
├── chatbot/                    # Main package
│   ├── api/
│   ├── core/
│   ├── guardrails/
│   ├── list_bot/
│   ├── prompts/
│   ├── rag/
│   ├── router/
│   ├── tests/
│   ├── config.py
│   └── i18n.py / i18n.yaml
├── docs/                       # Reference docs
├── ingestion/                  # LightRAG indexing
├── requirements.txt            # Python deps
├── .env                        # Production secrets (not in git!)
└── .gitignore                  # Prevents secrets from being committed
```

**DO NOT copy:**
- `.venv/`, `__pycache__/`, `.pytest_cache/`
- `.git/` (server doesn't need git history)
- Local logs (`logs/eval.jsonl` from dev)

---

## Appendix B: Emergency Contacts

If deployment fails and you need help:

- **OpenAI API issues:** Check status.openai.com
- **Redis issues:** `redis-cli ping`, check `sudo systemctl status redis-server`
- **PostgreSQL issues:** Check connection with `psql` from server
- **SSL/Nginx issues:** `sudo nginx -t`, check `/var/log/nginx/error.log`
- **Python errors:** Check `sudo journalctl -u amip-chatbot -n 100`

---

## Summary: Minimum Viable Deployment

If you're short on time, the absolute minimum to deploy safely is:

1. ✅ Pin dependencies (1.1)
2. ✅ Validate env vars (1.2)
3. ✅ Create production .env (1.3)
4. ✅ Deploy LightRAG (1.4)
5. ✅ Confirm schema (1.5)
6. ✅ Verify Redis (1.6)
7. ✅ Add systemd service (1.7)
8. ✅ Add nginx config (1.8)
9. ✅ Transfer code (2.2)
10. ✅ Start service (2.6-2.8)

Everything else can be done post-launch. But these 10 are non-negotiable.

---

**Good luck with the deployment! 🚀**
