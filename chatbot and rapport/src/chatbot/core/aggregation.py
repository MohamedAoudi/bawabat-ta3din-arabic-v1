"""
Aggregation handler for the AMIP Chatbot.

Sequential enrichment: after the first SQL query result, ask the LLM whether
a follow-up query is needed. If yes, execute it and synthesize both results
into a combined narrative. Caps at 2 queries total.
"""

from __future__ import annotations

import json

from src.chatbot.config import get_openai_client
from src.chatbot.core.schema_context import get_schema_for_question


def format_result_preview(result: dict, max_rows: int = 10) -> str:
    """Format a SQL result dict for LLM consumption."""
    columns = result.get("columns", [])
    rows = result.get("rows", [])[:max_rows]

    if not columns or not rows:
        answer = result.get("answer", "")
        if answer:
            return answer
        return "(empty result)"

    header = " | ".join(str(c) for c in columns)
    lines = [header, "-" * len(header)]
    for row in rows:
        lines.append(" | ".join(str(v) for v in row))

    total = len(result.get("rows", []))
    if total > max_rows:
        lines.append(f"... ({total - max_rows} more rows)")

    return "\n".join(lines)


def chunk_text(text: str, chunk_size: int = 20) -> list[str]:
    """Split text into chunks for streaming, breaking at word boundaries."""
    words = text.split()
    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    for word in words:
        current.append(word)
        current_len += len(word) + 1
        if current_len >= chunk_size:
            chunks.append(" ".join(current) + " ")
            current = []
            current_len = 0

    if current:
        chunks.append(" ".join(current))

    return chunks


async def needs_enrichment(
    original_question: str,
    first_sql: str,
    first_result: dict,
    language: str,
) -> dict:
    """
    Ask the LLM whether the first query fully answers the original question.

    Returns:
        {
            "needs_followup": True/False,
            "followup_sql": "SELECT ..." or None,
            "reason": "..."
        }
    """
    client = get_openai_client()
    result_preview = format_result_preview(first_result, max_rows=10)
    schema_context = get_schema_for_question(original_question)

    prompt = f"""You are a BI analyst assistant. The user asked a question and we ran one SQL query.
Determine if the answer is COMPLETE or if a FOLLOW-UP query is needed.

ORIGINAL QUESTION: {original_question}

SQL QUERY EXECUTED:
{first_sql}

QUERY RESULT:
{result_preview}

DATABASE SCHEMA (for follow-up query generation):
{schema_context}

RULES FOR FOLLOW-UP QUERIES:
- Always SET search_path TO warehouse, public
- Always status = 'active' (never 'publish')
- Always full Arabic country names
- Join on date_id not time_id
- For view counts use COUNT(*) FROM fact_views, not SUM(view_count)
- Aggregate tables are empty, query fact tables directly

Respond in JSON only (no markdown, no backticks):
{{
    "needs_followup": true or false,
    "reason": "brief explanation",
    "followup_sql": "SELECT ... (only if needs_followup is true, otherwise null)"
}}

A follow-up is needed ONLY if:
- The user asked for a COMPARISON but we only queried one dimension
- The user asked for TREND/GROWTH but we only have a snapshot
- The user asked about MULTIPLE metrics but we only computed one
- The user asked for RANKING across multiple criteria

A follow-up is NOT needed if:
- The question is simple and fully answered (count, list, single metric)
- The result already contains all requested dimensions
- The question is a RAG/knowledge question (not SQL)

Be conservative — most questions do NOT need a follow-up. Only return needs_followup: true when the gap is clear."""

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=500,
    )

    text = response.choices[0].message.content.strip()
    clean = text.replace("```json", "").replace("```", "").strip()

    try:
        parsed = json.loads(clean)
        return {
            "needs_followup": bool(parsed.get("needs_followup", False)),
            "followup_sql": parsed.get("followup_sql"),
            "reason": parsed.get("reason", ""),
        }
    except json.JSONDecodeError:
        return {"needs_followup": False, "followup_sql": None, "reason": "parse_error"}


async def synthesize_results(
    original_question: str,
    first_sql: str,
    first_result: dict,
    second_sql: str,
    second_result: dict,
    language: str,
) -> str:
    """
    Combine two query results into a unified narrative answer.

    Returns: synthesized answer string in the user's language.
    """
    client = get_openai_client()
    result1_preview = format_result_preview(first_result, max_rows=15)
    result2_preview = format_result_preview(second_result, max_rows=15)

    lang_instruction = {
        "ar": "Answer in Arabic.",
        "fr": "Answer in French.",
        "en": "Answer in English.",
    }.get(language, "Answer in English.")

    prompt = f"""You are a BI analyst. The user asked a complex question that required two SQL queries.
Synthesize both results into a clear, insightful answer.

ORIGINAL QUESTION: {original_question}

QUERY 1:
{first_sql}
Result:
{result1_preview}

QUERY 2:
{second_sql}
Result:
{result2_preview}

{lang_instruction}

Guidelines:
- Lead with the key insight (the direct answer to the question)
- Compare/contrast if the question asked for comparison
- Mention specific numbers from both results
- Keep it concise (3-5 sentences)
- Do NOT mention SQL, queries, or technical details
- Do NOT say "based on the data" or "according to the results"
"""

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=500,
    )

    return response.choices[0].message.content.strip()
