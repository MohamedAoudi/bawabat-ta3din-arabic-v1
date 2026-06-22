"""Reusable PDF components (KPI cards, tables, charts).

All text passes through ``i18n.localize`` so Arabic strings are shaped + bidi
re-ordered before reaching ReportLab.
"""

from __future__ import annotations

from typing import Optional

from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.shapes import Drawing, Line, Rect, String
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import HRFlowable, Paragraph, Spacer, Table, TableStyle

from src.reports.i18n import localize, is_rtl
from src.reports.pdf.theme import (
    ACCENT, AMIP_BURGUNDY, AMIP_CHARCOAL, AMIP_CREAM, AMIP_GOLD, AMIP_GREEN,
    DARK_BLUE, GOLD, GREEN, LIGHT_BG, LIGHT_GRAY, MID_BLUE, MID_GRAY,
    RED_SOFT, TEXT_MUTED, WHITE, YELLOW,
)


def L(text: str, lang: str) -> str:
    """Shorthand for ``localize`` to keep call sites short."""
    return localize(text, lang)


def P(text: str, style, lang: str) -> Paragraph:
    return Paragraph(L(text, lang), style)


# ─── KPI card row ─────────────────────────────────────────────────────────────
def kpi_card_row(kpis: dict, labels: dict, styles, lang: str) -> Table:
    cells = []
    for key, kpi in kpis.items():
        delta_color = GREEN if kpi.positive else RED_SOFT
        if kpi.delta == "N/A":
            delta_para = Paragraph("N/A", styles["kpi_delta"])
        else:
            arrow = "▲" if kpi.positive else "▼"
            delta_para = Paragraph(
                f'<font color="#{delta_color.hexval()[2:].upper()}">{arrow} {kpi.delta}</font>',
                styles["kpi_delta"],
            )
        cells.append([
            Paragraph(L(labels.get(key, key), lang), styles["kpi_label"]),
            Paragraph(L(kpi.value, lang),            styles["kpi_value"]),
            delta_para,
        ])

    tbl = Table([cells], colWidths=[42*mm] * len(cells))
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), AMIP_CREAM),
        ("BOX",           (0, 0), (-1, -1), 1.0, AMIP_GOLD),
        ("INNERGRID",     (0, 0), (-1, -1), 0.5, AMIP_GOLD),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return tbl


# ─── Bar chart (production) ───────────────────────────────────────────────────
def bar_chart_drawing(data_rows, lang="en", width=155*mm, height=55*mm):
    """data_rows: iterable of (year, value)."""
    if not data_rows:
        return Drawing(width, height)
    years  = [str(r[0]) for r in data_rows]
    values = [float(r[1]) for r in data_rows]

    lo, hi = min(values), max(values)
    span   = max(hi - lo, 1.0)
    margin = span * 0.15
    v_min  = max(0.0, lo - margin)
    v_max  = hi + margin
    v_step = max(1, round((v_max - v_min) / 5))

    d     = Drawing(width, height)
    chart = VerticalBarChart()
    chart.x      = 30
    chart.y      = 20
    chart.width  = width  - 50
    chart.height = height - 30
    chart.data   = [values]
    chart.categoryAxis.categoryNames     = years
    chart.categoryAxis.labels.fontSize   = 7
    chart.categoryAxis.labels.fontName   = "Helvetica"
    chart.valueAxis.labels.fontSize      = 7
    chart.valueAxis.labels.fontName      = "Helvetica"
    chart.valueAxis.valueMin             = v_min
    chart.valueAxis.valueMax             = v_max
    chart.valueAxis.valueStep            = v_step
    chart.bars[0].fillColor              = ACCENT
    chart.bars[0].strokeColor            = None
    chart.groupSpacing                   = 8
    # For RTL: reverse the category order so the latest year sits on the left.
    if is_rtl(lang):
        chart.categoryAxis.categoryNames = list(reversed(years))
        chart.data = [list(reversed(values))]
    d.add(chart)
    return d


def sparkline_drawing(values: list[float], width=60*mm, height=12*mm) -> Drawing:
    d = Drawing(width, height)
    if len(values) < 2:
        return d
    lo, hi = min(values), max(values)
    span = max(hi - lo, 1e-9)
    n = len(values)
    pts = [
        (i * (width / (n - 1)), 2 + (v - lo) / span * (height - 4))
        for i, v in enumerate(values)
    ]
    for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
        d.add(Line(x1, y1, x2, y2, strokeColor=ACCENT, strokeWidth=1.2))
    return d


# ─── Horizontal stacked bar (partner shares) ──────────────────────────────────
def partner_share_bar(partners, lang="en", width=155*mm, height=18*mm) -> Drawing:
    if not partners:
        return Drawing(width, height)
    d = Drawing(width, height + 4)
    palette = [AMIP_GREEN, AMIP_GOLD, colors.HexColor("#5A8A54"),
               colors.HexColor("#D4B85A"), AMIP_BURGUNDY, AMIP_CHARCOAL]
    total = sum(p.value_usd for p in partners) or 1
    bar_w = width - 20
    bar_h = height
    x_start = 10
    cx = x_start
    rtl = is_rtl(lang)
    iterable = list(reversed(partners)) if rtl else partners
    for i, partner in enumerate(iterable):
        seg_w = (partner.value_usd / total) * bar_w
        d.add(Rect(cx, 2, seg_w, bar_h,
                   fillColor=palette[i % len(palette)],
                   strokeColor=WHITE, strokeWidth=1))
        if seg_w > 20:
            d.add(String(cx + seg_w / 2, 2 + bar_h / 2 - 3,
                         partner.name[:3], fontSize=6, fontName="Helvetica-Bold",
                         fillColor=WHITE, textAnchor="middle"))
        cx += seg_w
    return d


# ─── Table builders ───────────────────────────────────────────────────────────
def _maybe_mirror_table(rows, lang):
    """Reverse each row's cell order for RTL languages so columns flow right→left."""
    if not is_rtl(lang):
        return rows
    return [list(reversed(r)) for r in rows]


def partner_table(partners, headers, styles, lang="en") -> Table:
    from src.reports.i18n import fmt_delta, fmt_pct, fmt_usd
    rows = [[Paragraph(L(h, lang), styles["table_header"]) for h in headers]]
    for i, p in enumerate(partners):
        yoy_str = fmt_delta(p.yoy_pct, lang) if p.yoy_pct is not None else "N/A"
        yoy_color = GREEN if (p.yoy_pct or 0) >= 0 else RED_SOFT
        rows.append([
            Paragraph(L(f"<b>{p.name}</b>" if i == 0 else p.name, lang), styles["table_cell"]),
            Paragraph("N/A", styles["table_cell"]),
            Paragraph(L(fmt_usd(p.value_usd, lang), lang), styles["table_cell"]),
            Paragraph(L(fmt_pct(p.share_pct, lang), lang), styles["table_cell"]),
            Paragraph(f'<font color="#{yoy_color.hexval()[2:].upper()}">{yoy_str}</font>',
                      styles["table_cell"]),
        ])
    rows = _maybe_mirror_table(rows, lang)
    tbl = Table(rows, colWidths=[35*mm, 32*mm, 35*mm, 30*mm, 28*mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1,  0), MID_BLUE),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("GRID",          (0, 0), (-1, -1), 0.4, MID_GRAY),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("ALIGN",         (1, 0), (-1, -1), "CENTER"),
    ]))
    return tbl


def hs_table(hs_products, headers, styles, lang="en") -> Table:
    from src.reports.i18n import fmt_pct, fmt_usd
    rows = [[Paragraph(L(h, lang), styles["table_header"]) for h in headers]]
    for h in hs_products:
        rows.append([
            Paragraph(f"<font name='Helvetica-Bold'>{h.hs_code}</font>", styles["table_cell"]),
            Paragraph(L(h.description, lang), styles["table_cell"]),
            Paragraph(L(fmt_pct(h.share_pct, lang), lang), styles["table_cell"]),
            Paragraph(L(fmt_usd(h.export_value_usd, lang), lang), styles["table_cell"]),
        ])
    rows = _maybe_mirror_table(rows, lang)
    tbl = Table(rows, colWidths=[25*mm, 75*mm, 30*mm, 35*mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1,  0), DARK_BLUE),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("GRID",          (0, 0), (-1, -1), 0.4, MID_GRAY),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("ALIGN",         (2, 0), (-1, -1), "CENTER"),
    ]))
    return tbl


def production_table(production_by_year, headers, styles, lang="en") -> Table:
    from src.reports.i18n import fmt_delta, fmt_number
    rows = [[Paragraph(L(h, lang), styles["table_header"]) for h in headers]]
    prev: Optional[float] = None
    for py in production_by_year:
        if prev is not None and prev > 0:
            chg = (py.production_mt - prev) / prev * 100
            chg_color = GREEN if chg >= 0 else RED_SOFT
            chg_str = fmt_delta(chg, lang)
            chg_html = f'<font color="#{chg_color.hexval()[2:].upper()}">{chg_str}</font>'
        else:
            chg_html = "—"
        rows.append([
            Paragraph(str(py.year), styles["table_cell"]),
            Paragraph(fmt_number(py.production_mt, lang, decimals=1), styles["table_cell"]),
            Paragraph(chg_html, styles["table_cell"]),
            Paragraph("—", styles["table_cell"]),
        ])
        prev = py.production_mt
    rows = _maybe_mirror_table(rows, lang)
    tbl = Table(rows, colWidths=[30*mm, 50*mm, 45*mm, 40*mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1,  0), DARK_BLUE),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("GRID",          (0, 0), (-1, -1), 0.4, MID_GRAY),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("ALIGN",         (1, 0), (-1, -1), "CENTER"),
    ]))
    return tbl


def insight_block(num: int, title: str, body: str, styles, lang="en") -> Table:
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.enums import TA_CENTER
    block = [[
        Paragraph(f"{num}", ParagraphStyle(
            "num", fontName="Helvetica-Bold", fontSize=14,
            textColor=WHITE, alignment=TA_CENTER)),
        [
            Paragraph(L(title, lang), styles["insight_title"]),
            Spacer(1, 3),
            Paragraph(L(body, lang), styles["insight_body"]),
        ],
    ]]
    cols = [12*mm, 153*mm]
    if is_rtl(lang):
        block = [[block[0][1], block[0][0]]]
        cols = list(reversed(cols))
    tbl = Table(block, colWidths=cols)
    bg_col = (0 if not is_rtl(lang) else 1)
    body_col = 1 - bg_col
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (bg_col, 0), (bg_col, 0), ACCENT),
        ("BACKGROUND",    (body_col, 0), (body_col, 0), LIGHT_BG),
        ("VALIGN",        (0, 0), (-1,-1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1,-1), 8),
        ("BOTTOMPADDING", (0, 0), (-1,-1), 8),
        ("LEFTPADDING",   (bg_col, 0), (bg_col, 0), 0),
        ("LEFTPADDING",   (body_col, 0), (body_col, 0), 10),
        ("RIGHTPADDING",  (body_col, 0), (body_col, 0), 10),
        ("BOX",           (0, 0), (-1,-1), 0.5, MID_GRAY),
    ]))
    return tbl


def flag_block(icon: str, color: str, msg: str, styles, lang="en") -> Table:
    color_map = {"red": RED_SOFT, "yellow": YELLOW, "green": GREEN}
    fill = color_map.get(color, MID_GRAY)
    block = [[
        Paragraph(f'<font color="#{fill.hexval()[2:].upper()}" size=12>{icon}</font>',
                  styles["body"]),
        Paragraph(L(msg, lang), styles["flag_body"]),
    ]]
    cols = [10*mm, 155*mm]
    if is_rtl(lang):
        block = [[block[0][1], block[0][0]]]
        cols = list(reversed(cols))
    tbl = Table(block, colWidths=cols)
    tbl.setStyle(TableStyle([
        ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND",   (0, 0), (-1, -1), LIGHT_GRAY),
        ("BOX",          (0, 0), (-1, -1), 0.4, MID_GRAY),
        ("TOPPADDING",   (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
        ("LEFTPADDING",  (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return tbl


def section_header(title: str, styles, lang="en"):
    from reportlab.lib.styles import ParagraphStyle
    inner = ParagraphStyle(
        "sec_band",
        fontName=styles["section_title"].fontName,
        fontSize=styles["section_title"].fontSize,
        leading=styles["section_title"].leading,
        textColor=WHITE,
        alignment=styles["section_title"].alignment,
    )
    tbl = Table([[Paragraph(L(title, lang), inner)]], colWidths=[180 * mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), AMIP_GREEN),
        ("TOPPADDING",    (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
    ]))
    return [Spacer(1, 10), tbl, Spacer(1, 6)]
