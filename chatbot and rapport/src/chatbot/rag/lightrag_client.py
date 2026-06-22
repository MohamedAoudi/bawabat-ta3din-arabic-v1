from __future__ import annotations

import json
import logging
from typing import AsyncGenerator

import httpx

from src.chatbot.config import LIGHTRAG_BASE_URL, LIGHTRAG_MODE, LIGHTRAG_TIMEOUT, OPENAI_MODEL, get_openai_client
from src.chatbot.core.events import TokenEvent
from src.chatbot.i18n import t

logger = logging.getLogger(__name__)

_FALLBACK_SYSTEM = (
    "You are a helpful assistant for AMIP, the Arab Mining Indicators Portal, "
    "covering mining and minerals data for 21 Arab countries. "
    "Answer the user's question clearly and concisely based on your knowledge. "
    "If you don't know, say so honestly."
)


def _query_endpoint() -> str:
    return f"{LIGHTRAG_BASE_URL}/query"


def _build_payload(
    message: str,
    language: str,
    history: list[dict] | None,
    stream: bool = False,
) -> dict:
    lang_instruction = t("rag_lang_instruction", language)

    conversation_history = None
    if history:
        recent = history[-4:]
        conversation_history = [
            {"role": turn["role"], "content": turn["content"]}
            for turn in recent
            if turn.get("content")
        ]

    payload: dict = {
        "query": message,
        "mode": LIGHTRAG_MODE,
        "user_prompt": (
            f"You are a helpful data assistant for AMIP, the Arab Mining Indicators Portal, "
            f"covering mining and minerals data for 21 Arab countries. {lang_instruction} "
            f"If the context does not contain enough information, say so briefly."
        ),
        "conversation_history": conversation_history,
        "include_references": False,
        "response_type": "Multiple Paragraphs",
        "top_k": 50,
    }
    if stream:
        payload["stream"] = True
    return payload


async def _openai_fallback(message: str, language: str, history: list[dict] | None) -> str:
    lang_instruction = t("rag_lang_instruction", language)
    messages = [{"role": "system", "content": f"{_FALLBACK_SYSTEM} {lang_instruction}"}]
    if history:
        for turn in history[-4:]:
            if turn.get("content"):
                messages.append({"role": turn["role"], "content": turn["content"]})
    messages.append({"role": "user", "content": message})
    client = get_openai_client()
    response = await client.chat.completions.create(
        model=OPENAI_MODEL,
        temperature=0.3,
        max_tokens=1024,
        messages=messages,
    )
    return response.choices[0].message.content.strip()


async def query_rag(message: str, language: str, history: list[dict] | None = None) -> str:
    payload = _build_payload(message, language, history)
    try:
        async with httpx.AsyncClient(timeout=LIGHTRAG_TIMEOUT) as client:
            response = await client.post(_query_endpoint(), json=payload)
            response.raise_for_status()
            data = response.json()

        answer: str = (data.get("response") or data.get("answer") or "").strip()
        if "### References" in answer:
            answer = answer.split("### References")[0].strip()

        return answer or t("rag_empty", language)

    except (httpx.TimeoutException, httpx.ConnectError):
        logger.warning("[RAG] LightRAG unavailable, falling back to OpenAI")
        try:
            return await _openai_fallback(message, language, history)
        except Exception as exc2:
            logger.error("[RAG FALLBACK ERROR] %s", exc2)
            return t("rag_unavailable", language)
    except Exception as exc:
        logger.error("[RAG ERROR] %s", exc)
        try:
            return await _openai_fallback(message, language, history)
        except Exception as exc2:
            logger.error("[RAG FALLBACK ERROR] %s", exc2)
            return t("rag_unavailable", language)


async def query_rag_stream(
    message: str,
    language: str,
    history: list[dict] | None = None,
) -> AsyncGenerator[TokenEvent, None]:
    payload = _build_payload(message, language, history, stream=True)
    stream_probe_timeout = min(5.0, LIGHTRAG_TIMEOUT)
    try:
        async with httpx.AsyncClient(timeout=stream_probe_timeout) as client:
            async with client.stream("POST", _query_endpoint(), json=payload) as response:
                response.raise_for_status()
                content_type = response.headers.get("content-type", "")

                if "text/event-stream" in content_type:
                    async for line in response.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        data_str = line[6:].strip()
                        if not data_str or data_str == "[DONE]":
                            continue
                        try:
                            data = json.loads(data_str)
                            text = data.get("response") or data.get("text") or ""
                            if text:
                                yield TokenEvent(text)
                        except json.JSONDecodeError:
                            if data_str:
                                yield TokenEvent(data_str + " ")
                else:
                    async for line in response.aiter_lines():
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            data = json.loads(line)
                            text = data.get("response") or data.get("text") or ""
                            if text:
                                yield TokenEvent(text)
                        except json.JSONDecodeError:
                            yield TokenEvent(line + " ")

    except Exception as exc:
        logger.warning("[RAG STREAM] Falling back (%s: %s)", type(exc).__name__, exc)
        try:
            answer = await query_rag(message, language, history)
            if answer:
                yield TokenEvent(answer)
        except Exception as exc2:
            logger.warning("[RAG STREAM] All fallbacks failed: %s", exc2, exc_info=True)
            yield TokenEvent(t("rag_unavailable", language))
