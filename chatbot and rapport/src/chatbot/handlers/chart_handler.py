"""CHART intent handler."""
from __future__ import annotations

import logging
from typing import AsyncIterator

from src.chatbot.core.chart_handler import handle_chart
from src.chatbot.core.events import Event, StageEvent
from src.chatbot.handlers import HandlerResult

logger = logging.getLogger(__name__)


async def handle_chart_intent(
    message: str,
    language: str,
    result: HandlerResult,
) -> AsyncIterator[Event]:
    """Run the chart pipeline and populate *result* with chart data."""
    yield StageEvent("running_chart")

    chart_result = await handle_chart(message, language)

    result.answer = chart_result["answer"]
    result.chart_type = chart_result["chart_type"]
    result.chart_data = chart_result["chart_data"]
    result.chart_title = chart_result["chart_title"]
    result.unit = chart_result["unit"]
    result.x_axis = chart_result.get("x_axis")
    result.y_axis = chart_result.get("y_axis")
    result.series = chart_result.get("series")
    result.insight = chart_result.get("insight")
    result.source_view = chart_result.get("source_view")
    result.filters_used = chart_result.get("filters_used")
    result.clarification = chart_result.get("clarification")
