"""Tests for src.reports.insights — covers every rule in build_insights and
build_flag_messages, plus the HHI / linear-forecast helpers in data.py.

These tests never touch the database; they instantiate Pydantic models
directly and assert on the localized (title, body) tuples produced.
"""

from __future__ import annotations

import pytest

from src.reports.data import (
    Flags, HSProduct, Partner, PeerBenchmark, ProductionYear, _hhi, _linear_next,
)
from src.reports.insights import build_flag_messages, build_insights


def _prod(years_values):
    return [ProductionYear(year=y, production_mt=v) for y, v in years_values]


def _partner(name, value=1e9, share=50.0, yoy=10.0):
    return Partner(name=name, value_usd=value, share_pct=share, yoy_pct=yoy)


def _hs(code="2510", desc="Phosphate ore", share=80.0, value=2e9):
    return HSProduct(hs_code=code, description=desc, share_pct=share,
                     export_value_usd=value)


# ─── HHI helper ───────────────────────────────────────────────────────────────
def test_hhi_high():
    assert _hhi([60, 30, 10]) == 60*60 + 30*30 + 10*10  # 4600

def test_hhi_low():
    assert _hhi([20, 20, 20, 20, 20]) == 2000

def test_hhi_empty_returns_none():
    assert _hhi([]) is None


# ─── Linear forecast helper ───────────────────────────────────────────────────
def test_linear_next_growing_series():
    assert _linear_next([10.0, 20.0, 30.0]) == pytest.approx(40.0, abs=0.01)

def test_linear_next_single_point_none():
    assert _linear_next([10.0]) is None

def test_linear_next_negative_clamped_to_zero():
    # Strongly declining series should not project to a negative value.
    assert _linear_next([10.0, 5.0, 1.0]) >= 0.0


# ─── Insight rules ────────────────────────────────────────────────────────────
def _common_args(**over):
    args = dict(
        country="Morocco", mineral="Phosphate",
        production_by_year=[], partners=[], hs_products=[],
        export_value=0, export_value_prev=0,
        year_from=2019, year_to=2023,
        peer=PeerBenchmark(),
        hhi=None, lang="en",
    )
    args.update(over)
    return args


def test_record_output_rule():
    prod = _prod([(2019, 10), (2020, 12), (2021, 15), (2022, 18), (2023, 25)])
    out = build_insights(**_common_args(production_by_year=prod))
    titles = [title for title, _ in out]
    assert any("Record output" in title for title in titles)


def test_production_growth_rule():
    prod = _prod([(2019, 10), (2020, 11), (2021, 12), (2022, 15), (2023, 14)])
    out = build_insights(**_common_args(production_by_year=prod))
    titles = [title for title, _ in out]
    assert any("growth" in title.lower() for title in titles)


def test_production_decline_rule():
    prod = _prod([(2019, 20), (2020, 18), (2021, 15), (2022, 12), (2023, 10)])
    out = build_insights(**_common_args(production_by_year=prod))
    titles = [title for title, _ in out]
    assert any("decline" in title.lower() for title in titles)


def test_top_partner_rule():
    partners = [_partner("India", 5e9, 50.0, 10.0),
                _partner("Brazil", 3e9, 30.0, -5.0),
                _partner("USA",    1e9, 10.0, 2.0)]
    out = build_insights(**_common_args(partners=partners))
    titles = [t for t, _ in out]
    assert any("India" in t for t in titles)


def test_export_trend_rule_grew():
    out = build_insights(**_common_args(export_value=12e9, export_value_prev=10e9))
    assert any("Export revenue trend" in t for t, _ in out)


def test_export_trend_rule_fell():
    out = build_insights(**_common_args(export_value=8e9, export_value_prev=10e9))
    found = [b for t, b in out if "Export revenue trend" in t]
    assert found and ("fell" in found[0] or "20" in found[0])


def test_hs_composition_rule():
    out = build_insights(**_common_args(hs_products=[_hs(), _hs("3104", "Potassium")]))
    assert any("composition" in t.lower() for t, _ in out)


def test_peer_benchmark_rule():
    peer = PeerBenchmark(country_yoy_pct=12.0, region_yoy_pct=4.0)
    prod = _prod([(2022, 10), (2023, 11.2)])
    out = build_insights(**_common_args(production_by_year=prod, peer=peer))
    assert any("Peer benchmarking" in t for t, _ in out)


def test_hhi_high_flagged_in_insights():
    out = build_insights(**_common_args(hhi=3000))
    found = [b for t, b in out if "HHI" in t or "concentration" in t.lower()]
    assert found and ("HIGH" in found[0] or "2500" in found[0])


def test_hhi_low_in_insights():
    out = build_insights(**_common_args(hhi=900))
    found = [b for t, b in out if "concentration" in t.lower()]
    assert found and "low" in found[0].lower()


def test_no_data_fallback():
    out = build_insights(**_common_args())  # everything empty
    assert any("No data" in t for t, _ in out)


def test_localization_french():
    prod = _prod([(2019, 10), (2023, 25)])
    out = build_insights(**_common_args(production_by_year=prod, lang="fr"))
    titles = " ".join(t for t, _ in out)
    assert "record" in titles.lower() or "production" in titles.lower()


def test_localization_arabic_renders():
    prod = _prod([(2019, 10), (2023, 25)])
    out = build_insights(**_common_args(production_by_year=prod, lang="ar"))
    # Must produce at least one bullet; AR strings include shaped/reshaped text
    assert len(out) >= 1
    titles = " ".join(t for t, _ in out)
    assert any(ord(ch) > 127 for ch in titles)  # contains non-ASCII (Arabic)


# ─── Flag messages ────────────────────────────────────────────────────────────
def test_flag_concentration_message():
    partners = [_partner("A", share=40), _partner("B", share=25),
                _partner("C", share=20)]  # top-3 = 85%
    flags = Flags(concentration=True)
    msgs = build_flag_messages(flags, partners, lang="en")
    assert any("Concentration" in m for _, _, m in msgs)


def test_flag_contraction_message():
    msgs = build_flag_messages(Flags(contraction=True), [], lang="en")
    assert any("contraction" in m.lower() for _, _, m in msgs)


def test_flag_emerging_partners():
    flags = Flags(emerging_partners=["Vietnam", "Kenya"])
    msgs = build_flag_messages(flags, [], lang="en")
    assert any("Vietnam" in m for _, _, m in msgs)


def test_flag_none_when_empty():
    msgs = build_flag_messages(Flags(), [], lang="en")
    assert msgs == []
