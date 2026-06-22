from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import TYPE_CHECKING

try:
    from dotenv import load_dotenv
except ModuleNotFoundError:
    def load_dotenv(*_args, **_kwargs):
        return False

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine, URL

from src.db_config import load_database_settings

if TYPE_CHECKING:
    from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

_project_root = Path(__file__).resolve().parents[2]
_root_env_path = _project_root / ".env"
_legacy_env_path = _project_root / "ai" / "07_ai_layer_CANONICAL" / ".env"

# Real environment variables win over .env files so that values injected at
# runtime (Docker/systemd/CI) are authoritative; .env files only fill gaps.
# The legacy AI-layer .env fills anything still missing after the root .env.
load_dotenv(dotenv_path=_root_env_path, override=False)
load_dotenv(dotenv_path=_legacy_env_path, override=False)


# ── Environment ───────────────────────────────────────────────────────────────
APP_ENV: str = os.getenv("APP_ENV", "development")

# ── OpenAI ────────────────────────────────────────────────────────────────────
OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o")
OPENAI_TIMEOUT_SECONDS: float = float(os.getenv("OPENAI_TIMEOUT_SECONDS", "30"))
OPENAI_MAX_RETRIES: int = int(os.getenv("OPENAI_MAX_RETRIES", "3"))

# ── PostgreSQL warehouse ───────────────────────────────────────────────────────
_db_settings = load_database_settings(os.environ)
DB_HOST: str = _db_settings.host
DB_PORT: int = _db_settings.port
DB_NAME: str = _db_settings.name
DB_USER: str = _db_settings.user
DB_PASSWORD: str = _db_settings.password
DB_SCHEMA: str = _db_settings.schema

# Backward-compatible aliases for modules/tests that still import the old names.
PG_WAREHOUSE_HOST: str = DB_HOST
PG_WAREHOUSE_PORT: int = DB_PORT
PG_WAREHOUSE_DB: str = DB_NAME
PG_WAREHOUSE_USER: str = DB_USER
PG_WAREHOUSE_PASSWORD: str = DB_PASSWORD
DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
DB_POOL_MAX_OVERFLOW: int = int(os.getenv("DB_POOL_MAX_OVERFLOW", "10"))
DB_POOL_RECYCLE: int = int(os.getenv("DB_POOL_RECYCLE", "3600"))

# ── Query limits ──────────────────────────────────────────────────────────────
QUERY_TIMEOUT_SECONDS: int = int(os.getenv("QUERY_TIMEOUT_SECONDS", "10"))
MAX_RESULT_ROWS: int = int(os.getenv("MAX_RESULT_ROWS", "500"))

# ── LightRAG ──────────────────────────────────────────────────────────────────
LIGHTRAG_BASE_URL: str = os.getenv("LIGHTRAG_BASE_URL", "http://localhost:9622")
LIGHTRAG_TIMEOUT: float = float(os.getenv("LIGHTRAG_TIMEOUT", "30"))
LIGHTRAG_MODE: str = os.getenv("LIGHTRAG_MODE", "hybrid")

# ── Redis ─────────────────────────────────────────────────────────────────────
REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
REDIS_SESSION_TTL_SECONDS: int = int(os.getenv("REDIS_SESSION_TTL_SECONDS", "3600"))
REDIS_SESSION_PREFIX: str = os.getenv("REDIS_SESSION_PREFIX", "amip:session:")
REDIS_ENABLED: bool = os.getenv("REDIS_ENABLED", "true").lower() == "true"

SQL_CACHE_ENABLED: bool = os.getenv("SQL_CACHE_ENABLED", "true").lower() == "true"
SQL_CACHE_TTL_SECONDS: int = int(os.getenv("SQL_CACHE_TTL_SECONDS", "86400"))
SQL_CACHE_PREFIX: str = os.getenv("SQL_CACHE_PREFIX", "amip:sql_cache:")

RATE_LIMIT_ENABLED: bool = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "20"))
RATE_LIMIT_PER_HOUR: int = int(os.getenv("RATE_LIMIT_PER_HOUR", "0"))
RATE_LIMIT_PER_DAY: int = int(os.getenv("RATE_LIMIT_PER_DAY", "500"))
RATE_LIMIT_STORAGE_URL: str = os.getenv("RATE_LIMIT_STORAGE_URL") or REDIS_URL

# ── Phase 2 ───────────────────────────────────────────────────────────────────
CLARIFICATION_THRESHOLD: float = float(os.getenv("CLARIFICATION_THRESHOLD", "0.75"))
CACHE_EVICTION_THRESHOLD: int = int(os.getenv("CACHE_EVICTION_THRESHOLD", "5"))
MAX_HISTORY_TURNS: int = int(os.getenv("MAX_HISTORY_TURNS", "20"))

# ── Context rewriter ──────────────────────────────────────────────────────────
CONTEXT_REWRITE_ENABLED: bool = os.getenv("CONTEXT_REWRITE_ENABLED", "true").lower() == "true"
CONTEXT_REWRITE_MAX_CHARS: int = int(os.getenv("CONTEXT_REWRITE_MAX_CHARS", "120"))

# ── Chart handler LLM ─────────────────────────────────────────────────────────
# When enabled, the chart handler uses GPT-4o for (a) intent + entity extraction
# and (b) narrative insight generation, falling back to the deterministic
# regex/template path on any failure. Disable to force the offline path.
CHART_LLM_ENABLED: bool = os.getenv("CHART_LLM_ENABLED", "true").lower() == "true"

CLARIFY_LABELS: dict[str, dict[str, str]] = {
    "en": {
        "SQL":  "Show me data (SQL query)",
        "RAG":  "Explain this (search knowledge base)",
        "LIST": "List matching items",
    },
    "ar": {
        "SQL":  "عرض البيانات (استعلام SQL)",
        "RAG":  "شرح هذا (البحث في قاعدة المعرفة)",
        "LIST": "قائمة العناصر المطابقة",
    },
    "fr": {
        "SQL":  "Afficher les données (requête SQL)",
        "RAG":  "Expliquer ceci (recherche dans la base de connaissances)",
        "LIST": "Lister les éléments correspondants",
    },
}

# ── CORS ──────────────────────────────────────────────────────────────────────
_cors_raw = os.getenv("CORS_ALLOWED_ORIGINS", "*")
CORS_ALLOWED_ORIGINS: list[str] = [o.strip() for o in _cors_raw.split(",") if o.strip()]

# ── Eval log (Fix 2.3 — default outside the repo) ────────────────────────────
EVAL_LOG_PATH: str = os.getenv(
    "EVAL_LOG_PATH",
    str(Path.home() / ".amip-chatbot" / "logs" / "eval.jsonl"),
)

# ── Host / Port ───────────────────────────────────────────────────────────────
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))


# ── Startup validation (Fix 2.12) ────────────────────────────────────────────
def validate_env() -> None:
    errors: list[str] = []

    if not OPENAI_API_KEY:
        errors.append("OPENAI_API_KEY is not set")

    if APP_ENV == "production":
        if not DB_USER:
            errors.append("DB_USER is not set")
        if not DB_PASSWORD:
            errors.append("DB_PASSWORD is not set")
        if not LIGHTRAG_BASE_URL or LIGHTRAG_BASE_URL == "http://localhost:9622":
            logger.warning("LIGHTRAG_BASE_URL is using default localhost — verify in production")
        if "*" in CORS_ALLOWED_ORIGINS:
            errors.append("CORS_ALLOWED_ORIGINS must not be '*' in production (Fix 2.10)")

    if errors:
        raise RuntimeError(f"Startup validation failed: {'; '.join(errors)}")


# ── SQLAlchemy engine — pooled, read-only, built once per process ─────────────
_engine: Engine | None = None


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        url = URL.create(
            drivername="postgresql+psycopg2",
            username=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
        )
        connect_args = {
            "connect_timeout": QUERY_TIMEOUT_SECONDS,
            "options": (
                f"-c default_transaction_read_only=on "
                f"-c search_path={DB_SCHEMA} "
                f"-c statement_timeout={QUERY_TIMEOUT_SECONDS * 1000}"
            ),
        }
        if _db_settings.sslmode:
            connect_args["sslmode"] = _db_settings.sslmode
        _engine = create_engine(
            url,
            pool_size=DB_POOL_SIZE,
            max_overflow=DB_POOL_MAX_OVERFLOW,
            pool_pre_ping=True,
            pool_recycle=DB_POOL_RECYCLE,
            connect_args=connect_args,
        )
        logger.info(
            "SQLAlchemy engine created (%s:%s/%s)",
            DB_HOST,
            DB_PORT,
            DB_NAME,
        )
    return _engine


# ── Redis singleton ───────────────────────────────────────────────────────────
_redis_client = None


def get_redis_client():
    global _redis_client
    if _redis_client is None:
        try:
            import redis
            _redis_client = redis.Redis.from_url(
                REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
            )
        except Exception as exc:
            logger.warning("Failed to create Redis client: %s", exc)
            raise
    return _redis_client


# ── AsyncOpenAI singleton (Fix 2.11) ─────────────────────────────────────────
_openai_client: AsyncOpenAI | None = None


def get_openai_client() -> AsyncOpenAI:
    global _openai_client
    if _openai_client is None:
        if not OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not set")
        from openai import AsyncOpenAI

        # Explicit timeout + bounded retries: the SDK applies exponential
        # backoff with jitter on 429s and transient 5xx/connection errors.
        _openai_client = AsyncOpenAI(
            api_key=OPENAI_API_KEY,
            timeout=OPENAI_TIMEOUT_SECONDS,
            max_retries=OPENAI_MAX_RETRIES,
        )
    return _openai_client
