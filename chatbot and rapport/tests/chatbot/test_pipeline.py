import asyncio
from unittest.mock import AsyncMock, patch

from src.chatbot.core.pipeline import detect_language


def test_detects_arabic():
    assert detect_language("كم عدد الشركات في المغرب؟") == "ar"


def test_detects_french():
    assert detect_language("Combien de entreprises sont dans le secteur ?") == "fr"


def test_detects_english():
    assert detect_language("How many companies are in Morocco?") == "en"


def test_arabic_takes_priority_over_french_keywords():
    # Message has Arabic characters — should be ar regardless
    assert detect_language("combien شركة") == "ar"


def test_defaults_to_english():
    assert detect_language("xyz unknown language tokens 123") == "en"


def test_no_sql_sentinel_does_not_surface_validator_error():
    from src.chatbot.core import pipeline

    async def _run():
        with patch.object(pipeline, "get_schema_for_question", return_value="schema"), \
             patch.object(pipeline, "generate_sql", new=AsyncMock(return_value="NO_SQL")):
            return await pipeline.run_pipeline("اريد مقارنة بين معدن الدهي و الفضة", "ar")

    result = asyncio.run(_run())

    assert result["sql"] == "NO_SQL"
    assert result["error"] is None
    assert "Only SELECT statements are allowed" not in result["answer"]
    assert result["answer"] == "لا يمكنني إنشاء استعلام SQL لهذا السؤال. يرجى إعادة الصياغة."
