"""Visual theme — colors, fonts, paragraph styles.

Registers an Arabic-capable TrueType font once, falling back to Helvetica when
the font file is absent so the report still renders in EN/FR.
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


# ─── AMIP Brand Colors ────────────────────────────────────────────────────────
AMIP_GREEN    = colors.HexColor("#2D5A27")  # deep forest green — dominant brand
AMIP_GOLD     = colors.HexColor("#B8A040")  # warm gold — accents, borders
AMIP_BURGUNDY = colors.HexColor("#8B1A1A")  # deep crimson — KPI values, alerts
AMIP_CREAM    = colors.HexColor("#F5F0E8")  # off-white — alt rows, backgrounds
AMIP_CHARCOAL = colors.HexColor("#1A1A1A")  # near-black — body text

# ─── Semantic aliases (imported by components.py and builder.py) ──────────────
DARK_BLUE   = AMIP_GREEN      # page/cover header band, table header fills
MID_BLUE    = AMIP_GREEN      # partner table header, toc items, subsection titles
ACCENT      = AMIP_GREEN      # chart bars, section rule, insight number gutter
LIGHT_BG    = AMIP_CREAM      # KPI card fill, insight body background
GOLD        = AMIP_GOLD       # cover HR, footer rule, page header separator
LIGHT_GRAY  = AMIP_CREAM      # table alternating rows, footer band, flag block bg
MID_GRAY    = AMIP_GOLD       # table grid lines, dividers
TEXT_DARK   = AMIP_CHARCOAL   # body text, table cell text
TEXT_MUTED  = colors.HexColor("#5A5A5A")   # footer text, muted labels
GREEN       = AMIP_GREEN      # positive KPI delta arrow
RED_SOFT    = AMIP_BURGUNDY   # negative KPI delta arrow, alert flags
YELLOW      = AMIP_GOLD       # caution flags
WHITE       = colors.white


# ─── Font registration ────────────────────────────────────────────────────────
_FONT_AR = "AmipArabic"
_FONT_AR_BOLD = "AmipArabic-Bold"
_FONT_REGISTERED = False


def _register_arabic_font() -> bool:
    """Register an Arabic-capable TTF (regular + bold). Return True if available.

    Prefers Amiri, which has complete Arabic + presentation-form coverage
    (including U+FEE9 HEH, which SFArabic lacks — that gap rendered some Arabic
    letters as white boxes). Falls back to any single-file Arabic TTF,
    registered for both weights.
    """
    global _FONT_REGISTERED
    if _FONT_REGISTERED:
        return True
    reports_fonts = Path(__file__).resolve().parents[1] / "fonts"
    assets_fonts = Path(__file__).resolve().parents[3] / "assets" / "fonts"

    # Preferred: a distinct regular + bold pair with full glyph coverage.
    pairs = [
        (reports_fonts / "Amiri-Regular.ttf", reports_fonts / "Amiri-Bold.ttf"),
    ]
    for reg, bold in pairs:
        if reg.exists() and bold.exists():
            try:
                pdfmetrics.registerFont(TTFont(_FONT_AR, str(reg)))
                pdfmetrics.registerFont(TTFont(_FONT_AR_BOLD, str(bold)))
                _FONT_REGISTERED = True
                return True
            except Exception:
                pass

    # Fallback: a single-file font used for both weights.
    singles = [
        assets_fonts / "SFArabic.ttf",
        assets_fonts / "NotoNaskhArabic-Regular.ttf",
        Path("/System/Library/Fonts/SFArabic.ttf"),
    ]
    for ttf in singles:
        if ttf.exists():
            try:
                pdfmetrics.registerFont(TTFont(_FONT_AR, str(ttf)))
                pdfmetrics.registerFont(TTFont(_FONT_AR_BOLD, str(ttf)))
                _FONT_REGISTERED = True
                return True
            except Exception:
                continue
    return False


def font_names(lang: str) -> tuple[str, str]:
    """Return (regular_font, bold_font) names appropriate for the language."""
    if lang == "ar" and _register_arabic_font():
        return _FONT_AR, _FONT_AR_BOLD
    return "Helvetica", "Helvetica-Bold"


def alignments(lang: str) -> dict[str, int]:
    """Body/heading alignment defaults for the language."""
    if lang == "ar":
        return {"body": TA_RIGHT, "title": TA_RIGHT, "center": TA_CENTER}
    return {"body": TA_LEFT, "title": TA_LEFT, "center": TA_CENTER}


def build_styles(lang: str = "en") -> dict[str, ParagraphStyle]:
    regular, bold = font_names(lang)
    al = alignments(lang)
    return {
        "cover_title": ParagraphStyle(
            "cover_title", fontName=bold,
            fontSize=28, leading=34, textColor=AMIP_GOLD, alignment=al["title"]),
        "cover_subtitle": ParagraphStyle(
            "cover_subtitle", fontName=regular,
            fontSize=13, leading=18, textColor=AMIP_CREAM, alignment=al["title"]),
        "cover_meta": ParagraphStyle(
            "cover_meta", fontName=regular,
            fontSize=10, leading=14, textColor=AMIP_CREAM, alignment=al["title"]),
        "section_title": ParagraphStyle(
            "section_title", fontName=bold,
            fontSize=14, leading=18, textColor=AMIP_GREEN,
            spaceBefore=14, spaceAfter=4, alignment=al["title"]),
        "subsection": ParagraphStyle(
            "subsection", fontName=bold,
            fontSize=11, leading=14, textColor=AMIP_GREEN, spaceBefore=10, spaceAfter=4,
            alignment=al["title"]),
        "body": ParagraphStyle(
            "body", fontName=regular,
            fontSize=9.5, leading=14, textColor=AMIP_CHARCOAL, spaceAfter=6,
            alignment=al["body"]),
        "body_small": ParagraphStyle(
            "body_small", fontName=regular,
            fontSize=8.5, leading=12, textColor=TEXT_MUTED, alignment=al["body"]),
        "kpi_label": ParagraphStyle(
            "kpi_label", fontName=regular,
            fontSize=8, leading=10, textColor=AMIP_GREEN, alignment=TA_CENTER),
        "kpi_value": ParagraphStyle(
            "kpi_value", fontName=bold,
            fontSize=18, leading=22, textColor=AMIP_BURGUNDY, alignment=TA_CENTER),
        "kpi_delta": ParagraphStyle(
            "kpi_delta", fontName=bold,
            fontSize=9, leading=12, alignment=TA_CENTER),
        "insight_title": ParagraphStyle(
            "insight_title", fontName=bold,
            fontSize=9.5, leading=12, textColor=AMIP_GREEN, alignment=al["title"]),
        "insight_body": ParagraphStyle(
            "insight_body", fontName=regular,
            fontSize=9, leading=13, textColor=AMIP_CHARCOAL, alignment=al["body"]),
        "table_header": ParagraphStyle(
            "table_header", fontName=bold,
            fontSize=8.5, leading=11, textColor=WHITE, alignment=TA_CENTER),
        "table_cell": ParagraphStyle(
            "table_cell", fontName=regular,
            fontSize=8.5, leading=11, textColor=AMIP_CHARCOAL, alignment=al["body"]),
        "footer": ParagraphStyle(
            "footer", fontName=regular,
            fontSize=7.5, leading=10, textColor=TEXT_MUTED, alignment=TA_CENTER),
        "toc_item": ParagraphStyle(
            "toc_item", fontName=regular,
            fontSize=10, leading=16, textColor=AMIP_GREEN, alignment=al["body"]),
        "flag_body": ParagraphStyle(
            "flag_body", fontName=regular,
            fontSize=9, leading=13, textColor=AMIP_CHARCOAL, alignment=al["body"]),
    }
