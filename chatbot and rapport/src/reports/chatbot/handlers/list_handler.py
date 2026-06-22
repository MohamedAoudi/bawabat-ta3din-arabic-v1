"""LIST intent handler with RAG fallback."""
from __future__ import annotations

import logging
from typing import AsyncIterator

from src.chatbot.core.events import Event, StageEvent
from src.chatbot.handlers import HandlerResult
from src.chatbot.handlers.rag_handler import handle_rag_intent
from src.chatbot.list_bot.handler import handle_list

logger = logging.getLogger(__name__)


async def handle_list_intent(
    message: str,
    language: str,
    history: list,
    result: HandlerResult,
) -> AsyncIterator[Event]:
    """Try the static list KB; fall back to RAG if no match."""
    yield StageEvent("matching_kb")

    list_answer = handle_list(message, language)

    if list_answer is None:
        # Upgrade to RAG — delegate to the RAG handler
        async for event in handle_rag_intent(message, language, history, result):
            yield event
    else:
        result.answer = list_answer
