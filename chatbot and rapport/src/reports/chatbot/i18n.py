from __future__ import annotations

from pathlib import Path

import yaml

_MESSAGES: dict[str, dict[str, str]] = {}


def _load() -> None:
    global _MESSAGES
    path = Path(__file__).parent / "i18n.yaml"
    with path.open(encoding="utf-8") as fh:
        _MESSAGES = yaml.safe_load(fh) or {}


_load()


def t(key: str, language: str = "en", **kwargs: object) -> str:
    msg = _MESSAGES.get(key, {})
    text = msg.get(language) or msg.get("en") or f"[{key}]"
    return text.format(**kwargs) if kwargs else text
