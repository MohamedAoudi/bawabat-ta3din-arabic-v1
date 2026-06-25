# AMIP Report Feature Location Audit

## 1. Current project structure

The checkout has three main application areas:

- `Frontend`: React/Vite web application. It owns the browser UI, routing, language context, dashboard/report pages, API client services, and preview/download behavior for generated report blobs.
- `Backend`: Node.js/Express API backed by PostgreSQL. It owns portal CRUD/admin APIs, authentication, uploads, migrations/seeding, and dashboard analytics endpoints over the simplified `public` schema.
- `chatbot and repport`: Python FastAPI/ETL/report module. The folder name on disk is spelled `repport`. It owns the chatbot API, report API, ReportLab PDF generation, report data builders, ETL pipelines, warehouse DDL, knowledge/RAG assets, Redis-related chatbot cache/session code, and generated report artifacts.

The existing architecture already separates the report generator from the Node backend: `Frontend/src/services/reportService.js` talks directly to the report FastAPI service on port `8001`, while normal portal data services use the Express API through `Frontend/src/services/apiClient.js`.

## 2. Existing report-related code

| Path | What it appears to do | Reuse, modify, or avoid |
| --- | --- | --- |
| `Frontend/src/pages/Rapport.jsx` | Existing authenticated Reports page at `/rapport`. Loads `/availability`, narrows country/mineral/year choices, calls report generation, creates a blob URL, and renders PDF preview/download/open links. | Modify later for any endpoint naming changes and PPTX-template report UX, but reuse the page and flow. |
| `Frontend/src/services/reportService.js` | Dedicated frontend service for the FastAPI report API. Calls `POST /report`, `GET /options`, and `GET /availability`; defaults to `http://localhost:8001`; maps frontend country codes to exact English DB names. | Reuse and modify later. This is the right frontend integration point. |
| `chatbot and repport/src/reports/api.py` | Current report FastAPI entry point. Exposes `POST /report`, `GET /options`, and `GET /availability`; uses 24-hour filesystem cache in `artifacts/reports`; streams PDFs with `FileResponse`; warms DB pool and ReportLab/font costs at startup. | Reuse and modify. This is the live/canonical report API file. |
| `chatbot and repport/src/reports/data.py` | Compatibility wrapper that re-exports `src.reports.reports.data`. Tests import from this path. | Keep as a compatibility import. Modify only if the project decides to flatten the nested implementation. |
| `chatbot and repport/src/reports/amip_report_generator.py` | Compatibility wrapper that re-exports the nested generator. | Keep for compatibility; later implementation can either extend the nested implementation or replace this wrapper after tests are updated. |
| `chatbot and repport/src/reports/i18n.py` | Compatibility wrapper for report translations and format helpers. | Reuse. |
| `chatbot and repport/src/reports/insights.py` | Compatibility wrapper for report insight rules. | Reuse. |
| `chatbot and repport/src/reports/pdf/builder.py` | Compatibility wrapper for nested ReportLab builder. | Avoid extending this wrapper directly; put real rendering code in an implementation module. |
| `chatbot and repport/src/reports/pdf/components.py` | ReportLab PDF components wrapper/copy area. | Avoid for the PPTX path unless keeping current ReportLab fallback. |
| `chatbot and repport/src/reports/pdf/theme.py` | ReportLab theme/font handling wrapper/copy area. | Reuse only for font/RTL lessons if needed; PPTX rendering should not depend on ReportLab theme code. |
| `chatbot and repport/src/reports/reports/data.py` | Actual current report data builder. Queries `public.countries`, `public.arab_production`, `public.mineral_production`, `public.trade_world`, `public.mineral_trade`, `public.partner_trade`, and `public.trade_partners`; builds Pydantic `ReportData`, KPIs, HS breakdown, partners, forecasts, flags, and insights. | Reuse/modify carefully. This is the strongest existing data foundation. |
| `chatbot and repport/src/reports/reports/amip_report_generator.py` | Legacy/current generator facade importing `get_report_payload`, `generate_report`, `generate_reports_all_languages`, and `render_pdf`. | Reuse as a facade or replace with a clearer service split later. |
| `chatbot and repport/src/reports/reports/pdf/builder.py` | Actual ReportLab PDF renderer. Builds the current designed PDF directly in code. | Avoid for PPTX rendering except as a fallback/reference for content ordering and visual requirements. |
| `chatbot and repport/src/reports/reports/pdf/components.py` | ReportLab chart/table/card helpers used by the current PDF renderer. | Avoid for PPTX rendering; reuse logic concepts only. |
| `chatbot and repport/src/reports/reports/pdf/theme.py` | ReportLab styles and Arabic font registration. | Reuse font/RTL knowledge; do not make PPTX service depend on ReportLab internals. |
| `chatbot and repport/src/reports/reports/i18n.py` | Report translation strings and locale-aware formatting. | Reuse. |
| `chatbot and repport/src/reports/reports/insights.py` | Rule-based report narrative and flag-message generation. | Reuse. |
| `chatbot and repport/src/reports/reports/api.py` | Older nested report API copy. It has `/report`, `/report/all`, and `/options`, but not the newer `/availability`, pooling, CORS, or `NoReportDataError` handling. | Avoid for new work unless deleting/merging legacy code in a separate cleanup. |
| `chatbot and repport/artifacts/reports/*.pdf` | Generated report outputs and current 24-hour filesystem cache targets. | Reuse the directory for generated PDFs; do not commit new generated PDFs unless explicitly needed. |
| `chatbot and repport/tests/test_report_availability.py` | Unit tests for `/availability` shape and year clamping. | Reuse and extend. |
| `chatbot and repport/tests/test_insights.py` | Report insight, HHI, and forecast tests. | Reuse. |
| `chatbot and repport/tests/test_db_pool.py` | Tests for read-only DB pooling used by report API hot paths. | Reuse. |
| `DATA_ENGINEERING.md`, `DATA_ENGINEERING_ONEPAGER.md`, `PROJECT_ROADMAP.md`, `LOCAL_SETUP_REPORT.md` | Existing architecture/status docs mentioning the report API, `/availability`, report caching, data coverage, and known schema constraints. | Reuse as reference; update later only if implementation changes architecture. |
| `Frontend/src/components/ChatChart.jsx` | Renders chatbot charts in the frontend using Chart.js. | Avoid for PPTX report generation. Useful only as reference for chart display semantics. |
| `chatbot and repport/src/chatbot/core/chart_handler.py` | Builds chart data for chatbot answers from SQL over the `public` schema. | Avoid coupling report generation to chatbot internals; can borrow query ideas if report charts need similar data. |

No `.pptx` or `.ppt` template file was found in the repository. Existing report generation is PDF-first via ReportLab, not PPTX-template-first.

## 3. Existing data access

Production, trade, mineral, and country data is currently accessed from PostgreSQL in two parallel stacks:

- Node/Express backend:
  - `Backend/db.js` creates a `pg.Pool` from `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.
  - `Backend/server.js` mounts routes under `/api/*`, runs migrations, and seeds on startup.
  - `Backend/Models/*.js` files query the simplified `public` tables directly.
  - `Backend/Controllers/AnalyticsController.js` joins `arab_production`, `countries`, `mineral_production`, `trade_world`, and `mineral_trade` for dashboard-ready production/trade rows.
  - Relevant endpoints include `/api/analytics/production`, `/api/analytics/trade`, `/api/countries`, `/api/minerals`, `/api/arab-production`, `/api/world-production`, `/api/mineral-trade`, `/api/trade-world`, and `/api/partner-trade`.
  - `Backend/schema.sql` defines the simplified application schema: `countries`, `mineral_production`, `arab_production`, `world_production`, `mineral_trade`, `trade_world`, `partner_trade`, `trade_partners`, and `users`.

- Python chatbot/report module:
  - `chatbot and repport/pipelines/config.py` loads `.env` and builds `DB` connection settings, including `DB_SCHEMA` as PostgreSQL `search_path`.
  - `chatbot and repport/pipelines/db.py` provides `get_cursor()` for ETL/general use and `get_pooled_cursor()` for SELECT-only hot paths such as report generation.
  - `chatbot and repport/src/reports/reports/data.py` is the current report data service. It queries the simplified `public` schema explicitly, not the older `minerals` schema.
  - `chatbot and repport/src/reports/api.py` uses `get_pooled_cursor()` for `/options` and `/availability`, and `generate_report()` for PDF generation.
  - `chatbot and repport/warehouse/ddl/99_create_simplified_schema.sql` mirrors the simplified `public` schema used by the current report API.
  - `chatbot and repport/warehouse/ddl/02_dimensions.sql` and `03_facts.sql` define an older/richer `minerals` warehouse V2 schema; current live report queries observed in code target `public.*`.

Important schema note: docs still mention Warehouse V2 in `minerals`, but current frontend/report/backend code inspected here is wired to the simplified `public` schema and `amip_db`.

## 4. Existing frontend report flow

The Reports page already exists:

- Page/component: `Frontend/src/pages/Rapport.jsx`
- Route: `/rapport` in `Frontend/src/App.jsx`, wrapped in `RequireAuth`.
- Service: `Frontend/src/services/reportService.js`

Current behavior:

- On mount, calls `reportService.getAvailability()` (`GET /availability` on the report FastAPI service).
- If availability succeeds, enables only countries with data, narrows minerals to the selected country, and bounds year selectors to the available data span.
- If availability fails, falls back to `GET /options?lang=en`.
- On submit, validates specific country, mineral, and year range; maps country code to exact English country name; calls `POST /report`.
- On success, stores a PDF blob URL and renders preview/download/open-new-tab controls.
- On 404, shows a no-data message.

API calls it already makes:

- `GET {VITE_REPORT_API_URL or http://localhost:8001}/availability`
- `GET {VITE_REPORT_API_URL or http://localhost:8001}/options?lang=en`
- `POST {VITE_REPORT_API_URL or http://localhost:8001}/report`

What needs to change later:

- Keep the availability-driven selection flow.
- Add/document `VITE_REPORT_API_URL` in `Frontend/.env.example`.
- If the API is renamed to `/reports/generate`, update `Frontend/src/services/reportService.js` and `Rapport.jsx`.
- If the new flow returns a `report_id` instead of an immediate PDF blob, update `Rapport.jsx` to call a download/preview endpoint after generation.

## 5. Recommended location for the new report-generation feature

Recommendation: implement the PPTX-template report generation in `chatbot and repport`, specifically under the existing `chatbot and repport/src/reports` service boundary.

Justification from inspected files:

- The current report API already lives in `chatbot and repport/src/reports/api.py`.
- The current frontend already calls the report service directly through `Frontend/src/services/reportService.js`.
- The report API already implements the required `/availability` behavior and 24-hour cache concept.
- The Python module already owns report-specific dependencies: FastAPI, ReportLab, matplotlib, plotly, Redis, pandas, psycopg2, Arabic text tooling, and tests.
- The Node `Backend` is focused on CRUD/admin/dashboard endpoints and does not have PPTX/PDF/document dependencies.
- The report data builder already lives in Python and queries the exact `public` schema needed for report content.

Do not put PPTX/PDF generation into `Backend`. At most, the Node backend could proxy report endpoints later for deployment simplicity, but the generation logic should stay in the Python report service.

## 6. Recommended file/folder structure

Proposed future structure, fitting the current repo and avoiding a new service:

```text
chatbot and repport/src/reports/
├── api.py                         # modify: expose final report endpoints
├── data.py                        # keep compatibility wrapper
├── report_data_service.py         # new: normalized payload builder facade around existing data.py implementation
├── pptx_service.py                # new: fill PPTX template placeholders and insert chart/table images
├── pdf_service.py                 # new: convert generated PPTX to PDF via LibreOffice/headless
├── chart_service.py               # new: build chart images/tables for PPTX placeholders
├── cache_service.py               # new: 24-hour cache lookup/key/report_id metadata
├── report_models.py               # new: Pydantic request/response models shared by API/services
├── templates/
│   ├── amip_report_template_en.pptx
│   ├── amip_report_template_fr.pptx
│   └── amip_report_template_ar.pptx
├── generated_reports/             # new or use artifacts/reports; generated PPTX/PDF outputs
└── cache/                         # optional if cache metadata is separated from generated outputs
```

Recommended storage choice:

- Keep final generated PDFs under existing `chatbot and repport/artifacts/reports/` unless there is a strong reason to split runtime outputs.
- Store source PPTX templates under `chatbot and repport/src/reports/templates/` if templates are versioned with code, or `chatbot and repport/templates/reports/` if non-code assets are preferred. I recommend `src/reports/templates/` because the templates are part of the report service contract and should deploy with the Python package.

Avoid creating work under `chatbot and repport/src/reports/reports/` unless a cleanup is done first. That nested package looks like an older implementation layer behind compatibility wrappers, and adding more files there would deepen the confusion.

## 7. API design recommendation

Recommended public endpoints for the report FastAPI service:

- `GET /reports/availability`
  - Returns only available country/mineral/year combinations.
  - Can reuse the SQL and response shape from current `GET /availability`.
  - Frontend caller: `Frontend/src/services/reportService.js`, consumed by `Frontend/src/pages/Rapport.jsx`.

- `POST /reports/generate`
  - Request body: `country`, `mineral`, `year_from`, `year_to`, `lang`.
  - Checks cache first. If an identical PDF exists within 24 hours, returns cached metadata and/or the file directly.
  - Recommended response if using a two-step flow: `{ "report_id": "...", "status": "ready", "download_url": "/reports/download/{report_id}" }`.
  - Alternative response if preserving current flow: stream the PDF directly, matching current `POST /report`.

- `GET /reports/download/{report_id}`
  - Streams the cached/generated PDF by stable report id.
  - Should reject path traversal and unknown/expired IDs.

Compatibility recommendation:

- Keep current `GET /availability`, `GET /options`, and `POST /report` as aliases during transition so `Rapport.jsx` does not break.
- Implement new `/reports/*` endpoints in `chatbot and repport/src/reports/api.py`.
- Do not expose these endpoints from the Express `Backend` unless deployment requires same-origin proxying later.

## 8. PPTX template handling

The PPTX template should be stored with the Python report service because:

- The Python service will load and mutate it.
- It must deploy with report generation code.
- It is not a frontend asset and should not be bundled by Vite.
- It is not part of the Node backend's CRUD/admin concerns.

Recommended template location:

```text
chatbot and repport/src/reports/templates/amip_report_template_en.pptx
chatbot and repport/src/reports/templates/amip_report_template_fr.pptx
chatbot and repport/src/reports/templates/amip_report_template_ar.pptx
```

If the design is identical across languages, one template plus language-specific text replacement may be enough:

```text
chatbot and repport/src/reports/templates/amip_report_template.pptx
```

The PPTX should contain static design elements. Code should only replace placeholders such as:

- `{{REPORT_TITLE}}`
- `{{COUNTRY_NAME}}`
- `{{MINERAL_NAME}}`
- `{{YEAR_RANGE}}`
- `{{EXECUTIVE_SUMMARY}}`
- `{{KPI_TOTAL_PRODUCTION}}`
- `{{CHART_PRODUCTION_TREND}}`
- `{{TABLE_HS_BREAKDOWN}}`

The placeholder naming contract should be documented next to the templates, for example:

```text
chatbot and repport/src/reports/templates/README.md
```

## 9. Dependencies to check

Already present:

- FastAPI: present in `chatbot and repport/requirements.txt` and `requirements-prod.txt`.
- Redis: present in Python requirements and used by chatbot cache/session logic.
- ReportLab: present and used by the current PDF renderer.
- matplotlib: present in Python requirements.
- plotly: present in Python requirements.
- pandas/openpyxl/numpy/psycopg2: present for data processing and DB access.
- Chart.js: present in `Frontend/package.json`, but only relevant to browser charts, not report generation.

Needed/not found:

- `python-pptx`: not found in requirements. Needed to fill PPTX templates.
- LibreOffice/headless conversion: no project dependency or script found. Needed to convert PPTX to PDF unless another converter is chosen.
- A PPTX template file: no `.pptx` or `.ppt` was found.

Probably not needed for the PPTX path:

- Flask: not needed because the service already uses FastAPI.
- A new Node PDF library: not needed if generation stays in Python.

Cache recommendation:

- Current report PDF cache is filesystem-based in `chatbot and repport/artifacts/reports` with a 24-hour TTL.
- Keep filesystem cache for generated PDFs unless multi-instance deployment requires Redis/shared storage. Redis is already available if cache metadata must become distributed later.

## 10. Risks and questions before implementation

- Folder spelling risk: the real folder is `chatbot and repport`, not `chatbot and report`.
- There is no PPTX template in the repo yet.
- Current generation is ReportLab-based, so PPTX-template generation is not a small renderer tweak; it is a new rendering path.
- There are duplicate/nested report modules. `src/reports/api.py` is the current API; `src/reports/reports/api.py` appears older and should be avoided for new endpoint work.
- The docs mention Warehouse V2 in schema `minerals`, but current report API and frontend are wired to the simplified `public` schema.
- `Frontend/.env.example` does not document `VITE_REPORT_API_URL`, even though `reportService.js` supports it.
- `chatbot and repport/src/reports/api.py` imports `hashlib` but does not currently use it; future cache keys/report IDs should be designed deliberately.
- Current cache identity is filename-pattern based and ignores `data_version`; this matches the documented 24-hour cache behavior but could serve stale reports during the TTL after data refreshes.
- LibreOffice availability is an environment/deployment question. The project has no verified `soffice` path or Docker install step for conversion.
- Arabic/RTL text replacement in PPTX may need manual verification. Current ReportLab code has Arabic font and bidi/reshaping support that will not automatically transfer to PowerPoint.
- Chart placeholders need a decision: generate static PNGs with matplotlib/plotly, or build native PowerPoint charts. Static images are simpler and more predictable for PDF conversion.
- Current `Rapport.jsx` expects an immediate PDF blob from `POST /report`; a `report_id` flow needs frontend changes.

## 11. Final recommended implementation plan

Phase A: template placement and placeholders

- Add PPTX template(s) under `chatbot and repport/src/reports/templates/`.
- Add a template README documenting required placeholders and language/template rules.
- Manually inspect the template placeholder names before writing replacement code.

Phase B: backend/report service skeleton

- Add `report_models.py`, `report_data_service.py`, `pptx_service.py`, `pdf_service.py`, `chart_service.py`, and `cache_service.py` under `chatbot and repport/src/reports/`.
- Keep `src/reports/api.py` as the FastAPI entry point.
- Keep legacy endpoint aliases until the frontend is migrated.

Phase C: `/availability`

- Reuse existing `GET /availability` SQL and tests.
- Add `GET /reports/availability` as the preferred endpoint.
- Keep year clamping to 2010-2024 unless requirements change.

Phase D: report data builder

- Wrap/reuse `src/reports/reports/data.py` through a clearer `report_data_service.py`.
- Produce a stable template context with keys matching PPTX placeholders.
- Keep Pydantic validation for request and payload models.

Phase E: charts

- Generate chart images from report payload data using matplotlib or plotly.
- Save chart images to a temporary/generated workspace and insert them into PPTX placeholders.
- Start with production trend and HS breakdown because current payload already includes both.

Phase F: PPTX to PDF

- Use `python-pptx` to duplicate/fill the template into a generated `.pptx`.
- Use LibreOffice headless (`soffice --headless --convert-to pdf`) to create the final PDF.
- Fail with a clear 500/config error if LibreOffice is missing.

Phase G: frontend integration

- Update `Frontend/.env.example` to include `VITE_REPORT_API_URL`.
- Update `Frontend/src/services/reportService.js` for `/reports/availability`, `/reports/generate`, and `/reports/download/{report_id}` if adopting the new endpoint names.
- Update `Frontend/src/pages/Rapport.jsx` only as needed for report-id flow, preview, and download.

Phase H: caching and tests

- Implement a 24-hour cache in `cache_service.py`.
- Use a deterministic hash of `country`, `mineral`, `year_from`, `year_to`, `lang`, and template version/path/mtime.
- Add tests for availability alias, cache hit/miss, no-data behavior, template placeholder validation, and safe download IDs.
- Add an integration test that generated PDFs start with `%PDF-` when LibreOffice is available; skip clearly when it is not.

## End-of-audit next-step summary

Recommended location for the report feature:

- `chatbot and repport/src/reports/`, exposed by `chatbot and repport/src/reports/api.py`.

Exact files that should be created in the next step:

- `chatbot and repport/src/reports/report_models.py`
- `chatbot and repport/src/reports/report_data_service.py`
- `chatbot and repport/src/reports/pptx_service.py`
- `chatbot and repport/src/reports/pdf_service.py`
- `chatbot and repport/src/reports/chart_service.py`
- `chatbot and repport/src/reports/cache_service.py`
- `chatbot and repport/src/reports/templates/README.md`
- `chatbot and repport/src/reports/templates/amip_report_template_en.pptx`
- `chatbot and repport/src/reports/templates/amip_report_template_fr.pptx`
- `chatbot and repport/src/reports/templates/amip_report_template_ar.pptx`
- `chatbot and repport/tests/test_report_cache_service.py`
- `chatbot and repport/tests/test_report_pptx_service.py`
- `chatbot and repport/tests/test_report_api_routes.py`

Exact files that should be modified in the next step:

- `chatbot and repport/requirements.txt`
- `chatbot and repport/requirements-prod.txt`
- `chatbot and repport/src/reports/api.py`
- `chatbot and repport/src/reports/reports/data.py`
- `Frontend/.env.example`
- `Frontend/src/services/reportService.js`
- `Frontend/src/pages/Rapport.jsx`

