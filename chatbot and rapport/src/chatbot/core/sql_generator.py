from __future__ import annotations

import json
import re
from pathlib import Path

from src.chatbot.config import OPENAI_MODEL, get_openai_client

_PROMPTS_DIR = Path(__file__).resolve().parents[3] / "knowledge" / "prompts"
_SYSTEM_PROMPT_TEMPLATE: str = (_PROMPTS_DIR / "system_prompt.txt").read_text(encoding="utf-8")
_FEW_SHOT_RAW: list[dict] = json.loads((_PROMPTS_DIR / "few_shot_examples.json").read_text(encoding="utf-8"))

_FEW_SHOT_BLOCK: str = "\n\n".join(
    f"Q: {ex.get('question_en') or ex.get('question_ar') or ex.get('question_fr')}\nSQL: {ex['sql']}"
    for ex in _FEW_SHOT_RAW
)


async def generate_sql(question: str, schema_context: str, language: str) -> str:
    system_prompt = (
        _SYSTEM_PROMPT_TEMPLATE
        .replace("{{SCHEMA_CONTEXT}}", schema_context)
        .replace("{{FEW_SHOT_EXAMPLES}}", _FEW_SHOT_BLOCK)
    )
    client = get_openai_client()
    response = await client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ],
        temperature=0,
        max_tokens=512,
    )
    raw = response.choices[0].message.content or ""
    return _strip_fences(raw.strip())


def _strip_fences(text: str) -> str:
    text = re.sub(r"^```[a-zA-Z]*\n?", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\n?```$", "", text)
    return text.strip()
