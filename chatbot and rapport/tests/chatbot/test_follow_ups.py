"""
Unit tests for the AMIP follow-up suggestion engine.

All tests are offline — no DB, no OpenAI calls.
"""
import pytest
from src.chatbot.core.follow_ups import suggest_follow_ups, _normalize


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _chart(chart_intent, filters=None, chart_type="bar", lang="en"):
    return suggest_follow_ups(
        intent="CHART",
        language=lang,
        chart_intent=chart_intent,
        filters_used=filters or {},
        chart_type=chart_type,
    )


# ---------------------------------------------------------------------------
# Core contract
# ---------------------------------------------------------------------------

class TestContract:
    def test_always_returns_list(self):
        result = _chart("top_producers", {"year": 2023, "mineral": "phosphate"})
        assert isinstance(result, list)

    def test_max_three(self):
        for intent in ["CHART", "SQL", "RAG", "LIST", "GREETING", "REFUSED"]:
            result = suggest_follow_ups(intent=intent, language="en", message="hello")
            assert len(result) <= 3, f"Too many suggestions for intent={intent}"

    def test_refused_returns_empty(self):
        assert suggest_follow_ups(intent="REFUSED", language="en") == []

    def test_error_intent_returns_empty(self):
        assert suggest_follow_ups(intent="ERROR", language="en") == []

    def test_no_duplicates(self):
        result = _chart("top_producers", {"year": 2023, "mineral": "phosphate"})
        norms = [_normalize(q) for q in result]
        assert len(norms) == len(set(norms))

    def test_none_language_defaults_to_en(self):
        result = suggest_follow_ups(intent="GREETING", language=None)
        assert len(result) > 0
        # en suggestions contain latin text
        assert all(any(c.isascii() and c.isalpha() for c in q) for q in result)


# ---------------------------------------------------------------------------
# Determinism
# ---------------------------------------------------------------------------

class TestDeterminism:
    def test_same_input_same_output(self):
        filters = {"year": 2023, "mineral": "phosphate"}
        a = _chart("top_producers", filters)
        b = _chart("top_producers", filters)
        assert a == b

    def test_different_mineral_different_swap(self):
        a = _chart("top_producers", {"year": 2023, "mineral": "phosphate"})
        b = _chart("top_producers", {"year": 2023, "mineral": "gold"})
        assert a != b

    def test_different_intent_different_output(self):
        f = {"year": 2023, "mineral": "phosphate", "country": "Morocco"}
        a = _chart("top_producers", f)
        b = _chart("production_trend", f)
        assert a != b


# ---------------------------------------------------------------------------
# CHART suggestions: all 7 intents produce non-empty output
# ---------------------------------------------------------------------------

CHART_INTENTS = [
    ("top_producers",             {"year": 2023, "mineral": "phosphate"}),
    ("production_trend",          {"country": "Morocco", "mineral": "phosphate", "year_from": 2015, "year_to": 2022}),
    ("production_vs_world",       {"year": 2022, "mineral": "phosphate"}),
    ("trade_trend",               {"country": "Morocco"}),
    ("trade_by_product",          {"year": 2023, "country": "Egypt"}),
    ("bilateral_partner_breakdown", {"year": 2022, "country": "Morocco"}),
    ("country_trade_summary",     {"country": "United Arab Emirates"}),
]

@pytest.mark.parametrize("chart_intent,filters", CHART_INTENTS)
def test_chart_intent_has_suggestions(chart_intent, filters):
    result = _chart(chart_intent, filters)
    assert len(result) >= 1, f"No follow-ups for chart_intent={chart_intent}"


# ---------------------------------------------------------------------------
# No-data recovery
# ---------------------------------------------------------------------------

class TestNoDataRecovery:
    def test_no_data_still_suggests_populated(self):
        # Somalia gold has no rows — the engine should still return non-empty
        result = _chart(
            "production_trend",
            {"country": "Somalia", "mineral": "gold", "year_from": 2014, "year_to": 2020},
            chart_type="table",
        )
        assert len(result) >= 1

    def test_price_trend_redirects_to_data(self):
        result = _chart("price_trend", {})
        assert len(result) >= 1
        # Should steer user toward something that works
        assert any("phosphate" in q.lower() or "chart" in q.lower() for q in result)

    def test_data_quality_redirects(self):
        result = _chart("data_quality_summary", {})
        assert len(result) >= 1


# ---------------------------------------------------------------------------
# Trilingual output
# ---------------------------------------------------------------------------

class TestTrilingual:
    def test_ar_uses_arabic_chart_keywords(self):
        result = _chart("top_producers", {"year": 2023, "mineral": "phosphate"}, lang="ar")
        assert any("مبيان" in q or "مخطط" in q or "جدول" in q for q in result)

    def test_fr_uses_french_chart_keywords(self):
        result = _chart("top_producers", {"year": 2023, "mineral": "phosphate"}, lang="fr")
        assert any("graphique" in q.lower() or "tableau" in q.lower() for q in result)

    def test_en_suggestions_contain_chart_type_word(self):
        result = _chart("top_producers", {"year": 2023, "mineral": "phosphate"}, lang="en")
        assert any("chart" in q.lower() or "table" in q.lower() for q in result)

    def test_ar_no_english_chart_words(self):
        result = _chart("bilateral_partner_breakdown", {"year": 2022, "country": "Morocco"}, lang="ar")
        for q in result:
            assert "chart" not in q.lower(), f"English 'chart' leaked into AR: {q}"
            assert "bar" not in q.lower(), f"English 'bar' leaked into AR: {q}"

    @pytest.mark.parametrize("lang", ["en", "fr", "ar"])
    def test_greeting_all_languages(self, lang):
        result = suggest_follow_ups(intent="GREETING", language=lang)
        assert 1 <= len(result) <= 3


# ---------------------------------------------------------------------------
# SQL and RAG / LIST
# ---------------------------------------------------------------------------

class TestNonChartIntents:
    def test_sql_with_entities_produces_chart_suggestions(self):
        result = suggest_follow_ups(
            intent="SQL", language="en",
            message="how much phosphate did Morocco produce in 2022",
        )
        assert len(result) >= 1
        assert any("chart" in q.lower() for q in result)

    def test_rag_country_message_suggests_data_pivot(self):
        result = suggest_follow_ups(
            intent="RAG", language="en",
            message="Tell me about Morocco's mining sector",
        )
        assert len(result) >= 1

    def test_list_no_entity_falls_back_to_starters(self):
        result = suggest_follow_ups(intent="LIST", language="en", message="what is amip")
        assert len(result) >= 1

    def test_sql_no_entity_falls_back_to_starters(self):
        result = suggest_follow_ups(intent="SQL", language="en", message="help")
        assert len(result) >= 1


# ---------------------------------------------------------------------------
# Suggestion text quality: no blanks, no raw None
# ---------------------------------------------------------------------------

class TestTextQuality:
    @pytest.mark.parametrize("intent,message", [
        ("CHART", ""),
        ("SQL",   "show me production data"),
        ("RAG",   "explain phosphate"),
        ("GREETING", ""),
    ])
    def test_no_blank_or_none_suggestions(self, intent, message):
        result = suggest_follow_ups(intent=intent, language="en", message=message)
        for q in result:
            assert q and q.strip(), f"Blank suggestion returned for {intent}"
            assert "None" not in q, f"'None' leaked into suggestion: {q}"
