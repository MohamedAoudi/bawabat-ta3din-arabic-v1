"""
Cleans arab_production.xlsx and world_production.xlsx.
Reads raw files, applies fuzzy-matched translations, normalises units,
deduplicates, and writes CSVs to data/processed/.
"""

import json
import logging
import sys
from pathlib import Path

import pandas as pd
from thefuzz import fuzz, process

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from etl.config import (
    CLEANING_LOG,
    FILES,
    FUZZY_MATCH_THRESHOLD,
    PROCESSED_DIR,
    TRANSLATIONS_COUNTRIES_LOOKUP,
    TRANSLATIONS_MINERALS_LOOKUP,
    UNIT_MULTIPLIERS,
)

log = logging.getLogger("cleaning")


# ── Column detection ──────────────────────────────────────────────────────────

def _is_arabic(val: object) -> bool:
    return any("؀" <= c <= "ۿ" for c in str(val))


def _arabic_repeating_cols(df: pd.DataFrame) -> list[str]:
    cols: list[str] = []
    for col in df.columns:
        if df[col].dtype != object:
            continue
        sample = df[col].dropna().head(30)
        if len(sample) == 0:
            continue
        arabic_frac = sum(1 for v in sample if _is_arabic(v)) / len(sample)
        if arabic_frac >= 0.7 and df[col].nunique() < len(df) * 0.6:
            cols.append(col)
    return cols


def _detect_year_col(df: pd.DataFrame, exclude: list[str]) -> str | None:
    for col in df.columns:
        if col in exclude:
            continue
        sample = df[col].dropna().head(10)
        if len(sample) == 0:
            continue
        try:
            if all(2000 <= int(v) <= 2030 for v in sample):
                return col
        except (ValueError, TypeError):
            continue
    return None


def _detect_numeric_col(df: pd.DataFrame, exclude: list[str]) -> str | None:
    for col in df.columns:
        if col in exclude:
            continue
        if pd.api.types.is_numeric_dtype(df[col]):
            return col
    return None


def _detect_unit_col(df: pd.DataFrame, exclude: list[str]) -> str | None:
    for col in df.columns:
        if col in exclude:
            continue
        if df[col].dtype != object:
            continue
        sample = df[col].dropna().head(10)
        if len(sample) == 0:
            continue
        arabic_frac = sum(1 for v in sample if _is_arabic(v)) / len(sample)
        avg_len = sum(len(str(v)) for v in sample) / len(sample)
        if arabic_frac >= 0.5 and avg_len < 25:
            return col
    return None


# ── Translation helpers ───────────────────────────────────────────────────────

def _load_lookup(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(
            f"Translation lookup not found: {path}\n"
            "Run the 'translate' step first:  python -m etl.cleaning.cleaner --step translate"
        )
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def _translate_term(
    raw: str,
    lookup: dict,
    threshold: int,
    tag: str,
) -> tuple[str, str]:
    """Return (en, fr) for an Arabic term using exact match then fuzzy fallback."""
    if not raw:
        return "", ""
    if raw in lookup:
        return lookup[raw]["en"], lookup[raw]["fr"]
    result = process.extractOne(raw, list(lookup.keys()), scorer=fuzz.ratio)
    if result and result[1] >= threshold:
        canonical, score = result[0], result[1]
        if score < 95:
            log.info(f'[FUZZY_MATCH] "{raw}" → "{canonical}" (score: {score})')
        return lookup[canonical]["en"], lookup[canonical]["fr"]
    log.info(f'[UNMAPPED_{tag}] "{raw}"')
    return "", ""


# ── Unit normalisation ────────────────────────────────────────────────────────

def _get_multiplier(unit: str) -> float:
    if unit in UNIT_MULTIPLIERS:
        return UNIT_MULTIPLIERS[unit]
    if unit:
        log.info(f'[UNKNOWN_UNIT] "{unit}"')
    return 1.0


# ── arab_production ───────────────────────────────────────────────────────────

def clean_arab_production() -> None:
    df = pd.read_excel(FILES["arab_production"])

    arabic_cols = _arabic_repeating_cols(df)
    country_col = arabic_cols[0] if len(arabic_cols) >= 1 else df.columns[0]
    mineral_col = arabic_cols[1] if len(arabic_cols) >= 2 else df.columns[1]

    used = [country_col, mineral_col]
    year_col = _detect_year_col(df, used)
    if year_col:
        used.append(year_col)
    value_col = _detect_numeric_col(df, used)
    if value_col:
        used.append(value_col)
    unit_col = _detect_unit_col(df, used)
    if unit_col:
        used.append(unit_col)
    source_col = df.columns[-1]

    minerals_lkp = _load_lookup(TRANSLATIONS_MINERALS_LOOKUP)
    countries_lkp = _load_lookup(TRANSLATIONS_COUNTRIES_LOOKUP)

    rows = []
    for _, row in df.iterrows():
        country_ar = str(row[country_col]).strip() if pd.notna(row[country_col]) else ""
        mineral_ar = str(row[mineral_col]).strip() if pd.notna(row[mineral_col]) else ""

        country_en, country_fr = _translate_term(country_ar, countries_lkp, FUZZY_MATCH_THRESHOLD, "COUNTRY")
        mineral_en, mineral_fr = _translate_term(mineral_ar, minerals_lkp, FUZZY_MATCH_THRESHOLD, "MINERAL")

        year = int(row[year_col]) if year_col and pd.notna(row[year_col]) else None
        production_value = float(row[value_col]) if value_col and pd.notna(row[value_col]) else None
        unit = str(row[unit_col]).strip() if unit_col and pd.notna(row[unit_col]) else ""
        source = str(row[source_col]).strip() if pd.notna(row[source_col]) else ""

        multiplier = _get_multiplier(unit)
        norm = production_value * multiplier if production_value is not None else None

        rows.append(
            dict(
                country_ar=country_ar,
                country_en=country_en,
                country_fr=country_fr,
                mineral_ar=mineral_ar,
                mineral_en=mineral_en,
                mineral_fr=mineral_fr,
                year=year,
                production_value=production_value,
                production_value_norm=norm,
                unit=unit,
                unit_multiplier=multiplier,
                source=source,
            )
        )

    result = pd.DataFrame(rows)
    dedup_cols = ["country_ar", "mineral_ar", "year", "production_value"]
    n_before = len(result)
    result = result.drop_duplicates(subset=dedup_cols)
    log.info(f"[DEDUP] arab_production: dropped {n_before - len(result)} duplicate rows")

    out = PROCESSED_DIR / "arab_production_clean.csv"
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    result.to_csv(out, index=False, encoding="utf-8-sig")
    log.info(f"Saved {len(result)} rows → {out}")


# ── world_production ──────────────────────────────────────────────────────────

def clean_world_production() -> None:
    df = pd.read_excel(FILES["world_production"])

    arabic_cols = _arabic_repeating_cols(df)
    mineral_col = arabic_cols[0] if arabic_cols else df.columns[0]

    used = [mineral_col]
    year_col = _detect_year_col(df, used)
    if year_col:
        used.append(year_col)
    value_col = _detect_numeric_col(df, used)
    if value_col:
        used.append(value_col)
    unit_col = _detect_unit_col(df, used)

    minerals_lkp = _load_lookup(TRANSLATIONS_MINERALS_LOOKUP)

    rows = []
    for _, row in df.iterrows():
        mineral_ar = str(row[mineral_col]).strip() if pd.notna(row[mineral_col]) else ""
        mineral_en, mineral_fr = _translate_term(mineral_ar, minerals_lkp, FUZZY_MATCH_THRESHOLD, "MINERAL")

        year = int(row[year_col]) if year_col and pd.notna(row[year_col]) else None
        production_value = float(row[value_col]) if value_col and pd.notna(row[value_col]) else None
        unit = str(row[unit_col]).strip() if unit_col and pd.notna(row[unit_col]) else ""

        multiplier = _get_multiplier(unit)
        norm = production_value * multiplier if production_value is not None else None

        rows.append(
            dict(
                mineral_ar=mineral_ar,
                mineral_en=mineral_en,
                mineral_fr=mineral_fr,
                year=year,
                production_value=production_value,
                production_value_norm=norm,
                unit=unit,
                unit_multiplier=multiplier,
            )
        )

    result = pd.DataFrame(rows)
    dedup_cols = ["mineral_ar", "year", "production_value"]
    n_before = len(result)
    result = result.drop_duplicates(subset=dedup_cols)
    log.info(f"[DEDUP] world_production: dropped {n_before - len(result)} duplicate rows")

    out = PROCESSED_DIR / "world_production_clean.csv"
    result.to_csv(out, index=False, encoding="utf-8-sig")
    log.info(f"Saved {len(result)} rows → {out}")


def run() -> None:
    clean_arab_production()
    clean_world_production()


if __name__ == "__main__":
    run()
