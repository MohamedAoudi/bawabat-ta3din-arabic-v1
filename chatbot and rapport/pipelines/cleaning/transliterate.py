"""
Translates Arabic mineral and country names to English and French via the
OpenAI API. Outputs JSON translation files and fast-lookup dicts to
data/processed/. Must be run before any cleaning step that needs translations.
"""

import json
import logging
import os
import sys
from pathlib import Path

import pandas as pd
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from etl.config import (
    FILES,
    PROCESSED_DIR,
    TRANSLATIONS_COUNTRIES_LOOKUP,
    TRANSLATIONS_COUNTRIES_PATH,
    TRANSLATIONS_MINERALS_LOOKUP,
    TRANSLATIONS_MINERALS_PATH,
)

log = logging.getLogger("cleaning")

_SYSTEM_PROMPT = (
    "You are a professional Arabic-English-French translator specializing in mining, minerals, and geography.\n"
    "Given a list of Arabic terms, return ONLY a valid JSON array. No markdown, no explanation, no code fences.\n"
    'Each item must have exactly three keys: "ar" (original Arabic, unchanged), "en" (English), "fr" (French).\n'
    "For country names use official names. For minerals use standard geological and mining terminology."
)


# ── Column detection helpers ──────────────────────────────────────────────────

def _is_arabic(val: object) -> bool:
    return any("؀" <= c <= "ۿ" for c in str(val))


def _arabic_repeating_cols(df: pd.DataFrame) -> list[str]:
    """Return columns whose values are mostly Arabic and have low cardinality."""
    cols: list[str] = []
    for col in df.columns:
        if df[col].dtype != object:
            continue
        sample = df[col].dropna().head(30)
        if len(sample) == 0:
            continue
        # Exclude columns where most values are plain numbers
        numeric_frac = sum(1 for v in sample if str(v).strip().isdigit()) / len(sample)
        if numeric_frac > 0.5:
            continue
        arabic_frac = sum(1 for v in sample if _is_arabic(v)) / len(sample)
        if arabic_frac >= 0.7 and df[col].nunique() < len(df) * 0.6:
            cols.append(col)
    return cols


def _detect_mineral_col(df: pd.DataFrame) -> str:
    """Return the mineral column: the second Arabic-repeating column, or first."""
    candidates = _arabic_repeating_cols(df)
    if len(candidates) >= 2:
        return candidates[1]
    if candidates:
        return candidates[0]
    return df.columns[1] if len(df.columns) > 1 else df.columns[0]


def _detect_country_col(df: pd.DataFrame) -> str:
    """Return the column with the highest fraction of Arabic characters."""
    best_col: str | None = None
    best_frac: float = 0.0
    for col in df.columns:
        if df[col].dtype != object:
            continue
        sample = df[col].dropna().head(30)
        if len(sample) == 0:
            continue
        numeric_frac = sum(1 for v in sample if str(v).strip().isdigit()) / len(sample)
        if numeric_frac > 0.5:
            continue
        arabic_frac = sum(1 for v in sample if _is_arabic(v)) / len(sample)
        if arabic_frac > best_frac:
            best_frac = arabic_frac
            best_col = col
    return best_col if best_col is not None else (df.columns[1] if len(df.columns) > 1 else df.columns[0])


# ── API call ──────────────────────────────────────────────────────────────────

def _translate(terms: list[str], category: str, client: OpenAI) -> list[dict]:
    terms_str = "\n".join(terms)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": f"{category}:\n{terms_str}"},
        ],
    )
    raw = response.choices[0].message.content.strip()
    return json.loads(raw)


# ── Persistence ───────────────────────────────────────────────────────────────

def _save(translations: list[dict], json_path: Path, lookup_path: Path) -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    with open(json_path, "w", encoding="utf-8") as fh:
        json.dump(
            {
                "_comment": (
                    "REVIEW BEFORE ETL: verify and correct all translations "
                    "before running the pipeline"
                ),
                "translations": translations,
            },
            fh,
            ensure_ascii=False,
            indent=2,
        )
    lookup = {item["ar"]: {"en": item["en"], "fr": item["fr"]} for item in translations}
    with open(lookup_path, "w", encoding="utf-8") as fh:
        json.dump(lookup, fh, ensure_ascii=False, indent=2)


# ── Main entry point ──────────────────────────────────────────────────────────

def run() -> None:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "OPENAI_API_KEY is not set.\n"
            "Add it to your .env file:\n"
            "  OPENAI_API_KEY=your_key_here"
        )

    client = OpenAI(api_key=api_key)

    # Collect unique mineral names
    df_prod = pd.read_excel(FILES["arab_production"])
    mineral_col = _detect_mineral_col(df_prod)
    minerals = sorted({str(v).strip() for v in df_prod[mineral_col].dropna() if str(v).strip()})

    # Collect unique country names
    df_ref = pd.read_excel(FILES["countries_ref"])
    country_col = _detect_country_col(df_ref)
    countries = sorted({str(v).strip() for v in df_ref[country_col].dropna() if str(v).strip()})

    log.info(f"Translating {len(minerals)} minerals and {len(countries)} countries via OpenAI API…")

    def _check_and_report(source_terms: list[str], translations: list[dict], label: str) -> None:
        source_set = set(source_terms)
        parsed_ar = {t.get("ar", "") for t in translations}
        mismatches = [t for t in translations if t.get("ar", "") not in source_set]
        missing = [s for s in source_terms if s not in parsed_ar]
        log.info(
            f"{label}: sent {len(source_terms)}, parsed {len(translations)}, "
            f"ar-mismatches {len(mismatches)}, missing {len(missing)}"
        )
        for t in mismatches:
            log.info(f'  [MISMATCH] "{t.get("ar")}"')
        for s in missing:
            log.info(f'  [MISSING_FROM_RESPONSE] "{s}"')

    mineral_translations = _translate(minerals, "MINERALS", client)
    _check_and_report(minerals, mineral_translations, "Minerals")
    _save(mineral_translations, TRANSLATIONS_MINERALS_PATH, TRANSLATIONS_MINERALS_LOOKUP)
    log.info(f"Saved → {TRANSLATIONS_MINERALS_PATH}")
    log.info(f"Saved → {TRANSLATIONS_MINERALS_LOOKUP}")

    country_translations = _translate(countries, "COUNTRIES", client)
    _check_and_report(countries, country_translations, "Countries")
    _save(country_translations, TRANSLATIONS_COUNTRIES_PATH, TRANSLATIONS_COUNTRIES_LOOKUP)
    log.info(f"Saved → {TRANSLATIONS_COUNTRIES_PATH}")
    log.info(f"Saved → {TRANSLATIONS_COUNTRIES_LOOKUP}")


if __name__ == "__main__":
    run()
