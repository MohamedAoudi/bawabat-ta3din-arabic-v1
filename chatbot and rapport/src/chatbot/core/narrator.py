from __future__ import annotations

from typing import AsyncGenerator

from src.chatbot.config import OPENAI_MODEL, get_openai_client
from src.chatbot.core.events import TokenEvent

_SYSTEM_PROMPT = """\
You are a senior minerals industry analyst for AMIP, the Arab Mining Indicators Portal,
covering 21 Arab countries and a wide range of minerals (phosphate, iron ore, gold,
copper, zinc, and more).

You will be given:
  - A user's question
  - The SQL query used to answer it
  - The data answer already formatted for the user

Your task is to write ONE short business-insight sentence (max 25 words) that
gives the numbers mineral-industry meaning — a trend, regional positioning, implication,
or comparison that helps an analyst or decision-maker act on the data.

Rules:
  - Write in the same language as the data answer provided
  - Do not repeat the numbers already in the answer — add interpretation
  - Start with a connector like "This suggests", "Notably", "This indicates",
    "Ce résultat indique", "يشير هذا", etc.
  - If the data is too limited to draw a meaningful insight, respond with
    exactly: NO_INSIGHT
  - Use real units (tonnes, m³, USD); never write internal column names or the
    phrase "base unit"

Tailor the insight to the user type:
  - "identified" → focus on actionable intelligence for analysts and researchers
  - "admin"      → focus on data completeness, coverage, and portal performance
  - "anonymous"  → write a neutral mineral-industry observation\
"""

_USER_PROMPT_TEMPLATE = """\
Question: {question}
User type: {user_type}

SQL used:
{sql}

Formatted answer:
{answer}

Write a single mineral-industry insight sentence to append after the answer above.\
"""

_MIN_ANSWER_LENGTH: int = 20


async def narrate_stream(
    question: str,
    sql: str,
    answer: str,
    row_count: int,
    language: str,
    user_type: str = "anonymous",
    from_cache: bool = False,
) -> AsyncGenerator[TokenEvent, None]:
    if from_cache or row_count == 0 or len(answer.strip()) < _MIN_ANSWER_LENGTH:
        return

    user_prompt = _USER_PROMPT_TEMPLATE.format(
        question=question, user_type=user_type, sql=sql, answer=answer
    )

    try:
        client = get_openai_client()
        stream = await client.chat.completions.create(
            model=OPENAI_MODEL,
            temperature=0,
            max_tokens=60,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            stream=True,
        )
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield TokenEvent(chunk.choices[0].delta.content)
    except Exception:
        return
