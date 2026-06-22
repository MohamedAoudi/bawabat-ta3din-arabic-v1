# Arab Minerals Data Warehouse — Schema Summary for AI Agent

## Overview
This warehouse contains mineral production and trade data for Arab countries (2010–2024).
All tables live in the `minerals` PostgreSQL schema.
Always prefix table names with `minerals.` in queries.

## Dimension tables (lookup / reference data)

### minerals.dim_countries
Arab countries. 22 rows.
- `country_id` — integer PK
- `country_name_ar` — Arabic name (e.g. المغرب)
- `country_name_en` — English name (e.g. Morocco)
- `display_order` — sort order 1–20

### minerals.dim_minerals
Mineral types. ~80 rows.
- `mineral_id` — integer PK
- `mineral_name_ar` — Arabic name (e.g. الفوسفات)
- `mineral_name_en` — English name (e.g. Phosphate)
- `mineral_group_en` — trade group (e.g. "Phosphates")

### minerals.dim_hs_codes
HS trade classification codes. ~200 rows.
- `hs_code` — 6-digit string PK
- `mineral_id` FK → dim_minerals
- `hs_description` — full English description
- `aggregate_product` — trade group label

### minerals.dim_partners
Trade partner countries and regions. ~200 rows.
- `partner_id` — integer PK
- `partner_name` — English name
- `partner_type` — 'country', 'region', or 'world'

### minerals.dim_time
Years 2010–2024.
- `year` — integer PK
- `decade` — 2010 or 2020

## Fact tables (measurements)

### minerals.fact_arab_production
Arab country mineral production. ~15,000 rows.
- Keys: country_id FK, mineral_id FK, year FK
- `production_value` — raw value from source
- `production_value_norm` — normalised to tonnes (USE THIS for aggregations)
- `unit` — original unit (طن, ألف طن, etc.)
- `unit_multiplier` — conversion factor
- `source` — reporting agency

### minerals.fact_world_production
Global mineral production benchmarks. ~300 rows.
- Keys: mineral_id FK, year FK
- Same value columns as arab production

### minerals.fact_trade_aggregate
Export and import to/from World, by HS code. ~26,000 rows.
- Keys: country_id FK, mineral_id FK, hs_code FK, year FK
- `flow` — 1 = Export, 2 = Import
- `value_usd` — trade value in USD

### minerals.fact_trade_bilateral_import
Import flows per trade partner. ~35,000 rows.
- Keys: country_id FK, partner_id FK, year FK
- `import_value_usd_thousand` — import value in USD thousands
- `import_share_pct` — % share of country's total imports

### minerals.fact_trade_bilateral_export
Export flows per trade partner. ~44,000 rows.
- Keys: country_id FK, partner_id FK, year FK
- `export_share_pct` — minerals as % of exports to this partner
- `export_value_usd` — computed USD value
- `export_value_computed` — TRUE if USD value is reliable

## Aggregation tables (pre-computed summaries — use for KPIs)

### minerals.agg_production_by_country_year
Pre-summed production per country × year × mineral.
Use for dashboard totals — faster than querying fact_arab_production directly.

### minerals.agg_trade_by_country_year
Pre-summed trade totals per country × year × flow.
Use for total export/import KPIs.

## Important notes for query generation

1. Always use `production_value_norm` not `production_value` when summing production across minerals.
2. Filter `fact_trade_bilateral_export` with `export_value_computed = TRUE` when summing `export_value_usd`.
3. To get world production share: `SUM(arab.production_value_norm) / world.production_value_norm * 100`.
4. Partner type: use `partner_type = 'country'` to exclude regional aggregates from bilateral analysis.
5. Flow codes: 1 = Export, 2 = Import.
6. All tables are partitioned by year — always include a year filter for best performance.
