"""Tests for the clarification flow (roadmap A3).

When the intent classifier is uncertain, the router must return a
``clarify`` turn carrying selectable options — and those fields must survive
serialization through the public ``ChatResponse`` model (the original bug:
Pydantic silently dropped them, so the frontend saw a blank reply).
"""

from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock, MagicMock, patch


def _session():
    from src.chatbot.core.session import Session, UserContext

    return Session(session_id="test-clarify", user=UserContext(), history=[])


def _route(message, clarify_choice=None, pipeline_result=None):
    from src.chatbot.core import hybrid_router

    async def _run():
        with patch.object(hybrid_router, "is_in_scope", new=AsyncMock(return_value=(True, None))), \
             patch.object(hybrid_router, "is_greeting", return_value=False), \
             patch.object(hybrid_router, "get_list_match", return_value=(None, 0.0, None)), \
             patch.object(hybrid_router, "classify_intent",
                          new=AsyncMock(return_value={"intent": "SQL", "confidence": 0.4})), \
             patch.object(hybrid_router, "save_turn", new=MagicMock()), \
             patch.object(hybrid_router, "log_turn", new=AsyncMock()), \
             patch.object(hybrid_router, "run_pipeline",
                          new=AsyncMock(return_value=pipeline_result or {})):
            return await hybrid_router.route(
                message, _session(), clarify_choice=clarify_choice
            )

    return asyncio.run(_run())


def test_low_confidence_triggers_clarification():
    result = _route("tell me about it")

    assert result["intent"] == "clarify"

    options = result["clarify_options"]
    assert isinstance(options, list) and len(options) >= 3
    intents = {o["intent"] for o in options}
    assert {"SQL", "RAG", "LIST", "CHART"}.issubset(intents)
    assert all(o.get("label") for o in options)

    # The original message must round-trip so the UI can re-send it.
    assert result["original_message"] == "tell me about it"
    assert result["original_language"] == "en"
    # A localized prompt must accompany the options (no blank reply).
    assert result["answer"]


def test_clarify_choice_forces_intent_and_skips_clarification():
    # Once the user has picked an option, we must dispatch directly — never
    # clarify again, even though classify_intent would still be low-confidence.
    result = _route(
        "tell me about it",
        clarify_choice="SQL",
        pipeline_result={
            "answer": "42 mines",
            "sql": "SELECT 1",
            "row_count": 1,
            "error": None,
            "from_cache": True,
        },
    )

    assert result["intent"] == "SQL"
    assert result["intent"] != "clarify"
    assert result["answer"] == "42 mines"


def test_chatresponse_preserves_clarify_fields():
    # Regression: the public model previously had no clarify_* fields, so
    # Pydantic dropped them and the frontend received intent="clarify" with
    # no options — a blank reply.
    from src.chatbot.api.app import ChatResponse

    payload = {
        "answer": "What would you like me to do?",
        "language": "en",
        "intent": "clarify",
        "clarify_options": [{"intent": "SQL", "label": "Show me data"}],
        "original_message": "tell me about it",
        "original_language": "en",
        "confidence": 0.4,
        "turn_id": "ignored-extra",  # not on the model — must be tolerated
        "cache_key": None,
    }

    resp = ChatResponse(**payload)

    assert resp.intent == "clarify"
    assert resp.clarify_options == [{"intent": "SQL", "label": "Show me data"}]
    assert resp.original_message == "tell me about it"
    assert resp.original_language == "en"
    assert resp.confidence == 0.4
