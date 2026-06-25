from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock, MagicMock, patch


def test_classifier_error_routes_obvious_production_question_to_sql():
    from src.chatbot.core.session import Session, UserContext
    from src.chatbot.router.intent_classifier import classify_intent

    session = Session(session_id="test", user=UserContext(), history=[])
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(side_effect=RuntimeError("model missing"))

    async def _run():
        with patch("src.chatbot.router.intent_classifier.get_openai_client", return_value=mock_client):
            return await classify_intent("what is gold production quantity in 2023 ?", session)

    result = asyncio.run(_run())

    assert result["intent"] == "SQL"
    assert result["confidence"] >= 0.75


def test_classifier_error_preserves_chart_priority():
    from src.chatbot.core.session import Session, UserContext
    from src.chatbot.router.intent_classifier import classify_intent

    session = Session(session_id="test", user=UserContext(), history=[])
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(side_effect=RuntimeError("model missing"))

    async def _run():
        with patch("src.chatbot.router.intent_classifier.get_openai_client", return_value=mock_client):
            return await classify_intent("show me a chart of gold production in 2023", session)

    result = asyncio.run(_run())

    assert result["intent"] == "CHART"


def test_classifier_error_routes_descriptive_arabic_mineral_comparison_to_rag():
    from src.chatbot.core.session import Session, UserContext
    from src.chatbot.router.intent_classifier import classify_intent

    session = Session(session_id="test", user=UserContext(), history=[])
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(side_effect=RuntimeError("model missing"))

    async def _run():
        with patch("src.chatbot.router.intent_classifier.get_openai_client", return_value=mock_client):
            return await classify_intent("اريد مقارنة بين معدن الدهي و الفضة", session)

    result = asyncio.run(_run())

    assert result["intent"] == "RAG"
    assert result["confidence"] >= 0.75


def test_classifier_error_keeps_measured_comparison_in_sql():
    from src.chatbot.core.session import Session, UserContext
    from src.chatbot.router.intent_classifier import classify_intent

    session = Session(session_id="test", user=UserContext(), history=[])
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(side_effect=RuntimeError("model missing"))

    async def _run():
        with patch("src.chatbot.router.intent_classifier.get_openai_client", return_value=mock_client):
            return await classify_intent("قارن إنتاج الفوسفات والفضة في 2023", session)

    result = asyncio.run(_run())

    assert result["intent"] == "SQL"
