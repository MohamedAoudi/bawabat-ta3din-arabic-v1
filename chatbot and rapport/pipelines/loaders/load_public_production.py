"""Load production workbooks into the simplified public AMIP schema.

Run from ``chatbot and repport/``:

    .venv/bin/python -m pipelines.loaders.load_public_production
"""

from __future__ import annotations

import json
import os
from collections import Counter, defaultdict
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

import pandas as pd
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"
ARAB_PRODUCTION_PATH = BASE_DIR / "data" / "raw" / "fact_arab_production.xlsx"
WORLD_PRODUCTION_PATH = BASE_DIR / "data" / "raw" / "fact_world_production.xlsx"
MINERALS_HS_PATH = BASE_DIR / "data" / "raw" / "ref_minerals_hs.xlsx"
COUNTRIES_PATH = BASE_DIR / "data" / "staging" / "ref_countries.xlsx"
COUNTRY_TRANSLATIONS_PATH = (
    BASE_DIR / "data" / "processed" / "translations_countries_lookup.json"
)
MINERAL_TRANSLATIONS_CACHE = (
    BASE_DIR / "data" / "processed" / "translations_minerals_public.json"
)

SOURCE_SYSTEM = "ETL:fact_arab_production+fact_world_production"
ARAB_COLUMNS = [
    "country_ar",
    "mineral_ar",
    "year",
    "production_value",
    "mineral_en",
    "unit_ar",
    "source",
]


@dataclass(frozen=True)
class UnitRule:
    factor: Decimal
    unit_en: str
    unit_fr: str


UNIT_RULES = {
    "طن": UnitRule(Decimal("1"), "tonne", "tonne"),
    "كجم": UnitRule(Decimal("0.001"), "kg", "kg"),
    "ألف طن": UnitRule(Decimal("1000"), "thousand tonnes", "millier de tonnes"),
    "متر مكعب": UnitRule(Decimal("1"), "m³", "m³"),
    "الف متر مكعب": UnitRule(Decimal("1000"), "thousand m³", "millier de m³"),
    "مليون متر مكعب": UnitRule(Decimal("1000000"), "million m³", "million de m³"),
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


def _year(value: Any) -> int | None:
    number = _decimal(value)
    if number is None or number != number.to_integral_value():
        return None
    return int(number)


def _hs_code(value: Any) -> str | None:
    if value is None or pd.isna(value):
        return None
    if isinstance(value, (int, float)) and float(value).is_integer():
        return str(int(value))
    cleaned = str(value).strip()
    return cleaned[:-2] if cleaned.endswith(".0") else cleaned or None


def _normalise_unit(value: Decimal, unit_ar: str, unmapped: set[str]) -> tuple:
    rule = UNIT_RULES.get(unit_ar)
    if rule is None:
        unmapped.add(unit_ar or "<blank>")
        fallback = unit_ar or ""
        return value, fallback, fallback
    return value * rule.factor, rule.unit_en, rule.unit_fr


def _require_files() -> None:
    missing = [
        path
        for path in (
            ARAB_PRODUCTION_PATH,
            WORLD_PRODUCTION_PATH,
            MINERALS_HS_PATH,
            COUNTRIES_PATH,
            COUNTRY_TRANSLATIONS_PATH,
        )
        if not path.exists()
    ]
    if missing:
        joined = "\n".join(f"- {path.relative_to(BASE_DIR)}" for path in missing)
        raise FileNotFoundError(f"Missing required production source files:\n{joined}")


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


def _read_sources() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, dict]:
    arab = pd.read_excel(ARAB_PRODUCTION_PATH, header=None, names=ARAB_COLUMNS)
    world = pd.read_excel(WORLD_PRODUCTION_PATH)
    minerals_hs = pd.read_excel(MINERALS_HS_PATH)
    countries = pd.read_excel(COUNTRIES_PATH)
    country_translations = json.loads(
        COUNTRY_TRANSLATIONS_PATH.read_text(encoding="utf-8")
    )

    for frame in (arab, world, minerals_hs, countries):
        for column in frame.columns:
            if pd.api.types.is_string_dtype(frame[column].dtype):
                frame[column] = frame[column].map(_clean_text)

    return arab, world, minerals_hs, countries, country_translations


def _most_frequent_english(arab: pd.DataFrame) -> dict[str, str]:
    counts: dict[str, Counter] = defaultdict(Counter)
    for row in arab.itertuples(index=False):
        mineral_ar = _clean_text(row.mineral_ar)
        mineral_en = _clean_text(row.mineral_en)
        if mineral_ar and mineral_en:
            counts[mineral_ar][mineral_en] += 1

    result = {}
    for mineral_ar, choices in counts.items():
        result[mineral_ar] = sorted(
            choices.items(), key=lambda item: (-item[1], item[0].casefold())
        )[0][0]
    return result


def _read_translation_cache() -> dict[str, dict[str, str]]:
    if not MINERAL_TRANSLATIONS_CACHE.exists():
        return {}
    try:
        payload = json.loads(MINERAL_TRANSLATIONS_CACHE.read_text(encoding="utf-8"))
        return {
            item["ar"]: item
            for item in payload.get("translations", [])
            if item.get("ar") and item.get("fr")
        }
    except (json.JSONDecodeError, OSError, TypeError):
        return {}


def _translate_minerals_batch(items: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    if not items:
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
                    "You translate mining and mineral names. Return one JSON object with "
                    "a 'translations' array. Each item must contain exactly 'ar', 'en', and "
                    "'fr'. Preserve the supplied Arabic string byte-for-byte. Preserve a "
                    "non-empty supplied English value; otherwise translate it. Use concise, "
                    "standard French mineral terminology. Return every input item once."
                ),
            },
            {
                "role": "user",
                "content": json.dumps({"minerals": items}, ensure_ascii=False),
            },
        ],
    )
    content = response.choices[0].message.content or "{}"
    payload = json.loads(content)
    translations = payload.get("translations", [])
    return {
        _clean_text(item.get("ar")): {
            "ar": _clean_text(item.get("ar")),
            "en": _clean_text(item.get("en")),
            "fr": _clean_text(item.get("fr")),
            "source": "openai",
        }
        for item in translations
        if _clean_text(item.get("ar"))
    }


def _resolve_mineral_translations(
    mineral_names: list[str], english_by_ar: dict[str, str]
) -> tuple[dict[str, dict[str, str]], dict[str, int]]:
    cache = _read_translation_cache()
    resolved = {name: cache[name] for name in mineral_names if name in cache}
    missing = [
        {"ar": name, "en": english_by_ar.get(name, "")}
        for name in mineral_names
        if name not in resolved
    ]

    batch_failed = False
    if missing:
        try:
            resolved.update(_translate_minerals_batch(missing))
        except Exception as exc:
            batch_failed = True
            print(f"translation batch failed; using placeholders: {type(exc).__name__}: {exc}")

    placeholders = 0
    for name in mineral_names:
        existing = resolved.get(name, {})
        english = english_by_ar.get(name) or _clean_text(existing.get("en")) or name
        french = _clean_text(existing.get("fr"))
        source = existing.get("source", "openai")
        if not french:
            french = english
            source = "placeholder"
            placeholders += 1
        resolved[name] = {
            "ar": name,
            "en": english,
            "fr": french,
            "source": source,
        }

    cache_payload = {
        "translations": [resolved[name] for name in mineral_names],
    }
    MINERAL_TRANSLATIONS_CACHE.parent.mkdir(parents=True, exist_ok=True)
    MINERAL_TRANSLATIONS_CACHE.write_text(
        json.dumps(cache_payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    openai_translated = sum(
        1 for item in resolved.values() if item.get("source") == "openai"
    )
    return resolved, {
        "openai_translated": openai_translated,
        "placeholders": placeholders,
        "batch_failed": int(batch_failed),
    }


def _repair_countries(cur, staging: pd.DataFrame) -> list[dict[str, Any]]:
    cur.execute(
        """
        SELECT id, name_ar, name_en, name_fr, iso_code, display_order
        FROM public.countries
        ORDER BY display_order NULLS LAST, id
        """
    )
    existing = [dict(row) for row in cur.fetchall()]
    if len(existing) != 21 or len(staging) != 21:
        raise RuntimeError(
            f"Country repair requires exactly 21 rows; db={len(existing)}, staging={len(staging)}"
        )

    by_iso = {_clean_text(row["iso_code"]).upper(): row for row in existing}
    by_order = {int(row["display_order"]): row for row in existing if row["display_order"]}
    matched_ids: set[int] = set()
    corrections: list[dict[str, Any]] = []

    for source in staging.to_dict(orient="records"):
        wanted = {
            "name_ar": _clean_text(source["country_ar"]),
            "name_en": _clean_text(source["country_en"]),
            "name_fr": _clean_text(source["country_fr"]),
            "iso_code": _clean_text(source["country_iso"]).upper(),
            "display_order": int(source["order_num"]),
        }
        current = by_iso.get(wanted["iso_code"]) or by_order.get(wanted["display_order"])
        if current is None or current["id"] in matched_ids:
            raise RuntimeError(f"Could not uniquely match staging country {wanted}")
        matched_ids.add(current["id"])

        changed = {
            field: {"from": current[field], "to": wanted[field]}
            for field in wanted
            if current[field] != wanted[field]
        }
        if changed:
            cur.execute(
                """
                UPDATE public.countries
                SET name_ar=%s, name_en=%s, name_fr=%s, iso_code=%s,
                    display_order=%s, updated_at=NOW()
                WHERE id=%s
                """,
                (
                    wanted["name_ar"],
                    wanted["name_en"],
                    wanted["name_fr"],
                    wanted["iso_code"],
                    wanted["display_order"],
                    current["id"],
                ),
            )
            correction = {"iso_code": wanted["iso_code"], "changes": changed}
            corrections.append(correction)
            print("country correction:", json.dumps(correction, ensure_ascii=False))

    if len(matched_ids) != 21:
        raise RuntimeError(f"Country repair matched {len(matched_ids)} rows, expected 21")
    return corrections


def _ensure_indexes(cur) -> None:
    cur.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS ux_mineral_production_ar
        ON public.mineral_production(mineral_name_ar)
        """
    )
    cur.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS ux_arab_production_key
        ON public.arab_production(country_id, mineral_production_id, year)
        """
    )
    cur.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS ux_world_production_key
        ON public.world_production(mineral_production_id, year)
        """
    )


def _hs_lookup(frame: pd.DataFrame) -> dict[str, str]:
    result = {}
    for row in frame.to_dict(orient="records"):
        mineral_ar = _clean_text(row.get("اسم المعدن"))
        code = _hs_code(row.get("HS Code"))
        if mineral_ar and code:
            result[mineral_ar] = code
    return result


def _upsert_minerals(
    cur,
    mineral_names: list[str],
    translations: dict[str, dict[str, str]],
    hs_by_ar: dict[str, str],
) -> dict[str, int]:
    mineral_ids = {}
    for mineral_ar in mineral_names:
        names = translations[mineral_ar]
        cur.execute(
            """
            INSERT INTO public.mineral_production (
                hs_codes, mineral_name_ar, mineral_name_en, mineral_name_fr, source_system
            ) VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (mineral_name_ar) DO UPDATE SET
                hs_codes = EXCLUDED.hs_codes,
                mineral_name_en = EXCLUDED.mineral_name_en,
                mineral_name_fr = EXCLUDED.mineral_name_fr,
                source_system = EXCLUDED.source_system,
                updated_at = NOW()
            RETURNING id
            """,
            (
                hs_by_ar.get(mineral_ar),
                mineral_ar,
                names["en"],
                names["fr"],
                SOURCE_SYSTEM,
            ),
        )
        mineral_ids[mineral_ar] = cur.fetchone()["id"]
    return mineral_ids


def _country_id_lookup(cur) -> dict[str, int]:
    cur.execute("SELECT id, name_en FROM public.countries")
    return {_clean_text(name).casefold(): country_id for country_id, name in cur.fetchall()}


def _prepare_arab_rows(
    arab: pd.DataFrame,
    country_translations: dict,
    country_ids: dict[str, int],
    mineral_ids: dict[str, int],
    unmapped_units: set[str],
) -> tuple[list[tuple], Counter, int, list[int]]:
    skipped = Counter()
    by_key: dict[tuple[int, int, int], tuple] = {}
    duplicate_keys = 0

    for row in arab.itertuples(index=False):
        country_ar = _clean_text(row.country_ar)
        mineral_ar = _clean_text(row.mineral_ar)
        unit_ar = _clean_text(row.unit_ar)
        if unit_ar == "وحدة الإنتاج":
            skipped["header_leak"] += 1
            continue

        translation = country_translations.get(country_ar) or {}
        country_en = _clean_text(translation.get("en"))
        country_id = country_ids.get(country_en.casefold()) if country_en else None
        if country_id is None:
            skipped["unresolved_country"] += 1
            continue

        mineral_id = mineral_ids.get(mineral_ar)
        if mineral_id is None:
            skipped["unresolved_mineral"] += 1
            continue

        year = _year(row.year)
        if year is None:
            skipped["invalid_year"] += 1
            continue

        value = _decimal(row.production_value)
        if value is None:
            skipped["invalid_value"] += 1
            continue

        value_base, unit_en, unit_fr = _normalise_unit(value, unit_ar, unmapped_units)
        key = (country_id, mineral_id, year)
        if key in by_key:
            duplicate_keys += 1
        by_key[key] = (
            country_id,
            mineral_id,
            year,
            value,
            value_base,
            unit_ar,
            unit_fr,
            unit_en,
        )

    rows = list(by_key.values())
    return rows, skipped, duplicate_keys, sorted({row[2] for row in rows})


def _prepare_world_rows(
    world: pd.DataFrame,
    mineral_ids: dict[str, int],
    unmapped_units: set[str],
) -> tuple[list[tuple], Counter, int, list[int]]:
    skipped = Counter()
    by_key: dict[tuple[int, int], tuple] = {}
    duplicate_keys = 0

    for source in world.to_dict(orient="records"):
        mineral_ar = _clean_text(source.get("الخام"))
        mineral_id = mineral_ids.get(mineral_ar)
        if mineral_id is None:
            skipped["unresolved_mineral"] += 1
            continue

        year = _year(source.get("السنوات"))
        if year is None:
            skipped["invalid_year"] += 1
            continue

        value = _decimal(source.get("الانتاج"))
        if value is None:
            skipped["invalid_value"] += 1
            continue

        unit_ar = _clean_text(source.get("وحدة الإنتاج"))
        value_base, unit_en, unit_fr = _normalise_unit(value, unit_ar, unmapped_units)
        key = (mineral_id, year)
        if key in by_key:
            duplicate_keys += 1
        by_key[key] = (
            mineral_id,
            year,
            value,
            value_base,
            unit_ar,
            unit_fr,
            unit_en,
        )

    rows = list(by_key.values())
    return rows, skipped, duplicate_keys, sorted({row[1] for row in rows})


def _upsert_arab_production(cur, rows: list[tuple]) -> None:
    psycopg2.extras.execute_values(
        cur,
        """
        INSERT INTO public.arab_production (
            country_id, mineral_production_id, year, production_value,
            production_value_base, unit_ar, unit_fr, unit_en
        ) VALUES %s
        ON CONFLICT (country_id, mineral_production_id, year) DO UPDATE SET
            production_value = EXCLUDED.production_value,
            production_value_base = EXCLUDED.production_value_base,
            unit_ar = EXCLUDED.unit_ar,
            unit_fr = EXCLUDED.unit_fr,
            unit_en = EXCLUDED.unit_en,
            updated_at = NOW()
        """,
        rows,
        page_size=500,
    )


def _upsert_world_production(cur, rows: list[tuple]) -> None:
    psycopg2.extras.execute_values(
        cur,
        """
        INSERT INTO public.world_production (
            mineral_production_id, year, production_value,
            production_value_base, unit_ar, unit_fr, unit_en
        ) VALUES %s
        ON CONFLICT (mineral_production_id, year) DO UPDATE SET
            production_value = EXCLUDED.production_value,
            production_value_base = EXCLUDED.production_value_base,
            unit_ar = EXCLUDED.unit_ar,
            unit_fr = EXCLUDED.unit_fr,
            unit_en = EXCLUDED.unit_en,
            updated_at = NOW()
        """,
        rows,
        page_size=500,
    )


def load() -> dict[str, Any]:
    _require_files()
    load_dotenv(ENV_PATH, override=False)
    arab, world, minerals_hs, countries, country_translations = _read_sources()

    cleaned_arab = arab.loc[arab["unit_ar"].map(_clean_text) != "وحدة الإنتاج"].copy()
    english_by_ar = _most_frequent_english(cleaned_arab)
    mineral_names = sorted(
        {
            *(_clean_text(value) for value in cleaned_arab["mineral_ar"]),
            *(_clean_text(value) for value in world["الخام"]),
        }
        - {""}
    )
    translations, translation_stats = _resolve_mineral_translations(
        mineral_names, english_by_ar
    )
    hs_by_ar = _hs_lookup(minerals_hs)
    unmapped_units: set[str] = set()

    conn = _database_connection()
    conn.autocommit = False
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            corrections = _repair_countries(cur, countries)
            _ensure_indexes(cur)
            mineral_ids = _upsert_minerals(
                cur, mineral_names, translations, hs_by_ar
            )

            cur.execute("SELECT id, name_en FROM public.countries")
            country_ids = {
                _clean_text(row["name_en"]).casefold(): row["id"]
                for row in cur.fetchall()
            }
            arab_rows, arab_skipped, arab_duplicates, arab_years = _prepare_arab_rows(
                arab,
                country_translations,
                country_ids,
                mineral_ids,
                unmapped_units,
            )
            world_rows, world_skipped, world_duplicates, world_years = _prepare_world_rows(
                world, mineral_ids, unmapped_units
            )

            _upsert_arab_production(cur, arab_rows)
            _upsert_world_production(cur, world_rows)

            cur.execute("SELECT COUNT(*) AS count FROM public.countries")
            countries_count = cur.fetchone()["count"]
            cur.execute("SELECT COUNT(*) AS count FROM public.mineral_production")
            minerals_count = cur.fetchone()["count"]
            cur.execute("SELECT COUNT(*) AS count FROM public.arab_production")
            arab_count = cur.fetchone()["count"]
            cur.execute("SELECT COUNT(*) AS count FROM public.world_production")
            world_count = cur.fetchone()["count"]

        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    report = {
        "countries": {
            "count": countries_count,
            "corrections": len(corrections),
        },
        "translations": translation_stats,
        "mineral_production": {
            "source_distinct": len(mineral_names),
            "upserted": len(mineral_ids),
            "final_count": minerals_count,
            "with_hs_codes": sum(1 for name in mineral_names if hs_by_ar.get(name)),
        },
        "arab_production": {
            "source_rows": len(arab),
            "upserted": len(arab_rows),
            "final_count": arab_count,
            "duplicate_natural_keys_collapsed": arab_duplicates,
            "skipped": dict(sorted(arab_skipped.items())),
            "years": arab_years,
        },
        "world_production": {
            "source_rows": len(world),
            "upserted": len(world_rows),
            "final_count": world_count,
            "duplicate_natural_keys_collapsed": world_duplicates,
            "skipped": dict(sorted(world_skipped.items())),
            "years": world_years,
        },
        "unmapped_units": sorted(unmapped_units),
    }
    print("LOAD_REPORT_JSON")
    print(json.dumps(report, ensure_ascii=False, indent=2, default=str))
    return report


if __name__ == "__main__":
    load()
