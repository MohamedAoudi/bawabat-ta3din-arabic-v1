"""
Loader 01 — Arab production.
Source:  data/raw/الانتاج_العربي.xlsx
Target:  fact_arab_production
Also populates dim_minerals (Arabic side) on the fly.
"""
import pandas as pd
from etl.db import get_cursor, upsert, fetch_lookup
from etl.utils import normalize_production, clean_string
from etl.config import FILES


def ensure_mineral(cur, name_ar: str, mineral_cache: dict) -> int:
    """Get or create a mineral by Arabic name, return mineral_id."""
    if name_ar in mineral_cache:
        return mineral_cache[name_ar]
    cur.execute("""
        INSERT INTO dim_minerals (mineral_name_ar)
        VALUES (%s)
        ON CONFLICT (mineral_name_ar) DO UPDATE SET mineral_name_ar = EXCLUDED.mineral_name_ar
        RETURNING mineral_id
    """, (name_ar,))
    mineral_id = cur.fetchone()[0]
    mineral_cache[name_ar] = mineral_id
    return mineral_id


def load():
    df = pd.read_excel(FILES["arab_production"], sheet_name=0)

    # ── Load lookups ──────────────────────────────────────────────────────────
    country_lookup = fetch_lookup("dim_countries", "country_id", "country_name_ar")
    mineral_cache  = fetch_lookup("dim_minerals",  "mineral_id", "mineral_name_ar")
    year_lookup    = fetch_lookup("dim_time",       "year",       "year")

    rows = []
    skipped = 0

    with get_cursor() as cur:
        for _, row in df.iterrows():
            country_ar = clean_string(row.get("الدولة") or row.get("Country"))
            mineral_ar = clean_string(row.get("المعدن") or row.get("Mineral"))
            year       = row.get("السنة") or row.get("Year")
            value      = row.get("الكمية") or row.get("Value")
            unit       = clean_string(row.get("الوحدة") or row.get("Unit"))
            source     = clean_string(row.get("المصدر") or row.get("Source"))

            country_id = country_lookup.get(country_ar)
            if not country_id:
                skipped += 1
                continue

            mineral_id = ensure_mineral(cur, mineral_ar, mineral_cache)

            try:
                year = int(year)
            except (ValueError, TypeError):
                skipped += 1
                continue

            if year not in year_lookup:
                skipped += 1
                continue

            raw_val, multiplier, norm_val = normalize_production(value, unit)

            rows.append({
                "country_id":            country_id,
                "mineral_id":            mineral_id,
                "year":                  year,
                "production_value":      raw_val,
                "production_value_norm": norm_val,
                "unit":                  unit,
                "unit_multiplier":       multiplier,
                "source":                source,
            })

        upsert(cur, "fact_arab_production", rows,
               conflict_cols=["country_id", "mineral_id", "year"])

    print(f"  fact_arab_production: {len(rows)} rows upserted, {skipped} skipped")


if __name__ == "__main__":
    print("Loading Arab production...")
    load()
    print("Done.")
