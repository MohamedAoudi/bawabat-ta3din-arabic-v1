"""Prometheus metrics for the AMIP chatbot.

All counters and histograms are module-level singletons — safe to import
from multiple places.  Call ``instrument_app(app)`` once in app.py to wire
up the /metrics endpoint and per-request HTTP instrumentation.
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from prometheus_client import Counter, Histogram

if TYPE_CHECKING:
    from fastapi import FastAPI

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Intent distribution
# ---------------------------------------------------------------------------
INTENT_COUNTER = Counter(
    "amip_intent_total",
    "Number of requests handled per intent type.",
    labelnames=["intent"],
)

# ---------------------------------------------------------------------------
# Language distribution
# ---------------------------------------------------------------------------
LANGUAGE_COUNTER = Counter(
    "amip_request_language_total",
    "Number of requests per detected/supplied language.",
    labelnames=["language"],
)

# ---------------------------------------------------------------------------
# SQL cache
# ---------------------------------------------------------------------------
CACHE_HIT_COUNTER = Counter(
    "amip_sql_cache_hits_total",
    "Number of SQL query results served from cache.",
)
CACHE_MISS_COUNTER = Counter(
    "amip_sql_cache_misses_total",
    "Number of SQL queries that required a live database execution.",
)

# ---------------------------------------------------------------------------
# Enrichment pipeline
# ---------------------------------------------------------------------------
ENRICHMENT_COUNTER = Counter(
    "amip_enrichment_total",
    "Outcome of the enrichment check (needed / skipped / failed).",
    labelnames=["result"],  # "needed" | "skipped" | "failed"
)

# ---------------------------------------------------------------------------
# LLM calls
# ---------------------------------------------------------------------------
LLM_CALL_COUNTER = Counter(
    "amip_llm_calls_total",
    "Number of LLM API calls made, by component.",
    labelnames=["component"],
    # components: scope_guard | intent_classifier | context_rewriter
    #             | sql_generator | narrator | enrichment_check | synthesizer
)

LLM_TOKEN_COUNTER = Counter(
    "amip_llm_tokens_total",
    "LLM tokens consumed, by component and kind (prompt/completion).",
    labelnames=["component", "kind"],
)

LLM_LATENCY_HISTOGRAM = Histogram(
    "amip_llm_latency_seconds",
    "LLM call wall-clock latency in seconds.",
    labelnames=["component"],
    buckets=[0.1, 0.25, 0.5, 1.0, 2.0, 4.0, 8.0, 16.0],
)

# ---------------------------------------------------------------------------
# SSE stream duration
# ---------------------------------------------------------------------------
STREAM_DURATION_HISTOGRAM = Histogram(
    "amip_stream_duration_seconds",
    "Total time to complete a /chat/stream request.",
    buckets=[0.5, 1.0, 2.0, 4.0, 8.0, 16.0, 30.0],
)


# ---------------------------------------------------------------------------
# Convenience helpers
# ---------------------------------------------------------------------------

def record_intent(intent: str) -> None:
    INTENT_COUNTER.labels(intent=intent).inc()


def record_language(language: str) -> None:
    LANGUAGE_COUNTER.labels(language=language).inc()


def record_cache_hit() -> None:
    CACHE_HIT_COUNTER.inc()


def record_cache_miss() -> None:
    CACHE_MISS_COUNTER.inc()


def record_enrichment(result: str) -> None:
    """result: 'needed' | 'skipped' | 'failed'"""
    ENRICHMENT_COUNTER.labels(result=result).inc()


def record_llm_call(component: str, latency_seconds: float | None = None) -> None:
    LLM_CALL_COUNTER.labels(component=component).inc()
    if latency_seconds is not None:
        LLM_LATENCY_HISTOGRAM.labels(component=component).observe(latency_seconds)


def record_token_usage(component: str, usage) -> None:
    """Record token usage from an OpenAI response (no-op when absent)."""
    if usage is None:
        return
    try:
        LLM_TOKEN_COUNTER.labels(component=component, kind="prompt").inc(usage.prompt_tokens or 0)
        LLM_TOKEN_COUNTER.labels(component=component, kind="completion").inc(usage.completion_tokens or 0)
        logger.info(
            "llm_usage component=%s prompt_tokens=%s completion_tokens=%s",
            component, usage.prompt_tokens, usage.completion_tokens,
        )
    except Exception:
        pass


# ---------------------------------------------------------------------------
# App wiring
# ---------------------------------------------------------------------------

def instrument_app(app: "FastAPI") -> None:
    """Attach prometheus-fastapi-instrumentator and expose /metrics."""
    try:
        from prometheus_fastapi_instrumentator import Instrumentator

        Instrumentator(
            should_group_status_codes=True,
            should_ignore_untemplated=True,
            should_instrument_requests_inprogress=True,
            excluded_handlers=["/metrics", "/health"],
        ).instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)

        logger.info("Prometheus /metrics endpoint enabled")
    except ImportError:
        logger.warning(
            "prometheus-fastapi-instrumentator not installed; "
            "/metrics endpoint will not be available. "
            "Run: pip install prometheus-fastapi-instrumentator"
        )
