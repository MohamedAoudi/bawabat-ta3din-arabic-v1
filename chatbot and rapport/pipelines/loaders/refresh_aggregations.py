"""
Loader 06 — Refresh aggregation tables.
Truncates and recomputes both agg tables from fact tables.
Run after all fact loaders complete.
"""
from etl.db import get_cursor


AGG_PRODUCTION_SQL = """
    INSERT INTO agg_production_by_country_year
        (country_id, year, mineral_id, total_production_norm, unit)
    SELECT
        country_id,
        year,
        mineral_id,
        SUM(production_value_norm) AS total_production_norm,
        'tonnes' AS unit
    FROM fact_arab_production
    WHERE production_value_norm IS NOT NULL
    GROUP BY country_id, year, mineral_id
    ON CONFLICT (country_id, mineral_id, year) DO UPDATE SET
        total_production_norm = EXCLUDED.total_production_norm
"""

AGG_TRADE_SQL = """
    INSERT INTO agg_trade_by_country_year
        (country_id, year, flow, total_value_usd,
         total_import_usd_thousand, total_export_usd)
    SELECT
        a.country_id,
        a.year,
        a.flow,
        SUM(a.value_usd)                                           AS total_value_usd,
        CASE WHEN a.flow = 2 THEN (
            SELECT SUM(b.import_value_usd_thousand)
            FROM   fact_trade_bilateral_import b
            WHERE  b.country_id = a.country_id AND b.year = a.year
        ) END                                                      AS total_import_usd_thousand,
        CASE WHEN a.flow = 1 THEN (
            SELECT SUM(b.export_value_usd)
            FROM   fact_trade_bilateral_export b
            WHERE  b.country_id = a.country_id AND b.year = a.year
              AND  b.export_value_computed = TRUE
        ) END                                                      AS total_export_usd
    FROM fact_trade_aggregate a
    GROUP BY a.country_id, a.year, a.flow
    ON CONFLICT (country_id, year, flow) DO UPDATE SET
        total_value_usd           = EXCLUDED.total_value_usd,
        total_import_usd_thousand = EXCLUDED.total_import_usd_thousand,
        total_export_usd          = EXCLUDED.total_export_usd
"""


def refresh():
    with get_cursor() as cur:
        print("  Refreshing agg_production_by_country_year...")
        cur.execute("TRUNCATE agg_production_by_country_year")
        cur.execute(AGG_PRODUCTION_SQL)
        cur.execute("SELECT COUNT(*) FROM agg_production_by_country_year")
        print(f"  → {cur.fetchone()[0]} rows")

        print("  Refreshing agg_trade_by_country_year...")
        cur.execute("TRUNCATE agg_trade_by_country_year")
        cur.execute(AGG_TRADE_SQL)
        cur.execute("SELECT COUNT(*) FROM agg_trade_by_country_year")
        print(f"  → {cur.fetchone()[0]} rows")


if __name__ == "__main__":
    print("Refreshing aggregation tables...")
    refresh()
    print("Done.")
