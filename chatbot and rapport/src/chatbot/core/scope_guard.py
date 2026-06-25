from __future__ import annotations

import re
from collections.abc import Iterable

from src.chatbot.config import OPENAI_MODEL, get_openai_client
from src.chatbot.i18n import t

_GREETINGS: frozenset[str] = frozenset({
    "hello", "hi", "hey", "good morning", "good afternoon", "good evening",
    "greetings", "howdy", "what's up", "how are you",
    "bonjour", "bonsoir", "salut", "coucou", "bonne journée",
    "comment allez-vous", "comment ça va",
    "مرحبا", "مرحباً", "السلام عليكم", "صباح الخير", "مساء الخير",
    "أهلا", "أهلاً", "هلا", "كيف حالك", "كيف الحال", "أهلا وسهلا", "تحية",
})

_ON_TOPIC_FRAGMENTS: list[str] = [
    # English — minerals
    "mineral", "minerals", "mining", "ore", "phosphate", "iron ore", "gold", "copper",
    "gypsum", "salt", "zinc", "barite", "feldspar", "kaolin", "cement", "bentonite",
    "production", "reserve", "reserves", "deposit",
    # English — trade
    "export", "exports", "import", "imports", "trade", "trade flow", "bilateral",
    "export value", "revenue",
    # English — portal
    "amip", "portal", "arab mining", "mineral indicators",
    "language", "languages", "multilingual", "trilingual",
    # English — countries
    "egypt", "somalia", "jordan", "mauritania", "bahrain", "morocco", "saudi", "algeria",
    "djibouti", "iraq", "lebanon", "sudan", "tunisia", "yemen", "kuwait", "libya",
    "palestine", "qatar", "oman", "syria", "emirates", "uae", "arab",
    # English — analytics
    "production volume", "output", "tons", "indicator", "statistics", "data", "dataset",
    "price", "commodity", "market price",
    # French — minerals
    "minéral", "minéraux", "minerai", "extraction minière", "phosphate", "minerai de fer",
    "or", "cuivre", "gypse", "sel", "zinc", "baryte", "feldspath", "kaolin", "ciment",
    "production", "réserve", "réserves",
    # French — trade
    "exportation", "importation", "commerce", "flux commercial", "valeur des exportations",
    # French — portal
    "amip", "portail", "indicateurs miniers",
    "langue", "langues", "multilingue", "trilingue",
    # French — countries
    "égypte", "somalie", "jordanie", "mauritanie", "bahreïn", "maroc", "arabie saoudite",
    "algérie", "irak", "liban", "soudan", "tunisie", "yémen", "koweït", "libye", "syrie", "émirats",
    # Arabic — minerals
    "معدن", "معادن", "تعدين", "خام الحديد", "الحديد", "الفوسفات", "الذهب", "النحاس",
    "الجبس", "الملح", "الزنك", "الباريت", "الفلسبار", "الكاولين", "الأسمنت", "البنتونيت",
    "منجم", "مناجم", "استخراج",
    # Arabic — trade
    "صادرات", "واردات", "تصدير", "استيراد", "تجارة", "تدفقات تجارية", "قيمة الصادرات",
    # Arabic — portal
    "amip", "بوابة", "بوابة amip", "مؤشرات تعدينية",
    "لغة", "لغات", "اللغات", "اللغة",
    # Arabic — countries
    "مصر", "الصومال", "الأردن", "موريتانيا", "البحرين", "المغرب", "السعودية", "الجزائر",
    "جيبوتي", "العراق", "لبنان", "السودان", "تونس", "اليمن", "الكويت", "ليبيا",
    "فلسطين", "قطر", "عمان", "سوريا", "الإمارات",
    # Arabic — analytics
    "إنتاج", "احتياطي", "سعر", "إيرادات", "بيانات", "إحصاء", "مؤشر",
]

_OFF_TOPIC_FRAGMENTS: list[str] = [
    "recipe", "cooking", "sport", "football", "soccer", "movie", "film", "weather",
    "joke", "poem", "song", "music", "celebrity", "game", "translate", "write me a",
    "write a poem", "tell me a story",
    "recette", "cuisine", "météo", "blague", "poème", "chanson", "célébrité", "jeu",
    "traduis", "raconte-moi",
    "وصفة", "طبخ", "طقس", "نكتة", "قصيدة", "أغنية", "فيلم", "رياضة",
    "كرة القدم", "لعبة", "ترجم", "احكي لي",
]

_META_FRAGMENTS: list[str] = [
    "who are you", "what are you", "your name",
    "qui es-tu", "qui es tu", "qui êtes-vous", "qui êtes vous",
    "qui etes-vous", "qui etes vous", "vous êtes qui", "vous etes qui",
    "tu es quoi", "من أنت", "من انت", "ما هذا المساعد",
    "what can you do", "how can you help",
    "que peux-tu faire", "que peux tu faire",
    "comment peux-tu m'aider", "comment peux tu m aider",
    "ماذا يمكنك أن تفعل", "ماذا يمكنك ان تفعل", "كيف تساعدني",
    "do you speak french", "do you speak arabic", "do you speak english",
    "tu parles français", "tu parles francais",
    "parlez-vous français", "parlez-vous francais",
    "tu parles", "هل تتحدث العربية", "هل تتكلم",
]

_FOLLOWUP_CHART_FRAGMENTS: tuple[str, ...] = (
    "chart", "graph", "plot", "line chart", "line graph", "table",
    "مخطط", "رسم بياني", "مبيان", "جدول", "منحنى",
)
_FOLLOWUP_REFERENCES: tuple[str, ...] = (
    " it", " this", " that", " those", " these", " them", "same", "above", "previous",
    " result", " results", " ذلك", " هذا", " هذه", " السابق", "النتيجة",
)

# --- Keyword matching -------------------------------------------------------
# A fragment list is compiled into a (regex, substrings) matcher. ASCII fragments
# are matched on word boundaries so short tokens like "or"/"ore"/"sel"/"hi" no
# longer leak via substrings inside unrelated words ("world", "before", "which").
# Non-ASCII (Arabic) fragments keep substring matching to preserve tolerance for
# attached clitic prefixes (e.g. "الإنتاج" still matches the fragment "إنتاج").

_Matcher = tuple["re.Pattern[str] | None", tuple[str, ...]]


def _compile_fragments(fragments: Iterable[str]) -> _Matcher:
    ascii_frags = sorted({f for f in fragments if f.isascii()}, key=len, reverse=True)
    other = tuple(dict.fromkeys(f for f in fragments if not f.isascii()))
    pattern = (
        re.compile(r"\b(?:" + "|".join(re.escape(f) for f in ascii_frags) + r")\b")
        if ascii_frags
        else None
    )
    return pattern, other


def _contains_fragment(text: str, matcher: _Matcher) -> bool:
    """True if ``text`` (already lowercased) matches any fragment in ``matcher``."""
    pattern, other = matcher
    if pattern is not None and pattern.search(text):
        return True
    return any(fragment in text for fragment in other)


_ON_TOPIC: _Matcher = _compile_fragments(_ON_TOPIC_FRAGMENTS)
_OFF_TOPIC: _Matcher = _compile_fragments(_OFF_TOPIC_FRAGMENTS)
_GREETING_MATCHER: _Matcher = _compile_fragments(_GREETINGS)
_META: _Matcher = _compile_fragments(_META_FRAGMENTS)


def _keyword_verdict(message: str) -> bool | None:
    """Pure keyword-layer scope check (no I/O).

    Returns ``True`` for an on-topic keyword hit, ``False`` for an off-topic hit,
    and ``None`` when no keyword matches (the caller then defers to the LLM).
    On-topic is checked first so mixed messages stay in scope.
    """
    lowered = message.lower()
    if _contains_fragment(lowered, _ON_TOPIC):
        return True
    if _contains_fragment(lowered, _OFF_TOPIC):
        return False
    return None


def is_greeting(message: str) -> bool:
    """True when the whole message is essentially a greeting with no real query.

    Pure greetings ("hello", "bonjour", "مرحبا", "hi there") are routed to a
    deterministic greeting reply instead of the LLM intent classifier, which
    otherwise answers them inconsistently. Mixed messages that also carry a
    substantive query (e.g. "hello, what is AMIP?") are NOT greetings — they
    have an on/off-topic keyword hit and fall through to normal routing.
    """
    stripped = message.lower().strip().rstrip("!.,؟? ")
    if not stripped:
        return False
    if stripped in _GREETINGS:
        return True
    return (
        len(stripped) <= 25
        and _contains_fragment(stripped, _GREETING_MATCHER)
        and _keyword_verdict(stripped) is None
    )


_SCOPE_SYSTEM_PROMPT = (
    "You are a strict topic classifier for AMIP, the Arab Mining Indicators Portal. "
    "Decide whether the user's message is IN_SCOPE or OUT_OF_SCOPE.\n\n"
    "IN_SCOPE: questions about minerals (phosphate, iron ore, gold, copper, etc.), "
    "mining industry, mineral production, trade flows (imports/exports) of minerals, "
    "mineral reserves, prices, Arab mining data, and the AMIP portal itself.\n\n"
    "OUT_OF_SCOPE: anything else (cooking, sports, weather, general knowledge, "
    "creative writing, translation of unrelated content, B2B directory questions, "
    "stock market speculation, personal questions, etc.).\n\n"
    "Respond with exactly one word: IN_SCOPE or OUT_OF_SCOPE."
)

_OUT_OF_SCOPE_MESSAGES: dict[str, str] = {
    "ar": (
        "أعتذر، يمكنني فقط الإجابة عن الأسئلة المتعلقة بقطاع التعدين والمعادن في الدول "
        "العربية، وبيانات بوابة AMIP. هل لديك سؤال آخر في هذا المجال؟"
    ),
    "en": (
        "I apologize, I can only answer questions related to mining, minerals, and trade "
        "data for Arab countries covered by the AMIP portal. Do you have another question "
        "in this area?"
    ),
    "fr": (
        "Je m'excuse, je ne peux répondre qu'aux questions relatives au secteur minier, "
        "aux minéraux et aux données commerciales des pays arabes couverts par le portail "
        "AMIP. Avez-vous une autre question dans ce domaine ?"
    ),
}


async def is_in_scope(
    message: str, language: str, history: list[dict] | None = None
) -> tuple[bool, str | None]:
    lowered = message.lower()

    if history and len(message.strip()) <= 30:
        return True, None

    if history and any(fragment in lowered for fragment in _FOLLOWUP_CHART_FRAGMENTS):
        if any(reference in f" {lowered}" for reference in _FOLLOWUP_REFERENCES):
            return True, None

    if history and len(message.strip()) <= 80 and any(fragment in lowered for fragment in _FOLLOWUP_CHART_FRAGMENTS):
        return True, None

    lowered_stripped = message.lower().strip().rstrip("!.,؟?")
    if lowered_stripped in _GREETINGS or _contains_fragment(lowered_stripped, _GREETING_MATCHER):
        return True, None

    if _contains_fragment(lowered, _META):
        return True, None

    verdict = _keyword_verdict(message)
    if verdict is True:
        return True, None
    if verdict is False:
        out_msg = _OUT_OF_SCOPE_MESSAGES.get(language, _OUT_OF_SCOPE_MESSAGES["en"])
        return False, out_msg

    try:
        client = get_openai_client()
        response = await client.chat.completions.create(
            model=OPENAI_MODEL,
            temperature=0,
            max_tokens=5,
            messages=[
                {"role": "system", "content": _SCOPE_SYSTEM_PROMPT},
                {"role": "user", "content": message},
            ],
        )
        verdict = response.choices[0].message.content.strip().upper()
        if verdict == "OUT_OF_SCOPE":
            out_msg = _OUT_OF_SCOPE_MESSAGES.get(language, _OUT_OF_SCOPE_MESSAGES["en"])
            return False, out_msg
        return True, None
    except Exception:
        return True, None
