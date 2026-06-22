from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping
from urllib.parse import parse_qsl, unquote, urlparse


DEFAULT_DB_HOST = "localhost"
DEFAULT_DB_PORT = 5432
DEFAULT_DB_NAME = "arab_minerals_dw"
DEFAULT_DB_USER = "AIDSMO"
DEFAULT_DB_SCHEMA = "minerals"

DATABASE_URL_KEYS = (
    "DATABASE_URL",
    "POSTGRES_URL",
    "POSTGRESQL_URL",
    "PGDATABASE_URL",
)


@dataclass(frozen=True)
class DatabaseSettings:
    host: str
    port: int
    name: str
    user: str
    password: str
    schema: str
    sslmode: str | None = None

    @property
    def search_path(self) -> str:
        return self.schema or DEFAULT_DB_SCHEMA

    def psycopg2_params(self, *, dbname: str | None = None, include_options: bool = True) -> dict:
        params: dict[str, object] = {
            "host": self.host,
            "port": self.port,
            "dbname": dbname or self.name,
            "user": self.user,
            "password": self.password,
        }
        if self.sslmode:
            params["sslmode"] = self.sslmode
        if include_options:
            params["options"] = f"-c search_path={self.search_path}"
        return params


def _first_env(env: Mapping[str, str], *keys: str, default: str = "") -> str:
    for key in keys:
        value = env.get(key)
        if value not in (None, ""):
            return value
    return default


def _parse_database_url(url: str) -> dict[str, str]:
    parsed = urlparse(url)
    if parsed.scheme not in {"postgres", "postgresql", "postgresql+psycopg2"}:
        raise ValueError(
            "Only PostgreSQL connection URLs are supported. "
            f"Received scheme {parsed.scheme!r}."
        )

    query = dict(parse_qsl(parsed.query))
    settings: dict[str, str] = {}
    if parsed.hostname:
        settings["host"] = parsed.hostname
    if parsed.port:
        settings["port"] = str(parsed.port)
    if parsed.path and parsed.path != "/":
        settings["name"] = unquote(parsed.path.lstrip("/"))
    if parsed.username:
        settings["user"] = unquote(parsed.username)
    if parsed.password:
        settings["password"] = unquote(parsed.password)
    if query.get("sslmode"):
        settings["sslmode"] = query["sslmode"]
    if query.get("schema"):
        settings["schema"] = query["schema"]
    elif query.get("search_path"):
        settings["schema"] = query["search_path"].split(",", 1)[0].strip()
    return settings


def load_database_settings(env: Mapping[str, str]) -> DatabaseSettings:
    url_settings: dict[str, str] = {}
    database_url = _first_env(env, *DATABASE_URL_KEYS)
    if database_url:
        url_settings = _parse_database_url(database_url)

    schema = _first_env(
        env,
        "DB_SCHEMA",
        "POSTGRES_SCHEMA",
        "PGSCHEMA",
        "PG_WAREHOUSE_SCHEMA",
        "DB_SEARCH_PATH",
        default=url_settings.get("schema", DEFAULT_DB_SCHEMA),
    )

    return DatabaseSettings(
        host=_first_env(
            env,
            "DB_HOST",
            "POSTGRES_HOST",
            "POSTGRES_SERVER",
            "PGHOST",
            "PG_WAREHOUSE_HOST",
            default=url_settings.get("host", DEFAULT_DB_HOST),
        ),
        port=int(
            _first_env(
                env,
                "DB_PORT",
                "POSTGRES_PORT",
                "PGPORT",
                "PG_WAREHOUSE_PORT",
                default=url_settings.get("port", str(DEFAULT_DB_PORT)),
            )
        ),
        name=_first_env(
            env,
            "DB_NAME",
            "DB_DATABASE",
            "POSTGRES_DB",
            "PGDATABASE",
            "PG_WAREHOUSE_DB",
            default=url_settings.get("name", DEFAULT_DB_NAME),
        ),
        user=_first_env(
            env,
            "DB_USER",
            "DB_USERNAME",
            "POSTGRES_USER",
            "PGUSER",
            "PG_WAREHOUSE_USER",
            default=url_settings.get("user", DEFAULT_DB_USER),
        ),
        password=_first_env(
            env,
            "DB_PASSWORD",
            "POSTGRES_PASSWORD",
            "PGPASSWORD",
            "PG_WAREHOUSE_PASSWORD",
            default=url_settings.get("password", ""),
        ),
        schema=schema,
        sslmode=_first_env(
            env,
            "DB_SSLMODE",
            "POSTGRES_SSLMODE",
            "PGSSLMODE",
            default=url_settings.get("sslmode", ""),
        )
        or None,
    )
