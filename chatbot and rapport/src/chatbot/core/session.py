from __future__ import annotations

import json
import logging
import uuid
from dataclasses import asdict, dataclass, field
from typing import Optional, Protocol, runtime_checkable

import src.chatbot.config as config

logger = logging.getLogger(__name__)

_VALID_USER_TYPES: frozenset[str] = frozenset({"identified", "anonymous", "admin"})


@dataclass
class UserContext:
    user_type: str = "anonymous"
    language: str = "en"
    country: Optional[str] = None
    sector_interest: Optional[str] = None
    wp_user_id: Optional[int] = None
    company_id: Optional[int] = None
    subscription_tier: Optional[str] = None
    company_name: Optional[str] = None
    company_sector: Optional[str] = None
    company_country: Optional[str] = None

    @property
    def is_authenticated(self) -> bool:
        return self.wp_user_id is not None

    @property
    def is_identified(self) -> bool:
        return self.user_type == "identified"

    @property
    def is_admin(self) -> bool:
        return self.user_type == "admin"

    @property
    def is_anonymous(self) -> bool:
        return self.user_type == "anonymous"


@dataclass
class Session:
    session_id: str
    user: UserContext
    history: list[dict] = field(default_factory=list)


@runtime_checkable
class SessionStore(Protocol):
    def get_or_create(self, session_id: Optional[str]) -> Session: ...
    def save(self, session: Session) -> None: ...
    def touch(self, session_id: str) -> None: ...


class InMemorySessionStore:
    def __init__(self) -> None:
        self._store: dict[str, Session] = {}

    def get_or_create(self, session_id: Optional[str]) -> Session:
        if session_id and session_id in self._store:
            return self._store[session_id]
        new_id = session_id or str(uuid.uuid4())
        session = Session(session_id=new_id, user=UserContext())
        self._store[new_id] = session
        return session

    def save(self, session: Session) -> None:
        self._store[session.session_id] = session

    def touch(self, session_id: str) -> None:
        pass


def _serialize(session: Session) -> str:
    return json.dumps(asdict(session))


def _deserialize(data: str) -> Session:
    d = json.loads(data)
    user_d = d.pop("user")
    return Session(user=UserContext(**user_d), **d)


class RedisSessionStore:
    def __init__(self, client, prefix: str, ttl: int) -> None:
        self._client = client
        self._prefix = prefix
        self._ttl = ttl
        # If Redis becomes unreachable at request time (e.g. the container is
        # stopped), degrade to an in-memory store instead of 500-ing every chat
        # turn. Mirrors the silent-failure design of the SQL cache.
        self._fallback = InMemorySessionStore()
        self._degraded = False

    def _key(self, session_id: str) -> str:
        return f"{self._prefix}{session_id}"

    def _degrade(self, exc: Exception) -> None:
        if not self._degraded:
            logger.warning(
                "Redis session store unavailable (%s); using in-memory sessions "
                "for this process", exc,
            )
            self._degraded = True

    def get_or_create(self, session_id: Optional[str]) -> Session:
        if self._degraded:
            return self._fallback.get_or_create(session_id)
        try:
            if session_id:
                raw = self._client.get(self._key(session_id))
                if raw:
                    session = _deserialize(raw)
                    self._client.expire(self._key(session_id), self._ttl)
                    return session
            new_id = session_id or str(uuid.uuid4())
            session = Session(session_id=new_id, user=UserContext())
            self._client.set(self._key(new_id), _serialize(session), ex=self._ttl)
            return session
        except Exception as exc:
            self._degrade(exc)
            return self._fallback.get_or_create(session_id)

    def save(self, session: Session) -> None:
        if self._degraded:
            self._fallback.save(session)
            return
        try:
            self._client.set(self._key(session.session_id), _serialize(session), ex=self._ttl)
        except Exception as exc:
            self._degrade(exc)
            self._fallback.save(session)

    def touch(self, session_id: str) -> None:
        if self._degraded:
            return
        try:
            self._client.expire(self._key(session_id), self._ttl)
        except Exception as exc:
            self._degrade(exc)


def _redis_reachable() -> bool:
    import socket
    from urllib.parse import urlparse

    parsed = urlparse(config.REDIS_URL)
    host = parsed.hostname or "127.0.0.1"
    port = parsed.port or 6379
    try:
        conn = socket.create_connection((host, port), timeout=2)
        conn.close()
        return True
    except Exception:
        return False


def build_session_store() -> SessionStore:
    if config.REDIS_ENABLED:
        if not _redis_reachable():
            logger.warning("Redis unavailable at %s, falling back to in-memory", config.REDIS_URL)
        else:
            try:
                client = config.get_redis_client()
                store = RedisSessionStore(
                    client=client,
                    prefix=config.REDIS_SESSION_PREFIX,
                    ttl=config.REDIS_SESSION_TTL_SECONDS,
                )
                logger.info("session store backend = redis (%s)", config.REDIS_URL)
                return store
            except Exception as exc:
                logger.warning("Redis unavailable, falling back to in-memory: %s", exc)
    return InMemorySessionStore()


session_store: SessionStore = build_session_store()


def load_session(
    session_id: Optional[str],
    user_type: Optional[str] = None,
    language: str = "en",
) -> Session:
    resolved_type = user_type if user_type in _VALID_USER_TYPES else "anonymous"
    session = session_store.get_or_create(session_id)
    if user_type in _VALID_USER_TYPES:
        session.user.user_type = resolved_type
    session.user.language = language
    session_store.save(session)
    return session


def save_turn(
    session: Session,
    role: str,
    content: str,
    intent: str,
    extra: Optional[dict] = None,
) -> None:
    turn: dict = {"role": role, "content": content, "intent": intent}
    if extra:
        turn.update(extra)
    session.history.append(turn)

    # Fix 2.7: cap history to MAX_HISTORY_TURNS to prevent unbounded growth
    max_turns = config.MAX_HISTORY_TURNS
    if len(session.history) > max_turns:
        session.history = session.history[-max_turns:]

    session_store.save(session)


def update_sector_interest(session: Session, sector: str) -> None:
    session.user.sector_interest = sector
