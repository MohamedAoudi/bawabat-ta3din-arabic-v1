# AMIP — Project Roadmap (Living Document)

**Project:** AMIP — Arab Mining Indicators Portal (full-stack web app)
**Components:** Frontend (React/Vite) · Backend (Express/PostgreSQL) · Chatbot (FastAPI + LightRAG) · Report Generator (FastAPI)
**Last updated:** 2026-06-23

> Status legend: ✅ done · 🔄 in progress · ❌ not started · 🟡 partial

---

## 1. Architecture at a glance

```
React frontend :5173
   ├── HTTP → Express backend :5001 → PostgreSQL amip_db :5432
   ├── HTTP → Chatbot API :8000 ──┐
   │                              ├── PostgreSQL (text-to-SQL) + LightRAG :9622 (RAG)
   └── HTTP → Report API :8001 ───┘    + OpenAI
```

Single database `amip_db` (`public` schema) + read-only `bi` schema for analytics.

---

## 2. Completed

### Data engineering ✅
- Production loaded: `arab_production` (2,881), `world_production` (255), `mineral_production` (111)
- Trade loaded: `trade_world` (6,050), `mineral_trade` (26), `trade_partners` (195)
- Bilateral loaded: `partner_trade` (16,740)
- Idempotent loaders under `pipelines/loaders/`, full FK integrity, isolation-asserted
- `bi` production semantic views for Power BI (`bi/schema_bi_production.sql`)
- Docs: `DATA_ENGINEERING.md`, diagrams, one-pager, `.drawio`

### Report generator 🟡
- `Rapport.jsx` wired to `POST :8001/report` → live PDF (preview + download) ✅
- `reportService.js` with country-name mapping + blob/error handling ✅
- Schema repointed to `public`; PDFs verified (Morocco/Phosphate, Morocco/Gold) ✅
- **Open:** partner section not wired to bilateral data; no performance tuning yet

### Chatbot 🟡
- SQL name-alignment fixed (ILIKE + GROUND-TRUTH names + singular `type_trade`) ✅
- Core SQL Q&A now returns real data (was 0% useful) ✅
- Redis up → persistent sessions ✅
- LightRAG migrated **into the project**, self-contained ✅
- RAG model upgraded → `gpt-4.1` extraction + `text-embedding-3-large` ✅
- Corpus corrected (name, oil/gas, dates) + expanded (54 minerals, 21 countries, 14 concepts, trilingual) ✅
- RAG re-indexed with gpt-4.1 — 17 docs, graph 4.4 MB → 91 MB; broad-question Q&A verified (EN + AR) ✅
- LIST/FAQ matching fixed — scoring was effectively dead (only exact full-message matches answered); now distinctive-phrase matching with specificity weights, French keyword bucket no longer dropped; added trilingual "languages-supported" FAQ; precheck (0.90) stays strict so SQL queries aren't hijacked ✅
- Charts repointed to live `public` schema — all 9 chart builders rewritten from dead `minerals.v_*` views to `public.*` derived-table subqueries (no validator change needed); 7 data-backed chart types (bar/line/donut/table/grouped-bar) render trilingually, price/data-quality degrade gracefully; chart regression tests added (suite 38→60) ✅

---

## 3. In progress 🔄

- _(none — RAG re-index complete)_

---

## 4. Remaining roadmap (recommended order)

### Block A — Finish chatbot (6 categories)
Each is one self-contained session with its own before/after metric.

| # | Category | Problem | Status |
|---|---|---|---|
| 1 | Scope-guard precision | `'or'`/`'ore'` substring bug leaks off-topic ("world cup") — fixed: word-boundary matching for ASCII fragments, substring kept for Arabic (prefix tolerance); greeting `'hi'` leak fixed too. Regression tests added (`test_scope_guard.py`, 15 cases) ✅ | ✅ |
| 2 | Charts | **before:** 6/6 chart requests crashed ("An internal error occurred") — all 9 builders hardwired to non-existent `minerals.v_*` views (blocked at `validate_sql`). **after:** repointed every builder to live `public` schema via derived-table subqueries → all 7 data-backed types (top-producers, production-trend, prod-vs-world, trade-trend, trade-by-product, bilateral, country-summary) return real data in en/fr/ar; price & data-quality degrade gracefully (no such data exists); 38→60 tests green; verified live ✅ | ✅ |
| 3 | Clarification | **before:** low-confidence intents returned `intent:"clarify"` but `ChatResponse` (the non-streaming `/chat` model the website uses) had no clarify fields → Pydantic dropped `clarify_options`/`original_message` and the turn had `answer:""` → blank reply. **after:** clarify fields added to `ChatResponse`; localized prompt added; CHART added as a 4th option (classifier emits it); `clarify_choice` regex widened to `SQL\|RAG\|LIST\|CHART`. Frontend `ChatbotModal` renders option buttons (RTL-aware, AMIP gold) and re-sends `original_message` + `clarify_choice` on click. 3 tests added (suite 94→97); live verification handed to Codex (`CLAUDE_TO_CODEX_CLARIFICATION.md`) ✅ | ✅ |
| 4 | RAG hardening | (a) corpus + re-index ✅ **done**; (b) **after:** verified the production fallback chain (`query_rag_stream`→`query_rag`→OpenAI free-style) on LightRAG-down; hardened the free-style system prompt to **qualitative-only** — must not fabricate stats/volumes/prices (all numbers come from SQL); both-down path degrades to localized `rag_unavailable`. 4 tests added ✅ | ✅ |
| 5 | Intent routing | LIST under-triggers — KB-matching layer fixed ✅; **chart intent-classifier** (`_classify_intent`/`_contains_any`/`_detect_entities`) **after:** Arabic proclitic prefixes (`لشركاء`, `بالمغرب`, `وللفوسفات`) + French/English plurals (`partenaires`, `prices`) now match via `_term_pattern` (proclitic-anchored for AR, word-boundary+`s?` for ASCII) — no longer mis-routes to `top_producers`; false-positive guards verified (`اقطار`≠Qatar, `barrel`≠`bar`); 7 tests added. LLM classifier nudged for existence questions (`do any countries have lithium?`→RAG) — **live-verified by Codex** (lithium/cobalt→RAG; gold/phosphate stay SQL) | ✅ |
| 6 | Follow-up suggestions | Deterministic trilingual engine (`follow_ups.py`): 3 clickable chips per turn, all 7 chart intents covered, per-intent pivots (representation/dimension/entity swaps), no-data recovery, REFUSED/error returns `[]`; `ChatbotModal` renders pills with gold AMIP styling + hover; test suite 60→94, all passing ✅ | ✅ |

**Recommended order:** 1 → 2 → 4b → 3 → 5 → 6 — **✅ ALL DONE — Block A complete.** Chatbot test suite 60→108 across the block; full project suite 132 passing (excludes pre-existing `etl` ModuleNotFoundError in ETL/pipeline tests, untouched).

> Live verification by Codex (2026-06-23) — **all passed, no code edits needed:**
> - Clarification (#3): all 4 branches (SQL/CHART/RAG/LIST), all 3 languages + RTL.
> - A5 LLM nudge: `lithium`/`cobalt`→RAG; `which countries produce gold?` / `top 5 phosphate producers`→SQL (no regression).
> - A5 chart routing: FR `partenaires` + AR `لشركاء`/`بالمغرب` both render partner charts (`source_view: public.partner_trade`, country+year filters applied) — no top-producers fallback.
> - A4b: simulated LightRAG outage → OpenAI fallback returned qualitative prose with **zero numeric claims**, deferred figures to AMIP.
> - Op note: stale uvicorn on :8000 reproduced the pre-fix state once — always restart from current source before an E2E pass.

### Block B — Report generator
- **B0. Valid-parameter constraints + year-only UI** ✅ **live-verified** — new `GET /availability` returns only (country→mineral→[yMin,yMax]) combos that actually have production/trade data, year spans clamped to 2010–2024 (a pair absent here would 404). `Rapport.jsx` now drives off it: countries with no data are disabled (greyed flags + disabled options), the mineral dropdown narrows to the selected country, and the **date pickers are replaced with year selectors** bounded to the chosen pair's data span (auto-defaulted to the full span = a complete report). Graceful fallback to `/options` if the endpoint is absent. 4 backend tests; `vite build` green. **Live-verified against amip_db:** 21 countries / 678 valid pairs; `/availability` + `/report` over HTTP return a valid `%PDF` in en/fr/ar; empty combo (Somalia/Phosphate) → 404, and that pair is correctly absent from `/availability`.
- **B1. Partner-section wiring** ✅ **live-verified** — `partner_trade` is 100% the `'All Minerals'` country-level sentinel, so the old per-mineral filter matched nothing → partner section was *permanently empty*. Dropped the per-mineral `mineral_trade` join/filter on both partner queries (now aggregates the country's bilateral export partners); kept the `mineral_has_trade` gate so production-only minerals still show no partners. Added a trilingual country-level caveat under the partner table (shares are all-commodity). **Verified:** Egypt/Gold now surfaces 6 partners (India/China/Côte d'Ivoire) + caveat in en/fr/ar; Morocco/Phosphate stays 0 (gate holds). **Data-coverage nuance:** only 11/21 countries have `partner_trade` rows and some end early (Algeria→2017, Lebanon/Sudan/Kuwait→2011); the partner query is pinned to `year_to`, so a year past a country's bilateral coverage shows the graceful "no bilateral data" note (candidate future tweak: use latest bilateral year ≤ year_to).
- **B2. Performance tuning** ✅ **measured & tuned** — profiled first (measure-before-optimize). **Findings corrected the brief:** `insights.py` has **no LLM call** (100% rule-based templates — no latency to tune); report gen is already fast warm (**~70 ms**: 44 ms reportlab + 26 ms / 10 DB queries); no matplotlib. The real costs were (a) **a fresh psycopg2 connection per request** (`get_cursor` connects+closes every call — ~5 ms local, 20–100 ms remote/TLS, re-paid on every `/report` + `/availability`) and (b) **~1.6 s cold start** (import + first connection + Arabic-font/reportlab warm-up). **Fixes:** added `get_pooled_cursor` (read-only `ThreadedConnectionPool`) in `pipelines/db.py` and pointed the report read path at it → **10 reports now reuse 1 connection** (was 10); added a FastAPI **lifespan warm-up** (primes pool + Arabic font + reportlab at boot, best-effort so a cold DB never crashes startup) → **first request after boot 82 ms** (was ~1 s). Kept `/report` **sync** (CPU-bound PDF runs in FastAPI's threadpool — async would block the loop and hurt). Existing 24 h file cache verified effective (**cache hit 1.1 ms**); left as-is (keying on `data_version` would add a DB query to the fast path for a 24 h TTL — not worth it; documented). 3 pool tests added; full suite **139 passing**; live-verified over HTTP.

### Block C — Frontend integration (highest visible payoff)
- **C1. Dashboard pages → real data** 🟡 — **4 nav-linked pages live-wired** (M1 production volume, M2 production trend, M5 exports, M6 imports). **Decision: live data via Express/`public`, not `bi`** (bi is production-only, pass-through, and not exposed over HTTP; Express already covers every table). Added read-only joined endpoints `GET /api/analytics/production` (arab_production → 2,881 rows w/ country+mineral names, units, `production_value_base`) and `GET /api/analytics/trade?type=export|import` (trade_world → 2,260 exp / 3,790 imp). Frontend `analyticsService.js` + `getTradeMinerals`; the 4 pages were already built to consume DB rows but had been **stubbed to `[]`** ("avoid external service usage") — un-stubbed + pointed at the new endpoints. **Data-quality verified against amip_db: zero duplicate facts in any table; values real (Morocco phosphate 30–39 Mt = USGS).** Fixed M1 "All minerals" cross-mineral sum to use `production_value_base` (was adding kg+tonnes). Fixed M5/M6 default country `"ma"`→`"mar"` (DB iso_code is 3-letter). `vite build` green; endpoints curl-verified.
  - **Remaining:** **M3** (multi-mineral compare) & **M4** (Arab-vs-world share) are **orphan prototypes** (not in nav, hardcoded `seriesMap`/`donutByYear`) — backable later from arab/world_production. **M7/M8** are reserves pages — **no reserves data exists in the DB**; left untouched as placeholders per decision. **Known nuance:** 15 bulk minerals (Iron/Cement/Salt…) report mixed units across countries; per-mineral over-time views are exact, cross-country bars for those few are approximate (use base to fully normalize later). **Op note:** running backend (`node server.js`, plain) must be restarted to load `/api/analytics`.
- **C2. ChatbotModal** ✅ — **chart rendering done** (`ChatChart.jsx`: raw chart.js, renders bar/line/donut/table/grouped-bar from the API's `chart_data`, with a Chart⇄Table toggle, trilingual + RTL, AMIP palette; verified via prod build + live-data transform). **Clarification UI done** — renders option buttons + sends `clarify_choice`, re-sending `original_message` (pairs with chatbot #3); shared `appendBotResponse` handler; `vite build` green

### Block D — Power BI (parallel track, your work)
- Production `bi` views ✅ ready
- Optional: trade `bi` views ❌ (only if trade visuals wanted)
- Build dashboards on the model

### Block E — Production-readiness (pre-deploy)
- **E1.** Replace `JWT_SECRET` placeholder; narrow CORS; secrets management ❌
- **E2.** Frontend bundle ~2 MB → code-splitting ❌
- **E3.** Full end-to-end test pass across all four components ❌

---

## 5. Recommended overall sequence

1. ~~Finish **Block A** (chatbot)~~ — ✅ **complete & live-verified by Codex** (all 6 categories)
2. ~~**Block B** (report: partner wiring + performance)~~ — ✅ **complete** (B0 params/year-UI, B1 partner wiring, B2 perf — all live-verified); perf-mandate gap closed
3. **Block C** (frontend real-data dashboards) — **← next**; biggest visible improvement
4. **Block E** (hardening) before any deployment
5. **Block D** (Power BI) runs in parallel throughout

---

## 6. Open decisions / notes

- A separate, unrelated LightRAG ("My Graph KB") runs on `:9621` from `/PFE/lightrag-server/` — not part of AMIP, left untouched.
- PFE source copies (`/PFE/amip/...`) are now redundant; deletion pending user go-ahead.
- AMIP canonical name: EN *Arab Mining Indicators Portal* · FR *Portail arabe des indicateurs miniers* · AR *بوابة المؤشرات التعدينية العربية*.
- RAG corpus rule: **qualitative only** — all numbers come from SQL, never from RAG.
- Backup of pre-reindex RAG graph at `lightrag-server-amip/data/rag_storage.bak`.
