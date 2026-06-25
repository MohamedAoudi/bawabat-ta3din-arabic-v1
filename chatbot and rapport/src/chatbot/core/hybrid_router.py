from __future__ import annotations

import asyncio
import hashlib
import uuid
from typing import AsyncIterator, Optional

from src.chatbot.config import CLARIFICATION_THRESHOLD, CLARIFY_LABELS, SQL_CACHE_PREFIX
from src.chatbot.core.aggregation import chunk_text, needs_enrichment, synthesize_results
from src.chatbot.core.eval_logger import log_turn
from src.chatbot.core.events import DoneEvent, ErrorEvent, Event, StageEvent, TokenEvent
from src.chatbot.core.narrator import narrate_stream
from src.chatbot.core.context_rewriter import rewrite_if_needed
from src.chatbot.core.follow_ups import suggest_follow_ups
from src.chatbot.core.pipeline import _ARABIC_RANGE, _VALID_LANGUAGES, detect_language, run_pipeline
from src.chatbot.core.scope_guard import is_greeting, is_in_scope
from src.chatbot.core.session import Session, save_turn
from src.chatbot.core.sql_executor import execute_sql
from src.chatbot.core.chart_handler import handle_chart
from src.chatbot.list_bot.handler import PRECHECK_THRESHOLD, get_list_match, handle_list
from src.chatbot.rag.lightrag_client import query_rag_stream
from src.chatbot.router.intent_classifier import classify_intent
from src.chatbot.router.user_detector import (
    detect_user_type,
    infer_country,
    infer_sector_interest,
)


def _build_response(
    answer: str,
    language: str,
    session_id: str,
    intent: str,
    sql: Optional[str] = None,
    row_count: Optional[int] = None,
    error: Optional[str] = None,
    follow_up_questions: Optional[list] = None,
) -> dict:
    return {
        "answer": answer,
        "sql": sql,
        "row_count": row_count,
        "language": language,
        "error": error,
        "intent": intent,
        "session_id": session_id,
        "chart_type": None,
        "chart_data": None,
        "chart_title": None,
        "unit": None,
        "follow_up_questions": follow_up_questions or [],
    }


def _error_message(language: str) -> str:
    _MESSAGES: dict[str, str] = {
        "en": "An unexpected error occurred. Please try again.",
        "fr": "Une erreur inattendue s'est produite. Veuillez réessayer.",
        "ar": "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    }
    return _MESSAGES.get(language, _MESSAGES["en"])


def _rag_empty(language: str) -> str:
    _MSGS = {
        "en": "No relevant information was found for your question.",
        "fr": "Aucune information pertinente n'a été trouvée pour votre question.",
        "ar": "لم يتم العثور على معلومات ذات صلة لسؤالك.",
    }
    return _MSGS.get(language, _MSGS["en"])


def _clarify_prompt(language: str) -> str:
    _MSGS = {
        "en": "I want to make sure I answer correctly. What would you like me to do?",
        "fr": "Je veux être sûr de bien répondre. Que souhaitez-vous que je fasse ?",
        "ar": "أريد التأكد من الإجابة بشكل صحيح. ماذا تريد أن أفعل؟",
    }
    return _MSGS.get(language, _MSGS["en"])


def _greeting_message(language: str) -> str:
    _MSGS = {
        "en": "Hello! How can I help you today with mining, minerals, and trade data for Arab countries?",
        "fr": "Bonjour ! Comment puis-je vous aider aujourd'hui concernant les données minières, minérales et commerciales des pays arabes ?",
        "ar": "مرحباً! كيف يمكنني مساعدتك اليوم في بيانات التعدين والمعادن والتجارة الخاصة بالدول العربية؟",
    }
    return _MSGS.get(language, _MSGS["en"])


async def route_stream(
    message: str,
    session: Session,
    clarify_choice: Optional[str] = None,
    requested_language: Optional[str] = None,
) -> AsyncIterator[Event]:
    turn_id = str(uuid.uuid4())

    # Step 1: Language detection
    if _ARABIC_RANGE.search(message):
        language = "ar"
    elif requested_language in _VALID_LANGUAGES:
        language = requested_language
    else:
        language = detect_language(message)
    session.user.language = language

    # Step 1.5: Context rewriting
    # Rewrites follow-up messages into self-contained questions
    # e.g. "now in UAE" + history → "top 5 companies in UAE"
    original_message = message
    if len(session.history) >= 2:
        message, was_rewritten = await rewrite_if_needed(
            message=message,
            history=session.history,
            language=language,
        )
        if was_rewritten:
            yield StageEvent("context_rewritten", {"original": original_message, "rewritten": message})

    yield StageEvent("classifying")

    # Step 2: Scope guard
    try:
        allowed, refusal = await is_in_scope(message, language, history=session.history)
    except Exception:
        allowed, refusal = True, None

    if not allowed:
        refusal_text = refusal or ""
        await log_turn(
            session_id=session.session_id,
            message=message,
            intent="REFUSED",
            answer=refusal_text,
            language=language,
            turn_id=turn_id,
            user_type=session.user.user_type,
            sector_interest=session.user.sector_interest,
            country=session.user.country,
        )
        save_turn(session, "user", message, "REFUSED")
        save_turn(session, "assistant", refusal_text, "REFUSED")
        yield DoneEvent(
            {**_build_response(
                answer=refusal_text,
                language=language,
                session_id=session.session_id,
                intent="REFUSED",
            ), "turn_id": turn_id, "cache_key": None}
        )
        return

    # Step 2.5: Greeting short-circuit
    # Pure greetings get a deterministic reply instead of unreliable LLM routing
    # (which previously answered "hello" and "hi" inconsistently).
    if not clarify_choice and is_greeting(message):
        greeting_text = _greeting_message(language)
        await log_turn(
            session_id=session.session_id,
            message=message,
            intent="GREETING",
            answer=greeting_text,
            language=language,
            turn_id=turn_id,
            user_type=session.user.user_type,
            sector_interest=session.user.sector_interest,
            country=session.user.country,
        )
        save_turn(session, "user", message, "GREETING")
        save_turn(session, "assistant", greeting_text, "GREETING")
        yield DoneEvent(
            {**_build_response(
                answer=greeting_text,
                language=language,
                session_id=session.session_id,
                intent="GREETING",
                follow_up_questions=suggest_follow_ups(intent="GREETING", language=language),
            ), "turn_id": turn_id, "cache_key": None}
        )
        return

    # Step 3: User type detection
    detect_user_type(message, session)

    # Step 4: Context inference
    infer_sector_interest(message, session)
    infer_country(message, session)

    # Step 5: Intent classification
    if clarify_choice:
        intent = clarify_choice
        yield StageEvent("intent_confirmed", {"intent": intent})
    else:
        _, list_score, list_entry_id = get_list_match(
            message, language, min_score=PRECHECK_THRESHOLD
        )
        if list_entry_id:
            intent = "LIST"
            yield StageEvent(
                "intent_detected",
                {"intent": intent, "source": "static_list", "entry_id": list_entry_id},
            )
        else:
            try:
                result = await classify_intent(message, session)
                intent = result["intent"]
                confidence = result.get("confidence", 1.0)
            except Exception:
                intent = "RAG"
                confidence = 1.0

            if confidence < CLARIFICATION_THRESHOLD:
                yield StageEvent("intent_uncertain", {"confidence": round(confidence, 3)})
                lang_labels = CLARIFY_LABELS.get(language, CLARIFY_LABELS["en"])
                clarify_options = [
                    {"intent": "SQL",   "label": lang_labels["SQL"]},
                    {"intent": "CHART", "label": lang_labels["CHART"]},
                    {"intent": "RAG",   "label": lang_labels["RAG"]},
                    {"intent": "LIST",  "label": lang_labels["LIST"]},
                ]
                yield DoneEvent({
                    "answer": _clarify_prompt(language),
                    "intent": "clarify",
                    "clarify_options": clarify_options,
                    "original_message": message,
                    "original_language": language,
                    "confidence": round(confidence, 3),
                    "session_id": session.session_id,
                    "sql": None,
                    "row_count": None,
                    "language": language,
                    "error": None,
                    "from_cache": False,
                    "chart_type": None,
                    "chart_data": None,
                    "chart_title": None,
                    "unit": None,
                    "follow_up_questions": [],
                    "turn_id": turn_id,
                    "cache_key": None,
                })
                return
            else:
                yield StageEvent("intent_detected", {"intent": intent})

    # Step 6: Handler dispatch
    answer: str = ""
    sql: Optional[str] = None
    row_count: Optional[int] = None
    error: Optional[str] = None
    from_cache: bool = False
    cache_key: Optional[str] = None
    chart_type: Optional[str] = None
    chart_intent: Optional[str] = None
    chart_data: Optional[list] = None
    chart_title: Optional[str] = None
    unit: Optional[str] = None
    x_axis: Optional[str] = None
    y_axis: Optional[str] = None
    series: Optional[list] = None
    insight: Optional[str] = None
    source_view: Optional[str] = None
    filters_used: Optional[dict] = None
    clarification: Optional[dict] = None
    aggregation_active: bool = False
    aggregation_sql: Optional[list] = None
    aggregation_reason: Optional[str] = None

    try:
        if intent == "CHART":
            yield StageEvent("running_chart")
            chart_result = await handle_chart(message, language)
            answer = chart_result["answer"]
            chart_type = chart_result["chart_type"]
            chart_intent = chart_result.get("chart_intent")
            chart_data = chart_result["chart_data"]
            chart_title = chart_result["chart_title"]
            unit = chart_result["unit"]
            x_axis = chart_result.get("x_axis")
            y_axis = chart_result.get("y_axis")
            series = chart_result.get("series")
            insight = chart_result.get("insight")
            source_view = chart_result.get("source_view")
            filters_used = chart_result.get("filters_used")
            clarification = chart_result.get("clarification")

        elif intent == "SQL":
            pipeline_result: dict = await run_pipeline(message, language)
            answer = pipeline_result.get("answer", "")
            raw_sql = pipeline_result.get("sql", "")
            sql = raw_sql if raw_sql else None
            raw_count = pipeline_result.get("row_count", 0)
            row_count = raw_count if raw_count else None
            error = pipeline_result.get("error")
            from_cache = pipeline_result.get("from_cache", False)

            if from_cache:
                yield StageEvent("cache_hit")
                if sql:
                    query_hash = hashlib.sha256(sql.encode()).hexdigest()[:12]
                    cache_key = f"{SQL_CACHE_PREFIX}{query_hash}"
            else:
                yield StageEvent("generating_sql")
                yield StageEvent("running_sql")

            # Step 5.5: Enrichment check
            if not error and row_count and not from_cache:
                yield StageEvent("checking_enrichment")

                first_data = {"answer": answer, "row_count": row_count}

                try:
                    enrichment = await needs_enrichment(
                        original_question=message,
                        first_sql=sql or "",
                        first_result=first_data,
                        language=language,
                    )

                    if enrichment["needs_followup"] and enrichment["followup_sql"]:
                        yield StageEvent("enrichment_needed", {"reason": enrichment["reason"]})
                        yield StageEvent("running_followup_sql")

                        second_result = await asyncio.to_thread(
                            execute_sql, enrichment["followup_sql"]
                        )

                        yield StageEvent("synthesizing")

                        synthesized_answer = await synthesize_results(
                            original_question=message,
                            first_sql=sql or "",
                            first_result=first_data,
                            second_sql=enrichment["followup_sql"],
                            second_result=second_result,
                            language=language,
                        )

                        for chunk in chunk_text(synthesized_answer, chunk_size=20):
                            yield TokenEvent(chunk)

                        answer = synthesized_answer
                        aggregation_active = True
                        aggregation_sql = [sql or "", enrichment["followup_sql"]]
                        aggregation_reason = enrichment["reason"]

                except Exception as exc:
                    yield StageEvent("enrichment_failed", {"error": str(exc)})

            # Step 7: Narrator (SQL only, no error, no cache, no aggregation)
            if not error and row_count and not from_cache and not aggregation_active:
                yield StageEvent("narrating")
                assembled: list[str] = []
                async for tok in narrate_stream(
                    question=message,
                    sql=sql or "",
                    answer=answer,
                    row_count=row_count,
                    language=language,
                    user_type=session.user.user_type,
                    from_cache=False,
                ):
                    yield tok
                    assembled.append(tok.text)

                insight = "".join(assembled).strip()
                if insight and insight != "NO_INSIGHT":
                    answer = f"{answer}\n\n{insight}"

        elif intent == "LIST":
            yield StageEvent("matching_kb")
            list_answer = handle_list(message, language)
            if list_answer is None:
                intent = "RAG"
                yield StageEvent("querying_rag")
                assembled = []
                async for tok in query_rag_stream(
                    message, language, history=session.history
                ):
                    yield tok
                    assembled.append(tok.text)
                raw = "".join(assembled)
                if "### References" in raw:
                    raw = raw.split("### References")[0]
                answer = raw.strip() or _rag_empty(language)
            else:
                answer = list_answer

        else:  # RAG
            yield StageEvent("querying_rag")
            assembled = []
            async for tok in query_rag_stream(
                message, language, history=session.history
            ):
                yield tok
                assembled.append(tok.text)
            raw = "".join(assembled)
            if "### References" in raw:
                raw = raw.split("### References")[0]
            answer = raw.strip() or _rag_empty(language)

    except Exception as exc:
        error = str(exc)
        answer = _error_message(language)

    # Step 7.5: Follow-up suggestions (deterministic; clickable in the UI).
    # Skipped on error so we never invite a click into a broken state.
    follow_up_questions: list = []
    if not error:
        follow_up_questions = suggest_follow_ups(
            intent=intent,
            language=language,
            message=message,
            filters_used=filters_used,
            chart_type=chart_type,
            chart_intent=chart_intent,
        )

    # Step 8: Memory write
    save_turn(session, "user", message, intent)
    chart_extra = {"chart_type": chart_type, "chart_title": chart_title} if chart_type else None
    save_turn(session, "assistant", answer, intent, extra=chart_extra)

    # Step 9: Eval logger
    await log_turn(
        session_id=session.session_id,
        message=message,
        intent=intent,
        answer=answer,
        language=language,
        turn_id=turn_id,
        row_count=row_count,
        user_type=session.user.user_type,
        sector_interest=session.user.sector_interest,
        country=session.user.country,
    )

    # Step 10: Done
    payload = {
        **_build_response(
            answer=answer,
            language=language,
            session_id=session.session_id,
            intent=intent,
            sql=sql,
            row_count=row_count,
            error=error,
        ),
        "chart_type": chart_type,
        "chart_data": chart_data,
        "chart_title": chart_title,
        "x_axis": x_axis,
        "y_axis": y_axis,
        "series": series,
        "unit": unit,
        "insight": insight,
        "source_view": source_view,
        "filters_used": filters_used,
        "clarification": clarification,
        "from_cache": from_cache,
        "follow_up_questions": follow_up_questions,
        "turn_id": turn_id,
        "cache_key": cache_key,
    }
    if aggregation_active:
        payload["sql"] = aggregation_sql
        payload["aggregation"] = True
        payload["enrichment_reason"] = aggregation_reason
    yield DoneEvent(payload)


async def route(
    message: str,
    session: Session,
    clarify_choice: Optional[str] = None,
    requested_language: Optional[str] = None,
) -> dict:
    async for event in route_stream(
        message,
        session,
        clarify_choice=clarify_choice,
        requested_language=requested_language,
    ):
        if isinstance(event, DoneEvent):
            return event.payload

    return _build_response(
        answer=_error_message("en"),
        language="en",
        session_id=session.session_id,
        intent="ERROR",
    )
