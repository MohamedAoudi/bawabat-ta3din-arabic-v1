"""
Intent classifier for the AMIP Chatbot.

Classifies every in-scope message into exactly one routing label:

  SQL  — quantitative / analytical question answerable by querying
          the AMIP warehouse (production volumes, trade values,
          rankings, comparisons, reserves, prices).

  LIST — question about portal content, coverage, or factual information
          that can be answered from a static knowledge base (which countries
          are in AMIP, what minerals are tracked, what data year, etc.).

  RAG  — open-ended question requiring document-level understanding
          (mineral profiles, country mining overviews, unstructured knowledge).

Classification is done by a single GPT-4o call (temperature=0) that
receives the message, the session's user type, and the last few turns
of conversation history for context.
"""

from __future__ import annotations

import logging
import math

from src.chatbot.config import OPENAI_MODEL, get_openai_client
from src.chatbot.core.session import Session

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Valid labels and fallback
# ---------------------------------------------------------------------------

_VALID_LABELS: frozenset[str] = frozenset({"SQL", "LIST", "RAG", "CHART"})
_DEFAULT_LABEL: str = "RAG"  # safest fallback — never crashes the DB

# Number of recent turns to include for context (keeps the prompt short)
_HISTORY_WINDOW: int = 4

_CHART_SIGNALS: tuple[str, ...] = (
    "chart", "graph", "plot", "bar chart", "line chart", "table",
    "مبيان", "رسم بياني", "مخطط", "جدول",
    "graphique", "tableau", "diagramme",
)
_LIST_SIGNALS: tuple[str, ...] = (
    "which countries", "what countries", "what minerals", "what is amip",
    "how does it work", "what languages", "latest year", "data sources",
    "who are you", "what are you", "your name", "what can you do",
    "how can you help", "which languages you speak", "do you speak french",
    "do you speak arabic", "do you speak english",
    "ما هي بوابة", "ما هي الدول", "ما هي المعادن", "أحدث سنة",
    "من أنت", "من انت", "ما هذا المساعد", "ماذا يمكنك أن تفعل",
    "ماذا يمكنك ان تفعل", "كيف تساعدني", "هل تتحدث العربية", "هل تتكلم",
    "quels pays", "quels minéraux", "qu'est-ce que amip", "sources de données",
    "qui es-tu", "qui es tu", "qui êtes-vous", "qui êtes vous",
    "qui etes-vous", "qui etes vous", "vous êtes qui", "vous etes qui",
    "tu es quoi", "que peux-tu faire", "que peux tu faire",
    "comment peux-tu m'aider", "comment peux tu m aider",
    "tu parles français", "tu parles francais", "parlez-vous français",
    "parlez-vous francais", "tu parles",
)
_SQL_SIGNALS: tuple[str, ...] = (
    "how many", "how much", "total", "top", "ranking", "most", "least",
    "compare", "trend", "show me", "production", "produce", "produced",
    "output", "quantity", "volume", "export", "exports", "import", "imports",
    "reserves", "price", "value", "revenue", "share", "percentage",
    "إنتاج", "الصادرات", "الواردات", "تصدير", "استيراد", "قارن", "أكبر",
    "أعلى", "قيمة", "حصة", "نسبة", "كم", "quantité", "volume", "production",
    "exportation", "importation", "prix", "valeur", "classement",
)
_DESCRIPTIVE_COMPARISON_SIGNALS: tuple[str, ...] = (
    "compare between", "comparison between", "difference between",
    "compare mineral", "mineral comparison",
    "مقارنة بين", "الفرق بين", "قارن بين معدن", "مقارنة معدن",
    "comparaison entre", "différence entre", "difference entre",
    "comparer deux minéraux", "comparer deux mineraux",
)
_MEASURED_COMPARISON_SIGNALS: tuple[str, ...] = (
    "production", "produce", "produced", "output", "quantity", "volume",
    "export", "exports", "import", "imports", "reserves", "price", "value",
    "revenue", "share", "percentage", "ranking", "top", "trend",
    "إنتاج", "انتاج", "الصادرات", "الواردات", "تصدير", "استيراد", "احتياطي",
    "سعر", "قيمة", "حصة", "نسبة", "ترتيب", "أكبر", "أعلى",
    "production", "exportation", "importation", "réserves", "reserves",
    "prix", "valeur", "classement", "tendance",
)

# ---------------------------------------------------------------------------
# Classification prompt
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """\
You are a routing classifier for AMIP, the Arab Mining Indicators Portal.
Classify the user message into exactly one label: SQL, LIST, RAG, or CHART.

## SQL
Use SQL when the question asks for numbers, volumes, statistics, rankings, trends, or comparisons from the minerals database.
Keywords that signal SQL: "how many", "how much", "total", "top", "ranking", "most", "least", "compare", "trend", "show me", "production", "export", "import", "reserves", "price", "volume".
Arabic SQL signals include: "إنتاج", "الصادرات", "الواردات", "تصدير", "استيراد", "قارن", "أكبر", "أعلى", "قيمة", "حصة", "نسبة", "مدى حداثة بيانات الإنتاج".
Examples:
- "What was Morocco's phosphate production in 2022?" → SQL
- "Top 5 Arab mineral exporters in 2023" → SQL
- "Compare iron ore production between Algeria and Mauritania" → SQL
- "What is Saudi Arabia's phosphate production?" → SQL
- "Which Arab countries produce gold?" → SQL
- "What are Jordan's phosphate export revenues?" → SQL
- "ما هي الصادرات الرئيسية للجزائر؟" → SQL
- "ما مدى حداثة بيانات الإنتاج الخاصة بالسودان؟" → SQL

## LIST
Use LIST when the question asks about portal features, coverage, factual portal information, or the assistant itself (who are you, what can you do, which languages you speak).
Keywords that signal LIST: "which countries", "what minerals", "what is amip", "how does it work", "what languages", "what data", "latest year", "data sources", "who are you", "what can you do", "do you speak French".
Examples:
- "Which countries does AMIP cover?" → LIST
- "What minerals does the portal track?" → LIST
- "What is the latest year of data available?" → LIST
- "What is AMIP?" → LIST
- "What languages does the portal support?" → LIST
- "What can you do?" → LIST

## RAG
Use RAG when the question asks for descriptions, explanations, or contextual knowledge about mining sectors or country profiles.
Also use RAG for open-ended existence / presence / geology questions — "do any countries have X", "is X found in...", "which countries have deposits/reserves of X" — where the user is exploring whether a resource exists rather than asking for a measured quantity or ranking.
Use RAG for descriptive comparisons between minerals when no metric is requested (for example differences, uses, properties, or general comparison between two minerals).
Examples:
- "Tell me about Morocco's mining sector" → RAG
- "Explain phosphate mining in Jordan" → RAG
- "What is the importance of iron ore for Mauritania's economy?" → RAG
- "Describe gold mining in Sudan" → RAG
- "Do any Arab countries have lithium deposits?" → RAG
- "Is cobalt found anywhere in the region?" → RAG
- "Compare feldspar and silver" → RAG
- "اريد مقارنة بين معدن الفلسبار و الفضة" → RAG

## CHART
Use CHART when the user explicitly asks for a visual graph, chart, diagram, or table of data.
Keywords that signal CHART: "chart", "graph", "plot", "bar chart", "line chart", "table",
"مبيان", "رسم بياني", "مخطط", "جدول", "اعرض لي تطور", "graphique", "tableau", "diagramme".
Examples:
- "Show me a bar chart of phosphate production by country" → CHART
- "Give me a line chart of iron ore exports per year" → CHART
- "رسم بياني للإنتاج حسب الدولة" → CHART
- "tableau des exportations par minéral" → CHART

## Decision rules
1. If the question contains chart/graph/plot keywords → always CHART (even if it also has count/number keywords)
2. If asks for specific production/trade/reserves data → SQL
3. If platform coverage question, portal info, questions about the assistant itself, or greeting → LIST
4. If descriptive/explanatory about mining/minerals → RAG
5. When unsure between SQL and CHART → SQL
6. Existence/presence questions ("do any countries have X", "is X found in the region") → RAG; but a measured ask about the same mineral ("how much X is produced", "which countries produce/export X", "top X producers") stays SQL.
7. "Compare X and Y" is SQL only when it asks for a measurable database metric such as production, exports, imports, reserves, price, value, trend, or ranking. A general/descriptive comparison between two minerals is RAG.

Reply with exactly one word: SQL, LIST, RAG, or CHART.\
"""

_USER_PROMPT_TEMPLATE = """\
User type: {user_type}
Recent conversation:
{history}

Current question: {message}\
"""


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def _format_history(history: list[dict]) -> str:
    """Render the last _HISTORY_WINDOW turns as a compact string for the prompt."""
    recent = history[-_HISTORY_WINDOW:]
    if not recent:
        return "(no prior turns)"
    lines = []
    for turn in recent:
        role = turn.get("role", "user").capitalize()
        content = turn.get("content", "")
        intent = turn.get("intent", "")
        suffix = f" [{intent}]" if intent else ""
        lines.append(f"{role}{suffix}: {content}")
    return "\n".join(lines)


def _heuristic_fallback(message: str) -> dict:
    """Route obvious cases when the LLM classifier is unavailable."""
    lowered = message.lower()

    if any(signal in lowered for signal in _CHART_SIGNALS):
        return {"intent": "CHART", "confidence": 0.9}

    if any(signal in lowered for signal in _LIST_SIGNALS):
        return {"intent": "LIST", "confidence": 0.9}

    if (
        any(signal in lowered for signal in _DESCRIPTIVE_COMPARISON_SIGNALS)
        and not any(signal.lower() in lowered for signal in _MEASURED_COMPARISON_SIGNALS)
    ):
        return {"intent": "RAG", "confidence": 0.85}

    if any(signal.lower() in lowered for signal in _SQL_SIGNALS):
        return {"intent": "SQL", "confidence": 0.9}

    return {"intent": _DEFAULT_LABEL, "confidence": 1.0}


async def classify_intent(message: str, session: Session) -> dict:
    """
    Classify a user message into SQL, LIST, RAG, or CHART.

    Uses GPT-4o with temperature=0 and logprobs to return a confidence score
    alongside the intent label.

    Returns:
        {"intent": str, "confidence": float} where confidence is in [0, 1].
        Defaults to _DEFAULT_LABEL / confidence=1.0 on any error.
    """
    user_prompt = _USER_PROMPT_TEMPLATE.format(
        user_type=session.user.user_type,
        history=_format_history(session.history),
        message=message,
    )

    try:
        client = get_openai_client()

        response = await client.chat.completions.create(
            model=OPENAI_MODEL,
            temperature=0,
            max_tokens=5,
            logprobs=True,
            top_logprobs=4,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
        )
        label = response.choices[0].message.content.strip().upper()

        confidence = 1.0
        try:
            lp_content = response.choices[0].logprobs.content
            if lp_content:
                confidence = math.exp(lp_content[0].logprob)
        except Exception:
            pass

        if label in _VALID_LABELS:
            return {"intent": label, "confidence": confidence}

        # GPT-4o occasionally returns "SQL." or "LIST\n" — strip punctuation
        cleaned = label.rstrip(".\n ")
        if cleaned in _VALID_LABELS:
            return {"intent": cleaned, "confidence": confidence}
        logger.warning("intent classifier returned invalid label: %r", label)
        return _heuristic_fallback(message)

    except Exception as exc:
        logger.warning("intent classifier failed, using heuristic fallback: %s", exc)
        return _heuristic_fallback(message)
