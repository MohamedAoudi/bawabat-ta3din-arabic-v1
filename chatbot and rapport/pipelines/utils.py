import re
import pandas as pd
from pipelines.config import UNIT_MULTIPLIERS, get_partner_type


# ── Unit normalisation ────────────────────────────────────────────────────────

def get_unit_multiplier(unit: str) -> float:
    """Return the multiplier to convert a given unit to tonnes (or m³ base)."""
    if not unit or pd.isna(unit):
        return 1.0
    unit = str(unit).strip()
    return UNIT_MULTIPLIERS.get(unit, 1.0)


def normalize_production(value, unit: str):
    """Return (raw_value, multiplier, normalized_value)."""
    if pd.isna(value):
        return None, get_unit_multiplier(unit), None
    multiplier = get_unit_multiplier(unit)
    return float(value), multiplier, float(value) * multiplier


# ── Wide-to-long (unpivot) ────────────────────────────────────────────────────

def unpivot_bilateral(df: pd.DataFrame, year_cols: list[str]) -> pd.DataFrame:
    """
    Melt a wide bilateral trade file into long format.
    year_cols: list of column names that are years, e.g. ['2010', '2011', ...]
    """
    id_cols = [c for c in df.columns if c not in year_cols]
    melted = df.melt(id_vars=id_cols, value_vars=year_cols,
                     var_name="year", value_name="value")
    melted["year"] = melted["year"].astype(int)
    melted = melted.dropna(subset=["value"])
    return melted


def detect_year_columns(df: pd.DataFrame) -> list[str]:
    """Find columns that look like years (4-digit integers between 2000-2030)."""
    return [c for c in df.columns
            if re.match(r"^\d{4}$", str(c)) and 2000 <= int(c) <= 2030]


# ── Name cleaning ─────────────────────────────────────────────────────────────

def clean_string(s) -> str | None:
    if pd.isna(s):
        return None
    return str(s).strip()


def clean_hs_code(code) -> str | None:
    """Ensure HS code is exactly 6 characters, zero-padded."""
    if pd.isna(code):
        return None
    code = str(code).strip().zfill(6)
    return code if len(code) == 6 else None


# ── Partner classification ────────────────────────────────────────────────────

def classify_partners(df: pd.DataFrame, partner_col: str = "Partner Name") -> pd.DataFrame:
    """Add a partner_type column based on partner name heuristics."""
    df = df.copy()
    df["partner_type"] = df[partner_col].apply(
        lambda x: get_partner_type(str(x)) if pd.notna(x) else "country"
    )
    return df


# ── Import share computation ──────────────────────────────────────────────────

def compute_import_share(df: pd.DataFrame,
                          value_col: str = "value",
                          partner_col: str = "Partner Name",
                          group_cols: list[str] = None) -> pd.DataFrame:
    """
    Compute import_share_pct = (partner_value / world_value) * 100.
    Assumes 'World' row exists per group.
    """
    df = df.copy()
    group_cols = group_cols or ["Reporter Name", "year"]

    world_vals = (df[df[partner_col].str.strip() == "World"]
                  .set_index(group_cols)[value_col]
                  .rename("world_total"))

    df = df.merge(world_vals, on=group_cols, how="left")
    df["import_share_pct"] = (df[value_col] / df["world_total"] * 100).round(6)
    df.drop(columns=["world_total"], inplace=True)
    return df


# ── Export USD computation ────────────────────────────────────────────────────

def compute_export_usd(share_pct: float | None,
                        world_usd: float | None) -> tuple[float | None, bool]:
    """
    Compute export_value_usd from share % and world aggregate USD.
    Returns (export_value_usd, export_value_computed).
    """
    if share_pct is None or world_usd is None:
        return None, False
    return round(share_pct / 100 * world_usd, 2), True


# ── Decade helper ─────────────────────────────────────────────────────────────

def year_to_decade(year: int) -> int:
    return (year // 10) * 10
