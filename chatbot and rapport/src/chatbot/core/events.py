"""Typed event protocol for SSE streaming responses.

Four event types cover the full chatbot pipeline:
  StageEvent  — progress signals at each orchestrator step
  TokenEvent  — a single LLM-generated text chunk
  DoneEvent   — final payload (same shape as sync ChatResponse)
  ErrorEvent  — graceful failure mid-stream

Wire format produced by to_sse():
  event: <name>
  data: <json>

  (two trailing newlines as required by SSE spec)
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from typing import Union


@dataclass
class StageEvent:
    """Progress signal emitted at each pipeline stage.

    Known stage names:
      classifying, scope_check, intent_detected,
      generating_sql, running_sql, cache_hit,
      narrating, querying_rag, matching_kb, running_chart
    """

    stage: str
    data: dict | None = None


@dataclass
class TokenEvent:
    """A chunk of LLM-generated text (narrator or RAG)."""

    text: str


@dataclass
class DoneEvent:
    """Final payload — same key/value shape as the sync ChatResponse dict."""

    payload: dict


@dataclass
class ErrorEvent:
    """Graceful failure signal emitted before closing the stream."""

    error: str
    message: str


Event = Union[StageEvent, TokenEvent, DoneEvent, ErrorEvent]

_EVENT_NAMES: dict[type, str] = {
    StageEvent: "stage",
    TokenEvent: "token",
    DoneEvent: "done",
    ErrorEvent: "error",
}


def _json_default(value):
    if isinstance(value, Decimal):
        return int(value) if value == value.to_integral_value() else float(value)
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    raise TypeError(f"Object of type {value.__class__.__name__} is not JSON serializable")


def to_sse(event: Event) -> str:
    """Serialize an Event to SSE wire format.

    Returns a string of the form:
        event: <name>\\ndata: <json>\\n\\n
    """
    event_name = _EVENT_NAMES[type(event)]

    if isinstance(event, StageEvent):
        d: dict = {"stage": event.stage}
        if event.data:
            d.update(event.data)
    elif isinstance(event, TokenEvent):
        d = {"text": event.text}
    elif isinstance(event, DoneEvent):
        d = event.payload
    else:  # ErrorEvent
        d = {"error": event.error, "message": event.message}

    return f"event: {event_name}\ndata: {json.dumps(d, ensure_ascii=False, default=_json_default)}\n\n"
