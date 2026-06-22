from __future__ import annotations

from typing import AsyncGenerator

from src.chatbot.config import OPENAI_MODEL, get_openai_client
from src.chatbot.i18n import t

_LANG_NAMES: dict[str, str] = {"ar": "Arabic", "fr": "French", "en": "English"}


def _build_messages(question: str, sql: str, result: dict, language: str) -> tuple[str, str]:
    columns = result["columns"]
    rows = result["rows"]
    header = " | ".join(columns)
    separator = "-" * len(header)
    data_lines = [" | ".join(str(v) for v in row) for row in rows[:50]]
    data_block = "\n".join([header, separator] + data_lines)

    truncation_note = ""
    if result.get("truncated"):
        truncation_note = t("truncation_note", language, n=result["row_count"])

    lang_name = _LANG_NAMES.get(language, "English")
    system_msg = (
        f"You are a data reporting assistant for AMIP, the Arab Mining Indicators Portal. "
        f"Answer in {lang_name}. "
        f"Summarise the SQL query result below into a clear, concise natural-language answer "
        f"for a minerals industry analyst. Be direct — do not repeat the SQL or column names unnecessarily. "
        f"If numbers are large, format them with thousands separators. "
        f"Use bold for key figures and bullet points for lists of countries or minerals."
    )
    user_msg = f"Question: {question}\n\nQuery result:\n{data_block}"
    if truncation_note:
        user_msg += f"\n\n{truncation_note}"
    return system_msg, user_msg


async def format_answer(question: str, sql: str, result: dict, language: str) -> str:
    if result.get("row_count", 0) == 0:
        return t("no_data", language)

    system_msg, user_msg = _build_messages(question, sql, result, language)
    client = get_openai_client()
    response = await client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.3,
        max_tokens=512,
    )
    return (response.choices[0].message.content or "").strip()


async def format_answer_stream(
    question: str, sql: str, result: dict, language: str
) -> AsyncGenerator[str, None]:
    if result.get("row_count", 0) == 0:
        yield t("no_data", language)
        return

    system_msg, user_msg = _build_messages(question, sql, result, language)
    client = get_openai_client()
    stream = await client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.3,
        max_tokens=512,
        stream=True,
    )
    async for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
