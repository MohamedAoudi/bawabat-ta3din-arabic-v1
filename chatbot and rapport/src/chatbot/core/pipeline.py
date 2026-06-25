from __future__ import annotations

import asyncio
import re

from src.chatbot.core.answer_formatter import format_answer
from src.chatbot.core.schema_context import get_schema_for_question
from src.chatbot.core.sql_cache import sql_cache
from src.chatbot.core.sql_executor import EmptyResultError, ExecutionError, QueryTimeoutError, execute_sql
from src.chatbot.core.sql_generator import generate_sql
from src.chatbot.guardrails.sql_validator import validate_sql
from src.chatbot.i18n import t

_ARABIC_RANGE = re.compile(r"[؀-ۿ]")
_FRENCH_KEYWORDS = frozenset([
    "le", "la", "les", "des", "est", "une", "un", "dans", "de", "du",
    "que", "qui", "quels", "combien",
    "bonjour", "bonsoir", "salut", "merci", "oui", "non", "vous", "tu",
    "je", "nous", "votre", "parlez", "parles", "parler", "parle",
    "français", "francais", "comment", "pourquoi", "quand", "quoi",
    "peux", "peut", "pouvez", "pouvoir", "aide", "aidez", "montre",
    "montrez", "est-ce", "c'est",
])
_VALID_LANGUAGES = frozenset(["ar", "fr", "en"])
_NO_SQL_SENTINELS = frozenset(["CANNOT_GENERATE", "NO_SQL"])


def detect_language(message: str) -> str:
    if _ARABIC_RANGE.search(message):
        return "ar"
    if re.search(r"[éèêëàâäçôöîïûùü]", message.lower()):
        return "fr"
    words = set(re.findall(r"\b\w+\b", message.lower()))
    if words & _FRENCH_KEYWORDS:
        return "fr"
    return "en"


def _is_no_sql(sql: str) -> bool:
    return sql.strip().upper() in _NO_SQL_SENTINELS


async def run_pipeline_data(message: str, language: str | None = None) -> dict:
    """Run the SQL pipeline and return raw execution data (no format_answer call)."""
    if language not in _VALID_LANGUAGES:
        language = detect_language(message)

    base: dict = {
        "sql": "", "row_count": 0, "language": language,
        "error": None, "from_cache": False, "result_data": None,
    }

    schema_context = get_schema_for_question(message)
    sql = await generate_sql(message, schema_context, language)

    if _is_no_sql(sql):
        return {**base, "sql": sql, "error": "cannot_generate"}

    base["sql"] = sql

    is_valid, reason = validate_sql(sql)
    if not is_valid:
        return {**base, "error": reason}

    cached = sql_cache.get(sql)
    if cached is not None:
        return {**base, "row_count": cached["row_count"], "from_cache": True, "result_data": cached}

    try:
        result = await asyncio.to_thread(execute_sql, sql)
    except QueryTimeoutError:
        return {**base, "error": "timeout"}
    except EmptyResultError:
        return {**base, "error": "empty_result"}
    except ExecutionError as exc:
        return {**base, "error": str(exc)}

    sql_cache.set(sql, result)
    return {**base, "row_count": result["row_count"], "result_data": result}


async def run_pipeline(message: str, language: str | None = None) -> dict:
    """Full Text-to-SQL pipeline: generate → validate → execute → format answer."""
    if language not in _VALID_LANGUAGES:
        language = detect_language(message)

    base: dict = {"answer": "", "sql": "", "row_count": 0, "language": language, "error": None}

    schema_context = get_schema_for_question(message)
    sql = await generate_sql(message, schema_context, language)

    if _is_no_sql(sql):
        return {**base, "answer": t("no_sql", language), "sql": sql}

    base["sql"] = sql

    is_valid, reason = validate_sql(sql)
    if not is_valid:
        return {**base, "answer": t("sql_blocked", language, reason=reason), "error": reason}

    cached = sql_cache.get(sql)
    if cached is not None:
        base["row_count"] = cached["row_count"]
        answer = await format_answer(message, sql, cached, language)
        return {**base, "answer": answer, "from_cache": True}

    try:
        result = await asyncio.to_thread(execute_sql, sql)
    except QueryTimeoutError:
        return {**base, "answer": t("query_timeout", language), "error": "timeout", "from_cache": False}
    except EmptyResultError:
        return {**base, "answer": t("empty_result", language), "from_cache": False}
    except ExecutionError as exc:
        return {**base, "answer": "An internal error occurred. Please try again.", "error": str(exc), "from_cache": False}

    sql_cache.set(sql, result)
    base["row_count"] = result["row_count"]
    answer = await format_answer(message, sql, result, language)
    return {**base, "answer": answer, "from_cache": False}
