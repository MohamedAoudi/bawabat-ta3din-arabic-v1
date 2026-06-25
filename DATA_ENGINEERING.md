# Data Engineering — AMIP Arab Mining Indicators Portal

**Project:** Arab Mineral Indicators Portal (AMIP)
**Component:** Data ingestion, transformation, and warehousing
**Database:** PostgreSQL `amip_db`, schema `public` (+ read-only `bi` schema)
**Last updated:** 2026-06-23

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Context & Architecture](#2-system-context--architecture)
3. [Source Data Inventory](#3-source-data-inventory)
4. [Target Dimensional Model](#4-target-dimensional-model)
5. [ETL Pipeline](#5-etl-pipeline)
6. [Data Quality & Transformation Catalog](#6-data-quality--transformation-catalog)
7. [Key Engineering Decisions & Rationale](#7-key-engineering-decisions--rationale)
8. [Challenges & Resolutions](#8-challenges--resolutions)
9. [Semantic Layer (`bi` schema)](#9-semantic-layer-bi-schema)
10. [Reproducibility & Operations](#10-reproducibility--operations)
11. [Validation & Final Metrics](#11-validation--final-metrics)
12. [Glossary](#12-glossary)

---

## 1. Executive Summary

The AMIP platform required its relational database to be populated with real Arab
mineral-sector statistics (production, world trade, and bilateral trade) so that
three downstream consumers could operate against a single source of truth:

- a **PDF report generator** (FastAPI service, port 8001),
- an **AI chatbot** that answers questions via text-to-SQL over the schema, and
- a planned **Power BI** analytics layer.

At the start, the database held only a canonical empty schema plus 21 seeded
countries. This work delivered a complete, idempotent ETL pipeline that ingests
heterogeneous Excel/CSV sources, normalizes and validates them, and loads them
into a clean star-shaped warehouse — followed by a read-only semantic layer for
analytics.

**Outcome (final row counts):**

| Table | Rows | Description |
|---|---:|---|
| `countries` | 21 | Country dimension (seeded) |
| `mineral_production` | 111 | Fine-grained production minerals |
| `arab_production` | 2,881 | Arab production facts (country × mineral × year) |
| `world_production` | 255 | World production benchmark (mineral × year) |
| `mineral_trade` | 26 | Broad trade commodity groups (+ 1 sentinel) |
| `trade_world` | 6,050 | Aggregate world trade (country × group × year × flow) |
| `trade_partners` | 195 | Trade partner dimension |
| `partner_trade` | 16,740 | Bilateral country-to-partner trade facts |

Coverage: **2010–2024** (production), **2010–2023** (trade). Zero foreign-key
orphans, zero NULL production values, all stages idempotent and server-portable.

---

## 2. System Context & Architecture

### 2.1 Where data engineering sits in the platform

```
            ┌─────────────────────────────────────────────────────────┐
            │                     SOURCE FILES                         │
            │   Excel (.xlsx) + CSV  —  analyst-cleaned "Version 1"    │
            └───────────────────────────┬─────────────────────────────┘
                                        │  EXTRACT
                                        ▼
            ┌─────────────────────────────────────────────────────────┐
            │              ETL LOADERS (Python, pandas)                │
            │   load_public_production · load_public_trade ·           │
            │   load_public_bilateral                                  │
            │   TRANSFORM: clean, normalize, translate, resolve keys   │
            └───────────────────────────┬─────────────────────────────┘
                                        │  LOAD (idempotent upserts)
                                        ▼
            ┌─────────────────────────────────────────────────────────┐
            │        PostgreSQL  amip_db . public  (star schema)       │
            │   dimensions + fact tables, enforced foreign keys        │
            └───────────────┬───────────────────────┬─────────────────┘
                            │                       │
                  read-only │ views                 │ direct SQL
                            ▼                       ▼
            ┌───────────────────────┐   ┌─────────────────────────────┐
            │   bi.* semantic layer │   │  Report API · Chatbot       │
            │   → Power BI (Import) │   │  (FastAPI, text-to-SQL)     │
            └───────────────────────┘   └─────────────────────────────┘
```

### 2.2 Technology stack

| Concern | Technology |
|---|---|
| Language / runtime | Python 3.14 (project `.venv`) |
| Extraction & transformation | pandas, openpyxl |
| Database driver | psycopg2 |
| Translation (AR/FR) | OpenAI API (batch, cached) |
| Configuration | python-dotenv (`.env`) |
| Database | PostgreSQL 5432 |
| Analytics | Power BI (Import mode) over `bi` views |

---

## 3. Source Data Inventory

### 3.1 Two candidate datasets

Two versions of the underlying data existed:

- **Version 1** — an analyst-cleaned data warehouse extract, split into
  `raw/`, `staging/`, and `processed/`. Filenames matched the pipeline's
  expected inputs.
- **Version 2** — the raw operational portal export
  ("بوابة المؤشرات التعدينية العربية"), organized by hand per country with
  inconsistent naming, mixed languages, and empty folders.

> **Decision — Version 1 selected.** It is the normalized, deduplicated
> derivative of Version 2 and requires the least transformation. Version 2 is
> retained as an archival fallback. The chosen files were copied into the
> project under relative paths (`chatbot and repport/data/...`) so the pipeline
> runs identically on a developer machine or a server.

### 3.2 File catalog

| File (relative to `chatbot and repport/`) | Format | Grain | Target |
|---|---|---|---|
| `data/raw/fact_arab_production.xlsx` | Excel, **headerless**, 7 cols | country × mineral × year | `arab_production`, `mineral_production` |
| `data/raw/fact_world_production.xlsx` | Excel, headed | mineral × year | `world_production` |
| `data/raw/ref_minerals_hs.xlsx` | Excel | mineral → HS code | HS enrichment |
| `data/raw/fact_trade_export.xlsx` | Excel, title row offset | country × group × year | `trade_world` (export) |
| `data/raw/fact_trade_import.xlsx` | Excel, float-typed | country × group × year | `trade_world` (import) |
| `data/staging/ref_countries.xlsx` | Excel, 5 cols incl. ISO | 21 countries | country verification |
| `data/processed/bilateral/<Country>/{export,import}_clean.csv` | CSV, long | country × partner × year (all-minerals) | `partner_trade` |
| `data/processed/translations_countries_lookup.json` | JSON | AR → EN/FR | name resolution |

### 3.3 Notable source characteristics

- **Trilingual content** — country and mineral names carry Arabic, English, and
  French variants, but coverage is uneven (e.g. French mineral names were
  largely absent and had to be generated).
- **Arabic spelling variance** — the same country appears with different
  alef/hamza forms across files, defeating naive string matching.
- **Mixed measurement units** — production values mix mass (طن, كجم, ألف طن) and
  volume (متر مكعب, …) units that cannot be summed together.
- **Inconsistent headers** — one production file has no header row; one trade
  file has an Excel title row offsetting the real header.

---

## 4. Target Dimensional Model

The `public` schema is a simplified **star schema**: surrogate-keyed dimensions
joined to fact tables by enforced foreign keys.

### 4.1 Entity overview

```
            ┌──────────────────┐
            │    countries     │  (dimension)
            │  id, iso_code,   │
            │  name_ar/en/fr   │
            └───────┬──────────┘
                    │ 1
        ┌───────────┼───────────────────────────┐
        │ *         │ *                           │ *
┌───────┴───────┐  │              ┌───────────────┴───────┐
│ arab_production│  │              │     trade_world       │
│ (fact)         │  │              │     (fact)            │
│ country_id  ───┘  │              │ reporter_country_id ──┘
│ mineral_prod_id ──┐              │ partner_id ──────────────┐
│ year, value,    │ │              │ mineral_trade_id ──────┐ │
│ value_base,unit │ │              │ year, value_usd, flow  │ │
└─────────────────┘ │              └────────────────────────┘ │
                    │ *                                    *   │
            ┌───────┴────────────┐              ┌──────────────┴───┐
            │ mineral_production │              │  trade_partners  │
            │ (dimension)        │              │  (dimension)     │
            │ id, hs_codes,      │              │  id, name_*,     │
            │ mineral_name_*     │              │  partner_category│
            └────────────────────┘              └──────────────────┘

            ┌────────────────────┐              ┌──────────────────┐
            │  world_production  │              │  partner_trade   │
            │  (fact)            │              │  (fact)          │
            │  mineral_prod_id   │              │  reporter_country│
            │  year, value, base │              │  partner_id      │
            └────────────────────┘              │  mineral_trade_id│
                                                │  year, value_usd │
            ┌────────────────────┐              └──────────────────┘
            │   mineral_trade    │ (dimension, shared by trade_world
            │   id, hs_codes,    │  and partner_trade)
            │   mineral_name_*   │
            └────────────────────┘
```

### 4.2 Grain definitions

| Fact table | Grain | Measure(s) |
|---|---|---|
| `arab_production` | country × mineral × year | `production_value`, `production_value_base` |
| `world_production` | mineral × year | `production_value`, `production_value_base` |
| `trade_world` | country × commodity-group × year × flow | `value_usd` |
| `partner_trade` | reporter-country × partner × year × flow | `value_usd` |

### 4.3 Two distinct mineral dimensions (important design point)

Production and trade operate at **different granularities** and therefore use
**separate mineral dimensions**:

- `mineral_production` — 111 fine-grained items (`Phosphate rock`, `Steel`,
  `Iron ore`, ferro-alloy variants, …).
- `mineral_trade` — 25 broad commodity groups (`Aluminium ; Bauxite`,
  `Platinum Group Metals (PGMs)`, …) as published in the trade source.

They are intentionally **not merged**; four names overlap exactly (`Gold`,
`Lead`, `Tin`, `Manganese`) and are de-duplicated only at presentation time
(e.g. the report API `/options` endpoint unions them).

---

## 5. ETL Pipeline

### 5.1 Design principles (applied to all three loaders)

| Principle | Implementation |
|---|---|
| **Configuration as data** | DB credentials and paths from `.env` + relative `BASE_DIR`; nothing hardcoded → server-portable |
| **Atomicity** | Each loader runs in a single transaction; any error triggers a full rollback |
| **Idempotency** | Unique natural-key indexes + `ON CONFLICT … DO UPDATE`; re-running yields identical counts |
| **Isolation** | Each loader snapshots row counts of tables it must not modify and asserts they are unchanged before commit |
| **Observability** | Each loader returns a structured report (rows loaded, skipped-by-reason, unresolved keys, placeholder counts) |

### 5.2 Execution order

```bash
# from chatbot and repport/
.venv/bin/python -m pipelines.loaders.load_public_production   # 1
.venv/bin/python -m pipelines.loaders.load_public_trade        # 2
.venv/bin/python -m pipelines.loaders.load_public_bilateral    # 3
```

Order matters for dimension consistency: production establishes the country and
mineral naming conventions first; trade and bilateral build on top.

### 5.3 Stage 1 — Production loader

**File:** `pipelines/loaders/load_public_production.py`

```
fact_arab_production.xlsx ──► clean (headerless, drop leak row, cast year)
fact_world_production.xlsx ─┐
ref_minerals_hs.xlsx ───────┤
                            ▼
              build mineral_production dim (EN from file,
              FR via OpenAI, HS join)            ──► mineral_production (111)
                            │
country names (AR) ──► translations_countries_lookup.json ──► country_id
                            │
              unit normalization → production_value_base
                            ▼
          arab_production (2,881)   world_production (255)
```

Highlights:
- Reads the headerless workbook by **positional columns**
  `[country_ar, mineral_ar, year, production_value, mineral_en, unit_ar, source]`.
- Filters a stray header-leak row (`unit_ar == 'وحدة الإنتاج'`).
- Resolves Arabic country names through the translation lookup → 0 unresolved.
- Generates French mineral names via a single OpenAI batch (111 translated,
  0 placeholders), cached to `data/processed/translations_minerals_public.json`.
- Computes `production_value_base` via the unit-family policy (see §6).
- Collapsed 14 duplicate natural keys; produced 0 NULL values.

### 5.4 Stage 2 — Aggregate trade loader

**File:** `pipelines/loaders/load_public_trade.py`

Highlights:
- Handles the export file's offset header (`header=1`) and a value column with a
  leading space; casts the import file's float-typed codes/years to `int`.
- Builds `mineral_trade` (25 groups) with HS codes comma-aggregated per group;
  AR/FR generated via OpenAI.
- **Schema evolution:** `mineral_trade.hs_codes` widened `VARCHAR(100)` → `TEXT`
  (aggregated HS lists reach 153 chars). Propagated to the canonical
  `Backend/schema.sql` and the migration file.
- Resolves non-standard reporter names
  (`'Bahrain, Kingdom of'` → `Kingdom of Bahrain`) via an explicit literal map.
- Loads `trade_world` = 6,050 rows from 26,553 source rows (aggregation by
  natural key); `value_share` left NULL for downstream computation.

### 5.5 Stage 3 — Bilateral loader

**File:** `pipelines/loaders/load_public_bilateral.py`

The most architecturally subtle stage: bilateral CSVs describe country-to-partner
trade **aggregated across all minerals** (no commodity column), yet
`partner_trade.mineral_trade_id` is `NOT NULL`.

```
bilateral/<Country>/{export,import}_clean.csv
        │  keep only partner_type == 'country'
        │  (drop World totals + region aggregates)
        ▼
  resolve reporter (WB label → canonical country)   ──► reporter_country_id
  upsert 194 distinct partners                       ──► trade_partners (195)
  attach sentinel 'All Minerals' mineral row         ──► mineral_trade_id
  convert thousand-USD → full USD (×1000)            ──► value_usd
        ▼
  partner_trade (16,740)
```

Highlights:
- Loads only `partner_type='country'` (drops 2,718 World-total / region rows to
  avoid double counting and a misleading "World as top partner").
- Introduces a single sentinel mineral `'All Minerals'`, **excluded from the
  report API `/options`** so it never appears in the frontend dropdown.
- Converts thousand-USD to full USD for unit parity with `trade_world`.
- 0 unresolved reporters/partners; 0 FK orphans; production & trade counts
  asserted unchanged.

---

## 6. Data Quality & Transformation Catalog

| # | Issue | Detection | Resolution |
|---|---|---|---|
| 1 | Headerless production workbook | First data row read as columns | `header=None`, positional mapping |
| 2 | Header-leak row in production | `unit_ar == 'وحدة الإنتاج'` | Filtered before load |
| 3 | Year stored as string | dtype inspection | Cast to `int` |
| 4 | Arabic alef/hamza name variants | Join mismatch vs DB | `translations_countries_lookup.json` bridge |
| 5 | Missing French mineral names | NOT NULL constraint | OpenAI batch translation + cache |
| 6 | Mixed units (mass vs volume) | Distinct `unit_ar` values | Per-family `production_value_base` |
| 7 | Excel title row in export file | Real header on row 1 | `header=1` |
| 8 | Leading space in value column | Column name `' Value (US$)'` | Strip / explicit reference |
| 9 | Float-typed HS codes & years | dtype inspection | Cast to `int` |
| 10 | Non-standard reporter names | Distinct value review | Explicit literal `REPORTER_MAP` |
| 11 | Over-long aggregated HS codes | 153-char overflow | `hs_codes` → `TEXT` (+ schema sync) |
| 12 | Bilateral has no mineral column | Schema FK is NOT NULL | Sentinel `'All Minerals'` + `/options` exclusion |
| 13 | World/region rows in bilateral | `partner_type` values | Load `'country'` only |
| 14 | Thousand-USD vs full-USD scale | Cross-source comparison | Multiply by 1,000 |

### 6.1 Unit normalization policy (detail)

`production_value_base = production_value × factor`, never aggregated across
families:

| `unit_ar` | Family | Factor | `unit_en` |
|---|---|---:|---|
| طن | mass | ×1 | tonne |
| كجم | mass | ÷1000 | kg |
| ألف طن | mass | ×1000 | thousand tonnes |
| متر مكعب | volume | ×1 | m³ |
| الف متر مكعب | volume | ×1000 | thousand m³ |
| مليون متر مكعب | volume | ×1,000,000 | million m³ |

> Aggregation on `production_value_base` is valid **only within a single unit
> family**. Analytical layers (Power BI, reports) must scope measures to one
> mineral or to mass-only minerals — the base unit does not bridge tonnes ↔ m³.

---

## 7. Key Engineering Decisions & Rationale

| Decision | Rationale |
|---|---|
| **Version 1 over Version 2** | Cleaned derivative → least transformation, matches expected pipeline inputs |
| **Copy data into project (relative paths)** | Server portability; reproducible runs independent of local machine layout |
| **Two separate mineral dimensions** | Production (111 fine) and trade (25 broad) are genuinely different grains; merging would corrupt analysis |
| **OpenAI for French names, with placeholder fallback** | 111 + 25 names are impractical to hand-curate; fallback guarantees the load never blocks |
| **Sentinel `'All Minerals'` for bilateral** | Honest representation of all-minerals grain while satisfying the NOT NULL FK |
| **Exclude sentinel from `/options`** | Prevents the sentinel leaking into the user-facing mineral dropdown |
| **Load only `partner_type='country'`** | Avoids double counting (regions overlap members) and a misleading World "partner" |
| **Idempotent upserts + isolation asserts** | Safe re-runs on a server; guarantees one stage never corrupts another |
| **`bi` views instead of materialized aggregates** | Data volume is tiny; views give zero duplication, always-fresh, no refresh burden |

---

## 8. Challenges & Resolutions

**8.1 The bilateral grain mismatch (headline challenge).**
The bilateral source is aggregated across all minerals, but the target fact
requires a mineral foreign key. A naive load would either violate the NOT NULL
constraint or — with a sentinel added carelessly — pollute the frontend mineral
dropdown via `/options`. Resolution: an explicit, named sentinel
(`'All Minerals'`) that satisfies referential integrity, paired with a one-line
exclusion in the `/options` query so the user experience is unaffected. The
bilateral data is fully queryable for analytics while the report's per-mineral
PDF section remains unchanged (no regression).

**8.2 Multilingual completeness under a NOT NULL constraint.**
French names were largely missing from source while the schema mandates them.
Rather than block the load, names are machine-translated in a single batch and
cached, with a deterministic `fr = en` fallback recorded and counted.

**8.3 Cross-source unit and naming consistency.**
Three independent sources used three different country-naming conventions and two
different monetary scales. Each was reconciled with an explicit, auditable
mapping (no fuzzy matching) and a documented scale conversion, so values across
`trade_world` and `partner_trade` are directly comparable.

**8.4 Schema evolution without breaking the app.**
Widening `hs_codes` to `TEXT` was required by the data but had to remain
consistent with the backend's canonical schema and Docker initialization. The
change was propagated to `Backend/schema.sql` and the migration file in the same
pass.

---

## 9. Semantic Layer (`bi` schema)

A read-only star-schema view layer over `public`, defined in
`chatbot and repport/bi/schema_bi_production.sql`, scoped to **production**
analytics for Power BI (Import mode) and reusable as a clean read-model for a
future real-data dashboard.

| View | Rows | Role |
|---|---:|---|
| `bi.dim_country` | 21 | Country dimension |
| `bi.dim_mineral_production` | 111 | Mineral dimension |
| `bi.dim_date` | 15 | Generated year spine 2010–2024 (for time-intelligence) |
| `bi.fact_arab_production` | 2,881 | Production fact, exposes `date_key`, `production_value_base` |
| `bi.fact_world_production` | 255 | World benchmark fact |

Properties: touches no `public` data, `CREATE OR REPLACE` (re-runnable), and
insulates the analytics layer from raw-schema changes. A star model with
single-direction relationships (dim → fact) and a marked date table supports
DAX measures such as *Total Production*, *Production YoY %*, *CAGR*, and
*Arab Share of World %*.

---

## 10. Reproducibility & Operations

### 10.1 Prerequisites

- PostgreSQL reachable per `chatbot and repport/.env`
  (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
- `OPENAI_API_KEY` in `.env` (used only for AR/FR name translation; cached after
  first run).
- Project virtualenv at `chatbot and repport/.venv`.

### 10.2 Full rebuild from empty database

```bash
cd "chatbot and repport"
.venv/bin/python -m pipelines.loaders.load_public_production
.venv/bin/python -m pipelines.loaders.load_public_trade
.venv/bin/python -m pipelines.loaders.load_public_bilateral
# semantic layer
psql "$DATABASE_URL" -f bi/schema_bi_production.sql   # or apply via the project's DB tooling
```

All loaders are idempotent — safe to re-run at any time.

### 10.3 Artifacts produced

| Artifact | Location |
|---|---|
| Production loader | `pipelines/loaders/load_public_production.py` |
| Trade loader | `pipelines/loaders/load_public_trade.py` |
| Bilateral loader | `pipelines/loaders/load_public_bilateral.py` |
| BI views (production) | `bi/schema_bi_production.sql` |
| Translation caches | `data/processed/translations_*_public.json` |
| Load reports | `PRODUCTION_ETL_LOAD_REPORT.md`, `TRADE_ETL_LOAD_REPORT.md` |

---

## 11. Validation & Final Metrics

### 11.1 Integrity checks (all passing)

- **Foreign-key orphans:** 0 across `arab_production`, `world_production`,
  `trade_world`, `partner_trade`.
- **NULL production values:** 0; **NULL base units:** 0.
- **Idempotency:** every loader re-run reproduces identical counts.
- **Isolation:** production and trade counts asserted unchanged during the
  bilateral load (in-transaction assertions).
- **End-to-end:** report API returns valid `%PDF-` documents
  (e.g. Kingdom of Morocco / Phosphate rock / 2019–2023).

### 11.2 Coverage

| Domain | Countries with data | Years | Notes |
|---|---:|---|---|
| Production | 20 / 21 | 2010–2024 | Palestine has no production rows in source |
| World trade | 19 reporters | 2010–2023 | Single `World` partner |
| Bilateral trade | 11 reporters | 2010–2017+ | 194 country partners |

### 11.3 Known limitations / future work

- **French/Arabic partner names** use `name_en` placeholders (the report surfaces
  only `name_en` for partners); machine translation is a future enhancement.
- **Bilateral coverage is partial** (11 of 21 reporters present in source).
- **Report PDF partner section** does not yet surface bilateral data because its
  query filters by a specific mineral while the data is all-minerals; wiring it
  (drop the per-mineral filter, keep the existing `mineral_has_trade` gate) is a
  scoped follow-up.

---

## 12. Glossary

| Term | Definition |
|---|---|
| **Star schema** | Dimensional model: central fact tables referencing surrogate-keyed dimension tables |
| **Grain** | The level of detail of one fact row (e.g. country × mineral × year) |
| **Surrogate key** | System-generated `BIGSERIAL` primary key, independent of business values |
| **Natural key** | Business-meaningful unique combination used for idempotent upserts |
| **Idempotent** | Re-running produces the same result without duplication |
| **Sentinel row** | An explicit placeholder dimension row (`'All Minerals'`) used to satisfy a NOT NULL foreign key for all-minerals data |
| **`production_value_base`** | Production value normalized to a base unit within its measurement family |
| **Semantic layer** | Read-only views (`bi.*`) presenting a clean, analytics-friendly model over raw tables |
| **Reporter** | The country reporting a trade flow |
| **Partner** | The counterpart country/region in a bilateral trade flow |
```
