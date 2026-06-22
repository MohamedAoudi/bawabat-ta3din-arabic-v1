"""Report orchestrator — builds the PDF story and renders it.

Sections (in order):
  1. Cover page
  2. Executive Summary (one-page) — NEW
  3. Table of Contents
  4. KPIs + summary
  5. Production analysis (with indicative projection)
  6. Export trade flows
  7. HS product breakdown
  8. Risk & opportunity flags  — NEW
  9. Key insights
 10. Methodology
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable, Image as RLImage, KeepTogether, PageBreak, Paragraph,
    SimpleDocTemplate, Spacer, Table, TableStyle,
)

_LOGO_PATH = Path(__file__).resolve().parents[3] / "assets" / "amip-logo.png"
_LOGO_ASPECT = 120 / 250  # height / width of amip-logo.png

from src.reports.data import ReportData, get_report_payload
from src.reports.i18n import (
    fmt_mt, fmt_pct, fmt_usd, is_rtl, localize, t,
)
from src.reports.insights import build_flag_messages
from src.reports.pdf import components as C
from src.reports.pdf.theme import (
    ACCENT, AMIP_CREAM, DARK_BLUE, GOLD, LIGHT_BG, LIGHT_GRAY, MID_GRAY,
    TEXT_MUTED, WHITE, build_styles, font_names,
)


# ─── Page template ────────────────────────────────────────────────────────────
def _page_template(canvas, doc, p: ReportData):
    canvas.saveState()
    W, H = A4
    lang = p.lang
    rtl = is_rtl(lang)

    canvas.setFillColor(DARK_BLUE)
    canvas.rect(0, H - 18*mm, W, 18*mm, fill=1, stroke=0)

    # Small logo in header band — right side (or left for RTL)
    logo_w_hdr = 26 * mm
    logo_h_hdr = logo_w_hdr * _LOGO_ASPECT          # ≈ 12.5 mm
    logo_margin = 10 * mm
    logo_y_hdr = H - 18*mm + (18*mm - logo_h_hdr) / 2
    if _LOGO_PATH.exists():
        if rtl:
            canvas.drawImage(str(_LOGO_PATH), logo_margin, logo_y_hdr,
                             width=logo_w_hdr, height=logo_h_hdr, mask="auto")
        else:
            canvas.drawImage(str(_LOGO_PATH), W - logo_margin - logo_w_hdr, logo_y_hdr,
                             width=logo_w_hdr, height=logo_h_hdr, mask="auto")

    # Canvas-drawn text: pick an Arabic-capable font for AR (Amiri also covers
    # Latin) and shape WITHOUT <font> tag-wrapping, since drawString cannot
    # parse markup. For en/fr these resolve to Helvetica.
    c_regular, c_bold = font_names(lang)

    def cl(s: str) -> str:
        return localize(s, lang, wrap_latin=False)

    # Header text (leave gap where logo sits)
    text_margin_outer = logo_margin + logo_w_hdr + 4*mm
    canvas.setFillColor(WHITE)
    canvas.setFont(c_bold, 9)
    header_left = cl(t("header_subtitle", lang))
    title_str = cl(f"{p.mineral} · {p.country} · {p.years[0]}–{p.years[1]}")
    if rtl:
        canvas.drawRightString(W - 15*mm, H - 11*mm, header_left)
        canvas.setFont(c_regular, 8)
        canvas.setFillColor(AMIP_CREAM)
        canvas.drawString(text_margin_outer, H - 11*mm, title_str)
    else:
        canvas.drawString(15*mm, H - 11*mm, header_left)
        canvas.setFont(c_regular, 8)
        canvas.setFillColor(AMIP_CREAM)
        canvas.drawRightString(W - text_margin_outer, H - 11*mm, title_str)

    canvas.setFillColor(LIGHT_GRAY)
    canvas.rect(0, 0, W, 12*mm, fill=1, stroke=0)
    canvas.setFillColor(TEXT_MUTED)
    canvas.setFont(c_regular, 7)
    footer_left = cl(f"{t('generated_prefix', lang)} {p.generated_at}")
    page_label = cl(f"{t('page_label', lang)} {doc.page}")
    if rtl:
        # Mirror: page number on the left, generated text on the right
        canvas.drawString(15*mm, 4.5*mm, page_label)
        canvas.setFont(c_bold, 7)
        canvas.drawRightString(W - 15*mm, 4.5*mm, footer_left)
    else:
        canvas.drawString(15*mm, 4.5*mm, footer_left)
        canvas.setFont(c_bold, 7)
        canvas.drawRightString(W - 15*mm, 4.5*mm, page_label)

    canvas.setStrokeColor(GOLD)
    canvas.setLineWidth(0.5)
    canvas.line(0, H - 18*mm, W, H - 18*mm)
    canvas.restoreState()


# ─── Sections ─────────────────────────────────────────────────────────────────
def _empty_note(message: str, styles, lang: str) -> Table:
    """A clean, centered info box shown when a section has no data —
    clearer than a bare 'N/A' line or an empty table."""
    note_style = ParagraphStyle(
        "empty_note", parent=styles["body"],
        alignment=TA_CENTER, textColor=TEXT_MUTED)
    tbl = Table([[Paragraph(localize(message, lang), note_style)]], colWidths=[180*mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), AMIP_CREAM),
        ("BOX",           (0, 0), (-1, -1), 0.5, GOLD),
        ("TOPPADDING",    (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING",   (0, 0), (-1, -1), 12),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
    ]))
    return tbl


def _cover_page(p: ReportData, styles) -> list:
    lang = p.lang
    elements = []

    # Logo: 42 mm wide, aspect-correct height (~20 mm)
    logo_w = 42 * mm
    logo_h = logo_w * _LOGO_ASPECT
    if _LOGO_PATH.exists():
        logo_cell = RLImage(str(_LOGO_PATH), width=logo_w, height=logo_h)
    else:
        logo_cell = Spacer(logo_w, logo_h)

    # Use the language's base font so Arabic platform name renders (Helvetica
    # has no Arabic glyphs → white boxes).
    plat_regular, _plat_bold = font_names(lang)
    platform_para = Paragraph(
        localize(t("platform_name", lang), lang),
        ParagraphStyle("ct", fontName=plat_regular, fontSize=9, textColor=AMIP_CREAM),
    )

    # Row 0: [platform name (115 mm) | logo (55 mm)] — logo always right
    r0 = [platform_para, logo_cell]

    # Rows 1+: full-width content (spans both columns)
    spanning = [
        Spacer(1, 6*mm),
        Paragraph(localize(t("report_title_tpl", lang, mineral=p.mineral), lang),
                  styles["cover_title"]),
        Spacer(1, 3*mm),
        Paragraph(localize(f"{p.country}  ·  {p.years[0]}–{p.years[1]}", lang),
                  styles["cover_subtitle"]),
        Spacer(1, 8*mm),
        HRFlowable(width="100%", thickness=1, color=GOLD, spaceAfter=8),
        Paragraph(localize(t("cover_meta", lang), lang), styles["cover_meta"]),
        Spacer(1, 4*mm),
        Paragraph(localize(f"{t('generated_label', lang)} {p.generated_at}", lang),
                  styles["cover_meta"]),
    ]

    data = [r0] + [[item, ""] for item in spanning]
    span_cmds = [("SPAN", (0, i + 1), (1, i + 1)) for i in range(len(spanning))]

    table = Table(data, colWidths=[115 * mm, 55 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), DARK_BLUE),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING",   (0, 0), (-1, -1), 14 * mm),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8 * mm),
        # Logo cell: tighter left padding so it sits flush to the right edge
        ("LEFTPADDING",   (1, 0), (1, 0), 5 * mm),
        ("RIGHTPADDING",  (1, 0), (1, 0), 8 * mm),
        ("VALIGN",        (0, 0), (-1, 0), "MIDDLE"),
        ("ALIGN",         (1, 0), (1, 0), "RIGHT"),
        *span_cmds,
    ]))

    elements.append(Spacer(1, 20 * mm))
    elements.append(table)
    elements.append(PageBreak())
    return elements


def _executive_summary_page(p: ReportData, styles) -> list:
    """One-page exec summary: 4 KPIs + top-3 insights + production sparkline."""
    lang = p.lang
    elements = C.section_header(t("sec_exec", lang), styles, lang)

    labels = {
        "total_production_mt": t("kpi_total_prod", lang),
        "export_value_usd":    t("kpi_export_val", lang),
        "top_partner_share":   t("kpi_top_partner", lang),
        "yoy_growth":          t("kpi_yoy", lang, year=p.years[1]),
    }
    elements.append(C.kpi_card_row(p.kpis, labels, styles, lang))
    elements.append(Spacer(1, 6*mm))

    # Sparkline
    spark_values = [py.production_mt for py in p.production_by_year]
    if len(spark_values) >= 2:
        elements.append(Paragraph(localize(t("sec_production", lang), lang),
                                  styles["subsection"]))
        elements.append(C.sparkline_drawing(spark_values))
        elements.append(Spacer(1, 4*mm))

    # Top 3 insights as one-liners
    for i, (title, body) in enumerate(p.insights[:3], 1):
        bullet = f"<b>{localize(title, lang)}</b> — {localize(body, lang)}"
        elements.append(Paragraph(bullet, styles["body"]))
    elements.append(PageBreak())
    return elements


def _toc(p: ReportData, styles) -> list:
    lang = p.lang
    elements = [
        Paragraph(localize(t("toc_title", lang), lang), styles["section_title"]),
        HRFlowable(width="100%", thickness=0.5, color=MID_GRAY, spaceAfter=8),
    ]
    items = [
        (1, t("sec_exec", lang)),
        (2, t("sec_kpi", lang)),
        (3, t("sec_production", lang)),
        (4, t("sec_trade", lang)),
        (5, t("sec_hs", lang)),
        (6, t("sec_flags", lang)),
        (7, t("sec_insights", lang)),
        (8, t("sec_methodology", lang)),
    ]
    # Two columns (number | title) so the marker lays out deterministically.
    # The dot sits between number and title: "1." for LTR; ".N" for RTL so that,
    # reading right-to-left, the reader meets number → dot → title.
    rtl = is_rtl(lang)
    num_style = ParagraphStyle(
        "toc_num", parent=styles["toc_item"],
        fontName="Helvetica-Bold", alignment=TA_CENTER)
    rows = []
    for num, tt in items:
        marker = f".{num}" if rtl else f"{num}."
        num_cell = Paragraph(marker, num_style)
        txt_cell = Paragraph(localize(tt, lang), styles["toc_item"])
        rows.append([txt_cell, num_cell] if rtl else [num_cell, txt_cell])
    col_widths = [156*mm, 14*mm] if rtl else [14*mm, 156*mm]
    tbl = Table(rows, colWidths=col_widths)
    tbl.setStyle(TableStyle([
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("LINEBELOW",     (0, 0), (-1, -2), 0.3, MID_GRAY),
        ("ROWBACKGROUNDS",(0, 0), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(tbl)
    elements.append(PageBreak())
    return elements


def _kpi_section(p: ReportData, styles) -> list:
    lang = p.lang
    elements = C.section_header(t("sec_kpi", lang), styles, lang)
    labels = {
        "total_production_mt": t("kpi_total_prod", lang),
        "export_value_usd":    t("kpi_export_val", lang),
        "top_partner_share":   t("kpi_top_partner", lang),
        "yoy_growth":          t("kpi_yoy", lang, year=p.years[1]),
    }
    elements.append(C.kpi_card_row(p.kpis, labels, styles, lang))
    elements.append(Spacer(1, 8*mm))
    elements.append(Paragraph(localize(p.summary, lang), styles["body"]))
    elements.append(Spacer(1, 4*mm))
    return elements


def _production_section(p: ReportData, styles) -> list:
    lang = p.lang
    elements = C.section_header(t("sec_production", lang), styles, lang)
    elements.append(C.bar_chart_drawing(
        [(py.year, py.production_mt) for py in p.production_by_year], lang=lang))
    elements.append(Spacer(1, 4*mm))
    elements.append(C.production_table(
        p.production_by_year,
        [t("th_year", lang), t("th_prod_mt", lang),
         t("th_yoy", lang),  t("th_rank", lang)],
        styles, lang,
    ))
    # Forecast
    if p.forecast.production_next_year_mt:
        elements.append(Spacer(1, 4*mm))
        elements.append(Paragraph(
            f'<i>{localize(t("indicative_projection", lang), lang)}</i>: '
            f'{localize(t("next_year_forecast", lang, value=fmt_mt(p.forecast.production_next_year_mt * 1e6, lang)), lang)}',
            styles["body_small"],
        ))
    elements.append(Spacer(1, 6*mm))
    return elements


def _trade_section(p: ReportData, styles) -> list:
    lang = p.lang
    elements = C.section_header(t("sec_trade", lang), styles, lang)
    if p.trade_by_partner:
        elements.append(C.partner_share_bar(p.trade_by_partner, lang=lang))
        elements.append(Spacer(1, 4*mm))
        elements.append(C.partner_table(
            p.trade_by_partner,
            [t("th_partner", lang), t("th_volume", lang),
             t("th_value_usd", lang), t("th_share", lang), t("th_yoy", lang)],
            styles, lang,
        ))
    else:
        elements.append(_empty_note(t("no_bilateral", lang), styles, lang))
    # Forecast for export value
    if p.forecast.export_next_year_usd:
        elements.append(Spacer(1, 4*mm))
        elements.append(Paragraph(
            f'<i>{localize(t("indicative_projection", lang), lang)}</i>: '
            f'{localize(t("next_year_forecast", lang, value=fmt_usd(p.forecast.export_next_year_usd, lang)), lang)}',
            styles["body_small"],
        ))
    elements.append(Spacer(1, 6*mm))
    return elements


def _hs_section(p: ReportData, styles) -> list:
    lang = p.lang
    elements = C.section_header(t("sec_hs", lang), styles, lang)
    if p.hs_products:
        elements.append(C.hs_table(
            p.hs_products,
            [t("th_hs_code", lang), t("th_product", lang),
             t("th_export_share", lang), t("th_export_value", lang)],
            styles, lang,
        ))
    else:
        elements.append(_empty_note(t("no_hs", lang), styles, lang))
    elements.append(Spacer(1, 6*mm))
    return elements


def _flags_section(p: ReportData, styles) -> list:
    lang = p.lang
    msgs = build_flag_messages(p.flags, p.trade_by_partner, lang=lang)
    if not msgs:
        return []
    elements = C.section_header(t("sec_flags", lang), styles, lang)
    for icon, color, msg in msgs:
        elements.append(C.flag_block(icon, color, msg, styles, lang))
        elements.append(Spacer(1, 3))
    elements.append(Spacer(1, 6*mm))
    return elements


def _insights_section(p: ReportData, styles) -> list:
    lang = p.lang
    elements = C.section_header(t("sec_insights", lang), styles, lang)
    for i, (title, body) in enumerate(p.insights, 1):
        elements.append(KeepTogether([
            C.insight_block(i, title, body, styles, lang),
            Spacer(1, 5),
        ]))
    elements.append(Spacer(1, 6*mm))
    return elements


def _methodology_section(p: ReportData, styles) -> list:
    lang = p.lang
    elements = C.section_header(t("sec_methodology", lang), styles, lang)
    elements.append(Paragraph(localize(p.methodology, lang), styles["body"]))
    elements.append(Spacer(1, 4*mm))
    sources = [
        "Arab country statistical offices (national mining directorates)",
        "USGS Mineral Resources Data System (MRDS)",
        "UN Comtrade Database — HS-6 level bilateral trade",
        "Price monitoring schema present; no local price source loaded in this build",
        "AMIP internal database (arab_minerals_dw · PostgreSQL)",
    ]
    for s in sources:
        elements.append(Paragraph(f"• {s}", styles["body_small"]))
    return elements


# ─── Public entry points ──────────────────────────────────────────────────────
def generate_report(output_path: str, country="Morocco", mineral="Phosphate",
                    year_from=2019, year_to=2023, lang="en"):
    payload = get_report_payload(country, mineral, year_from, year_to, lang)
    render_pdf(payload, output_path)
    print(f"✓ Report saved: {output_path}")


def generate_reports_all_languages(output_dir: str, country="Morocco", mineral="Phosphate",
                                   year_from=2019, year_to=2023) -> dict[str, str]:
    """Render the same report in en/fr/ar; return {lang: output_path}."""
    import os

    os.makedirs(output_dir, exist_ok=True)
    paths: dict[str, str] = {}
    for lang in ("en", "fr", "ar"):
        filename = (
            f"AMIP_{country}_{mineral}_{year_from}_{year_to}_{lang}.pdf"
            .replace(" ", "_")
        )
        output_path = os.path.join(output_dir, filename)
        generate_report(
            output_path,
            country=country,
            mineral=mineral,
            year_from=year_from,
            year_to=year_to,
            lang=lang,
        )
        paths[lang] = output_path
    return paths


def render_pdf(p: ReportData, output_path: str):
    styles = build_styles(p.lang)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=15*mm, rightMargin=15*mm,
        topMargin=22*mm,  bottomMargin=16*mm,
        title=f"AMIP {p.mineral_key_en} Report — {p.country_key_en}",
        author="AMIP Platform",
        subject=f"{p.mineral_key_en} · {p.country_key_en} · {p.years[0]}–{p.years[1]}",
    )
    story: list = []
    story += _cover_page(p, styles)
    story += _executive_summary_page(p, styles)
    story += _toc(p, styles)
    story += _kpi_section(p, styles)
    story += _production_section(p, styles)
    story += _trade_section(p, styles)
    story += _hs_section(p, styles)
    story += _flags_section(p, styles)
    story += _insights_section(p, styles)
    story += _methodology_section(p, styles)

    doc.build(
        story,
        onFirstPage=lambda c, d: _page_template(c, d, p),
        onLaterPages=lambda c, d: _page_template(c, d, p),
    )
