"""RAG intent handler."""
from __future__ import annotations

import logging
from typing import AsyncIterator

from src.chatbot.core.events import Event, StageEvent
from src.chatbot.handlers import HandlerResult
from src.chatbot.rag.lightrag_client import query_rag_stream

logger = logging.getLogger(__name__)

_NO_RESULT: dict[str, str] = {
    "en": "No relevant information was found for your question.",
    "fr": "Aucune information pertinente n'a été trouvée pour votre question.",
    "ar": "لم يتم العثور على معلومات ذات صلة لسؤالك.",
}


async def handle_rag_intent(
    message: str,
    language: str,
    history: list,
    result: HandlerResult,
) -> AsyncIterator[Event]:
    """Stream RAG tokens and store the assembled answer in *result*."""
    yield StageEvent("querying_rag")

    assembled: list[str] = []
    async for tok in query_rag_stream(message, language, history=history):
        yield tok
        assembled.append(tok.text)

    raw = "".join(assembled)
    if "### References" in raw:
        raw = raw.split("### References")[0]

    result.answer = raw.strip() or _NO_RESULT.get(language, _NO_RESULT["en"])
