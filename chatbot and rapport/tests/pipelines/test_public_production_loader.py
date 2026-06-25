from decimal import Decimal

import pytest

from pipelines.loaders.load_public_production import (
    _decimal,
    _hs_code,
    _normalise_unit,
    _year,
)


@pytest.mark.parametrize(
    ("unit_ar", "value", "expected_base", "unit_en", "unit_fr"),
    [
        ("طن", "2", "2", "tonne", "tonne"),
        ("كجم", "2000", "2.000", "kg", "kg"),
        ("ألف طن", "2", "2000", "thousand tonnes", "millier de tonnes"),
        ("متر مكعب", "2", "2", "m³", "m³"),
        ("الف متر مكعب", "2", "2000", "thousand m³", "millier de m³"),
        ("مليون متر مكعب", "2", "2000000", "million m³", "million de m³"),
    ],
)
def test_unit_normalisation(unit_ar, value, expected_base, unit_en, unit_fr):
    unmapped = set()

    base, resolved_en, resolved_fr = _normalise_unit(
        Decimal(value), unit_ar, unmapped
    )

    assert base == Decimal(expected_base)
    assert resolved_en == unit_en
    assert resolved_fr == unit_fr
    assert not unmapped


def test_unmapped_unit_preserves_value_and_label():
    unmapped = set()

    base, unit_en, unit_fr = _normalise_unit(
        Decimal("12.5"), "وحدة غير معروفة", unmapped
    )

    assert base == Decimal("12.5")
    assert unit_en == "وحدة غير معروفة"
    assert unit_fr == "وحدة غير معروفة"
    assert unmapped == {"وحدة غير معروفة"}


@pytest.mark.parametrize(
    ("raw", "expected"),
    [(2821.0, "2821"), ("2510.1", "2510.1"), (None, None)],
)
def test_hs_code_cleanup(raw, expected):
    assert _hs_code(raw) == expected


def test_numeric_parsing():
    assert _decimal("1,250.5") == Decimal("1250.5")
    assert _decimal("") is None
    assert _year("2024") == 2024
    assert _year("2024.5") is None
