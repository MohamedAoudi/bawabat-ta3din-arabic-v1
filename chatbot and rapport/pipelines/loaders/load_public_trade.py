"""Load aggregate world trade into the simplified public AMIP schema.

Run from ``chatbot and repport/``:

    .venv/bin/python -m pipelines.loaders.load_public_trade
"""

from __future__ import annotations

import json
import os
from collections import Counter, defaultdict
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

import pandas as pd
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"
EXPORT_PATH = BASE_DIR / "data" / "raw" / "fact_trade_export.xlsx"
IMPORT_PATH = BASE_DIR / "data" / "raw" / "fact_trade_import.xlsx"
TRANSLATION_CACHE_PATH = (
    BASE_DIR / "data" / "processed" / "translations_mineral_trade_public.json"
)
SOURCE_SYSTEM = "ETL:fact_trade_export+fact_trade_import"

REPORTER_MAP = {
    "Algeria": "People's Democratic Republic of Algeria",
    "Bahrain, Kingdom of": "Kingdom of Bahrain",
    "Egypt": "Arab Republic of Egypt",
    "Iraq": "Republic of Iraq",
    "Jordan": "Hashemite Kingdom of Jordan",
    "Kuwait, the State of": "State of Kuwait",
    "Lebanese Republic": "Lebanese Republic",
    "Libya": "State of Libya",
    "Mauritania": "Islamic Republic of Mauritania",
    "Morocco": "Kingdom of Morocco",
    "Oman": "Sultanate of Oman",
    "Palestine": "State of Palestine",
    "Qatar": "State of Qatar",
    "Saudi Arabia, Kingdom of": "Kingdom of Saudi Arabia",
    "Sudan": "Republic of the Sudan",
    "Syrian Arab Republic": "Syrian Arab Republic",
    "Tunisia": "Republic of Tunisia",
    "United Arab Emirates": "United Arab Emirates",
    "Yemen": "Republic of Yemen",
}


def _clean_text(value: Any) -> str:
    if value is None or pd.isna(value):
        return ""
    return str(value).strip()


def _decimal(value: Any) -> Decimal | None:
    if value is None or pd.isna(value):
        return None
    try:
        return Decimal(str(value).strip().replace(",", ""))
    except (InvalidOperation, ValueError, AttributeError):
        return None


def _integer(value: Any) -> int | None:
    number = _decimal(value)
    if number is None or number != number.to_integral_value():
        return None
    return int(number)


def _hs_code(value: Any) -> str | None:
    number = _integer(value)
    if number is not None:
        return str(number)
    cleaned = _clean_text(value)
    return cleaned or None


def _require_files() -> None:
    missing = [path for path in (EXPORT_PATH, IMPORT_PATH) if not path.exists()]
    if missing:
        joined = "\n".join(f"- {path.relative_to(BASE_DIR)}" for path in missing)
        raise FileNotFoundError(f"Missing required trade source files:\n{joined}")


def _connect():
    load_dotenv(ENV_PATH, override=False)
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("DB_NAME", "amip_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
        options="-c search_path=public",
    )


def _read_trade_file(path: Path, header: int, type_trade: str) -> pd.DataFrame:
    frame = pd.read_excel(path, header=header)
    frame.columns = [_clean_text(column) for column in frame.columns]
    value_column = "Value (US$)" if type_trade == "export" else "value"
    required = {
        "reporter",
        "partner",
        "flow",
        "aggregate_product",
        "hs_code",
        "hs_description",
        "year",
        value_column,
    }
    missing = sorted(required - set(frame.columns))
    if missing:
        raise ValueError(f"{path.name} is missing required columns: {missing}")

    frame = frame.rename(columns={value_column: "value_usd"})
    frame["type_trade"] = type_trade
    for column in (
        "reporter",
        "partner",
        "flow",
        "aggregate_product",
        "hs_description",
    ):
        frame[column] = frame[column].map(_clean_text)
    return frame


def _read_sources() -> tuple[pd.DataFrame, pd.DataFrame]:
    export = _read_trade_file(EXPORT_PATH, header=1, type_trade="export")
    imports = _read_trade_file(IMPORT_PATH, header=0, type_trade="import")
    return export, imports


def _translation_cache() -> dict[str, dict[str, str]]:
    if not TRANSLATION_CACHE_PATH.exists():
        return {}
    try:
        payload = json.loads(TRANSLATION_CACHE_PATH.read_text(encoding="utf-8"))
        return {
            item["en"]: item
            for item in payload.get("translations", [])
            if item.get("en") and item.get("ar") and item.get("fr")
        }
    except (json.JSONDecodeError, OSError, TypeError):
        return {}


def _translate_batch(names: list[str]) -> dict[str, dict[str, str]]:
    if not names:
        return {}

    from openai import OpenAI

    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    client = OpenAI(
        api_key=api_key,
        timeout=float(os.getenv("OPENAI_TIMEOUT_SECONDS", "90")),
        max_retries=int(os.getenv("OPENAI_MAX_RETRIES", "2")),
    )
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o"),
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": (
                    "Translate broad mining and mineral trade group names. Return one JSON "
                    "object with a 'translations' array. Every item must contain exactly "
                    "'en', 'ar', and 'fr'. Preserve each supplied English value byte-for-byte. "
                    "Use concise standard Arabic and French mineral terminology. Return every "
                    "input value once."
                ),
            },
            {
                "role": "user",
                "content": json.dumps({"mineral_groups": names}, ensure_ascii=False),
            },
        ],
    )
    payload = json.loads(response.choices[0].message.content or "{}")
    return {
        _clean_text(item.get("en")): {
            "en": _clean_text(item.get("en")),
            "ar": _clean_text(item.get("ar")),
            "fr": _clean_text(item.get("fr")),
            "source": "openai",
        }
        for item in payload.get("translations", [])
        if _clean_text(item.get("en"))
    }


def _resolve_translations(names: list[str]) -> tuple[dict, dict[str, int]]:
    cache = _translation_cache()
    resolved = {name: cache[name] for name in names if name in cache}
    missing = [name for name in names if name not in resolved]
    batch_failed = False

    if missing:
        try:
            resolved.update(_translate_batch(missing))
        except Exception as exc:
            batch_failed = True
            print(f"translation batch failed; using placeholders: {type(exc).__name__}: {exc}")

    ar_placeholders = 0
    fr_placeholders = 0
    for name in names:
        item = resolved.get(name, {})
        arabic = _clean_text(item.get("ar"))
        french = _clean_text(item.get("fr"))
        source = item.get("source", "openai")
        if not arabic:
            arabic = name
            ar_placeholders += 1
            source = "placeholder"
        if not french:
            french = name
            fr_placeholders += 1
            source = "placeholder"
        resolved[name] = {
            "en": name,
            "ar": arabic,
            "fr": french,
            "source": source,
        }

    TRANSLATION_CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    TRANSLATION_CACHE_PATH.write_text(
        json.dumps(
            {"translations": [resolved[name] for name in names]},
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    return resolved, {
        "openai_translated": sum(
            item.get("source") == "openai" for item in resolved.values()
        ),
        "arabic_placeholders": ar_placeholders,
        "french_placeholders": fr_placeholders,
        "batch_failed": int(batch_failed),
    }


def _valid_source_records(frame: pd.DataFrame) -> list[dict[str, Any]]:
    return frame.to_dict(orient="records")


def _mineral_names(export: pd.DataFrame, imports: pd.DataFrame) -> list[str]:
    return sorted(
        {
            _clean_text(value)
            for value in pd.concat(
                [export["aggregate_product"], imports["aggregate_product"]],
                ignore_index=True,
            )
            if _clean_text(value)
        },
        key=str.casefold,
    )


def _hs_codes_by_mineral(export: pd.DataFrame, imports: pd.DataFrame) -> dict[str, str]:
    grouped: dict[str, set[str]] = defaultdict(set)
    for frame in (export, imports):
        for row in _valid_source_records(frame):
            mineral = _clean_text(row.get("aggregate_product"))
            code = _hs_code(row.get("hs_code"))
            if mineral and code:
                grouped[mineral].add(code)
    return {
        mineral: ",".join(sorted(codes, key=lambda code: int(code)))
        for mineral, codes in grouped.items()
    }


def _ensure_schema_and_indexes(cur) -> None:
    # Two source groups exceed VARCHAR(100); TEXT preserves every distinct HS code.
    cur.execute(
        "ALTER TABLE public.mineral_trade ALTER COLUMN hs_codes TYPE TEXT"
    )
    cur.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS ux_trade_partners_en
        ON public.trade_partners(name_en)
        """
    )
    cur.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS ux_mineral_trade_en
        ON public.mineral_trade(mineral_name_en)
        """
    )
    cur.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS ux_trade_world_key
        ON public.trade_world(
            reporter_country_id, partner_id, mineral_trade_id, year, type_trade
        )
        """
    )


def _upsert_world_partner(cur) -> int:
    cur.execute(
        """
        INSERT INTO public.trade_partners (
            name_ar, name_en, name_fr,
            partner_category_ar, partner_category_en, partner_category_fr
        ) VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (name_en) DO UPDATE SET
            name_ar = EXCLUDED.name_ar,
            name_fr = EXCLUDED.name_fr,
            partner_category_ar = EXCLUDED.partner_category_ar,
            partner_category_en = EXCLUDED.partner_category_en,
            partner_category_fr = EXCLUDED.partner_category_fr,
            updated_at = NOW()
        RETURNING id
        """,
        ("العالم", "World", "Monde", "العالم", "World", "Monde"),
    )
    return cur.fetchone()["id"]


def _upsert_minerals(
    cur,
    names: list[str],
    translations: dict[str, dict[str, str]],
    hs_codes: dict[str, str],
) -> dict[str, int]:
    ids = {}
    for name in names:
        translated = translations[name]
        cur.execute(
            """
            INSERT INTO public.mineral_trade (
                hs_codes, mineral_name_ar, mineral_name_en,
                mineral_name_fr, source_system
            ) VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (mineral_name_en) DO UPDATE SET
                hs_codes = EXCLUDED.hs_codes,
                mineral_name_ar = EXCLUDED.mineral_name_ar,
                mineral_name_fr = EXCLUDED.mineral_name_fr,
                source_system = EXCLUDED.source_system,
                updated_at = NOW()
            RETURNING id
            """,
            (
                hs_codes.get(name),
                translated["ar"],
                name,
                translated["fr"],
                SOURCE_SYSTEM,
            ),
        )
        ids[name] = cur.fetchone()["id"]
    return ids


def _country_ids(cur) -> dict[str, int]:
    cur.execute("SELECT id, name_en FROM public.countries")
    return {_clean_text(row["name_en"]): row["id"] for row in cur.fetchall()}


def _prepare_fact_rows(
    frames: list[pd.DataFrame],
    country_ids: dict[str, int],
    mineral_ids: dict[str, int],
    world_partner_id: int,
) -> tuple[list[tuple], Counter, dict[str, int], list[int], list[str], int]:
    skipped = Counter()
    source_by_flow = Counter()
    aggregate: dict[tuple[int, int, int, int, str], Decimal] = defaultdict(
        lambda: Decimal("0")
    )
    reporters_loaded: set[str] = set()
    years_loaded: set[int] = set()
    valid_rows = 0

    for frame in frames:
        for row in _valid_source_records(frame):
            reporter = _clean_text(row.get("reporter"))
            mineral = _clean_text(row.get("aggregate_product"))
            flow = _clean_text(row.get("flow")).lower()
            type_trade = _clean_text(row.get("type_trade")).lower()

            if not reporter and not mineral and not _clean_text(row.get("year")):
                skipped["null_spacer_or_total"] += 1
                continue

            expected_country = REPORTER_MAP.get(reporter)
            if expected_country is None:
                skipped["reporter_not_in_map"] += 1
                continue
            country_id = country_ids.get(expected_country)
            if country_id is None:
                skipped["country_not_found"] += 1
                continue

            mineral_id = mineral_ids.get(mineral)
            if mineral_id is None:
                skipped["unresolved_mineral"] += 1
                continue

            year = _integer(row.get("year"))
            if year is None:
                skipped["invalid_year"] += 1
                continue
            value = _decimal(row.get("value_usd"))
            if value is None:
                skipped["invalid_value"] += 1
                continue
            if flow not in {"export", "import"} or flow != type_trade:
                skipped["invalid_flow"] += 1
                continue

            key = (country_id, world_partner_id, mineral_id, year, type_trade)
            aggregate[key] += value
            valid_rows += 1
            source_by_flow[type_trade] += 1
            reporters_loaded.add(reporter)
            years_loaded.add(year)

    rows = [(*key, value, None) for key, value in aggregate.items()]
    keys_by_flow = Counter(row[4] for row in rows)
    return (
        rows,
        skipped,
        dict(sorted(keys_by_flow.items())),
        sorted(years_loaded),
        sorted(reporters_loaded),
        valid_rows,
    )


def _upsert_trade_world(cur, rows: list[tuple]) -> None:
    psycopg2.extras.execute_values(
        cur,
        """
        INSERT INTO public.trade_world (
            reporter_country_id, partner_id, mineral_trade_id, year,
            type_trade, value_usd, value_share
        ) VALUES %s
        ON CONFLICT (
            reporter_country_id, partner_id, mineral_trade_id, year, type_trade
        ) DO UPDATE SET
            value_usd = EXCLUDED.value_usd,
            value_share = EXCLUDED.value_share,
            updated_at = NOW()
        """,
        rows,
        page_size=500,
    )


def _protected_production_counts(cur) -> dict[str, int]:
    counts = {}
    for table in ("mineral_production", "arab_production", "world_production"):
        cur.execute(f"SELECT COUNT(*) AS count FROM public.{table}")
        counts[table] = cur.fetchone()["count"]
    return counts


def load() -> dict[str, Any]:
    _require_files()
    load_dotenv(ENV_PATH, override=False)
    export, imports = _read_sources()
    names = _mineral_names(export, imports)
    hs_codes = _hs_codes_by_mineral(export, imports)
    translations, translation_stats = _resolve_translations(names)

    conn = _connect()
    conn.autocommit = False
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            production_before = _protected_production_counts(cur)
            _ensure_schema_and_indexes(cur)
            world_partner_id = _upsert_world_partner(cur)
            mineral_ids = _upsert_minerals(cur, names, translations, hs_codes)
            country_ids = _country_ids(cur)
            (
                fact_rows,
                skipped,
                keys_by_flow,
                years,
                reporters,
                valid_rows,
            ) = _prepare_fact_rows(
                [export, imports], country_ids, mineral_ids, world_partner_id
            )
            _upsert_trade_world(cur, fact_rows)

            production_after = _protected_production_counts(cur)
            if production_after != production_before:
                raise RuntimeError(
                    "Protected production table counts changed during trade load"
                )

            cur.execute("SELECT COUNT(*) AS count FROM public.trade_partners")
            partner_count = cur.fetchone()["count"]
            cur.execute("SELECT COUNT(*) AS count FROM public.mineral_trade")
            mineral_count = cur.fetchone()["count"]
            cur.execute("SELECT COUNT(*) AS count FROM public.trade_world")
            fact_count = cur.fetchone()["count"]

        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    report = {
        "trade_partners": {"upserted": 1, "final_count": partner_count},
        "mineral_trade": {
            "source_distinct": len(names),
            "upserted": len(mineral_ids),
            "final_count": mineral_count,
        },
        "translations": translation_stats,
        "trade_world": {
            "source_rows": len(export) + len(imports),
            "valid_source_rows": valid_rows,
            "source_rows_collapsed_by_aggregation": valid_rows - len(fact_rows),
            "upserted": len(fact_rows),
            "upserted_by_flow": keys_by_flow,
            "final_count": fact_count,
            "skipped": dict(sorted(skipped.items())),
            "years": years,
            "reporters": reporters,
        },
        "hs_codes": {
            "max_joined_length": max(map(len, hs_codes.values())),
            "column_type": "text",
        },
        "protected_production_counts": production_after,
    }
    print("LOAD_REPORT_JSON")
    print(json.dumps(report, ensure_ascii=False, indent=2, default=str))
    return report


if __name__ == "__main__":
    load()
