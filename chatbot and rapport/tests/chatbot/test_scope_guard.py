from __future__ import annotations

import pytest

from src.chatbot.core.scope_guard import (
    _GREETING_MATCHER,
    _contains_fragment,
    _keyword_verdict,
)


@pytest.mark.parametrize("message", [
    "world cup",
    "who won the world cup",
    "before the match",
    "tell me more",
])
def test_keyword_verdict_ignores_short_fragment_substrings(message):
    assert _keyword_verdict(message) is None


@pytest.mark.parametrize("message", [
    "what is the price of gold",
    "prix de l'or",
    "iron ore reserves",
    "production de l'or au maroc",
    "سعر الذهب اليوم",
    "الإنتاج",
])
def test_keyword_verdict_accepts_legitimate_on_topic_keywords(message):
    assert _keyword_verdict(message) is True


@pytest.mark.parametrize("message", [
    "i love football",
    "give me a recipe",
    "tell me a joke",
])
def test_keyword_verdict_rejects_off_topic_keywords(message):
    assert _keyword_verdict(message) is False


@pytest.mark.parametrize(("message", "expected"), [
    ("which movie is best", False),
    ("hello there", True),
])
def test_greeting_matcher_does_not_leak_through_substrings(message, expected):
    assert _contains_fragment(message.lower(), _GREETING_MATCHER) is expected
