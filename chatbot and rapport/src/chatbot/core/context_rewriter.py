"""
Context rewriter — rewrites a short/ambiguous follow-up message
into a fully self-contained question using recent session history.

Only rewrites when the message is clearly a follow-up (short,
contains pronouns/references, or lacks a subject).
Passes through unchanged if the message is already complete.
"""
from __future__ import annotations

import logging
import re

from src.chatbot.config import (
    CONTEXT_REWRITE_ENABLED,
    CONTEXT_REWRITE_MAX_CHARS,
    OPENAI_MODEL,
    get_openai_client,
)

logger = logging.getLogger(__name__)

# Prefixes that signal the message is a follow-up referencing prior context
_TRIGGER_PREFIXES: tuple[str, ...] = (
    # English
    "now", "what about", "and ", "how about", "same for", "also ",
    "in ", "for ", "those", "these", "them", "it ", "they",
    "give me", "show me", "make ", "create ", "draw ",
    # French
    "maintenant", "et ", "pour ", "aussi ", "pareil pour", "qu'en est-il",
    "et pour", "et en", "et au", "et aux",
    # Arabic — "و" (and/but) is the most common follow-up connector
    "و ", "والآن", "ماذا عن", "وماذا", "نفس", "أيضا", "في ", "لـ",
)

_FOLLOWUP_REFERENCE_RE = re.compile(
    r"\b(it|this|that|these|those|them|same|above|previous|result|results)\b",
    re.IGNORECASE,
)
_CHART_REQUEST_RE = re.compile(
    r"\b(line chart|line graph|chart|graph|plot|visual|table)\b|"
    r"(مخطط|رسم بياني|مبيان|جدول|منحنى)",
    re.IGNORECASE,
)

# Patterns indicating the message is already a self-contained question.
# The Arabic catch-all was intentionally removed: any Arabic text with 3+ words
# was wrongly marked as self-contained, blocking rewrites of short follow-ups.
_SELF_CONTAINED_RE = re.compile(
    r"\b(how many|how much|how often)\b.{0,60}\b(are|is|have|has|were|was|do|does|did|registered|active|located)\b"
    r"|\b(what|which|where|when|who)\b.{0,60}\b(are|is|have|has|were|was|companies|sectors|products)\b"
    r"|\b(combien de|quels|quelles|où|quand|qui sont|qui ont)\b",
    re.IGNORECASE,
)


def _should_rewrite(message: str, history: list[dict]) -> bool:
    if len(history) < 2:
        return False

    msg = message.strip()

    if len(msg) > CONTEXT_REWRITE_MAX_CHARS:
        return False

    # Check length before the regex: very short messages are almost always
    # follow-ups and should be rewritten regardless of pattern matches.
    if len(msg) <= 30:
        return True

    if _CHART_REQUEST_RE.search(msg) and _FOLLOWUP_REFERENCE_RE.search(msg):
        return True

    if _SELF_CONTAINED_RE.search(msg):
        return False

    low = msg.lower()
    for prefix in _TRIGGER_PREFIXES:
        if low.startswith(prefix):
            return True

    return False


def _format_history(history: list[dict]) -> str:
    lines: list[str] = []
    for turn in history[-4:]:
        role = turn.get("role", "")
        content = turn.get("content", "")
        if role == "user":
            lines.append(f"User: {content}")
        elif role == "assistant":
            lines.append(f"Assistant: {content}")
    return "\n".join(lines)


async def rewrite_if_needed(
    message: str,
    history: list[dict],
    language: str,
) -> tuple[str, bool]:
    """
    Returns (rewritten_message, was_rewritten).
    If no rewriting needed, returns (original_message, False).
    """
    if not CONTEXT_REWRITE_ENABLED:
        return message, False

    if not _should_rewrite(message, history):
        return message, False

    try:
        client = get_openai_client()
        formatted_history = _format_history(history)

        resp = await client.chat.completions.create(
            model=OPENAI_MODEL,
            temperature=0,
            max_tokens=150,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a query rewriter for AMIP, the Arab Mining Indicators Portal chatbot.\n"
                        "Your job is to rewrite a short follow-up message into a complete, "
                        "self-contained question using the conversation history.\n"
                        "Rules:\n"
                        "- Keep the same language as the original message (Arabic/French/English)\n"
                        "- Keep the same intent (if it was a data question, keep it a data question)\n"
                        "- If the message already makes sense standalone, return it unchanged\n"
                        "- Never add information that wasn't in the history or message\n"
                        "- Return ONLY the rewritten question, nothing else, no explanation"
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Conversation history:\n{formatted_history}\n\n"
                        f'Follow-up message: "{message}"\n\n'
                        "Rewrite the follow-up message into a complete standalone question."
                    ),
                },
            ],
        )

        rewritten = resp.choices[0].message.content or ""
        rewritten = rewritten.strip().strip('"').strip("'")

        if not rewritten:
            return message, False

        # Safety: reject if response is suspiciously long relative to original.
        # Use an absolute floor (250) so short Arabic follow-ups (< 30 chars) can
        # expand into a full sentence without being incorrectly rejected.
        if len(rewritten) > max(250, len(message) * 3):
            return message, False

        if rewritten.lower() == message.lower():
            return message, False

        return rewritten, True

    except Exception as exc:
        logger.warning("context_rewriter failed, passing original: %s", exc)
        return message, False
