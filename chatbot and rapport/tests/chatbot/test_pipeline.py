import pytest
from src.chatbot.core.pipeline import detect_language


def test_detects_arabic():
    assert detect_language("كم عدد الشركات في المغرب؟") == "ar"


def test_detects_french():
    assert detect_language("Combien de entreprises sont dans le secteur ?") == "fr"


def test_detects_english():
    assert detect_language("How many companies are in Morocco?") == "en"


def test_arabic_takes_priority_over_french_keywords():
    # Message has Arabic characters — should be ar regardless
    assert detect_language("combien شركة") == "ar"


def test_defaults_to_english():
    assert detect_language("xyz unknown language tokens 123") == "en"
