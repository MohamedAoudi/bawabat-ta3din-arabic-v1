from __future__ import annotations

import asyncio
import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import src.chatbot.config as config

logger = logging.getLogger(__name__)

EVAL_LOG_PATH: Path = Path(config.EVAL_LOG_PATH)


def _write_line(record: dict) -> None:
    try:
        EVAL_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with EVAL_LOG_PATH.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(record, ensure_ascii=False) + "\n")
    except Exception as exc:
        logger.warning("Failed to write eval log entry: %s", exc, exc_info=True)


async def log_turn(
    session_id: str,
    message: str,
    intent: str,
    answer: str,
    language: str,
    turn_id: Optional[str] = None,
    row_count: Optional[int] = None,
    user_type: Optional[str] = None,
    sector_interest: Optional[str] = None,
    country: Optional[str] = None,
) -> None:
    record: dict = {
        "type": "turn",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "turn_id": turn_id,
        "session_id": session_id,
        "message": message,
        "intent": intent,
        "answer": answer,
        "language": language,
        "row_count": row_count,
        "user_type": user_type,
        "sector_interest": sector_interest,
        "country": country,
    }
    try:
        await asyncio.to_thread(_write_line, record)
    except Exception as exc:
        logger.warning("log_turn failed: %s", exc, exc_info=True)


async def log_feedback(
    turn_id: str,
    feedback: str,
    session_id: Optional[str] = None,
) -> None:
    record: dict = {
        "type": "feedback",
        "turn_id": turn_id,
        "feedback": feedback,
        "session_id": session_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    try:
        await asyncio.to_thread(_write_line, record)
    except Exception as exc:
        logger.warning("log_feedback failed: %s", exc, exc_info=True)
