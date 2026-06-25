"""Tests for RAG hardening (roadmap A4b): graceful fallback when LightRAG is down.

The production RAG path is ``query_rag_stream`` → ``query_rag`` → OpenAI free-style.
These tests exercise that chain with LightRAG unavailable, and lock the
qualitative-only guardrail so the fallback never fabricates statistics (all
numbers must come from SQL, never from RAG).
"""

from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import httpx

from src.chatbot.i18n import t
from src.chatbot.rag import lightrag_client


class _DownAsyncClient:
    """Stand-in httpx client that simulates an unreachable LightRAG service."""

    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return False

    async def post(self, *args, **kwargs):
        raise httpx.ConnectError("LightRAG unreachable")

    def stream(self, *args, **kwargs):
        raise httpx.ConnectError("LightRAG unreachable")


def _openai_returning(text: str) -> MagicMock:
    msg = MagicMock()
    msg.content = text
    choice = MagicMock()
    choice.message = msg
    resp = MagicMock()
    resp.choices = [choice]
    client = MagicMock()
    client.chat.completions.create = AsyncMock(return_value=resp)
    return client


def test_query_rag_falls_back_to_openai_when_lightrag_down():
    client = _openai_returning("Morocco has a large phosphate sector.")

    async def _run():
        with patch.object(lightrag_client.httpx, "AsyncClient", _DownAsyncClient), \
             patch.object(lightrag_client, "get_openai_client", return_value=client):
            return await lightrag_client.query_rag("tell me about Morocco mining", "en")

    result = asyncio.run(_run())

    assert result == "Morocco has a large phosphate sector."
    client.chat.completions.create.assert_awaited_once()
    # The qualitative-only guardrail must actually reach the model.
    sent = client.chat.completions.create.await_args.kwargs["messages"]
    assert sent[0]["role"] == "system"
    assert "invent" in sent[0]["content"].lower()


def test_query_rag_returns_unavailable_when_both_down():
    client = MagicMock()
    client.chat.completions.create = AsyncMock(side_effect=RuntimeError("OpenAI down"))

    async def _run():
        with patch.object(lightrag_client.httpx, "AsyncClient", _DownAsyncClient), \
             patch.object(lightrag_client, "get_openai_client", return_value=client):
            return await lightrag_client.query_rag("tell me about Morocco mining", "fr")

    result = asyncio.run(_run())

    assert result == t("rag_unavailable", "fr")


def test_stream_falls_back_when_lightrag_down():
    async def _collect():
        with patch.object(lightrag_client.httpx, "AsyncClient", _DownAsyncClient), \
             patch.object(lightrag_client, "query_rag",
                          new=AsyncMock(return_value="Free-style fallback answer.")):
            return [ev.text async for ev in lightrag_client.query_rag_stream("q", "en")]

    tokens = asyncio.run(_collect())

    assert "".join(tokens) == "Free-style fallback answer."


def test_fallback_prompt_enforces_qualitative_only():
    system = lightrag_client._FALLBACK_SYSTEM.lower()
    assert "invent" in system
    assert "statistic" in system
