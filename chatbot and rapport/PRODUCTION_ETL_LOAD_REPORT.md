# Public Production ETL Load Report

Date: 2026-06-22

## Scope

Loaded production data only into the simplified `amip_db.public` schema:

- `countries` repair/verification
- `mineral_production`
- `arab_production`
- `world_production`

Trade and bilateral tables were not modified.

## Loader

Script:

```text
pipelines/loaders/load_public_production.py
```

Run from `chatbot and repport/`:

```bash
.venv/bin/python -m pipelines.loaders.load_public_production
```

The loader reads PostgreSQL and OpenAI configuration from `.env`. It never prints or rewrites the OpenAI key.

## Source Files

```text
data/raw/fact_arab_production.xlsx
data/raw/fact_world_production.xlsx
data/raw/ref_minerals_hs.xlsx
data/staging/ref_countries.xlsx
data/processed/translations_countries_lookup.json
```

Observed source shapes:

```text
fact_arab_production.xlsx: 2896 rows x 7 columns
fact_world_production.xlsx: 255 rows x 4 columns
ref_minerals_hs.xlsx: 106 rows
ref_countries.xlsx: 21 rows
translations_countries_lookup.json: 20 entries
```

## Idempotent Indexes

The loader creates these indexes when absent:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS ux_mineral_production_ar
ON public.mineral_production(mineral_name_ar);

CREATE UNIQUE INDEX IF NOT EXISTS ux_arab_production_key
ON public.arab_production(country_id, mineral_production_id, year);

CREATE UNIQUE INDEX IF NOT EXISTS ux_world_production_key
ON public.world_production(mineral_production_id, year);
```

## Country Repair

The database retained exactly 21 country rows. Thirteen rows required at least one correction to match `data/staging/ref_countries.xlsx` exactly:

- `ARE`: corrected Arabic spelling.
- `SAU`: corrected French apostrophe representation.
- `SOM`: corrected Arabic spelling.
- `IRQ`: corrected French apostrophe representation.
- `OMN`: corrected Arabic spelling and French apostrophe representation.
- `KWT`: corrected display order to 13.
- `LBN`: corrected display order to 15.
- `LBY`: corrected display order to 16.
- `EGY`: corrected French apostrophe representation and display order to 17.
- `MAR`: corrected display order to 18.
- `MRT`: corrected Arabic spelling and display order to 19.
- `YEM`: corrected display order to 20.
- `PSE`: stripped source whitespace and corrected display order to 21.

Post-load workbook-to-database comparison:

```text
country_count=21
country_reference_mismatches=0
```

The second ETL run reported `corrections=0`.

## Mineral Translation and Dimension Load

Distinct minerals across Arab and world production sources:

```text
111
```

World-only minerals:

```text
0
```

All 111 minerals already had an English name in the Arab production workbook.

French translation result:

```text
OpenAI-translated: 111
French placeholders: 0
Translation batch failures: 0
```

Translations are cached locally in:

```text
data/processed/translations_minerals_public.json
```

Mineral dimension result:

```text
source distinct minerals: 111
rows upserted: 111
final mineral_production count: 111
rows with HS codes: 106
```

`source_system` is set to:

```text
ETL:fact_arab_production+fact_world_production
```

## Arab Production Load

```text
source rows: 2896
header-leak rows skipped: 1
duplicate natural keys collapsed: 14
rows upserted: 2881
final arab_production count: 2881
unresolved countries: 0
unresolved minerals: 0
invalid values: 0
invalid years: 0
```

Loaded years:

```text
2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017,
2018, 2019, 2020, 2021, 2022, 2023, 2024
```

The one skipped row was the required header leak where `unit_ar == 'وحدة الإنتاج'`.

## World Production Load

```text
source rows: 255
rows upserted: 255
final world_production count: 255
duplicate natural keys collapsed: 0
unresolved minerals: 0
invalid values: 0
invalid years: 0
```

Loaded years:

```text
2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024
```

## Unit Normalization

All encountered units matched the specified normalization table.

```text
unmapped units: []
arab base-value mismatches: 0
world base-value mismatches: 0
```

Supported output labels include the requested Unicode cubic-metre notation:

```text
m³
thousand m³ / millier de m³
million m³ / million de m³
```

## Final Counts

```text
countries: 21
mineral_production: 111
arab_production: 2881
world_production: 255
```

Natural-key duplicate audit:

```text
arab duplicate keys: 0
world duplicate keys: 0
```

Mineral name null audit:

```text
null Arabic/English/French mineral names: 0
```

## Sample Joined Rows

```text
country                       mineral  year  production_value  production_value_base  unit_ar  unit_en  unit_fr
Hashemite Kingdom of Jordan  Basalt   2010  1090.0000        1090.0000              طن       tonne   tonne
Hashemite Kingdom of Jordan  Basalt   2011  1090.0000        1090.0000              طن       tonne   tonne
Hashemite Kingdom of Jordan  Basalt   2012  1090.0000        1090.0000              طن       tonne   tonne
```

## Idempotency Verification

The loader was run twice. The second run produced:

```text
country corrections: 0
mineral_production final count: 111
arab_production final count: 2881
world_production final count: 255
unmapped units: []
```

No table counts increased on the second run.

## Tests

Added:

```text
tests/pipelines/test_public_production_loader.py
```

Verification result:

```text
36 passed in 1.74s
```

## Downstream Report Smoke Test

The production load makes the report API operational for production-backed selections.

Test selection:

```json
{
  "country": "Kingdom of Morocco",
  "mineral": "Phosphate rock",
  "year_from": 2019,
  "year_to": 2023,
  "lang": "en"
}
```

Result:

```text
/options status: 200
/options countries: 21
/options minerals: 111
/report status: 200
content-type: application/pdf
PDF bytes: 11035
valid PDF signature: true
```

