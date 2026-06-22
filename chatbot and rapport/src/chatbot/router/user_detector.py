"""
User type, mineral interest, and country detection for the AMIP Chatbot.

Provides three inference functions, all operating on the same keyword-scan
principle — no LLM call, no I/O, deterministic:

  detect_user_type(message, session)
    Detects identified / anonymous / admin. The user_type is set by the auth
    layer when wp_user_id is present. This function preserves any existing
    user_type or defaults to anonymous.

  infer_sector_interest(message, session)
    Infers the mineral being discussed from message keywords. For AMIP,
    "sector_interest" stores the mineral name (phosphate, iron_ore, gold, etc.).
    Can shift during a conversation.

  infer_country(message, session)
    Infers the Arab country being discussed. Like sector_interest, country
    can shift and is always overwritten on a new match.

All keyword lists cover Arabic, French, and English. Country keys match the
canonical English names in dim_countries.
"""

from __future__ import annotations

from src.chatbot.core.session import Session

# ---------------------------------------------------------------------------
# Public API — user type detection
# ---------------------------------------------------------------------------


def detect_user_type(message: str, session: Session) -> str:
    """
    Detect user type. AMIP uses three types:
    - "anonymous": default, not logged in
    - "identified": logged-in regular user
    - "admin": logged-in admin user

    The user_type is set by the auth layer when wp_user_id is present.
    This function preserves any existing user_type or defaults to anonymous.
    """
    if session.user.user_type in {"identified", "admin"}:
        # Already set by auth layer, don't override
        return session.user.user_type
    if session.user.wp_user_id is not None:
        # Has WordPress ID, treat as identified
        session.user.user_type = "identified"
        return "identified"
    return "anonymous"


# ---------------------------------------------------------------------------
# Mineral interest keyword map
# ---------------------------------------------------------------------------

_MINERAL_FRAGMENTS: dict[str, list[str]] = {
    "phosphate": [
        "phosphate", "الفوسفات", "فوسفات", "phosphates",
    ],
    "iron_ore": [
        "iron ore", "iron", "خام الحديد", "الحديد", "minerai de fer", "fer",
    ],
    "gold": [
        "gold", "الذهب", "ذهب", "or",
    ],
    "copper": [
        "copper", "النحاس", "نحاس", "cuivre",
    ],
    "gypsum": [
        "gypsum", "الجبس", "جبس", "gypse",
    ],
    "salt": [
        "salt", "الملح", "ملح", "sel",
    ],
    "zinc": [
        "zinc", "الزنك", "زنك",
    ],
    "barite": [
        "barite", "الباريت", "باريت", "baryte",
    ],
    "feldspar": [
        "feldspar", "الفلسبار", "فلسبار", "feldspath",
    ],
    "kaolin": [
        "kaolin", "الكاولين", "كاولين",
    ],
    "cement": [
        "cement", "الأسمنت", "أسمنت", "ciment",
    ],
    "bentonite": [
        "bentonite", "البنتونيت", "بنتونيت",
    ],
    "oil": [
        "oil", "petroleum", "النفط", "البترول", "نفط", "pétrole",
    ],
}


def infer_sector_interest(message: str, session: Session) -> str | None:
    """
    Infer and update the session's sector_interest from message keywords.

    For AMIP, "sector_interest" stores the mineral name (e.g. "phosphate").
    Unlike user_type, sector_interest is always overwritten when a new
    match is found — a user's mineral focus can legitimately shift within
    a conversation.

    Args:
        message: Raw user message.
        session: Active Session object — mutated in place when a mineral is
                 matched.

    Returns:
        The matched mineral key (e.g. "phosphate"), or None if no mineral
        keyword was found in the message.
    """
    lowered = message.lower()

    for mineral, fragments in _MINERAL_FRAGMENTS.items():
        if any(fragment.lower() in lowered for fragment in fragments):
            session.user.sector_interest = mineral
            return mineral

    return None


# ---------------------------------------------------------------------------
# Country keyword map (keys match dim_countries canonical English names)
# ---------------------------------------------------------------------------

_COUNTRY_FRAGMENTS: dict[str, list[str]] = {
    "Egypt": ["egypt", "égypte", "مصر"],
    "Somalia": ["somalia", "somalie", "الصومال"],
    "Jordan": ["jordan", "jordanie", "الأردن"],
    "Mauritania": ["mauritania", "mauritanie", "موريتانيا"],
    "Bahrain": ["bahrain", "bahreïn", "البحرين"],
    "Morocco": ["morocco", "maroc", "المغرب"],
    "Saudi Arabia": ["saudi", "arabie saoudite", "السعودية"],
    "Algeria": ["algeria", "algérie", "الجزائر"],
    "Djibouti": ["djibouti", "جيبوتي"],
    "Iraq": ["iraq", "irak", "العراق"],
    "Lebanon": ["lebanon", "liban", "لبنان"],
    "Sudan": ["sudan", "soudan", "السودان"],
    "Tunisia": ["tunisia", "tunisie", "تونس"],
    "Yemen": ["yemen", "yémen", "اليمن"],
    "Kuwait": ["kuwait", "koweït", "الكويت"],
    "Libya": ["libya", "libye", "ليبيا"],
    "Palestine": ["palestine", "فلسطين"],
    "Qatar": ["qatar", "قطر"],
    "Oman": ["oman", "عمان"],
    "Syria": ["syria", "syrie", "سوريا"],
    "United Arab Emirates": ["emirates", "uae", "émirats", "الإمارات"],
}


def infer_country(message: str, session: Session) -> str | None:
    """
    Infer and update the session's country from message keywords.

    Like sector_interest, country can shift during a conversation and is
    always overwritten when a new match is found. The stored value is the
    canonical English country name as used in dim_countries (e.g. "Morocco").

    Args:
        message: Raw user message.
        session: Active Session object — mutated in place when a country is
                 matched.

    Returns:
        The matched canonical country name, or None if no country keyword
        was found in the message.
    """
    lowered = message.lower()

    for country, fragments in _COUNTRY_FRAGMENTS.items():
        if any(fragment in lowered for fragment in fragments):
            session.user.country = country
            return country

    return None
