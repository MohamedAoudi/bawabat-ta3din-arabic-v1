"""SQL intent handler — pipeline, enrichment, narration."""
from __future__ import annotations

import asyncio
import hashlib
import logging
from typing import AsyncIterator

from src.chatbot.config import SQL_CACHE_PREFIX
from src.chatbot.core.aggregation import chunk_text, needs_enrichment, synthesize_results
from src.chatbot.core.events import Event, StageEvent, TokenEvent
from src.chatbot.core.narrator import narrate_stream
from src.chatbot.core.pipeline import run_pipeline
from src.chatbot.core.scope_note import implies_global_ranking
from src.chatbot.core.session import Session
from src.chatbot.i18n import t
from src.chatbot.core.sql_executor import execute_sql
from src.chatbot.guardrails.sql_validator import enforce_limit, validate_sql
from src.chatbot.handlers import HandlerResult
from src.chatbot.metrics import (
    record_cache_hit,
    record_cache_miss,
    record_enrichment,
    record_llm_call,
)

logger = logging.getLogger(__name__)


async def handle_sql_intent(
    message: str,
    session: Session,
    language: str,
    result: HandlerResult,
) -> AsyncIterator[Event]:
    """Run the full SQL pipeline (generate → validate → execute → narrate).

    Populates *result* in-place and yields stage/token events as work progresses.
    """
    # ── Pipeline ─────────────────────────────────────────────────────────────
    pipeline_result: dict = await run_pipeline(message, language)
    result.answer = pipeline_result.get("answer", "")
    raw_sql = pipeline_result.get("sql", "")
    result.sql = raw_sql if raw_sql else None
    raw_count = pipeline_result.get("row_count", 0)
    result.row_count = raw_count if raw_count else None
    result.error = pipeline_result.get("error")
    result.from_cache = pipeline_result.get("from_cache", False)

    if result.from_cache:
        record_cache_hit()
        yield StageEvent("cache_hit")
        if result.sql:
            query_hash = hashlib.sha256(result.sql.encode()).hexdigest()[:20]
            result.cache_key = f"{SQL_CACHE_PREFIX}{query_hash}"
    else:
        record_cache_miss()
        record_llm_call("sql_generator")
        yield StageEvent("generating_sql")
        yield StageEvent("running_sql")

    # ── Enrichment ───────────────────────────────────────────────────────────
    if not result.error and result.row_count and not result.from_cache:
        yield StageEvent("checking_enrichment")
        first_data = {"answer": result.answer, "row_count": result.row_count}

        try:
            record_llm_call("enrichment_check")
            enrichment = await needs_enrichment(
                original_question=message,
                first_sql=result.sql or "",
                first_result=first_data,
                language=language,
            )

            if enrichment["needs_followup"] and enrichment["followup_sql"]:
                followup_sql = enrichment["followup_sql"]
                followup_valid, followup_reason = validate_sql(followup_sql)

                if not followup_valid:
                    record_enrichment("failed")
                    yield StageEvent(
                        "enrichment_failed",
                        {"error": f"invalid_followup_sql: {followup_reason}"},
                    )
                else:
                    record_enrichment("needed")
                    yield StageEvent("enrichment_needed", {"reason": enrichment["reason"]})
                    yield StageEvent("running_followup_sql")

                    second_result = await asyncio.to_thread(execute_sql, enforce_limit(followup_sql))

                    yield StageEvent("synthesizing")

                    record_llm_call("synthesizer")
                    synthesized = await synthesize_results(
                        original_question=message,
                        first_sql=result.sql or "",
                        first_result=first_data,
                        second_sql=followup_sql,
                        second_result=second_result,
                        language=language,
                    )

                    for chunk in chunk_text(synthesized, chunk_size=20):
                        yield TokenEvent(chunk)

                    result.answer = synthesized
                    result.aggregation_active = True
                    result.aggregation_sql = [result.sql or "", followup_sql]
                    result.aggregation_reason = enrichment["reason"]
            else:
                record_enrichment("skipped")

        except Exception as exc:
            record_enrichment("failed")
            yield StageEvent("enrichment_failed", {"error": str(exc)})

    # ── Narrator ─────────────────────────────────────────────────────────────
    if (
        not result.error
        and result.row_count
        and not result.from_cache
        and not result.aggregation_active
    ):
        record_llm_call("narrator")
        yield StageEvent("narrating")
        assembled: list[str] = []
        async for tok in narrate_stream(
            question=message,
            sql=result.sql or "",
            answer=result.answer,
            row_count=result.row_count,
            language=language,
            user_type=session.user.user_type,
            from_cache=False,
        ):
            yield tok
            assembled.append(tok.text)

        insight = "".join(assembled).strip()
        if insight and insight != "NO_INSIGHT":
            result.answer = f"{result.answer}\n\n{insight}"
            result.insight = insight

    # ── Data-scope guard ─────────────────────────────────────────────────────
    # Country-level data covers Arab countries only; a "global ranking"
    # question must not let an Arab-only rank read as a worldwide one.
    if not result.error and result.answer and implies_global_ranking(message):
        scope_note = t("global_scope_note", language)
        if scope_note not in result.answer:
            result.answer = f"{result.answer}\n\n{scope_note}"
            for chunk in chunk_text(f"\n\n{scope_note}", chunk_size=40):
                yield TokenEvent(chunk)
