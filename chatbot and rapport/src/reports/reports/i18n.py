"""
AMIP i18n module — translations, locale-aware number formatting, Arabic shaping.

Single source of truth for all UI strings. Use `t(key, lang)` to look up a
translated string, `fmt_number(value, lang)` / `fmt_usd` / `fmt_mt` for
locale-aware numbers, and `shape_ar(text)` to prepare Arabic text for
ReportLab rendering.
"""

from __future__ import annotations

import re
from typing import Any

try:
    import arabic_reshaper
    from bidi.algorithm import get_display
    _ARABIC_OK = True
except Exception:  # pragma: no cover - optional deps
    arabic_reshaper = None

    def get_display(text, *args, **kwargs):
        return text

    _ARABIC_OK = False

from babel.numbers import format_decimal


SUPPORTED_LANGS = ["en", "fr", "ar"]
RTL_LANGS = {"ar"}
_LOCALES = {"en": "en_US", "fr": "fr_FR", "ar": "ar"}

# ─── Translation table ─────────────────────────────────────────────────────────
TRANSLATIONS: dict[str, dict[str, str]] = {
    "platform_name": {
        "en": "ARAB MINERALS<br/>INDICATORS PORTAL",
        "fr": "PORTAIL DES INDICATEURS<br/>MINIERS ARABES",
        "ar": "بوابة المؤشرات التعدينية العربية",
    },
    "report_title_tpl": {
        "en": "{mineral} Industry Report",
        "fr": "Rapport sur l'industrie du {mineral}",
        "ar": "تقرير صناعة {mineral}",
    },
    "cover_meta": {
        "en": "Production volumes · Export trade flows · Partner analysis · Key insights",
        "fr": "Volumes de production · Flux commerciaux · Analyse des partenaires · Aperçus clés",
        "ar": "أحجام الإنتاج · تدفقات التجارة · تحليل الشركاء · الرؤى الرئيسية",
    },
    "generated_label": {
        "en": "Report generated:",
        "fr": "Rapport généré le :",
        "ar": "تم إنشاء التقرير في:",
    },
    "header_subtitle": {
        "en": "AMIP — Arab Minerals Indicators Portal",
        "fr": "AMIP — Portail des Indicateurs Miniers Arabes",
        "ar": "AMIP — بوابة المؤشرات التعدينية العربية",
    },
    "footer_confidential": {
        "en": "CONFIDENTIAL — AMIP Internal Use",
        "fr": "CONFIDENTIEL — Usage interne AMIP",
        "ar": "سري — للاستخدام الداخلي",
    },
    "page_label": {"en": "Page", "fr": "Page", "ar": "صفحة"},
    "generated_prefix": {"en": "Generated:", "fr": "Généré :", "ar": "تم في:"},
    "toc_title": {
        "en": "Table of Contents",
        "fr": "Table des matières",
        "ar": "جدول المحتويات",
    },
    "sec_exec": {
        "en": "Executive Summary",
        "fr": "Résumé exécutif",
        "ar": "الملخص التنفيذي",
    },
    "sec_kpi": {
        "en": "Executive Summary & KPIs",
        "fr": "Résumé exécutif et indicateurs",
        "ar": "الملخص التنفيذي ومؤشرات الأداء",
    },
    "sec_production": {
        "en": "Production Analysis",
        "fr": "Analyse de la production",
        "ar": "تحليل الإنتاج",
    },
    "sec_trade": {
        "en": "Export Trade Flows",
        "fr": "Flux commerciaux d'exportation",
        "ar": "تدفقات التجارة التصديرية",
    },
    "sec_import": {
        "en": "Import Trade Flows",
        "fr": "Flux commerciaux d'importation",
        "ar": "تدفقات التجارة الواردة",
    },
    "sec_price": {
        "en": "Price Analysis",
        "fr": "Analyse des prix",
        "ar": "تحليل الأسعار",
    },
    "sec_hs": {
        "en": "HS Product Breakdown",
        "fr": "Répartition par produit SH",
        "ar": "تفصيل المنتجات حسب النظام المنسق",
    },
    "sec_insights": {
        "en": "Key Insights & Observations",
        "fr": "Aperçus et observations clés",
        "ar": "الرؤى والملاحظات الرئيسية",
    },
    "sec_flags": {
        "en": "Risk & Opportunity Flags",
        "fr": "Signaux de risque et d'opportunité",
        "ar": "إشارات المخاطر والفرص",
    },
    "sec_methodology": {
        "en": "Methodology & Data Sources",
        "fr": "Méthodologie et sources de données",
        "ar": "المنهجية ومصادر البيانات",
    },
    "kpi_total_prod": {
        "en": "Total Production",
        "fr": "Production totale",
        "ar": "إجمالي الإنتاج",
    },
    "kpi_latest_prod": {
        "en": "Latest Production",
        "fr": "Dernière production",
        "ar": "أحدث إنتاج",
    },
    "kpi_export_val": {
        "en": "Export Value",
        "fr": "Valeur des exportations",
        "ar": "قيمة الصادرات",
    },
    "kpi_top_partner": {
        "en": "Top Partner Share",
        "fr": "Part du principal partenaire",
        "ar": "حصة الشريك الأول",
    },
    "kpi_yoy": {
        "en": "YoY Growth ({year})",
        "fr": "Croissance annuelle ({year})",
        "ar": "النمو السنوي ({year})",
    },
    "kpi_avg_price": {
        "en": "Average Price",
        "fr": "Prix moyen",
        "ar": "متوسط السعر",
    },
    "label_period": {"en": "{start}-{end}", "fr": "{start}-{end}", "ar": "{start}-{end}"},
    "label_exports": {
        "en": "{share} exports",
        "fr": "{share} des exportations",
        "ar": "{share} من الصادرات",
    },
    "label_year": {"en": "{year}", "fr": "{year}", "ar": "{year}"},
    "mineral_description_title": {
        "en": "Mineral Description",
        "fr": "Description du minerai",
        "ar": "وصف المعدن",
    },
    "price_trend_direction": {
        "en": "Trend direction: {trend}",
        "fr": "Direction de tendance : {trend}",
        "ar": "اتجاه السعر: {trend}",
    },
    "peak_year": {
        "en": "Peak year: {year} ({value})",
        "fr": "Année de pointe : {year} ({value})",
        "ar": "سنة الذروة: {year} ({value})",
    },
    "trend_rising": {"en": "Rising", "fr": "En hausse", "ar": "صاعد"},
    "trend_falling": {"en": "Falling", "fr": "En baisse", "ar": "هابط"},
    "trend_stable": {"en": "Stable", "fr": "Stable", "ar": "مستقر"},
    "price_delta_tpl": {
        "en": "{value} vs prior",
        "fr": "{value} vs prec.",
        "ar": "{value} مقارنة بالسابق",
    },
    "th_year": {"en": "Year", "fr": "Année", "ar": "السنة"},
    "th_prod_mt": {
        "en": "Production (M MT)",
        "fr": "Production (Mt MT)",
        "ar": "الإنتاج (مليون طن متري)",
    },
    "th_yoy": {
        "en": "YoY Change",
        "fr": "Variation annuelle",
        "ar": "التغير السنوي",
    },
    "th_rank": {
        "en": "World Rank",
        "fr": "Rang mondial",
        "ar": "الترتيب العالمي",
    },
    "th_arab_rank": {
        "en": "Arab Rank",
        "fr": "Rang arabe",
        "ar": "الترتيب العربي",
    },
    "th_partner": {"en": "Partner", "fr": "Partenaire", "ar": "الشريك"},
    "th_volume": {"en": "Volume", "fr": "Volume", "ar": "الحجم"},
    "th_value_usd": {
        "en": "Value (USD)",
        "fr": "Valeur (USD)",
        "ar": "القيمة (دولار)",
    },
    "th_share": {"en": "Share", "fr": "Part", "ar": "الحصة"},
    "th_hs_code": {"en": "HS Code", "fr": "Code SH", "ar": "رمز ن.م."},
    "th_product": {
        "en": "Product Description",
        "fr": "Description du produit",
        "ar": "وصف المنتج",
    },
    "th_export_share": {
        "en": "Export Share",
        "fr": "Part des exportations",
        "ar": "حصة التصدير",
    },
    "th_export_value": {
        "en": "Export Value",
        "fr": "Valeur d'exportation",
        "ar": "قيمة التصدير",
    },
    "th_avg_price": {
        "en": "Average Price (USD)",
        "fr": "Prix moyen (USD)",
        "ar": "متوسط السعر (دولار)",
    },
    "th_min_price": {
        "en": "Min (USD)",
        "fr": "Min (USD)",
        "ar": "الأدنى (دولار)",
    },
    "th_max_price": {
        "en": "Max (USD)",
        "fr": "Max (USD)",
        "ar": "الأعلى (دولار)",
    },
    "th_trend": {
        "en": "Trend Direction",
        "fr": "Direction",
        "ar": "الاتجاه",
    },
    "no_bilateral": {
        "en": "No bilateral trade data found for the selected parameters.",
        "fr": "Aucune donnée commerciale bilatérale trouvée pour les paramètres sélectionnés.",
        "ar": "لا توجد بيانات تجارية ثنائية للمعايير المحددة.",
    },
    "partner_country_level_note": {
        "en": "Note: bilateral partner shares reflect {country}'s total mineral exports across all commodities; the dataset is not split by individual mineral.",
        "fr": "Remarque : les parts des partenaires bilatéraux reflètent l'ensemble des exportations minières de {country}, tous produits confondus ; les données ne sont pas ventilées par minéral.",
        "ar": "ملاحظة: تعكس حصص الشركاء الثنائيين إجمالي صادرات {country} المعدنية لجميع السلع؛ والبيانات غير مُقسَّمة حسب كل معدن على حدة.",
    },
    "no_import": {
        "en": "No import partner data found for the selected parameters.",
        "fr": "Aucune donnée sur les partenaires d'importation trouvée pour les paramètres sélectionnés.",
        "ar": "لا توجد بيانات لشركاء الاستيراد للمعايير المحددة.",
    },
    "no_hs": {
        "en": "No HS product data found for the selected parameters.",
        "fr": "Aucune donnée de produit SH trouvée pour les paramètres sélectionnés.",
        "ar": "لا توجد بيانات منتجات نظام منسق للمعايير المحددة.",
    },
    "no_price": {
        "en": "No price data found for the selected mineral and period.",
        "fr": "Aucune donnée de prix trouvée pour le minerai et la période sélectionnés.",
        "ar": "لا توجد بيانات أسعار للمعدن والفترة المحددين.",
    },
    "top_export_partners": {
        "en": "Top 5 export partners in {year}",
        "fr": "Les 5 premiers partenaires d'exportation en {year}",
        "ar": "أهم 5 شركاء تصدير في {year}",
    },
    "top_import_partners": {
        "en": "Top 5 import partners in {year}",
        "fr": "Les 5 premiers partenaires d'importation en {year}",
        "ar": "أهم 5 شركاء استيراد في {year}",
    },
    "top_hs_codes": {
        "en": "Top exported HS codes in {year}",
        "fr": "Principaux codes SH exportés en {year}",
        "ar": "أهم رموز النظام المنسق المصدرة في {year}",
    },
    "indicative_projection": {
        "en": "Indicative projection (linear)",
        "fr": "Projection indicative (linéaire)",
        "ar": "إسقاط إرشادي (خطي)",
    },
    "next_year_forecast": {
        "en": "Next-year projection: {value}",
        "fr": "Projection pour l'année suivante : {value}",
        "ar": "إسقاط العام المقبل: {value}",
    },
    "methodology_body": {
        "en": "Production data sourced from Arab country statistical offices and cross-validated against USGS Mineral Resources Data. Trade figures derived from UN Comtrade HS-6 level data. All monetary values in USD (current prices). MT = metric tonnes. YoY growth calculated on a calendar-year basis.",
        "fr": "Données de production issues des offices statistiques nationaux des pays arabes, recoupées avec USGS Mineral Resources Data. Données commerciales issues de UN Comtrade au niveau SH-6. Toutes les valeurs monétaires sont en USD (prix courants).",
        "ar": "بيانات الإنتاج مستقاة من المكاتب الإحصائية للدول العربية، تم التحقق منها مقابل بيانات USGS. بيانات التجارة من UN Comtrade على مستوى ن.م-6. القيم بالدولار الأمريكي.",
    },
    "methodology_sources": {
        "en": "Sources: Arab country statistical offices, USGS, UN Comtrade, internal AMIP PostgreSQL database.",
        "fr": "Sources : offices statistiques des pays arabes, USGS, UN Comtrade, base PostgreSQL interne AMIP.",
        "ar": "المصادر: المكاتب الإحصائية العربية، USGS، UN Comtrade، قاعدة بيانات AMIP الداخلية.",
    },
    "source_stat_offices": {
        "en": "Arab country statistical offices",
        "fr": "Offices statistiques des pays arabes",
        "ar": "المكاتب الإحصائية للدول العربية",
    },
    "source_usgs": {"en": "USGS", "fr": "USGS", "ar": "USGS"},
    "source_comtrade": {"en": "UN Comtrade", "fr": "UN Comtrade", "ar": "UN Comtrade"},
    "source_amip_db": {
        "en": "Internal AMIP PostgreSQL database",
        "fr": "Base PostgreSQL interne AMIP",
        "ar": "قاعدة بيانات AMIP الداخلية PostgreSQL",
    },
    "mineral_desc_phosphate": {
        "en": "Phosphate rock is a strategic industrial mineral used mainly to produce fertilizers, phosphoric acid, and downstream chemicals. Its market position links mine output with agricultural demand and international shipping conditions.",
        "fr": "La roche phosphatée est un minerai industriel stratégique utilisé principalement pour produire des engrais, de l'acide phosphorique et des produits chimiques en aval. Sa position de marché relie la production minière à la demande agricole et aux conditions du transport international.",
        "ar": "صخر الفوسفات معدن صناعي استراتيجي يستخدم أساسا في إنتاج الأسمدة وحمض الفوسفوريك والمواد الكيميائية اللاحقة. ويرتبط وضعه في السوق بإنتاج المناجم والطلب الزراعي وظروف الشحن الدولي.",
    },
    "mineral_desc_generic": {
        "en": "{mineral} is an industrial mineral monitored by AMIP through production, trade, price, and partner-flow indicators. The report links national output with external market demand and mineral supply-chain conditions.",
        "fr": "{mineral} est un minerai industriel suivi par AMIP à travers des indicateurs de production, de commerce, de prix et de partenaires. Le rapport relie la production nationale à la demande externe et aux conditions de la chaîne d'approvisionnement.",
        "ar": "{mineral} معدن صناعي ترصده منصة AMIP من خلال مؤشرات الإنتاج والتجارة والأسعار وتدفقات الشركاء. يربط التقرير الإنتاج الوطني بالطلب الخارجي وظروف سلسلة الإمداد.",
    },
    "ins_record_output": {
        "en": "Record output in {year}",
        "fr": "Production record en {year}",
        "ar": "إنتاج قياسي في {year}",
    },
    "ins_prod_growth": {
        "en": "Production growth",
        "fr": "Croissance de la production",
        "ar": "نمو الإنتاج",
    },
    "ins_prod_decline": {
        "en": "Production decline",
        "fr": "Baisse de la production",
        "ar": "انخفاض الإنتاج",
    },
    "ins_top_partner": {
        "en": "{partner} leads exports",
        "fr": "{partner} en tête des exportations",
        "ar": "{partner} في صدارة الصادرات",
    },
    "ins_export_trend": {
        "en": "Export revenue trend",
        "fr": "Tendance des revenus d'exportation",
        "ar": "اتجاه عائدات التصدير",
    },
    "ins_hs_composition": {
        "en": "Export product composition",
        "fr": "Composition des produits exportés",
        "ar": "تكوين المنتجات المصدرة",
    },
    "ins_no_data": {
        "en": "No data available",
        "fr": "Aucune donnée disponible",
        "ar": "لا توجد بيانات متاحة",
    },
    "ins_peer_bench": {
        "en": "Peer benchmarking",
        "fr": "Comparaison entre pairs",
        "ar": "المقارنة مع الأقران",
    },
    "ins_concentration": {
        "en": "Market concentration (HHI)",
        "fr": "Concentration du marché (IHH)",
        "ar": "تركز السوق (HHI)",
    },
    "ins_record_output_body": {
        "en": "{country}'s {mineral} production reached {value} in {year}, the highest level in the {span}-year review period.",
        "fr": "La production de {mineral} de {country} a atteint {value} en {year}, le niveau le plus élevé de la période de {span} ans.",
        "ar": "بلغ إنتاج {country} من {mineral} {value} في {year}، وهو أعلى مستوى خلال فترة المراجعة البالغة {span} سنوات.",
    },
    "ins_prod_growth_body": {
        "en": "{mineral} production grew {pct} from {first_v} ({first_y}) to {last_v} ({last_y}).",
        "fr": "La production de {mineral} a augmenté de {pct}, passant de {first_v} ({first_y}) à {last_v} ({last_y}).",
        "ar": "نما إنتاج {mineral} بنسبة {pct} من {first_v} ({first_y}) إلى {last_v} ({last_y}).",
    },
    "ins_prod_decline_body": {
        "en": "{mineral} production fell {pct} from {first_v} ({first_y}) to {last_v} ({last_y}).",
        "fr": "La production de {mineral} a chuté de {pct}, passant de {first_v} ({first_y}) à {last_v} ({last_y}).",
        "ar": "انخفض إنتاج {mineral} بنسبة {pct} من {first_v} ({first_y}) إلى {last_v} ({last_y}).",
    },
    "ins_top_partner_body": {
        "en": "{partner} is {country}'s leading export destination, representing {share} of total export value ({value}).{top3}",
        "fr": "{partner} est la principale destination d'exportation de {country}, représentant {share} de la valeur totale ({value}).{top3}",
        "ar": "{partner} هو الوجهة الرئيسية لصادرات {country}، ويمثل {share} من إجمالي قيمة التصدير ({value}).{top3}",
    },
    "ins_top3_suffix": {
        "en": " The top 3 partners account for {pct} of exports.",
        "fr": " Les 3 principaux partenaires représentent {pct} des exportations.",
        "ar": " يستحوذ أكبر 3 شركاء على {pct} من الصادرات.",
    },
    "ins_export_trend_body": {
        "en": "Export revenues {direction} {pct} to {value} in {year}, compared with {prev_value} in {prev_year}.",
        "fr": "Les revenus d'exportation ont {direction} de {pct} pour atteindre {value} en {year}, contre {prev_value} en {prev_year}.",
        "ar": "{direction} عائدات التصدير بنسبة {pct} لتصل إلى {value} في {year}، مقارنة بـ {prev_value} في {prev_year}.",
    },
    "trend_grew": {"en": "grew", "fr": "progressé", "ar": "ارتفعت"},
    "trend_fell": {"en": "fell", "fr": "reculé", "ar": "انخفضت"},
    "ins_hs_composition_body": {
        "en": "The top HS export category, {top_hs}, accounts for {share} of total export value. {n} distinct HS product categories were identified for this mineral.",
        "fr": "La principale catégorie SH d'exportation, {top_hs}, représente {share} de la valeur totale. {n} catégories SH distinctes ont été identifiées.",
        "ar": "تستحوذ فئة النظام المنسق الأعلى، {top_hs}، على {share} من إجمالي قيمة التصدير. تم تحديد {n} فئات منتجات مميزة.",
    },
    "ins_no_data_body": {
        "en": "Insufficient data for {country} — {mineral} in the {year_from}–{year_to} period.",
        "fr": "Données insuffisantes pour {country} — {mineral} sur la période {year_from}–{year_to}.",
        "ar": "بيانات غير كافية لـ {country} — {mineral} في الفترة {year_from}–{year_to}.",
    },
    "ins_peer_bench_body": {
        "en": "{country} grew {country_pct} YoY vs an Arab regional average of {region_pct}.",
        "fr": "{country} a progressé de {country_pct} en glissement annuel contre une moyenne arabe de {region_pct}.",
        "ar": "نما {country} بنسبة {country_pct} على أساس سنوي مقابل متوسط عربي قدره {region_pct}.",
    },
    "ins_concentration_body": {
        "en": "Export partner concentration (HHI) is {hhi}, indicating {level}.",
        "fr": "La concentration des partenaires d'exportation (IHH) est de {hhi}, indiquant {level}.",
        "ar": "تركز شركاء التصدير (HHI) هو {hhi}، مما يشير إلى {level}.",
    },
    "hhi_low": {
        "en": "low concentration",
        "fr": "faible concentration",
        "ar": "تركز منخفض",
    },
    "hhi_mod": {
        "en": "moderate concentration",
        "fr": "concentration modérée",
        "ar": "تركز معتدل",
    },
    "hhi_high": {
        "en": "HIGH concentration risk (>2500)",
        "fr": "RISQUE ÉLEVÉ de concentration (>2500)",
        "ar": "خطر تركز مرتفع (>2500)",
    },
    "flag_concentration": {
        "en": "Concentration risk — top 3 partners hold {pct} of exports.",
        "fr": "Risque de concentration — les 3 principaux partenaires détiennent {pct} des exportations.",
        "ar": "خطر تركز — يستحوذ أكبر 3 شركاء على {pct} من الصادرات.",
    },
    "flag_contraction": {
        "en": "Demand contraction — export value fell two years in a row.",
        "fr": "Contraction de la demande — la valeur des exportations a chuté deux années consécutives.",
        "ar": "انكماش الطلب — انخفضت قيمة الصادرات لعامين متتاليين.",
    },
    "flag_emerging": {
        "en": "Emerging partner — {partner} is a new entry in the top 6.",
        "fr": "Partenaire émergent — {partner} fait son entrée dans le top 6.",
        "ar": "شريك ناشئ — {partner} دخول جديد ضمن أفضل 6.",
    },
    "flag_price_pressure": {
        "en": "Price pressure — unit value down while volume rose.",
        "fr": "Pression sur les prix — valeur unitaire en baisse alors que le volume augmente.",
        "ar": "ضغط على الأسعار — انخفاض القيمة الوحدية مع ارتفاع الحجم.",
    },
}


# ─── Lookup ─────────────────────────────────────────────────────────────────────
def t(key: str, lang: str = "en", **kwargs: Any) -> str:
    """Look up a translation; format with kwargs if provided.

    Falls back to English if the key/lang combo is missing.
    """
    if lang not in SUPPORTED_LANGS:
        lang = "en"
    entry = TRANSLATIONS.get(key)
    if not entry:
        return key
    template = entry.get(lang) or entry.get("en") or key
    if kwargs:
        try:
            return template.format(**kwargs)
        except (KeyError, IndexError):
            return template
    return template


# ─── Number formatting ──────────────────────────────────────────────────────────
def fmt_number(value, lang: str = "en", decimals: int = 1) -> str:
    """Locale-aware decimal formatter.

    - EN: 1,234.5
    - FR: 1 234,5 (uses NBSP as thousands separator via babel)
    - AR: Western digits with Arabic separators
    """
    locale = _LOCALES.get(lang, "en_US")
    pattern = "#,##0" + ("." + "0" * decimals if decimals else "")
    try:
        return format_decimal(value, format=pattern, locale=locale)
    except Exception:
        return f"{value:,.{decimals}f}"


def _fmt_unit(value, lang, suffixes, default) -> str:
    if value is None:
        return "N/A"
    for divisor, suffix in suffixes:
        if abs(value) >= divisor:
            return f"{fmt_number(value / divisor, lang, decimals=2 if divisor >= 1e9 else 1)}{suffix}"
    return f"{fmt_number(value, lang, decimals=0)}{default}"


def fmt_mt(tonnes, lang: str = "en") -> str:
    if tonnes is None:
        return "N/A"
    suffixes = [(1e9, "B MT"), (1e6, "M MT"), (1e3, "K MT")]
    return _fmt_unit(float(tonnes), lang, suffixes, " MT")


def fmt_usd(usd, lang: str = "en") -> str:
    if usd is None:
        return "N/A"
    suffixes = [(1e9, "B"), (1e6, "M"), (1e3, "K")]
    body = _fmt_unit(float(usd), lang, suffixes, "")
    if body != "N/A":
        return f"${body}"
    return "N/A"


def fmt_delta(value, lang: str = "en", suffix: str = "%") -> str:
    if value is None:
        return "N/A"
    sign = "+" if value >= 0 else "−"
    return f"{sign}{fmt_number(abs(value), lang, decimals=1)}{suffix}"


def fmt_pct(value, lang: str = "en", decimals: int = 1) -> str:
    if value is None:
        return "N/A"
    return f"{fmt_number(value, lang, decimals=decimals)}%"


# ─── Arabic shaping ─────────────────────────────────────────────────────────────
_TAG_RE = re.compile(r"(<[^>]+>)")

# Matches runs of non-Arabic, non-whitespace characters (Latin letters, Western
# digits, symbols, currency signs, arrows).  Spaces are included only when
# sandwiched between two such characters so "38.1 M MT" stays one run while the
# space between "+12.3%" and shaped Arabic chars is left untouched.
# Excluded ranges: Arabic (0600-06FF), Pres-A (FB50-FDFF), Pres-B (FE70-FEFF).
_LAT = r'[^؀-ۿﭐ-﷿ﹰ-﻿\s]'
_LATIN_RUN_RE = re.compile(_LAT + r'(?:' + _LAT + r'| (?=' + _LAT + r'))*')


def shape_ar(text: str, wrap_latin: bool = True) -> str:
    """Reshape + bidi-reorder Arabic text for ReportLab.

    Preserves HTML/XML tags (``<b>``, ``<br/>``, ``<font ...>``) untouched so
    Paragraph mini-markup still parses correctly.

    When ``wrap_latin`` is True (the default, for ``Paragraph`` flowables),
    every Latin/digit/symbol run is wrapped in ``<font name="Helvetica">`` for
    clean Latin glyphs in mixed text.  Set ``wrap_latin=False`` for text drawn
    directly on the canvas (``canvas.drawString``), which does NOT parse markup
    — there the caller must instead select an Arabic-capable font (e.g. Amiri,
    which also covers Latin) so the whole string renders without tag leakage.
    """
    if not text or not _ARABIC_OK:
        return text
    parts = _TAG_RE.split(text)
    out = []
    for part in parts:
        if not part:
            continue
        if part.startswith("<") and part.endswith(">"):
            out.append(part)
            continue
        try:
            shaped = get_display(arabic_reshaper.reshape(part))
        except Exception:
            shaped = part
        if wrap_latin:
            shaped = _LATIN_RUN_RE.sub(
                lambda m: f'<font name="Helvetica">{m.group()}</font>',
                shaped,
            )
        out.append(shaped)
    return "".join(out)


def localize(text: str, lang: str, wrap_latin: bool = True) -> str:
    """Apply Arabic shaping if needed; otherwise pass through.

    Pass ``wrap_latin=False`` for canvas-drawn text (no markup parsing).
    """
    if lang == "ar" and text:
        return shape_ar(text, wrap_latin=wrap_latin)
    return text


def is_rtl(lang: str) -> bool:
    return lang in RTL_LANGS
