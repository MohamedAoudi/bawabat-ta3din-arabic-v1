"""
AMIP Report — insights & flag rules.

All narrative text is produced via ``i18n.t(key, lang, **kwargs)`` so adding a
language is a translations-only change.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from src.reports.i18n import fmt_delta, fmt_mt, fmt_number, fmt_pct, fmt_usd, t

if TYPE_CHECKING:
    from src.reports.data import Partner, PeerBenchmark, ProductionYear


def build_insights(*, country, mineral, production_by_year, partners, hs_products,
                   export_value, export_value_prev, year_from, year_to,
                   peer, hhi, lang):
    """Rule-based narrative bullets. Returns (title, body) tuples already localized."""
    out = []

    if len(production_by_year) >= 2:
        first = production_by_year[0]
        last = production_by_year[-1]
        peak = max(production_by_year, key=lambda r: r.production_mt)
        if peak.year == year_to:
            out.append((
                t("ins_record_output", lang, year=year_to),
                t("ins_record_output_body", lang,
                  country=country, mineral=mineral,
                  value=fmt_mt(last.production_mt * 1e6, lang),
                  year=year_to, span=(year_to - year_from) + 1),
            ))
        elif last.production_mt >= first.production_mt:
            pct = (((last.production_mt - first.production_mt) / first.production_mt) * 100
                   if first.production_mt else 0)
            out.append((
                t("ins_prod_growth", lang),
                t("ins_prod_growth_body", lang,
                  mineral=mineral, pct=fmt_pct(pct, lang),
                  first_v=fmt_mt(first.production_mt * 1e6, lang), first_y=first.year,
                  last_v=fmt_mt(last.production_mt * 1e6, lang), last_y=last.year),
            ))
        elif first.production_mt:
            pct = ((first.production_mt - last.production_mt) / first.production_mt) * 100
            out.append((
                t("ins_prod_decline", lang),
                t("ins_prod_decline_body", lang,
                  mineral=mineral, pct=fmt_pct(pct, lang),
                  first_v=fmt_mt(first.production_mt * 1e6, lang), first_y=first.year,
                  last_v=fmt_mt(last.production_mt * 1e6, lang), last_y=last.year),
            ))

    if peer.country_yoy_pct is not None and peer.region_yoy_pct is not None:
        out.append((
            t("ins_peer_bench", lang),
            t("ins_peer_bench_body", lang,
              country=country,
              country_pct=fmt_delta(peer.country_yoy_pct, lang),
              region_pct=fmt_delta(peer.region_yoy_pct, lang)),
        ))

    if partners:
        top = partners[0]
        top3_share = sum(p.share_pct for p in partners[:3])
        suffix = (t("ins_top3_suffix", lang, pct=fmt_pct(top3_share, lang, decimals=0))
                  if top3_share > 0 else "")
        out.append((
            t("ins_top_partner", lang, partner=top.name),
            t("ins_top_partner_body", lang,
              partner=top.name, country=country,
              share=fmt_pct(top.share_pct, lang),
              value=fmt_usd(top.value_usd, lang), top3=suffix),
        ))

    if export_value > 0 and export_value_prev > 0:
        ev_chg = ((export_value - export_value_prev) / export_value_prev) * 100
        direction_key = "trend_grew" if ev_chg >= 0 else "trend_fell"
        out.append((
            t("ins_export_trend", lang),
            t("ins_export_trend_body", lang,
              direction=t(direction_key, lang),
              pct=fmt_pct(abs(ev_chg), lang),
              value=fmt_usd(export_value, lang), year=year_to,
              prev_value=fmt_usd(export_value_prev, lang), prev_year=year_to - 1),
        ))

    if hs_products:
        top_hs = hs_products[0]
        out.append((
            t("ins_hs_composition", lang),
            t("ins_hs_composition_body", lang,
              top_hs=top_hs.description,
              share=fmt_pct(top_hs.share_pct, lang), n=len(hs_products)),
        ))

    if hhi is not None:
        if hhi >= 2500:
            level = t("hhi_high", lang)
        elif hhi >= 1500:
            level = t("hhi_mod", lang)
        else:
            level = t("hhi_low", lang)
        out.append((
            t("ins_concentration", lang),
            t("ins_concentration_body", lang,
              hhi=fmt_number(hhi, lang, decimals=0), level=level),
        ))

    if not out:
        out.append((
            t("ins_no_data", lang),
            t("ins_no_data_body", lang,
              country=country, mineral=mineral,
              year_from=year_from, year_to=year_to),
        ))

    return out


def build_flag_messages(flags, partners, lang):
    """Convert structured Flags object to (icon, color, message) tuples for the PDF."""
    msgs = []
    if flags.concentration and partners:
        top3 = sum(p.share_pct for p in partners[:3])
        msgs.append(("🟡", "yellow",
                     t("flag_concentration", lang, pct=fmt_pct(top3, lang, decimals=0))))
    if flags.contraction:
        msgs.append(("🔴", "red", t("flag_contraction", lang)))
    for partner in flags.emerging_partners[:3]:
        msgs.append(("🟢", "green", t("flag_emerging", lang, partner=partner)))
    if flags.price_pressure:
        msgs.append(("🟡", "yellow", t("flag_price_pressure", lang)))
    return msgs
