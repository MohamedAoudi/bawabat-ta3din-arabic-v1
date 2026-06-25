# Public Trade ETL Load Report

Date: 2026-06-22

## Scope

Loaded aggregate world trade only into:

- `public.trade_partners`
- `public.mineral_trade`
- `public.trade_world`

The loader did not modify bilateral data, the `bi` schema, or any production table.

## Loader

Script:

```text
pipelines/loaders/load_public_trade.py
```

Run from `chatbot and repport/`:

```bash
.venv/bin/python -m pipelines.loaders.load_public_trade
```

The loader reads PostgreSQL and OpenAI configuration from `.env`. It never prints or rewrites the OpenAI key.

## Source Files

```text
data/raw/fact_trade_export.xlsx
data/raw/fact_trade_import.xlsx
```

Observed shapes:

```text
fact_trade_export.xlsx: 8163 rows x 8 columns, read with header=1
fact_trade_import.xlsx: 18390 rows x 8 columns, read with header=0
```

Both workbooks contain one non-data total/spacer row with no reporter, mineral, or year. These two rows were skipped.

## Schema Alignment

The source requires comma-joining every distinct HS code per mineral group. Two values exceed the original `VARCHAR(100)` field:

```text
Aluminium: 153 characters
Nickel: 146 characters
```

To avoid truncating required HS codes, `public.mineral_trade.hs_codes` was widened to `TEXT`. The canonical backend schema and migration were updated to match.

## Idempotent Indexes

```sql
CREATE UNIQUE INDEX IF NOT EXISTS ux_trade_partners_en
ON public.trade_partners(name_en);

CREATE UNIQUE INDEX IF NOT EXISTS ux_mineral_trade_en
ON public.mineral_trade(mineral_name_en);

CREATE UNIQUE INDEX IF NOT EXISTS ux_trade_world_key
ON public.trade_world(
    reporter_country_id, partner_id, mineral_trade_id, year, type_trade
);
```

## Partner Load

One partner was upserted:

```text
name_en: World
name_fr: Monde
name_ar: العالم
partner_category_en: World
partner_category_fr: Monde
partner_category_ar: العالم
```

Final count:

```text
trade_partners: 1
```

## Mineral Trade Dimension

```text
distinct aggregate_product values: 25
rows upserted: 25
final mineral_trade count: 25
maximum joined HS length: 153
source_system: ETL:fact_trade_export+fact_trade_import
```

Translation result:

```text
OpenAI-translated groups: 25
Arabic placeholders: 0
French placeholders: 0
translation batch failures: 0
```

Translations are cached locally in:

```text
data/processed/translations_mineral_trade_public.json
```

## Trade Fact Load

```text
source rows: 26553
valid HS-level rows: 26551
non-data rows skipped: 2
source rows collapsed by aggregation: 20501
natural-key rows upserted: 6050
final trade_world count: 6050
```

Rows by flow:

```text
export: 2260
import: 3790
```

Every row uses the World partner and stores:

```text
type_trade: export or import
value_share: NULL
```

Skipped counts:

```text
null_spacer_or_total: 2
reporter_not_in_map: 0
country_not_found: 0
unresolved_mineral: 0
invalid_year: 0
invalid_value: 0
invalid_flow: 0
```

## Loaded Years

```text
2010, 2011, 2012, 2013, 2014, 2015, 2016,
2017, 2018, 2019, 2020, 2021, 2022, 2023
```

## Loaded Reporters

```text
Algeria
Bahrain, Kingdom of
Egypt
Iraq
Jordan
Kuwait, the State of
Lebanese Republic
Libya
Mauritania
Morocco
Oman
Palestine
Qatar
Saudi Arabia, Kingdom of
Sudan
Syrian Arab Republic
Tunisia
United Arab Emirates
Yemen
```

All 19 source reporter names resolved through the required literal `REPORTER_MAP`.

## Final Counts

```text
trade_partners: 1
mineral_trade: 25
trade_world: 6050
```

Integrity audit:

```text
null partner names: 0
null mineral names: 0
duplicate trade natural keys: 0
nonnull value_share rows: 0
```

## Flow Totals

Source totals before target-scale rounding:

```text
export: 495908830588.95
import: 654876431084.00
```

Database totals after each aggregated key is stored as `NUMERIC(20,2)`:

```text
export: 495908830589.08
import: 654876431084.06
```

The differences of `$0.13` and `$0.06` are the expected cumulative effect of per-key two-decimal rounding.

## Sample Joined Rows

```text
reporter                      partner  mineral    year  type    value_usd     value_share
Hashemite Kingdom of Jordan  World    Aluminium  2010  export   51090496.00  NULL
Hashemite Kingdom of Jordan  World    Aluminium  2010  import  148084931.86  NULL
Hashemite Kingdom of Jordan  World    Aluminium  2011  export   51304759.00  NULL
```

## Production Isolation

Production counts before and after the trade load remained:

```text
mineral_production: 111
arab_production: 2881
world_production: 255
```

The loader asserts these counts do not change during its transaction.

## Idempotency Verification

The loader was run twice. The second run preserved:

```text
trade_partners: 1
mineral_trade: 25
trade_world: 6050
```

No count increased on rerun.

## Tests

Added:

```text
tests/pipelines/test_public_trade_loader.py
```

Verification result:

```text
38 passed in 6.48s
```

## Downstream Report Smoke Test

After the trade load:

```text
/options status: 200
/options countries: 21
/options combined minerals: 133
```

Test request:

```json
{
  "country": "Kingdom of Morocco",
  "mineral": "Gold",
  "year_from": 2019,
  "year_to": 2023,
  "lang": "en"
}
```

Result:

```text
/report status: 200
content-type: application/pdf
PDF bytes: 11703
valid PDF signature: true
```

