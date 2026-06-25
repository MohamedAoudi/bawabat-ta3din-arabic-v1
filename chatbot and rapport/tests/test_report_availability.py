"""Tests for the report API's /availability endpoint.

It must surface only (country, mineral) pairs that actually have data, with
year spans clamped to the report's accepted range — so the frontend never
offers a parameter combination that would 404.
"""

from __future__ import annotations

from unittest.mock import patch

import src.reports.api as api


class _FakeCursor:
    def __init__(self, rows):
        self._rows = rows

    def execute(self, *args, **kwargs):
        pass

    def fetchall(self):
        return self._rows


class _FakeCtx:
    def __init__(self, rows):
        self._rows = rows

    def __enter__(self):
        return _FakeCursor(self._rows)

    def __exit__(self, *args):
        return False


def _availability(rows):
    with patch.object(api, "get_pooled_cursor", return_value=_FakeCtx(rows)):
        return api.get_availability()


def test_groups_pairs_by_country_with_year_spans():
    out = _availability([
        ("Kingdom of Morocco", "Phosphate rock", 2012, 2023),
        ("Kingdom of Morocco", "Gold", 2015, 2022),
        ("Arab Republic of Egypt", "Gold", 2014, 2020),
    ])

    assert set(out["pairs"]) == {"Kingdom of Morocco", "Arab Republic of Egypt"}
    assert out["pairs"]["Kingdom of Morocco"]["Phosphate rock"] == [2012, 2023]
    assert out["pairs"]["Kingdom of Morocco"]["Gold"] == [2015, 2022]
    assert out["year_min"] == 2012
    assert out["year_max"] == 2023


def test_year_spans_are_clamped_to_accepted_range():
    out = _availability([
        ("Kingdom of Morocco", "Gold", 2008, 2026),  # spills past both bounds
    ])
    assert out["pairs"]["Kingdom of Morocco"]["Gold"] == [api.YEAR_MIN, api.YEAR_MAX]


def test_pairs_entirely_out_of_range_are_dropped():
    out = _availability([
        ("Republic of Iraq", "Crude oil", 2030, 2031),  # no overlap with range
        ("Kingdom of Morocco", "Phosphate rock", 2012, 2023),
    ])
    assert "Republic of Iraq" not in out["pairs"]
    assert "Kingdom of Morocco" in out["pairs"]


def test_empty_database_returns_default_bounds():
    out = _availability([])
    assert out["pairs"] == {}
    assert out["year_min"] == api.YEAR_MIN
    assert out["year_max"] == api.YEAR_MAX
