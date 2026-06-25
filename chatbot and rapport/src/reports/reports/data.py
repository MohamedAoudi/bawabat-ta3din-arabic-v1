"""
AMIP Report — data layer.

All SQL queries and dataclass-style pydantic models for the report payload.

Adds, beyond the original ``get_report_data``:
  * Peer benchmarking against the Arab regional average.
  * Herfindahl-Hirschman Index (HHI) of partner export shares.
  * Lightweight linear forecast (numpy.polyfit) for next-year production and
    export value.
  * A snapshot of "previous top 6" partners so the insights layer can flag
    newly-emerging partners.

The legacy ``get_report_data`` signature and return shape are preserved as
``get_report_data_dict`` for backward compatibility; new callers should use
``get_report_payload`` which returns a typed ``ReportData``.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

import numpy as np
from pydantic import BaseModel, Field

from pipelines.db import get_pooled_cursor
from src.reports.i18n import (
    fmt_delta, fmt_mt, fmt_pct, fmt_usd, t,
)


# ─── Pydantic models ──────────────────────────────────────────────────────────
class ProductionYear(BaseModel):
    year: int
    production_mt: float  # millions of metric tonnes


class Partner(BaseModel):
    name: str
    value_usd: float
    share_pct: float
    yoy_pct: Optional[float] = None


class HSProduct(BaseModel):
    hs_code: str
    description: str
    share_pct: float
    export_value_usd: float


class KPI(BaseModel):
    value: str
    delta: str
    positive: bool


class Forecast(BaseModel):
    production_next_year_mt: Optional[float] = None   # millions MT
    export_next_year_usd: Optional[float] = None


class PeerBenchmark(BaseModel):
    country_yoy_pct: Optional[float] = None
    region_yoy_pct: Optional[float] = None


class Flags(BaseModel):
    concentration: bool = False
    contraction: bool = False
    emerging_partners: list[str] = Field(default_factory=list)
    price_pressure: bool = False  # always False — no quantity column available


class ReportData(BaseModel):
    country: str
    mineral: str
    country_key_en: str
    mineral_key_en: str
    years: tuple[int, int]
    lang: str
    generated_at: str
    kpis: dict[str, KPI]
    production_by_year: list[ProductionYear]
    trade_by_partner: list[Partner]
    hs_products: list[HSProduct]
    insights: list[tuple[str, str]]   # localized (title, body) pairs
    summary: str
    methodology: str
    forecast: Forecast
    peer: PeerBenchmark
    hhi: Optional[float] = None
    flags: Flags
    data_version: str = ""   # hash of underlying fact table created_at — for cache keying


class NoReportDataError(RuntimeError):
    """The selected public-schema report has no production or trade rows."""


# ─── Helpers ──────────────────────────────────────────────────────────────────
def _hhi(shares_pct: list[float]) -> Optional[float]:
    """Herfindahl-Hirschman Index from share percentages (0-100 scale)."""
    if not shares_pct:
        return None
    return float(sum(s * s for s in shares_pct))


def _linear_next(values: list[float]) -> Optional[float]:
    """Project next data point with a degree-1 polynomial. Needs >=2 finite points."""
    finite = [v for v in values if v is not None and np.isfinite(v)]
    if len(finite) < 2:
        return None
    x = np.arange(len(finite))
    try:
        coeffs = np.polyfit(x, finite, 1)
        nxt = float(np.polyval(coeffs, len(finite)))
        return max(nxt, 0.0)
    except Exception:
        return None


# ─── Main data loader ─────────────────────────────────────────────────────────
def get_report_payload(country="Morocco", mineral="Phosphate",
                       year_from=2019, year_to=2023, lang="en") -> ReportData:
    lang = lang if lang in ("en", "fr", "ar") else "en"
    lang_idx = {"en": 0, "fr": 1, "ar": 2}[lang]
    mineral_pattern = f"%{mineral}%"

    with get_pooled_cursor() as cur:

        # Display names ───────────────────────────────────────────────────────
        cur.execute(
            "SELECT name_en, name_fr, name_ar "
            "FROM public.countries WHERE name_en = %s",
            (country,),
        )
        row = cur.fetchone()
        country_display = (row[lang_idx] if row else None) or country

        cur.execute(
            "SELECT mineral_name_en, mineral_name_fr, mineral_name_ar FROM ("
            "SELECT mineral_name_en, mineral_name_fr, mineral_name_ar "
            "FROM public.mineral_production UNION ALL "
            "SELECT mineral_name_en, mineral_name_fr, mineral_name_ar "
            "FROM public.mineral_trade) minerals "
            "WHERE mineral_name_en = %s OR mineral_name_en ILIKE %s "
            "ORDER BY (mineral_name_en = %s) DESC, mineral_name_en LIMIT 1",
            (mineral, mineral_pattern, mineral),
        )
        row = cur.fetchone()
        mineral_display = (row[lang_idx] if row else None) or mineral

        # Production by year ──────────────────────────────────────────────────
        cur.execute(
            """
            SELECT ap.year,
                   COALESCE(SUM(COALESCE(ap.production_value_base, ap.production_value)), 0) / 1e6
            FROM public.arab_production ap
            JOIN public.countries c ON c.id = ap.country_id
            JOIN public.mineral_production mp ON mp.id = ap.mineral_production_id
            WHERE c.name_en = %s
              AND mp.mineral_name_en ILIKE %s
              AND ap.year BETWEEN %s AND %s
            GROUP BY ap.year
            ORDER BY ap.year
            """,
            (country, mineral_pattern, year_from, year_to),
        )
        production_by_year = [
            ProductionYear(year=int(r[0]), production_mt=float(r[1])) for r in cur.fetchall()
        ]

        # Total production for KPI ───────────────────────────────────────────
        cur.execute(
            """
            SELECT COALESCE(SUM(COALESCE(ap.production_value_base, ap.production_value)), 0)
            FROM public.arab_production ap
            JOIN public.countries c ON c.id = ap.country_id
            JOIN public.mineral_production mp ON mp.id = ap.mineral_production_id
            WHERE c.name_en = %s
              AND mp.mineral_name_en ILIKE %s
              AND ap.year BETWEEN %s AND %s
            """,
            (country, mineral_pattern, year_from, year_to),
        )
        total_prod_t = float(cur.fetchone()[0] or 0)

        # Peer benchmark — regional avg YoY of the same mineral ──────────────
        cur.execute(
            """
            WITH yearly AS (
                SELECT c.name_en AS cname,
                       ap.year,
                       SUM(COALESCE(ap.production_value_base, ap.production_value)) / 1e6 AS prod_mt
                FROM public.arab_production ap
                JOIN public.countries c ON c.id = ap.country_id
                JOIN public.mineral_production mp ON mp.id = ap.mineral_production_id
                WHERE mp.mineral_name_en ILIKE %s
                  AND ap.year IN (%s, %s)
                GROUP BY c.name_en, ap.year
            ),
            yoy AS (
                SELECT cname,
                       MAX(CASE WHEN year = %s THEN prod_mt END) AS curr,
                       MAX(CASE WHEN year = %s THEN prod_mt END) AS prev
                FROM yearly
                GROUP BY cname
            )
            SELECT AVG((curr - prev) / NULLIF(prev, 0) * 100)
            FROM   yoy
            WHERE  prev IS NOT NULL AND prev > 0 AND curr IS NOT NULL
            """,
            (mineral_pattern, year_to, year_to - 1, year_to, year_to - 1),
        )
        region_yoy_pct = cur.fetchone()[0]
        region_yoy_pct = float(region_yoy_pct) if region_yoy_pct is not None else None

        # Export value (current + previous + previous-2) ─────────────────────
        cur.execute(
            """
            SELECT tw.year, COALESCE(SUM(tw.value_usd), 0) AS export_usd
            FROM public.trade_world tw
            JOIN public.countries c ON c.id = tw.reporter_country_id
            JOIN public.mineral_trade mt ON mt.id = tw.mineral_trade_id
            WHERE c.name_en = %s
              AND mt.mineral_name_en ILIKE %s
              AND LOWER(tw.type_trade) IN ('export', 'exports')
              AND tw.year IN (%s, %s, %s)
            GROUP BY tw.year
            ORDER BY tw.year DESC
            """,
            (country, mineral_pattern, year_to, year_to - 1, year_to - 2),
        )
        ev_rows = {int(r[0]): float(r[1]) for r in cur.fetchall()}
        export_value      = ev_rows.get(year_to,     0.0)
        export_value_prev = ev_rows.get(year_to - 1, 0.0)
        export_value_prev2 = ev_rows.get(year_to - 2, 0.0)

        # Bilateral partner data is country-level: every partner_trade row uses
        # the 'All Minerals' commodity sentinel — the warehouse has no per-mineral
        # bilateral split. So we (B1) aggregate the country's overall bilateral
        # export partners WITHOUT a per-mineral filter (the old filter matched
        # nothing, leaving the partner section permanently empty), but keep the
        # `mineral_has_trade` gate so partners only appear for a mineral that the
        # country actually exports (per trade_world) — never attributed to a
        # production-only mineral like phosphate. The PDF labels the section as
        # country-level so the all-commodity scope is explicit.
        mineral_has_trade = (
            export_value > 0 or export_value_prev > 0 or export_value_prev2 > 0
        )

        # Top partners (current year, with YoY) — country-level (all commodities)
        cur.execute(
            """
            WITH curr AS (
                SELECT tp.name_en AS partner_name,
                       COALESCE(SUM(pt.value_usd), 0) AS val
                FROM public.partner_trade pt
                JOIN public.countries c ON c.id = pt.reporter_country_id
                JOIN public.trade_partners tp ON tp.id = pt.partner_id
                WHERE c.name_en = %s
                  AND LOWER(pt.type_trade) IN ('export', 'exports')
                  AND pt.year = %s
                GROUP BY tp.name_en
            ),
            prev AS (
                SELECT tp.name_en AS partner_name,
                       COALESCE(SUM(pt.value_usd), 0) AS val
                FROM public.partner_trade pt
                JOIN public.countries c ON c.id = pt.reporter_country_id
                JOIN public.trade_partners tp ON tp.id = pt.partner_id
                WHERE c.name_en = %s
                  AND LOWER(pt.type_trade) IN ('export', 'exports')
                  AND pt.year = %s
                GROUP BY tp.name_en
            ),
            totals AS (SELECT NULLIF(SUM(val), 0) AS tv FROM curr)
            SELECT curr.partner_name,
                   curr.val,
                   curr.val / totals.tv * 100                              AS share_pct,
                   CASE WHEN prev.val > 0
                        THEN (curr.val - prev.val) / prev.val * 100
                        ELSE NULL END                                      AS yoy_pct
            FROM   curr
            CROSS JOIN totals
            LEFT JOIN prev ON prev.partner_name = curr.partner_name
            WHERE  curr.val > 0
              AND  totals.tv IS NOT NULL
            ORDER BY curr.val DESC
            LIMIT 6
            """,
            (country, year_to, country, year_to - 1),
        )
        partner_rows = cur.fetchall()
        partners: list[Partner] = []
        if mineral_has_trade:
            for name, val, share, yoy in partner_rows:
                partners.append(Partner(
                    name=name,
                    value_usd=float(val or 0),
                    share_pct=float(share or 0),
                    yoy_pct=float(yoy) if yoy is not None else None,
                ))

        # Top 6 partners last year (for emerging-partner flag) — country-level
        cur.execute(
            """
            SELECT tp.name_en AS partner_name, SUM(pt.value_usd) AS v
            FROM public.partner_trade pt
            JOIN public.countries c ON c.id = pt.reporter_country_id
            JOIN public.trade_partners tp ON tp.id = pt.partner_id
            WHERE c.name_en = %s
              AND LOWER(pt.type_trade) IN ('export', 'exports')
              AND pt.year = %s
            GROUP BY tp.name_en
            ORDER BY v DESC NULLS LAST
            LIMIT 6
            """,
            (country, year_to - 1),
        )
        prev_top6 = {r[0] for r in cur.fetchall() if r[0]} if mineral_has_trade else set()

        # HS-6 breakdown ──────────────────────────────────────────────────────
        cur.execute(
            """
            WITH agg AS (
                SELECT mt.hs_codes AS hs_code,
                       COALESCE(mt.mineral_name_en, mt.hs_codes) AS hs_description,
                       SUM(tw.value_usd) AS export_value
                FROM public.trade_world tw
                JOIN public.countries c ON c.id = tw.reporter_country_id
                JOIN public.mineral_trade mt ON mt.id = tw.mineral_trade_id
                WHERE c.name_en = %s
                  AND mt.mineral_name_en ILIKE %s
                  AND LOWER(tw.type_trade) IN ('export', 'exports')
                  AND tw.year BETWEEN %s AND %s
                  AND mt.hs_codes IS NOT NULL
                GROUP BY mt.hs_codes, mt.mineral_name_en
            ),
            total AS (SELECT NULLIF(SUM(export_value), 0) AS tv FROM agg)
            SELECT a.hs_code, a.hs_description,
                   a.export_value / t.tv * 100 AS share_pct,
                   a.export_value
            FROM   agg a CROSS JOIN total t
            WHERE  t.tv IS NOT NULL
            ORDER BY a.export_value DESC
            LIMIT 6
            """,
            (country, mineral_pattern, year_from, year_to),
        )
        hs_rows = cur.fetchall()
        hs_products = [
            HSProduct(
                hs_code=str(code),
                description=desc or str(code),
                share_pct=float(share or 0),
                export_value_usd=float(val or 0),
            )
            for code, desc, share, val in hs_rows
        ]

        # Data version (cache key) — max(created_at) across the fact tables ──
        try:
            cur.execute(
                """
                SELECT GREATEST(
                    COALESCE((SELECT MAX(created_at) FROM public.arab_production), 'epoch'),
                    COALESCE((SELECT MAX(created_at) FROM public.trade_world), 'epoch'),
                    COALESCE((SELECT MAX(created_at) FROM public.partner_trade), 'epoch')
                )
                """
            )
            mx = cur.fetchone()[0]
            data_version = mx.strftime("%Y%m%d%H%M%S") if mx else datetime.now().strftime("%Y%m%d")
        except Exception:
            data_version = datetime.now().strftime("%Y%m%d")

    if not production_by_year and not export_value and not partners and not hs_products:
        raise NoReportDataError(
            f"No report data available for {country} / {mineral} "
            f"between {year_from} and {year_to}."
        )

    # ── KPIs ──────────────────────────────────────────────────────────────────
    yoy_growth_pct: Optional[float] = None
    if len(production_by_year) >= 2:
        prev_v = production_by_year[-2].production_mt
        curr_v = production_by_year[-1].production_mt
        if prev_v > 0:
            yoy_growth_pct = (curr_v - prev_v) / prev_v * 100

    ev_growth_pct: Optional[float] = None
    if export_value > 0 and export_value_prev > 0:
        ev_growth_pct = (export_value - export_value_prev) / export_value_prev * 100

    top_partner_share = partners[0].share_pct if partners else 0.0

    kpis = {
        "total_production_mt": KPI(
            value=fmt_mt(total_prod_t, lang) if total_prod_t else "N/A",
            delta=fmt_delta(yoy_growth_pct, lang),
            positive=(yoy_growth_pct or 0) >= 0,
        ),
        "export_value_usd": KPI(
            value=fmt_usd(export_value, lang) if export_value else "N/A",
            delta=fmt_delta(ev_growth_pct, lang),
            positive=(ev_growth_pct or 0) >= 0,
        ),
        "top_partner_share": KPI(
            value=fmt_pct(top_partner_share, lang) if top_partner_share else "N/A",
            delta="N/A",
            positive=True,
        ),
        "yoy_growth": KPI(
            value=fmt_pct(yoy_growth_pct, lang) if yoy_growth_pct is not None else "N/A",
            delta="N/A",
            positive=(yoy_growth_pct or 0) >= 0,
        ),
    }

    # ── Forecast (linear polyfit) ─────────────────────────────────────────────
    prod_values = [py.production_mt for py in production_by_year]
    next_prod = _linear_next(prod_values)
    ev_series = [ev_rows.get(year_to - 2, 0.0),
                 ev_rows.get(year_to - 1, 0.0),
                 ev_rows.get(year_to,     0.0)]
    ev_series = [v for v in ev_series if v > 0]
    next_ev = _linear_next(ev_series) if len(ev_series) >= 2 else None
    forecast = Forecast(
        production_next_year_mt=next_prod,
        export_next_year_usd=next_ev,
    )

    # ── Peer benchmark ────────────────────────────────────────────────────────
    peer = PeerBenchmark(
        country_yoy_pct=yoy_growth_pct,
        region_yoy_pct=region_yoy_pct,
    )

    # ── HHI ──────────────────────────────────────────────────────────────────
    hhi_val = _hhi([p.share_pct for p in partners]) if partners else None

    # ── Flags ─────────────────────────────────────────────────────────────────
    top3_share = sum(p.share_pct for p in partners[:3]) if partners else 0.0
    contraction = (
        export_value > 0 and export_value_prev > 0 and export_value_prev2 > 0
        and export_value < export_value_prev < export_value_prev2
    )
    curr_top6 = {p.name for p in partners}
    emerging = sorted(curr_top6 - prev_top6) if prev_top6 else []
    flags = Flags(
        concentration=top3_share > 70.0,
        contraction=bool(contraction),
        emerging_partners=emerging,
        price_pressure=False,  # quantity column not available in v_trade_world
    )

    # ── Summary ───────────────────────────────────────────────────────────────
    parts: list[str] = []
    if production_by_year:
        parts.append(
            f"{country_display}: {fmt_mt(total_prod_t, lang)} ({mineral_display}, {year_from}–{year_to})."
        )
    if export_value:
        parts.append(f"{t('kpi_export_val', lang)}: {fmt_usd(export_value, lang)} ({year_to}).")
    if yoy_growth_pct is not None:
        parts.append(f"{t('th_yoy', lang)}: {fmt_delta(yoy_growth_pct, lang)}.")
    summary = " ".join(parts) or t("ins_no_data_body", lang,
                                   country=country_display, mineral=mineral_display,
                                   year_from=year_from, year_to=year_to)

    # Insights are built by ``insights.py`` to keep this file query-focused.
    from src.reports.insights import build_insights, build_flag_messages
    insights = build_insights(
        country=country_display, mineral=mineral_display,
        production_by_year=production_by_year, partners=partners,
        hs_products=hs_products, export_value=export_value,
        export_value_prev=export_value_prev,
        year_from=year_from, year_to=year_to,
        peer=peer, hhi=hhi_val, lang=lang,
    )

    return ReportData(
        country=country_display,
        mineral=mineral_display,
        country_key_en=country,
        mineral_key_en=mineral,
        years=(year_from, year_to),
        lang=lang,
        generated_at=datetime.now().strftime("%B %d, %Y — %H:%M UTC"),
        kpis=kpis,
        production_by_year=production_by_year,
        trade_by_partner=partners,
        hs_products=hs_products,
        insights=insights,
        summary=summary,
        methodology=t("methodology_body", lang),
        forecast=forecast,
        peer=peer,
        hhi=hhi_val,
        flags=flags,
        data_version=data_version,
    )


# ─── Backward-compatible dict shape (consumed by legacy callers) ──────────────
def get_report_data(country="Morocco", mineral="Phosphate",
                    year_from=2019, year_to=2023, lang="en") -> dict:
    """Legacy dict-shaped return; mirrors the original ``amip_report_generator.get_report_data``."""
    payload = get_report_payload(country, mineral, year_from, year_to, lang)
    return _payload_to_legacy_dict(payload, lang)


def _payload_to_legacy_dict(p: ReportData, lang: str) -> dict:
    trade_by_partner = []
    for partner in p.trade_by_partner:
        if partner.yoy_pct is not None:
            yoy_str = fmt_delta(partner.yoy_pct, lang)
        else:
            yoy_str = "N/A"
        trade_by_partner.append((
            partner.name, "N/A",
            fmt_usd(partner.value_usd, lang),
            fmt_pct(partner.share_pct, lang),
            yoy_str,
        ))
    hs_products = [
        (h.hs_code, h.description, fmt_pct(h.share_pct, lang),
         fmt_usd(h.export_value_usd, lang))
        for h in p.hs_products
    ]
    kpis = {
        k: (v.value, v.delta, v.positive) for k, v in p.kpis.items()
    }
    return {
        "country": p.country,
        "mineral": p.mineral,
        "years": p.years,
        "generated_at": p.generated_at,
        "kpis": kpis,
        "production_by_year": [(py.year, py.production_mt) for py in p.production_by_year],
        "trade_by_partner": trade_by_partner,
        "hs_products": hs_products,
        "insights": p.insights,
        "summary": p.summary,
        "methodology": p.methodology,
        "_payload": p,
    }
