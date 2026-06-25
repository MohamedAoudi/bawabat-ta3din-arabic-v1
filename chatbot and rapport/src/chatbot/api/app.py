"""
FastAPI application for the AMIP Chatbot.

Single endpoint: POST /chat
Accepts a natural-language question and returns a structured minerals data answer.
"""

from __future__ import annotations

import asyncio
import logging
import time
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

import src.chatbot.config as config
from src.chatbot.config import CACHE_EVICTION_THRESHOLD
from src.chatbot.core import hybrid_router
from src.chatbot.core.eval_logger import log_feedback
from src.chatbot.core.events import ErrorEvent, to_sse
from src.chatbot.core.session import RedisSessionStore, load_session, session_store

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Rate limiter — built at module level, before the FastAPI app
# ---------------------------------------------------------------------------

limiter = None
_RateLimitExceeded = None
_slowapi_handler = None

if config.RATE_LIMIT_ENABLED:
    try:
        from slowapi import Limiter, _rate_limit_exceeded_handler as _slowapi_handler
        from slowapi.errors import RateLimitExceeded as _RateLimitExceeded
        from slowapi.util import get_remote_address

        limiter = Limiter(key_func=get_remote_address)
        logger.info("rate limiter initialized (storage=%s)", config.RATE_LIMIT_STORAGE_URL)
    except Exception as exc:
        logger.warning("Rate limiter init failed, disabling: %s", exc)
        limiter = None
        _RateLimitExceeded = None
        _slowapi_handler = None


def _apply_rate_limits(func):
    """Conditionally apply rate limits (per-minute, per-hour, per-day)."""
    if not limiter:
        return func

    if config.RATE_LIMIT_PER_MINUTE > 0:
        func = limiter.limit(f"{config.RATE_LIMIT_PER_MINUTE}/minute")(func)

    if config.RATE_LIMIT_PER_HOUR > 0:
        func = limiter.limit(f"{config.RATE_LIMIT_PER_HOUR}/hour")(func)

    if config.RATE_LIMIT_PER_DAY > 0:
        func = limiter.limit(f"{config.RATE_LIMIT_PER_DAY}/day")(func)

    return func


# ---------------------------------------------------------------------------
# Lifespan — startup probe + env validation (Fix 2.12)
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fix 2.12: validate required env vars at startup
    try:
        config.validate_env()
    except RuntimeError as exc:
        logger.error("Startup validation failed: %s", exc)
        raise

    backend = "redis" if isinstance(session_store, RedisSessionStore) else "in-memory"
    redis_ok = False
    if isinstance(session_store, RedisSessionStore):
        try:
            session_store._client.ping()
            redis_ok = True
        except Exception as exc:
            # Fix 2.9: log instead of silently swallowing
            logger.warning("Redis ping failed at startup: %s", exc)

    status = "reachable" if redis_ok else "not reachable"
    logger.info("session store backend = %s (%s)", backend, status)

    rl_status = "enabled" if limiter is not None else "disabled"
    logger.info("rate limiter = %s", rl_status)

    yield


# Fix 2.6: disable /docs and /redoc in production
app = FastAPI(
    title="AMIP Chatbot",
    description="Data assistant for the AMIP Arab Mining Indicators Portal.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if config.APP_ENV != "production" else None,
    redoc_url="/redoc" if config.APP_ENV != "production" else None,
)

# Fix 2.10: use CORS_ALLOWED_ORIGINS from config (never hardcode "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if limiter is not None:
    app.state.limiter = limiter


# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------


async def rate_limit_handler(request: Request, exc) -> JSONResponse:
    """Return a localised JSON 429 instead of slowapi's default plain-text response."""
    language = request.query_params.get("lang", "")
    if language not in ("ar", "fr", "en"):
        accept = request.headers.get("Accept-Language", "en")
        language = accept.split("-")[0][:2].lower()
    if language not in ("ar", "fr", "en"):
        language = "en"

    messages = {
        "ar": "عدد كبير من الطلبات. يرجى الانتظار قليلاً قبل المحاولة مرة أخرى.",
        "fr": "Trop de requêtes. Veuillez patienter un instant avant de réessayer.",
        "en": "Too many requests. Please wait a moment before trying again.",
    }
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "message": messages[language],
            "retry_after_seconds": 60,
        },
    )


if _RateLimitExceeded is not None:
    app.add_exception_handler(_RateLimitExceeded, _slowapi_handler)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------


class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,  # Fix 2.5: cap request body size
        description="Natural-language question in Arabic, French, or English.",
    )
    language: Optional[str] = Field(
        None,
        description="Language code: 'ar', 'fr', or 'en'. Auto-detected if omitted.",
        pattern="^(ar|fr|en)$",
    )
    session_id: Optional[str] = Field(
        None,
        description="Session UUID from a prior response. Omit to start a new session.",
    )
    user_type: Optional[str] = Field(
        None,
        description="Declared user role: 'identified', 'anonymous', or 'admin'.",
        pattern="^(identified|anonymous|admin)$",
    )
    wp_token: Optional[str] = Field(
        None,
        description="WordPress auth token for future authenticated user resolution.",
    )
    clarify_choice: Optional[str] = Field(
        None,
        description="User-selected intent after a clarification prompt: 'SQL', 'RAG', 'LIST', or 'CHART'.",
        pattern="^(SQL|RAG|LIST|CHART)$",
    )


class ChatResponse(BaseModel):
    answer: str
    sql: Optional[str] = None
    row_count: Optional[int] = None
    language: str
    error: Optional[str] = None
    session_id: Optional[str] = None
    intent: Optional[str] = None
    from_cache: bool = False
    chart_type: Optional[str] = None
    chart_data: Optional[list] = None
    chart_title: Optional[str] = None
    x_axis: Optional[str] = None
    y_axis: Optional[str] = None
    series: Optional[list] = None
    unit: Optional[str] = None
    insight: Optional[str] = None
    source_view: Optional[str] = None
    filters_used: Optional[dict] = None
    clarification: Optional[dict] = None
    follow_up_questions: Optional[list] = None
    # Clarification flow: when the intent classifier is uncertain, the router
    # returns intent="clarify" with a list of options for the user to choose.
    # The frontend echoes original_message back with the chosen clarify_choice.
    clarify_options: Optional[list] = None
    original_message: Optional[str] = None
    original_language: Optional[str] = None
    confidence: Optional[float] = None


class FeedbackRequest(BaseModel):
    turn_id: Optional[str] = None
    feedback: str  # "positive" or "negative"
    cache_key: Optional[str] = None
    session_id: Optional[str] = None


# ---------------------------------------------------------------------------
# Middleware — request logging
# ---------------------------------------------------------------------------


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = (time.perf_counter() - start) * 1000
    logger.info("%s %s → %s (%.1fms)", request.method, request.url.path, response.status_code, elapsed)
    return response


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/health")
async def health() -> dict:
    """Liveness probe with session store backend info."""
    backend = "redis" if isinstance(session_store, RedisSessionStore) else "in-memory"
    redis_reachable = False
    if isinstance(session_store, RedisSessionStore):
        try:
            session_store._client.ping()
            redis_reachable = True
        except Exception as exc:
            # Fix 2.9: log instead of silently swallowing
            logger.warning("Redis ping failed in /health: %s", exc)
    return {"status": "ok", "backend": backend, "redis_reachable": redis_reachable}


@app.post("/chat", response_model=ChatResponse)
@_apply_rate_limits
async def chat(request: Request, body: ChatRequest) -> ChatResponse:
    """
    Run the Text-to-SQL pipeline and return a natural-language BI answer.

    Always returns HTTP 200 — errors are surfaced in the response body so the
    frontend always receives a usable payload.
    """
    try:
        session = load_session(
            session_id=body.session_id,
            user_type=body.user_type,
            language=body.language or "en",
        )
        result = await hybrid_router.route(
            message=body.message,
            session=session,
            clarify_choice=body.clarify_choice,
            requested_language=body.language,
        )
        return ChatResponse(**result)
    except Exception as exc:
        # Fix 2.4: log internally, return generic message (don't expose str(exc))
        logger.exception("Unhandled exception in /chat")
        return ChatResponse(
            answer="An unexpected error occurred. Please try again.",
            language=body.language or "en",
            error="internal_error",
        )


@app.post("/chat/stream")
@_apply_rate_limits
async def chat_stream(request: Request, body: ChatRequest) -> StreamingResponse:
    """
    Stream chatbot progress and text chunks as Server-Sent Events.

    Emits:
      - stage events while the pipeline progresses
      - token events for streamed RAG/narrator text
      - done with the final ChatResponse-shaped payload
      - error if an unexpected failure happens before completion
    """

    async def event_generator():
        try:
            session = load_session(
                session_id=body.session_id,
                user_type=body.user_type,
                language=body.language or "en",
            )
            async for event in hybrid_router.route_stream(
                message=body.message,
                session=session,
                clarify_choice=body.clarify_choice,
                requested_language=body.language,
            ):
                yield to_sse(event)
        except Exception as exc:
            # Fix 2.4: log internally, return generic message
            logger.exception("Unhandled exception in /chat/stream")
            yield to_sse(
                ErrorEvent(
                    error="internal_error",
                    message="An unexpected error occurred. Please try again.",
                )
            )

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/feedback")
async def submit_feedback(req: FeedbackRequest):
    """
    Record user feedback (thumbs up/down) for a chatbot turn.

    - Appends feedback to eval log
    - If negative feedback on a cached result, increments negative counter in Redis
    - When counter reaches CACHE_EVICTION_THRESHOLD, evicts the cache entry
    - Positive feedback is logged but does NOT affect the counter
    """
    if req.feedback not in ("positive", "negative"):
        return JSONResponse(
            status_code=400,
            content={"error": "invalid_feedback", "message": "Feedback must be 'positive' or 'negative'"},
        )

    await log_feedback(
        turn_id=req.turn_id,
        feedback=req.feedback,
        session_id=req.session_id,
    )

    evicted = False
    negative_count = 0

    if req.feedback == "negative" and req.cache_key:
        try:
            redis = await asyncio.to_thread(_get_redis_safely)
            if redis:
                counter_key = f"feedback:negative:{req.cache_key}"
                negative_count = await asyncio.to_thread(redis.incr, counter_key)

                cache_ttl = await asyncio.to_thread(redis.ttl, req.cache_key)
                ttl = cache_ttl if cache_ttl > 0 else 3600
                await asyncio.to_thread(redis.expire, counter_key, ttl)

                if negative_count >= CACHE_EVICTION_THRESHOLD:
                    deleted = await asyncio.to_thread(redis.delete, req.cache_key)
                    await asyncio.to_thread(redis.delete, counter_key)
                    evicted = deleted > 0
        except Exception as exc:
            # Fix 2.9: log instead of silently swallowing
            logger.warning("Cache eviction failed for key %s: %s", req.cache_key, exc)

    return {
        "status": "recorded",
        "turn_id": req.turn_id,
        "feedback": req.feedback,
        "cache_evicted": evicted,
        "negative_count": negative_count,
        "eviction_threshold": CACHE_EVICTION_THRESHOLD if req.cache_key else None,
    }


def _get_redis_safely():
    """Return a synchronous Redis client, or None if unavailable."""
    try:
        return config.get_redis_client()
    except Exception as exc:
        logger.warning("Failed to get Redis client: %s", exc)
        return None
