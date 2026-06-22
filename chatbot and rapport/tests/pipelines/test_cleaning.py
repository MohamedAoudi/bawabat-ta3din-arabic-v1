"""Unit tests for ETL cleaning helpers.

All tested functions are pure (no I/O, no LLM calls) so these tests run
without any data files or environment variables present.

Covered:
  clean_production._is_arabic
  clean_production._arabic_repeating_cols
  clean_production._detect_year_col
  clean_production._detect_numeric_col
  clean_production._detect_unit_col
  clean_production._translate_term
  clean_production._get_multiplier
  config.get_partner_type
"""
from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import patch

import pandas as pd
import pytest

# Make the project root importable from the test runner without a real install.
ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from pipelines.cleaning.clean_production import (
    _arabic_repeating_cols,
    _detect_numeric_col,
    _detect_unit_col,
    _detect_year_col,
    _get_multiplier,
    _is_arabic,
    _translate_term,
)
from pipelines.config import UNIT_MULTIPLIERS, get_partner_type


# ─────────────────────────────────────────────────────────────────────────────
# _is_arabic
# ─────────────────────────────────────────────────────────────────────────────

class TestIsArabic:
    def test_pure_arabic_word(self):
        assert _is_arabic("طن") is True

    def test_arabic_sentence(self):
        assert _is_arabic("المملكة العربية السعودية") is True

    def test_latin_word(self):
        assert _is_arabic("Morocco") is False

    def test_french_word(self):
        assert _is_arabic("tonnes") is False

    def test_digits_only(self):
        assert _is_arabic("2024") is False

    def test_empty_string(self):
        # No Arabic characters → False
        assert _is_arabic("") is False

    def test_mixed_arabic_latin(self):
        # Contains at least one Arabic char → True
        assert _is_arabic("Gold ذهب") is True

    def test_arabic_range_boundary_low(self):
        # U+0600 is the first Arabic code point ('؀')
        assert _is_arabic("؀") is True

    def test_arabic_range_boundary_high(self):
        # U+06FF is the last Arabic Extended code point ('ۿ')
        assert _is_arabic("ۿ") is True

    def test_just_outside_arabic_range(self):
        # U+05FF is Hebrew range — not Arabic
        assert _is_arabic("׿") is False

    def test_non_string_coerced(self):
        # The function calls str(val), so integers must work too
        assert _is_arabic(12345) is False


# ─────────────────────────────────────────────────────────────────────────────
# _arabic_repeating_cols
# ─────────────────────────────────────────────────────────────────────────────

class TestArabicRepeatingCols:
    def _make_df(self, col_data: dict) -> pd.DataFrame:
        return pd.DataFrame(col_data)

    def test_detects_high_arabic_low_uniqueness(self):
        # 10 rows, all Arabic, 2 distinct values → low uniqueness → detected
        df = self._make_df({
            "country": ["المغرب", "الجزائر"] * 5,
        })
        assert "country" in _arabic_repeating_cols(df)

    def test_ignores_numeric_dtype_column(self):
        df = self._make_df({
            "year": [2020, 2021, 2022, 2023, 2024],
        })
        assert _arabic_repeating_cols(df) == []

    def test_ignores_latin_text_column(self):
        df = self._make_df({
            "country_en": ["Morocco", "Algeria", "Egypt", "Tunisia", "Libya"],
        })
        assert _arabic_repeating_cols(df) == []

    def test_ignores_high_uniqueness_arabic_col(self):
        # Every row is unique → uniqueness ratio == 1.0 > 0.6 → excluded
        df = self._make_df({
            "unique_ar": [f"قيمة{i}" for i in range(20)],
        })
        result = _arabic_repeating_cols(df)
        assert "unique_ar" not in result

    def test_detects_multiple_arabic_cols(self):
        df = self._make_df({
            "country": ["المغرب", "الجزائر"] * 10,
            "mineral": ["ذهب", "فضة", "نحاس"] * 6 + ["ذهب", "فضة"],
        })
        result = _arabic_repeating_cols(df)
        assert "country" in result
        assert "mineral" in result

    def test_empty_column_skipped(self):
        df = self._make_df({
            "empty_ar": [None] * 10,
        })
        # All NaN → sample is empty → skipped
        assert _arabic_repeating_cols(df) == []

    def test_below_arabic_fraction_threshold(self):
        # Only 4 of 10 Arabic → 40% < 70% → not detected
        df = self._make_df({
            "mixed": ["طن", "طن", "طن", "طن", "ton", "ton", "ton", "ton", "ton", "ton"],
        })
        assert _arabic_repeating_cols(df) == []


# ─────────────────────────────────────────────────────────────────────────────
# _detect_year_col
# ─────────────────────────────────────────────────────────────────────────────

class TestDetectYearCol:
    def test_finds_year_column(self):
        df = pd.DataFrame({
            "country": ["Morocco"],
            "year": [2022],
            "value": [100.0],
        })
        assert _detect_year_col(df, exclude=["country"]) == "year"

    def test_excludes_listed_columns(self):
        df = pd.DataFrame({
            "year": [2022],
            "value": [100.0],
        })
        # "year" is excluded → None
        assert _detect_year_col(df, exclude=["year"]) is None

    def test_rejects_out_of_range_years(self):
        df = pd.DataFrame({
            "bad_year": [1999, 2000, 2001],
        })
        # 1999 < 2000 → not all in [2000, 2030]
        assert _detect_year_col(df, exclude=[]) is None

    def test_rejects_future_years(self):
        df = pd.DataFrame({
            "future": [2031, 2032],
        })
        assert _detect_year_col(df, exclude=[]) is None

    def test_non_numeric_column_skipped(self):
        df = pd.DataFrame({
            "name": ["Alice", "Bob"],
        })
        assert _detect_year_col(df, exclude=[]) is None

    def test_boundary_year_2000(self):
        df = pd.DataFrame({"yr": [2000, 2000, 2000]})
        assert _detect_year_col(df, exclude=[]) == "yr"

    def test_boundary_year_2030(self):
        df = pd.DataFrame({"yr": [2030, 2030]})
        assert _detect_year_col(df, exclude=[]) == "yr"

    def test_empty_column_skipped(self):
        df = pd.DataFrame({"yr": [None, None, None]})
        assert _detect_year_col(df, exclude=[]) is None


# ─────────────────────────────────────────────────────────────────────────────
# _detect_numeric_col
# ─────────────────────────────────────────────────────────────────────────────

class TestDetectNumericCol:
    def test_finds_first_numeric_col(self):
        df = pd.DataFrame({
            "name": ["a", "b"],
            "value": [10.0, 20.0],
            "count": [1, 2],
        })
        # "value" comes first among numeric cols
        assert _detect_numeric_col(df, exclude=["name"]) == "value"

    def test_skips_excluded_cols(self):
        df = pd.DataFrame({
            "value": [10.0, 20.0],
            "count": [1, 2],
        })
        assert _detect_numeric_col(df, exclude=["value"]) == "count"

    def test_returns_none_when_no_numeric(self):
        df = pd.DataFrame({
            "a": ["x", "y"],
            "b": ["p", "q"],
        })
        assert _detect_numeric_col(df, exclude=[]) is None

    def test_integer_dtype_counts(self):
        df = pd.DataFrame({"qty": pd.Series([1, 2, 3], dtype="int64")})
        assert _detect_numeric_col(df, exclude=[]) == "qty"


# ─────────────────────────────────────────────────────────────────────────────
# _detect_unit_col
# ─────────────────────────────────────────────────────────────────────────────

class TestDetectUnitCol:
    def test_finds_short_arabic_unit_col(self):
        df = pd.DataFrame({
            "country": ["المغرب"] * 10,
            "unit": ["طن"] * 10,
        })
        # "unit" is short Arabic text → detected; exclude "country"
        result = _detect_unit_col(df, exclude=["country"])
        assert result == "unit"

    def test_ignores_numeric_col(self):
        df = pd.DataFrame({
            "value": [1.0, 2.0, 3.0],
        })
        assert _detect_unit_col(df, exclude=[]) is None

    def test_ignores_long_arabic_text(self):
        # avg_len > 25 → not a unit column
        long_text = "الجمهورية الجزائرية الديمقراطية الشعبية"  # >25 chars
        df = pd.DataFrame({"desc": [long_text] * 10})
        assert _detect_unit_col(df, exclude=[]) is None

    def test_ignores_excluded_cols(self):
        df = pd.DataFrame({"unit": ["طن"] * 10})
        assert _detect_unit_col(df, exclude=["unit"]) is None

    def test_ignores_mostly_latin_col(self):
        df = pd.DataFrame({
            "unit_en": ["ton", "kg", "m3"] * 4,
        })
        # <50% Arabic → not detected
        assert _detect_unit_col(df, exclude=[]) is None

    def test_empty_column_skipped(self):
        df = pd.DataFrame({"unit": [None] * 10})
        assert _detect_unit_col(df, exclude=[]) is None


# ─────────────────────────────────────────────────────────────────────────────
# _translate_term
# ─────────────────────────────────────────────────────────────────────────────

SAMPLE_LOOKUP = {
    "ذهب": {"en": "Gold", "fr": "Or"},
    "فضة": {"en": "Silver", "fr": "Argent"},
    "نحاس": {"en": "Copper", "fr": "Cuivre"},
}


class TestTranslateTerm:
    def test_exact_match(self):
        en, fr = _translate_term("ذهب", SAMPLE_LOOKUP, threshold=80, tag="TEST")
        assert en == "Gold"
        assert fr == "Or"

    def test_empty_string_returns_empty(self):
        en, fr = _translate_term("", SAMPLE_LOOKUP, threshold=80, tag="TEST")
        assert en == ""
        assert fr == ""

    def test_fuzzy_match_above_threshold(self):
        # "ذهبب" is close to "ذهب" — should fuzzy-match if score >= threshold
        # We lower the threshold to 50 to guarantee a match for this slight variant
        en, fr = _translate_term("ذهبب", SAMPLE_LOOKUP, threshold=50, tag="TEST")
        assert en == "Gold"
        assert fr == "Or"

    def test_no_match_below_threshold(self):
        # Completely unrelated term with threshold=99 → no match
        en, fr = _translate_term("xyz_unrelated_xyz", SAMPLE_LOOKUP, threshold=99, tag="TEST")
        assert en == ""
        assert fr == ""

    def test_unmapped_term_returns_empty(self):
        en, fr = _translate_term("بلاتين", SAMPLE_LOOKUP, threshold=95, tag="TEST")
        assert en == ""
        assert fr == ""

    def test_exact_match_takes_priority_over_fuzzy(self):
        # "نحاس" exists exactly — should not fall through to fuzzy
        en, fr = _translate_term("نحاس", SAMPLE_LOOKUP, threshold=80, tag="TEST")
        assert en == "Copper"
        assert fr == "Cuivre"

    def test_all_three_minerals_exact(self):
        for arabic, expected_en in [("ذهب", "Gold"), ("فضة", "Silver"), ("نحاس", "Copper")]:
            en, _ = _translate_term(arabic, SAMPLE_LOOKUP, threshold=80, tag="TEST")
            assert en == expected_en, f"Expected {expected_en} for '{arabic}', got '{en}'"


# ─────────────────────────────────────────────────────────────────────────────
# _get_multiplier
# ─────────────────────────────────────────────────────────────────────────────

class TestGetMultiplier:
    def test_tonne_is_one(self):
        assert _get_multiplier("طن") == 1.0

    def test_thousand_tonnes_variant1(self):
        # "ألف طن" → 1000
        assert _get_multiplier("ألف طن") == 1000.0

    def test_thousand_tonnes_variant2(self):
        # "الف طن" (without hamza) → also 1000
        assert _get_multiplier("الف طن") == 1000.0

    def test_million_tonnes(self):
        assert _get_multiplier("مليون طن") == 1_000_000.0

    def test_kilogram(self):
        assert _get_multiplier("كجم") == pytest.approx(0.001)

    def test_kilogram_long(self):
        assert _get_multiplier("كيلو جرام") == pytest.approx(0.001)

    def test_cubic_metre(self):
        assert _get_multiplier("متر مكعب") == 1.0

    def test_thousand_cubic_metres(self):
        assert _get_multiplier("الف متر مكعب") == 1000.0

    def test_million_cubic_metres(self):
        assert _get_multiplier("مليون متر مكعب") == 1_000_000.0

    def test_unknown_unit_returns_one(self):
        assert _get_multiplier("وحدة_غير_معروفة") == 1.0

    def test_empty_string_returns_one(self):
        assert _get_multiplier("") == 1.0

    def test_all_defined_units_present_in_multipliers(self):
        # Sanity check: every unit in UNIT_MULTIPLIERS is reachable
        for unit_ar, multiplier in UNIT_MULTIPLIERS.items():
            result = _get_multiplier(unit_ar)
            assert result == multiplier, (
                f"Mismatch for unit '{unit_ar}': expected {multiplier}, got {result}"
            )


# ─────────────────────────────────────────────────────────────────────────────
# get_partner_type  (config helper)
# ─────────────────────────────────────────────────────────────────────────────

class TestGetPartnerType:
    def test_world_lowercase(self):
        assert get_partner_type("world") == "world"

    def test_world_mixed_case(self):
        assert get_partner_type("World") == "world"

    def test_regional_keyword_asia(self):
        assert get_partner_type("East Asia & Pacific") == "region"

    def test_regional_keyword_europe(self):
        assert get_partner_type("Europe and Central Asia") == "region"

    def test_regional_keyword_arab(self):
        assert get_partner_type("Arab countries") == "region"

    def test_regional_keyword_opec(self):
        assert get_partner_type("OPEC members") == "region"

    def test_country(self):
        assert get_partner_type("Morocco") == "country"

    def test_country_with_whitespace(self):
        assert get_partner_type("  Egypt  ") == "country"

    def test_high_income_is_region(self):
        assert get_partner_type("High income") == "region"

    def test_developing_is_region(self):
        assert get_partner_type("developing economies") == "region"
