"""Per-intent handler modules for the AMIP chatbot router.

Each handler is an async generator that yields Event objects and
populates a shared HandlerResult with the final answer payload.
The router (hybrid_router.py) stays thin — it only handles
pre-processing (language, scope, intent) and post-processing
(session write, eval log, DoneEvent).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class HandlerResult:
    """Mutable result container populated by each intent handler."""

    answer: str = ""
    sql: Optional[str] = None
    row_count: Optional[int] = None
    error: Optional[str] = None
    from_cache: bool = False
    cache_key: Optional[str] = None
    # Chart fields
    chart_type: Optional[str] = None
    chart_data: Optional[list] = None
    chart_title: Optional[str] = None
    unit: Optional[str] = None
    x_axis: Optional[str] = None
    y_axis: Optional[str] = None
    series: Optional[list] = None
    # Enrichment / narrative extras
    insight: Optional[str] = None
    source_view: Optional[str] = None
    filters_used: Optional[dict] = None
    clarification: Optional[dict] = None
    aggregation_active: bool = False
    aggregation_sql: Optional[list] = None
    aggregation_reason: Optional[str] = None
