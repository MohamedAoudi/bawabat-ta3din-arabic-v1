import pytest

from src.chatbot.core.chart_handler import (
    _build_spec,
    _classify_intent,
    _contains_any,
    _detect_entities,
    _COUNTRIES,
    _MINERALS,
)
from src.chatbot.guardrails.sql_validator import validate_sql


CASES = [
    ("show me a bar chart of phosphate production by country", "en", "top_producers"),
    ("line chart of Morocco phosphate production from 2015 to 2022", "en", "production_trend"),
    ("arab vs world phosphate production chart", "en", "production_vs_world"),
    ("bar chart of Egypt exports by product in 2020", "en", "trade_by_product"),
    ("trade trend chart for Morocco over time", "en", "trade_trend"),
    ("donut chart of Morocco trade partners 2017", "en", "bilateral_partner_breakdown"),
    ("country trade summary chart for Morocco", "en", "country_trade_summary"),
    ("price chart of gold", "en", "price_trend"),
    ("data quality issues chart", "en", "data_quality_summary"),
    ("graphique à barres de la production de phosphate par pays", "fr", "top_producers"),
    ("مخطط أعمدة لإنتاج الفوسفات حسب الدولة", "ar", "top_producers"),
]


@pytest.mark.parametrize("message,language,expected_intent", CASES)
def test_chart_sql_is_valid_and_repointed(message, language, expected_intent):
    spec = _build_spec(message, language)
    assert spec.intent == expected_intent
    ok, reason = validate_sql(spec.sql)
    assert ok, f"{spec.intent}: {reason}"
    assert "minerals." not in spec.sql.lower()
    assert "mart_" not in spec.sql.lower()


@pytest.mark.parametrize("message,language,_", CASES)
def test_chart_sql_references_only_public(message, language, _):
    spec = _build_spec(message, language)
    assert "public." in spec.sql or "WHERE 1 = 0" in spec.sql


# Roadmap A5 — these used to mis-route to top_producers because the word-boundary
# matcher missed Arabic proclitic prefixes ("لشركاء") and French plurals
# ("partenaires"). They must now reach the correct chart sub-type.
A5_ROUTING_CASES = [
    ("chart of Morocco trade partenaires 2017", "fr", "bilateral_partner_breakdown"),
    ("graphique des partenaires commerciaux du Maroc", "fr", "bilateral_partner_breakdown"),
    ("مخطط لشركاء تجارة المغرب 2017", "ar", "bilateral_partner_breakdown"),
    ("مخطط وصادرات المغرب 2020", "ar", "trade_by_product"),
    ("تطور أسعار الذهب", "ar", "price_trend"),
]


@pytest.mark.parametrize("message,language,expected_intent", A5_ROUTING_CASES)
def test_proclitic_and_plural_routing(message, language, expected_intent):
    assert _classify_intent(message) == expected_intent
    # The corrected sub-type must also produce valid, public-schema SQL.
    spec = _build_spec(message, language)
    ok, reason = validate_sql(spec.sql)
    assert ok, f"{spec.intent}: {reason}"


def test_arabic_proclitic_entity_detection():
    # "بالمغرب" = "in Morocco" (ب proclitic); "وللفوسفات" = "and for phosphate".
    assert _detect_entities("انتاج بالمغرب", _COUNTRIES) == ["Morocco"]
    assert _detect_entities("وللفوسفات", _MINERALS) == ["phosphate"]


def test_proclitic_tolerance_avoids_false_positives():
    # "اقطار" (regions) must NOT be detected as Qatar ("قطر"); the proclitic
    # prefix is anchored at a word start, not an arbitrary substring.
    assert "Qatar" not in _detect_entities("اقطار عربية", _COUNTRIES)
    # The plural-"s" tolerance must not break the ASCII word boundary.
    assert not _contains_any("a barrel of oil", ["bar"])
    assert _contains_any("show me the bars", ["bar"])
