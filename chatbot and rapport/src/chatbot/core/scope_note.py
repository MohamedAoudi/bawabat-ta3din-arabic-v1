"""Data-scope guard for global-ranking questions.

AMIP holds country-level data for Arab countries only; world data exists
only as aggregate totals per mineral/year. When a question implies a global
country-level ranking, the SQL pipeline can still answer with Arab-scope
data — but the answer must say so explicitly instead of letting an
Arab-only rank read as a worldwide one.
"""
from __future__ import annotations

import re

_GLOBAL_RANKING_RE = re.compile(
    # English
    r"\b(global|world(?:wide)?)\s+(rank(?:ing)?|position|place)\b"
    r"|\brank(?:ing|ed)?\s+(?:in|of)\s+the\s+world\b"
    # French
    r"|\bclassement\s+mondial\b|\brang\s+mondial\b|\bposition\s+mondiale\b"
    # Arabic
    r"|الترتيب\s+العالمي|المرتبة\s+العالمية|التصنيف\s+العالمي|مرتبة\s+عالمي",
    re.IGNORECASE,
)


def implies_global_ranking(message: str) -> bool:
    """True when the question asks for a global country-level ranking."""
    return bool(_GLOBAL_RANKING_RE.search(message))
