"""
Redis-backed cache for SQL query results.

Cache keys are SHA-256 hashes of the SQL query text.
Entries expire after SQL_CACHE_TTL_SECONDS (default 24 hours).
Cache failures are silent — queries always proceed normally.
"""

from __future__ import annotations

import hashlib
import json
import logging
from typing import Any, Optional

from src.chatbot.config import (
    SQL_CACHE_ENABLED,
    SQL_CACHE_PREFIX,
    SQL_CACHE_TTL_SECONDS,
    get_redis_client,
)

logger = logging.getLogger(__name__)


class SQLCache:
    """Redis-backed cache for SQL query results."""

    def __init__(self) -> None:
        self.enabled = SQL_CACHE_ENABLED
        self.ttl = SQL_CACHE_TTL_SECONDS
        self.prefix = SQL_CACHE_PREFIX
        # Client is resolved lazily on first use so a Redis blip at startup
        # doesn't permanently disable the cache for the process lifetime.
        self._client: object | None = None

    @property
    def client(self) -> object | None:
        if not self.enabled:
            return None
        if self._client is None:
            try:
                self._client = get_redis_client()
            except Exception:
                pass
        return self._client

    def _key(self, sql_query: str) -> str:
        """Hash SQL query to a cache key."""
        query_hash = hashlib.sha256(sql_query.encode()).hexdigest()[:12]
        return f"{self.prefix}{query_hash}"

    def get(self, sql_query: str) -> Optional[Any]:
        """Retrieve cached result for a SQL query, or None on miss/error."""
        if not self.enabled or not self.client:
            return None

        try:
            key = self._key(sql_query)
            cached = self.client.get(key)
            if cached:
                return json.loads(cached)
        except Exception as exc:
            logger.debug("SQL cache get failed: %s", exc)

        return None

    def set(self, sql_query: str, result: Any) -> None:
        """Store a SQL result in the cache with the configured TTL."""
        if not self.enabled or not self.client:
            return

        try:
            key = self._key(sql_query)
            self.client.setex(key, self.ttl, json.dumps(result))
        except Exception as exc:
            logger.debug("SQL cache set failed: %s", exc)

    def clear(self, sql_query: str) -> None:
        """Delete a cached result (useful for testing)."""
        if not self.enabled or not self.client:
            return

        try:
            key = self._key(sql_query)
            self.client.delete(key)
        except Exception as exc:
            logger.debug("SQL cache clear failed: %s", exc)


# Module-level singleton
sql_cache = SQLCache()
