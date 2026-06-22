from __future__ import annotations

import logging

from sqlalchemy import text

from src.chatbot.config import MAX_RESULT_ROWS, get_engine

logger = logging.getLogger(__name__)


class QueryTimeoutError(Exception):
    """Raised when the warehouse query exceeds QUERY_TIMEOUT_SECONDS."""


class EmptyResultError(Exception):
    """Raised when the query returns zero rows."""


class ExecutionError(Exception):
    """Raised for any other SQL execution failure."""


def execute_sql(sql: str) -> dict:
    """
    Execute a validated SELECT statement against the warehouse.

    Returns a dict with: columns, rows, row_count, truncated.
    Raises QueryTimeoutError, EmptyResultError, or ExecutionError.
    """
    try:
        engine = get_engine()
    except Exception as exc:
        logger.exception("Could not connect to warehouse")
        raise ExecutionError("An internal error occurred. Please try again.") from exc

    try:
        with engine.connect() as conn:
            result = conn.execute(text(sql))
            columns = list(result.keys())
            all_rows = result.fetchmany(MAX_RESULT_ROWS + 1)
    except Exception as exc:
        msg = str(exc)
        if "timeout" in msg.lower() or "timed out" in msg.lower() or "statement_timeout" in msg.lower():
            raise QueryTimeoutError("Query timed out.") from exc
        logger.exception("SQL execution failed")
        raise ExecutionError("An internal error occurred. Please try again.") from exc

    truncated = len(all_rows) > MAX_RESULT_ROWS
    rows = all_rows[:MAX_RESULT_ROWS]

    if not rows:
        raise EmptyResultError("The query returned no results.")

    return {
        "columns": columns,
        "rows": [tuple(r) for r in rows],
        "row_count": len(rows),
        "truncated": truncated,
    }
