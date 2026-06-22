"""
Loader 00 — Static dimension seeding.
Populates: dim_time, dim_countries (base list).
Run once before any other loader.
"""
import pandas as pd
from etl.db import get_cursor, upsert
from etl.utils import year_to_decade
from etl.config import FILES, COUNTRY_NAME_MAP_EN

# Reverse map: AR → EN
COUNTRY_NAME_MAP_AR = {v: k for k, v in COUNTRY_NAME_MAP_EN.items()}


def load_dim_time(years: range = range(2010, 2025)):
    rows = [{"year": y, "decade": year_to_decade(y)} for y in years]
    with get_cursor() as cur:
        upsert(cur, "dim_time", rows, conflict_cols=["year"])
    print(f"  dim_time: {len(rows)} rows upserted")


def load_dim_countries():
    df = pd.read_excel(FILES["countries_ref"])
    # Assume first column = display_order or country name
    # Adjust column names to match your actual file structure
    rows = []
    for i, row in df.iterrows():
        name_ar = str(row.iloc[0]).strip()
        name_en = COUNTRY_NAME_MAP_AR.get(name_ar)
        rows.append({
            "country_name_ar": name_ar,
            "country_name_en": name_en or f"UNMAPPED_{i}",
            "display_order":   i + 1,
        })

    # Add Iraq and Palestine if not already in reference file
    existing = {r["country_name_ar"] for r in rows}
    extras = [
        {"country_name_ar": "العراق",    "country_name_en": "Iraq",      "display_order": None},
        {"country_name_ar": "فلسطين",    "country_name_en": "Palestine",  "display_order": None},
    ]
    for e in extras:
        if e["country_name_ar"] not in existing:
            rows.append(e)

    with get_cursor() as cur:
        upsert(cur, "dim_countries", rows, conflict_cols=["country_name_ar"])
    print(f"  dim_countries: {len(rows)} rows upserted")


def load_dim_partners_world():
    """Seed the 'World' partner so it's always available for FK references."""
    rows = [{"partner_name": "World", "partner_type": "world"}]
    with get_cursor() as cur:
        upsert(cur, "dim_partners", rows, conflict_cols=["partner_name"])
    print("  dim_partners: 'World' seeded")


if __name__ == "__main__":
    print("Loading static dimensions...")
    load_dim_time()
    load_dim_countries()
    load_dim_partners_world()
    print("Done.")
