from __future__ import annotations

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

_FOLLOWUP_CHART_FRAGMENTS: tuple[str, ...] = (
    "chart", "graph", "plot", "line chart", "line graph", "table",
    "مخطط", "رسم بياني", "مبيان", "جدول", "منحنى",
)
_FOLLOWUP_REFERENCES: tuple[str, ...] = (
    " it", " this", " that", " those", " these", " them", "same", "above", "previous",
    " result", " results", " ذلك", " هذا", " هذه", " السابق", "النتيجة",
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
    if lowered_stripped in _GREETINGS or any(g in lowered_stripped for g in _GREETINGS):
        return True, None

    if any(fragment in lowered for fragment in _ON_TOPIC_FRAGMENTS):
        return True, None

    if any(fragment in lowered for fragment in _OFF_TOPIC_FRAGMENTS):
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
