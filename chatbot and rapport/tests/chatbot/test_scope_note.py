"""Tests for the global-ranking data-scope guard."""
from __future__ import annotations

import asyncio
from unittest.mock import patch

import pytest

from src.chatbot.core.scope_note import implies_global_ranking
from src.chatbot.handlers import HandlerResult
from src.chatbot.handlers.sql_handler import handle_sql_intent
from src.chatbot.i18n import t


# ---------------------------------------------------------------------------
# Detector
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("message", [
    "What is the global ranking of Arab countries in gold production?",
    "Morocco's world rank in phosphate production",
    "Where does Sudan rank in the world for gold?",
    "Quel est le classement mondial des pays arabes pour l'or ?",
    "Quel est le rang mondial du Maroc en phosphate ?",
    "ما هو الترتيب العالمي للدول العربية في إنتاج الذهب؟",
    "ما هي المرتبة العالمية للمغرب في الفوسفات؟",
])
def test_global_ranking_detected(message):
    assert implies_global_ranking(message)


@pytest.mark.parametrize("message", [
    "Top 5 Arab phosphate producers in 2023",
    "What was Morocco's phosphate production in 2022?",
    "ما هي الصادرات الرئيسية للجزائر؟",
    "Quelle est la production de fer en Mauritanie ?",
    "Compare iron ore production between Algeria and Mauritania",
])
def test_normal_questions_not_flagged(message):
    assert not implies_global_ranking(message)


# ---------------------------------------------------------------------------
# Handler appends the trilingual disclaimer
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("language,message", [
    ("en", "What is the global ranking of Arab countries in gold production?"),
    ("ar", "ما هو الترتيب العالمي للدول العربية في إنتاج الذهب؟"),
    ("fr", "Quel est le classement mondial des pays arabes pour l'or ?"),
])
def test_sql_handler_appends_scope_note(language, message):
    from src.chatbot.core.session import Session, UserContext

    async def fake_pipeline(msg, lang):
        return {
            "answer": "Sudan produced 93.6 tons of gold in 2020.",
            "sql": "SELECT 1",
            "row_count": 1,
            "error": None,
            "from_cache": True,  # skips enrichment + narrator (no LLM calls)
        }

    async def run():
        result = HandlerResult()
        session = Session(session_id="t", user=UserContext())
        with patch("src.chatbot.handlers.sql_handler.run_pipeline", fake_pipeline):
            async for _ in handle_sql_intent(message, session, language, result):
                pass
        return result

    result = asyncio.run(run())
    assert t("global_scope_note", language) in result.answer


def test_sql_handler_no_note_for_normal_question():
    from src.chatbot.core.session import Session, UserContext

    async def fake_pipeline(msg, lang):
        return {
            "answer": "Morocco produced 35M tons of phosphate in 2022.",
            "sql": "SELECT 1",
            "row_count": 1,
            "error": None,
            "from_cache": True,
        }

    async def run():
        result = HandlerResult()
        session = Session(session_id="t", user=UserContext())
        with patch("src.chatbot.handlers.sql_handler.run_pipeline", fake_pipeline):
            async for _ in handle_sql_intent(
                "What was Morocco's phosphate production in 2022?",
                session, "en", result,
            ):
                pass
        return result

    result = asyncio.run(run())
    assert t("global_scope_note", "en") not in result.answer
