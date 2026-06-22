"""
List bot handler for the AMIP Chatbot.

Answers LIST-intent questions by fuzzy-matching the user's message against
the entries in knowledge_base.yaml. Each entry holds a set of keyword
fragments and a trilingual answer.

Matching algorithm:
  - For each entry, count how many of its keyword fragments appear as
    substrings in the lowered message.
  - Score = matched_fragments / total_fragments_in_entry.
  - Return the answer (in the correct language) for the entry with the
    highest score, provided that score >= CONFIDENCE_THRESHOLD.
  - Return None if no entry clears the threshold — the caller (hybrid_router)
    will escalate to RAG.

The YAML is loaded once at module import time (static file, no hot-reload).
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Optional

import yaml

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

CONFIDENCE_THRESHOLD: float = 0.55
PRECHECK_THRESHOLD: float = 0.90

_KB_PATH: Path = Path(__file__).resolve().parents[3] / "knowledge" / "static" / "knowledge_base.yaml"
_ARABIC_RE = re.compile(r"[\u0600-\u06ff]")
_DIACRITICS_RE = re.compile(r"[\u064b-\u065f\u0670]")
_PUNCT_RE = re.compile(r"[^\w\s]+", re.UNICODE)

# ---------------------------------------------------------------------------
# Knowledge base loading
# ---------------------------------------------------------------------------


def _load_kb() -> list[dict]:
    """Load and return the list of knowledge base entries from YAML."""
    with _KB_PATH.open(encoding="utf-8") as fh:
        data = yaml.safe_load(fh)
    return data.get("entries", [])


_ENTRIES: list[dict] = _load_kb()


# ---------------------------------------------------------------------------
# Matching logic
# ---------------------------------------------------------------------------


def _normalize(text: str) -> str:
    text = text.lower().strip()
    text = _DIACRITICS_RE.sub("", text)
    text = text.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    text = text.replace("ى", "ي").replace("ة", "ه")
    text = _PUNCT_RE.sub(" ", text)
    return " ".join(text.split())


def _keyword_bucket(keyword: str) -> str:
    if _ARABIC_RE.search(keyword):
        return "ar"
    if any(ch in keyword for ch in "àâçéèêëîïôùûüÿœæ"):
        return "fr"
    return "latin"


def _message_bucket(message: str) -> str:
    if _ARABIC_RE.search(message):
        return "ar"
    return "latin"


def _score_entry(entry: dict, normalized_message: str, message_bucket: str) -> float:
    """
    Compute a match score between a KB entry and the user's message.

    Score = number of keyword fragments found in message / total fragments.

    Args:
        entry:           A knowledge base entry dict with a "keywords" list.
        normalized_message: The user's normalized message.

    Returns:
        Float in [0.0, 1.0].
    """
    keywords: list[str] = entry.get("keywords", [])
    if not keywords:
        return 0.0
    normalized_keywords = [_normalize(kw) for kw in keywords if kw]
    if normalized_message in normalized_keywords and len(normalized_message.split()) > 1:
        return 1.0

    if message_bucket == "ar":
        candidates = [kw for kw in normalized_keywords if _keyword_bucket(kw) == "ar"]
    else:
        candidates = [kw for kw in normalized_keywords if _keyword_bucket(kw) == "latin"]
    if not candidates:
        candidates = normalized_keywords

    matched = sum(1 for kw in candidates if kw and kw in normalized_message)
    return matched / len(candidates)


def _best_match(message: str, language: str = "") -> tuple[Optional[dict], float]:
    """
    Find the highest-scoring KB entry for a given message.

    Args:
        message: Raw user message.

    Returns:
        Tuple of (best_entry or None, best_score).
    """
    normalized = _normalize(message)
    if language == "ar":
        message_bucket = "ar"
    else:
        message_bucket = "latin"
    best_entry: Optional[dict] = None
    best_score: float = 0.0

    for entry in _ENTRIES:
        score = _score_entry(entry, normalized, message_bucket)
        if score > best_score:
            best_score = score
            best_entry = entry

    return best_entry, best_score


def get_list_match(message: str, language: str, min_score: float = CONFIDENCE_THRESHOLD) -> tuple[Optional[str], float, Optional[str]]:
    """Return a static FAQ answer, match score, and entry id when confident."""
    entry, score = _best_match(message, language)
    if entry is None or score < min_score:
        return None, score, None

    answer_block: dict = entry.get("answer", {})
    answer = answer_block.get(language) or answer_block.get("en", "")
    return (answer.strip() if answer else None), score, entry.get("id")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def handle_list(message: str, language: str) -> Optional[str]:
    """
    Attempt to answer a LIST-intent question from the knowledge base.

    Args:
        message:  Raw user message.
        language: Detected language code ("ar" | "fr" | "en").

    Returns:
        Answer string in the correct language if a match is found with
        confidence >= CONFIDENCE_THRESHOLD, otherwise None (signals RAG
        fallback to the caller).
    """
    answer, _, _ = get_list_match(message, language)
    return answer


def list_entry_ids() -> list[str]:
    """Return all entry IDs in the knowledge base (useful for testing)."""
    return [e.get("id", "") for e in _ENTRIES]
