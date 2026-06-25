"""Load bilateral (country-to-country) mineral trade into the public schema.

Run from ``chatbot and repport/``:

    .venv/bin/python -m pipelines.loaders.load_public_bilateral

Source grain note
-----------------
The cleaned bilateral CSVs are aggregated across ALL minerals (there is no
per-commodity split), so every loaded row references a single sentinel
``mineral_trade`` row named "All Minerals". That sentinel is deliberately
excluded from the report API ``/options`` list so it never appears in the
frontend mineral dropdown.

Alignment guarantees (so this is safe to re-run on a server):
  * Connection + paths come from ``.env`` / ``BASE_DIR`` — nothing hardcoded.
  * Only ``partner_type == 'country'`` rows load (no World totals / region
    aggregates) to avoid double counting and misleading "top partner".
  * Values are converted from thousand-USD to full USD to match ``trade_world``.
  * Idempotent: a unique natural key + ON CONFLICT upsert.
  * Production and aggregate-trade row counts are asserted unchanged.
"""

from __future__ import annotations

import os
from decimal import Decimal, InvalidOperation
from pathlib import Path

import pandas as pd
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"
BILATERAL_DIR = BASE_DIR / "data" / "processed" / "bilateral"

SENTINEL_MINERAL_EN = "All Minerals"
SENTINEL_MINERAL_FR = "Tous les minéraux"
SENTINEL_MINERAL_AR = "كل المعادن"
SOURCE_SYSTEM = "ETL:bilateral"

# Bilateral CSV reporter labels (World Bank style) -> canonical public.countries.name_en
REPORTER_MAP = {
    "Algeria": "People's Democratic Republic of Algeria",
    "Bahrain": "Kingdom of Bahrain",
    "Djibouti": "Republic of Djibouti",
    "Egypt, Arab Rep.": "Arab Republic of Egypt",
    "Fm Sudan": "Republic of the Sudan",
    "Kuwait": "State of Kuwait",
    "Lebanon": "Lebanese Republic",
    "Libya": "State of Libya",
    "Mauritania": "Islamic Republic of Mauritania",
    "Morocco": "Kingdom of Morocco",
    "Oman": "Sultanate of Oman",
}

THOUSAND = Decimal("1000")


def _database_connection():
    load_dotenv(ENV_PATH, override=False)
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("DB_NAME", "amip_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
        options="-c search_path=public",
    )


def _read_bilateral_rows() -> tuple[list[dict], dict[str, int]]:
    """Return (rows, skip_counts). Each row dict is normalized but unresolved."""
    rows: list[dict] = []
    skips = {"not_country_type": 0, "blank_value": 0, "bad_year": 0}

    for csv_path in sorted(BILATERAL_DIR.glob("*/*.csv")):
        flow = "export" if csv_path.stem.startswith("export") else "import"
        value_col = f"{flow}_value_usd_thousand"
        df = pd.read_csv(csv_path)
        if value_col not in df.columns:
            continue
        for _, r in df.iterrows():
            ptype = str(r.get("partner_type", "")).strip().lower()
            if ptype != "country":  # drop World totals + region aggregates
                skips["not_country_type"] += 1
                continue
            reporter = str(r.get("reporter", "")).strip()
            partner = str(r.get("partner", "")).strip()
            try:
                year = int(r.get("year"))
            except (ValueError, TypeError):
                skips["bad_year"] += 1
                continue
            raw_val = r.get(value_col)
            if pd.isna(raw_val):
                skips["blank_value"] += 1
                continue
            try:
                value_usd = (Decimal(str(raw_val)) * THOUSAND).quantize(Decimal("0.01"))
            except (InvalidOperation, ValueError):
                skips["blank_value"] += 1
                continue
            rows.append(
                {
                    "reporter": reporter,
                    "partner": partner,
                    "year": year,
                    "flow": flow,
                    "value_usd": value_usd,
                }
            )
    return rows, skips


def load() -> dict:
    load_dotenv(ENV_PATH, override=False)
    if not BILATERAL_DIR.exists():
        raise FileNotFoundError(f"Missing bilateral data directory: {BILATERAL_DIR}")

    rows, skips = _read_bilateral_rows()
    distinct_partners = sorted({r["partner"] for r in rows})

    conn = _database_connection()
    conn.autocommit = False
    report: dict = {"skips": skips}
    try:
        with conn.cursor() as cur:
            # ── isolation snapshot ──────────────────────────────────────────
            cur.execute("SELECT count(*) FROM public.arab_production")
            prod_before = cur.fetchone()[0]
            cur.execute("SELECT count(*) FROM public.trade_world")
            tradeworld_before = cur.fetchone()[0]

            # ── sentinel mineral + natural-key index ────────────────────────
            cur.execute(
                "CREATE UNIQUE INDEX IF NOT EXISTS ux_mineral_trade_en "
                "ON public.mineral_trade(mineral_name_en)"
            )
            cur.execute(
                """
                INSERT INTO public.mineral_trade
                    (hs_codes, mineral_name_ar, mineral_name_en, mineral_name_fr, source_system)
                VALUES (NULL, %s, %s, %s, %s)
                ON CONFLICT (mineral_name_en) DO UPDATE
                    SET mineral_name_en = EXCLUDED.mineral_name_en
                RETURNING id
                """,
                (SENTINEL_MINERAL_AR, SENTINEL_MINERAL_EN, SENTINEL_MINERAL_FR, SOURCE_SYSTEM),
            )
            sentinel_id = cur.fetchone()[0]

            cur.execute(
                "CREATE UNIQUE INDEX IF NOT EXISTS ux_trade_partners_en "
                "ON public.trade_partners(name_en)"
            )
            cur.execute(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS ux_partner_trade_key
                ON public.partner_trade
                   (reporter_country_id, partner_id, mineral_trade_id, year, type_trade)
                """
            )

            # ── upsert partner dimension (name_ar/fr placeholder = name_en) ──
            psycopg2.extras.execute_values(
                cur,
                """
                INSERT INTO public.trade_partners
                    (name_ar, name_en, name_fr,
                     partner_category_ar, partner_category_en, partner_category_fr)
                VALUES %s
                ON CONFLICT (name_en) DO NOTHING
                """,
                [(p, p, p, "Country", "Country", "Country") for p in distinct_partners],
            )

            # ── lookups ─────────────────────────────────────────────────────
            cur.execute("SELECT name_en, id FROM public.countries")
            country_by_name = {n: i for n, i in cur.fetchall()}
            cur.execute("SELECT name_en, id FROM public.trade_partners")
            partner_by_name = {n: i for n, i in cur.fetchall()}

            # ── resolve + build fact rows ───────────────────────────────────
            fact_rows = []
            unresolved = {"reporter": 0, "partner": 0}
            for r in rows:
                country_id = country_by_name.get(REPORTER_MAP.get(r["reporter"], ""))
                partner_id = partner_by_name.get(r["partner"])
                if country_id is None:
                    unresolved["reporter"] += 1
                    continue
                if partner_id is None:
                    unresolved["partner"] += 1
                    continue
                fact_rows.append(
                    (country_id, partner_id, sentinel_id, r["year"], r["value_usd"], r["flow"])
                )

            psycopg2.extras.execute_values(
                cur,
                """
                INSERT INTO public.partner_trade
                    (reporter_country_id, partner_id, mineral_trade_id,
                     year, value_usd, type_trade)
                VALUES %s
                ON CONFLICT (reporter_country_id, partner_id, mineral_trade_id, year, type_trade)
                DO UPDATE SET value_usd = EXCLUDED.value_usd, updated_at = CURRENT_TIMESTAMP
                """,
                fact_rows,
            )

            # ── isolation assertions ────────────────────────────────────────
            cur.execute("SELECT count(*) FROM public.arab_production")
            prod_after = cur.fetchone()[0]
            cur.execute("SELECT count(*) FROM public.trade_world")
            tradeworld_after = cur.fetchone()[0]
            assert prod_after == prod_before, "arab_production changed!"
            assert tradeworld_after == tradeworld_before, "trade_world changed!"

            cur.execute("SELECT count(*) FROM public.partner_trade")
            partner_trade_count = cur.fetchone()[0]
            cur.execute("SELECT count(*) FROM public.trade_partners")
            trade_partners_count = cur.fetchone()[0]

        conn.commit()
        report.update(
            {
                "source_rows": len(rows),
                "fact_rows_loaded": len(fact_rows),
                "unresolved": unresolved,
                "distinct_partners": len(distinct_partners),
                "sentinel_mineral_id": sentinel_id,
                "partner_trade_count": partner_trade_count,
                "trade_partners_count": trade_partners_count,
                "production_isolated": prod_after == prod_before,
                "trade_world_isolated": tradeworld_after == tradeworld_before,
            }
        )
        return report
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    result = load()
    print("Bilateral partner-trade load complete:")
    for k, v in result.items():
        print(f"  {k}: {v}")
