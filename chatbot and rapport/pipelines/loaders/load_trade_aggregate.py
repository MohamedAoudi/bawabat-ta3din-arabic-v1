"""
Loader 03 — Aggregate trade (export + import to World).
Source:  data/raw/trade_data__export_.xlsx
         data/raw/trade_data__inport_.xlsx
Target:  fact_trade_aggregate
Also populates dim_hs_codes and dim_minerals (English side) on the fly.
"""
import pandas as pd
from etl.db import get_cursor, upsert, fetch_lookup
from etl.utils import clean_string, clean_hs_code
from etl.config import FILES, FLOW_CODES


def ensure_mineral_en(cur, group_en: str, mineral_cache: dict) -> int:
    if group_en in mineral_cache:
        return mineral_cache[group_en]
    cur.execute("""
        INSERT INTO dim_minerals (mineral_group_en)
        VALUES (%s)
        ON CONFLICT DO NOTHING
        RETURNING mineral_id
    """, (group_en,))
    result = cur.fetchone()
    if not result:
        cur.execute("SELECT mineral_id FROM dim_minerals WHERE mineral_group_en = %s", (group_en,))
        result = cur.fetchone()
    mineral_id = result[0]
    mineral_cache[group_en] = mineral_id
    return mineral_id


def ensure_hs_code(cur, hs_code: str, mineral_id: int,
                   description: str, aggregate: str, hs_cache: set):
    if hs_code in hs_cache:
        return
    cur.execute("""
        INSERT INTO dim_hs_codes (hs_code, mineral_id, hs_description, aggregate_product)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (hs_code) DO UPDATE SET
            mineral_id = EXCLUDED.mineral_id,
            hs_description = EXCLUDED.hs_description,
            aggregate_product = EXCLUDED.aggregate_product
    """, (hs_code, mineral_id, description, aggregate))
    hs_cache.add(hs_code)


def load_file(filepath, flow_label: str):
    header_row = 1 if "export" in str(filepath).lower() else 0
    df = pd.read_excel(filepath, header=header_row)
    df.columns = df.columns.str.strip()

    # Rename value column
    val_col = [c for c in df.columns if "Value" in str(c) or "value" in str(c)]
    if val_col:
        df.rename(columns={val_col[0]: "value_usd"}, inplace=True)

    flow_code = FLOW_CODES[flow_label]

    country_lookup = fetch_lookup("dim_countries", "country_id", "country_name_en")
    year_lookup    = fetch_lookup("dim_time",       "year",       "year")
    mineral_cache  = fetch_lookup("dim_minerals",   "mineral_id", "mineral_group_en")
    hs_cache: set  = set()

    rows    = []
    skipped = 0

    with get_cursor() as cur:
        for _, row in df.iterrows():
            country_en  = clean_string(row.get("reporter"))
            hs_raw      = clean_hs_code(row.get("hs_code"))
            group_en    = clean_string(row.get("aggregate_product"))
            hs_desc     = clean_string(row.get("hs_description"))
            year        = row.get("year")
            value_usd   = row.get("value_usd")

            country_id = country_lookup.get(country_en)
            if not country_id or not hs_raw or not group_en:
                skipped += 1
                continue

            try:
                year = int(year)
            except (ValueError, TypeError):
                skipped += 1
                continue

            if year not in year_lookup:
                skipped += 1
                continue

            mineral_id = ensure_mineral_en(cur, group_en, mineral_cache)
            ensure_hs_code(cur, hs_raw, mineral_id, hs_desc, group_en, hs_cache)

            rows.append({
                "country_id": country_id,
                "mineral_id": mineral_id,
                "hs_code":    hs_raw,
                "year":       year,
                "flow":       flow_code,
                "value_usd":  float(value_usd) if pd.notna(value_usd) else None,
            })

        upsert(cur, "fact_trade_aggregate", rows,
               conflict_cols=["country_id", "hs_code", "year", "flow"])

    print(f"  fact_trade_aggregate ({flow_label}): {len(rows)} rows, {skipped} skipped")


def load():
    load_file(FILES["trade_export"], "Export")
    load_file(FILES["trade_import"], "Import")


if __name__ == "__main__":
    print("Loading aggregate trade...")
    load()
    print("Done.")
