"""
Cleans bilateral trade data for each country folder under data/raw/bilateral/.
Reads 4 xlsx files per country, unpivots year columns to long format,
merges USD and PCT files, classifies partners, and writes per-country CSVs
to data/processed/bilateral/{CountryName}/.
"""

import logging
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from etl.config import BILATERAL_DIR, PROCESSED_DIR, get_partner_type

log = logging.getLogger("cleaning")

_SHEET = "Product-TimeSeries-Partner"
_YEAR_MIN, _YEAR_MAX = 2010, 2030


# ── Helpers ───────────────────────────────────────────────────────────────────

def _year_columns(columns) -> list:
    """Return columns whose header is a 4-digit integer in [YEAR_MIN, YEAR_MAX]."""
    year_cols = []
    for col in columns:
        try:
            yr = int(col)
            if _YEAR_MIN <= yr <= _YEAR_MAX:
                year_cols.append(col)
        except (ValueError, TypeError):
            continue
    return year_cols


def _read_bilateral(path: Path) -> pd.DataFrame:
    df = pd.read_excel(path, sheet_name=_SHEET)
    df.columns = [str(c).strip() for c in df.columns]
    return df


def _melt_to_long(df: pd.DataFrame, value_name: str) -> pd.DataFrame:
    year_cols = _year_columns(df.columns)
    id_cols = [c for c in df.columns if c not in year_cols]
    long = pd.melt(df, id_vars=id_cols, value_vars=year_cols, var_name="year", value_name=value_name)
    long["year"] = long["year"].astype(int)
    return long


def _aggregate(df: pd.DataFrame, value_col: str, agg_fn: str) -> pd.DataFrame:
    """Collapse product-level rows to (Reporter Name, Partner Name, year) granularity."""
    reporter_col = _find_name_col(df.columns, "reporter name", "reporter")
    partner_col  = _find_name_col(df.columns, "partner name", "partner")
    if not reporter_col or not partner_col:
        return df
    group_cols = [reporter_col, partner_col, "year"]
    agg_map = {value_col: agg_fn}
    return df.groupby(group_cols, as_index=False).agg(agg_map)


def _find_name_col(columns, *candidates: str) -> str | None:
    cols_lower = {c.lower(): c for c in columns}
    for cand in candidates:
        if cand.lower() in cols_lower:
            return cols_lower[cand.lower()]
    return None


def _get_reporter_partner_cols(df: pd.DataFrame) -> tuple[str, str]:
    reporter_col = _find_name_col(df.columns, "reporter name", "reporter") or df.columns[0]
    partner_col  = _find_name_col(df.columns, "partner name", "partner") or df.columns[1]
    return reporter_col, partner_col


def _process_country(country_dir: Path) -> None:
    country_name = country_dir.name

    files = {
        "export_usd": country_dir / "export_usd.xlsx",
        "export_pct": country_dir / "export_pct.xlsx",
        "import_usd": country_dir / "import_usd.xlsx",
        "import_pct": country_dir / "import_pct.xlsx",
    }
    missing = [k for k, p in files.items() if not p.exists()]
    if missing:
        log.info(f"[SKIP] {country_name}: missing files {missing}")
        return

    # ── Imports ──
    imp_usd_raw = _read_bilateral(files["import_usd"])
    imp_pct_raw = _read_bilateral(files["import_pct"])

    imp_usd_long = _melt_to_long(imp_usd_raw, "import_value_usd_thousand")
    imp_pct_long = _melt_to_long(imp_pct_raw, "import_share_pct")

    imp_usd_agg = _aggregate(imp_usd_long, "import_value_usd_thousand", "sum")
    imp_pct_agg = _aggregate(imp_pct_long, "import_share_pct", "sum")

    reporter_col, partner_col = _get_reporter_partner_cols(imp_usd_agg)
    merge_cols = [reporter_col, partner_col, "year"]

    imports = pd.merge(
        imp_usd_agg[[reporter_col, partner_col, "year", "import_value_usd_thousand"]],
        imp_pct_agg[[reporter_col, partner_col, "year", "import_share_pct"]],
        on=merge_cols,
        how="outer",
    )

    n_before = len(imports)
    imports = imports.drop_duplicates(subset=merge_cols)
    n_dropped = n_before - len(imports)
    if n_dropped:
        log.info(f"[DEDUP] {country_name} imports: dropped {n_dropped} duplicate rows")

    imports["partner_type"] = imports[partner_col].apply(
        lambda x: get_partner_type(str(x)) if pd.notna(x) else "country"
    )
    imports = imports.rename(columns={reporter_col: "reporter", partner_col: "partner"})
    imports = imports[["reporter", "partner", "partner_type", "year", "import_value_usd_thousand", "import_share_pct"]]

    # ── Exports ──
    exp_usd_raw = _read_bilateral(files["export_usd"])
    exp_pct_raw = _read_bilateral(files["export_pct"])

    exp_usd_long = _melt_to_long(exp_usd_raw, "export_value_usd_thousand")
    exp_pct_long = _melt_to_long(exp_pct_raw, "export_share_pct")

    exp_usd_agg = _aggregate(exp_usd_long, "export_value_usd_thousand", "sum")
    exp_pct_agg = _aggregate(exp_pct_long, "export_share_pct", "sum")

    reporter_col, partner_col = _get_reporter_partner_cols(exp_usd_agg)

    exports = pd.merge(
        exp_usd_agg[[reporter_col, partner_col, "year", "export_value_usd_thousand"]],
        exp_pct_agg[[reporter_col, partner_col, "year", "export_share_pct"]],
        on=[reporter_col, partner_col, "year"],
        how="outer",
    )

    n_before = len(exports)
    exports = exports.drop_duplicates(subset=[reporter_col, partner_col, "year"])
    n_dropped = n_before - len(exports)
    if n_dropped:
        log.info(f"[DEDUP] {country_name} exports: dropped {n_dropped} duplicate rows")

    exports["partner_type"] = exports[partner_col].apply(
        lambda x: get_partner_type(str(x)) if pd.notna(x) else "country"
    )
    exports = exports.rename(columns={reporter_col: "reporter", partner_col: "partner"})
    exports = exports[["reporter", "partner", "partner_type", "year", "export_value_usd_thousand", "export_share_pct"]]

    # ── Output ──
    out_dir = PROCESSED_DIR / "bilateral" / country_name
    out_dir.mkdir(parents=True, exist_ok=True)

    imp_path = out_dir / "import_clean.csv"
    exp_path = out_dir / "export_clean.csv"
    imports.to_csv(imp_path, index=False, encoding="utf-8-sig")
    exports.to_csv(exp_path, index=False, encoding="utf-8-sig")
    log.info(f"Saved {len(imports)} import rows → {imp_path}")
    log.info(f"Saved {len(exports)} export rows → {exp_path}")


def run() -> None:
    if not BILATERAL_DIR.exists():
        log.info(f"[SKIP] bilateral dir not found: {BILATERAL_DIR}")
        return

    country_dirs = [
        d for d in sorted(BILATERAL_DIR.iterdir())
        if d.is_dir() and any(d.glob("*.xlsx"))
    ]

    if not country_dirs:
        log.info("[SKIP] No non-empty country folders found in bilateral dir")
        return

    log.info(f"Processing {len(country_dirs)} country folder(s): {[d.name for d in country_dirs]}")
    for country_dir in country_dirs:
        _process_country(country_dir)


if __name__ == "__main__":
    run()
