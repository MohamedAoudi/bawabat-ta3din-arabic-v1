"""
Cleans trade_export.xlsx and trade_import.xlsx.
Reads raw files, cleans HS codes, maps country names via fuzzy matching,
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
    FILES,
    FUZZY_COUNTRY_THRESHOLD,
    PROCESSED_DIR,
    TRANSLATIONS_COUNTRIES_LOOKUP,
)

log = logging.getLogger("cleaning")


# ── Helpers ───────────────────────────────────────────────────────────────────

def _load_countries_lookup() -> dict:
    path = TRANSLATIONS_COUNTRIES_LOOKUP
    if not path.exists():
        raise FileNotFoundError(
            f"Countries lookup not found: {path}\n"
            "Run the 'translate' step first:  python -m etl.cleaning.cleaner --step translate"
        )
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def _find_col(columns: list[str], *keywords: str) -> str | None:
    """Case-insensitive column search; returns first match."""
    for kw in keywords:
        for col in columns:
            if kw.lower() in col.lower():
                return col
    return None


def _build_en_lookup(ar_lookup: dict) -> dict[str, str]:
    """Build {en_name: en_name} set from the AR→{en,fr} lookup for fuzzy matching."""
    return {v["en"]: v["en"] for v in ar_lookup.values()}


def _map_country(raw: str, en_names: list[str], threshold: int) -> str | None:
    raw_str = str(raw).strip()
    if raw_str in en_names:
        return raw_str
    result = process.extractOne(raw_str, en_names, scorer=fuzz.ratio)
    if result and result[1] >= threshold:
        canonical, score = result[0], result[1]
        if score < 100:
            log.info(f'[COUNTRY_MISMATCH] "{raw_str}" → "{canonical}" (score: {score})')
        return canonical
    log.info(f'[UNMAPPED_COUNTRY] "{raw_str}"')
    return None


def _is_valid_hs(code: str) -> bool:
    return len(code) == 6 and code.isdigit()


def _clean_file(
    path: Path,
    header_row: int,
    flow_code: int,
    label: str,
) -> pd.DataFrame:
    df = pd.read_excel(path, header=header_row)
    df.columns = [str(c).strip() for c in df.columns]

    cols = df.columns.tolist()

    reporter_col = _find_col(cols, "reporter name", "reporter", "country name", "country")
    hs_col       = _find_col(cols, "hs", "commodity code", "product code", "code")
    desc_col     = _find_col(cols, "description", "commodity", "product name", "product")
    year_col     = _find_col(cols, "year", "period")
    group_col    = _find_col(cols, "product group", "mineral group", "group")
    value_col    = next((c for c in cols if "value" in c.lower()), None)

    if value_col:
        df = df.rename(columns={value_col: "value_usd"})
    else:
        log.info(f"[WARN] {label}: no 'Value' column found — value_usd will be NaN")
        df["value_usd"] = None

    # HS code cleaning
    if hs_col:
        df[hs_col] = df[hs_col].astype(str).str.strip()
        n_before = len(df)
        df = df[df[hs_col].notna() & (df[hs_col] != "nan") & (df[hs_col] != "")]
        df[hs_col] = df[hs_col].str.zfill(6)
        invalid_mask = ~df[hs_col].apply(_is_valid_hs)
        n_invalid = invalid_mask.sum()
        if n_invalid:
            log.info(f"[INVALID_HS] {label}: dropped {n_invalid} rows")
        df = df[~invalid_mask]
    else:
        df["hs_code"] = None
        hs_col = "hs_code"

    # Country mapping
    countries_lkp = _load_countries_lookup()
    en_names = list(_build_en_lookup(countries_lkp).keys())

    if reporter_col:
        country_mapped: list[str | None] = []
        for raw in df[reporter_col]:
            country_mapped.append(_map_country(str(raw).strip(), en_names, FUZZY_COUNTRY_THRESHOLD))
        df["country_en"] = country_mapped
        n_unmapped = df["country_en"].isna().sum()
        if n_unmapped:
            log.info(f"[WARN] {label}: dropped {n_unmapped} rows with unmapped countries")
        df = df[df["country_en"].notna()]
    else:
        df["country_en"] = None

    # Flow column
    df["flow"] = flow_code

    # Rename structural columns
    rename_map = {}
    if hs_col and hs_col != "hs_code":
        rename_map[hs_col] = "hs_code"
    if desc_col:
        rename_map[desc_col] = "hs_description"
    if year_col:
        rename_map[year_col] = "year"
    if group_col:
        rename_map[group_col] = "mineral_group_en"
    df = df.rename(columns=rename_map)

    for col in ["hs_code", "hs_description", "year", "mineral_group_en", "value_usd"]:
        if col not in df.columns:
            df[col] = None

    # Dedup
    dedup_cols = [c for c in ["country_en", "hs_code", "year", "flow"] if c in df.columns]
    n_before = len(df)
    df = df.drop_duplicates(subset=dedup_cols)
    log.info(f"[DEDUP] {label}: dropped {n_before - len(df)} duplicate rows")

    return df[["country_en", "mineral_group_en", "hs_code", "hs_description", "year", "flow", "value_usd"]]


def run() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    export_df = _clean_file(FILES["trade_export"], header_row=1, flow_code=1, label="trade_export")
    out_exp = PROCESSED_DIR / "trade_export_clean.csv"
    export_df.to_csv(out_exp, index=False, encoding="utf-8-sig")
    log.info(f"Saved {len(export_df)} rows → {out_exp}")

    import_df = _clean_file(FILES["trade_import"], header_row=0, flow_code=2, label="trade_import")
    out_imp = PROCESSED_DIR / "trade_import_clean.csv"
    import_df.to_csv(out_imp, index=False, encoding="utf-8-sig")
    log.info(f"Saved {len(import_df)} rows → {out_imp}")


if __name__ == "__main__":
    run()
