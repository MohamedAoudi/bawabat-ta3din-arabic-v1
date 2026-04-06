import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Boxes, ChartLine, Flag } from "lucide-react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import { LanguageContext } from "../App";

const series = [
  { year: 2010, val: 851 },
  { year: 2011, val: 881 },
  { year: 2012, val: 890 },
  { year: 2013, val: 913 },
  { year: 2014, val: 931 },
  { year: 2015, val: 961 },
  { year: 2016, val: 971 },
  { year: 2017, val: 981 },
  { year: 2018, val: 1011 },
  { year: 2019, val: 2183 },
  { year: 2020, val: 1568 },
  { year: 2021, val: 1167 },
  { year: 2022, val: 1574 },
  { year: 2023, val: 1561 },
  { year: 2024, val: 1600 },
];

const PAGE_TRANSLATIONS = {
  ar: {
    pageTitle: "تطور الانتاج التعديني",
    pageSubtitle: "تتبع تطور الانتاج عبر السنوات مع ابراز الاتجاهات واهم التغيرات السنوية.",
    country: "الدولة",
    product: "الخامة / المنتج",
    demoView: "عرض تجريبي",
    trendChart: "منحنى التطور عبر الزمن",
    productionUnit: "وحدة الانتاج",
    yearsProduction: "السنوات / الانتاج",
    production: "الانتاج",
    year: "السنة",
    sources: "المصادر",
    ministryIndustry: "وزارة الصناعة",
    officialReports: "تقارير رسمية (Placeholder)",
    globalDatabase: "قاعدة بيانات عالمية (Placeholder)",
    sourceLink: "رابط المصدر",
  },
  fr: {
    pageTitle: "Evolution de la production miniere",
    pageSubtitle: "Suivez l'evolution de la production au fil des ans et les principales variations annuelles.",
    country: "Pays",
    product: "Minerai / produit",
    demoView: "Vue demo",
    trendChart: "Courbe d'evolution dans le temps",
    productionUnit: "Unite de production",
    yearsProduction: "Annees / production",
    production: "Production",
    year: "Annee",
    sources: "Sources",
    ministryIndustry: "Ministere de l'industrie",
    officialReports: "Rapports officiels (Placeholder)",
    globalDatabase: "Base de donnees mondiale (Placeholder)",
    sourceLink: "Lien source",
  },
  en: {
    pageTitle: "Mining production trend",
    pageSubtitle: "Track production over time with key yearly shifts and long-term direction.",
    country: "Country",
    product: "Mineral / product",
    demoView: "Demo view",
    trendChart: "Trend over time",
    productionUnit: "Production unit",
    yearsProduction: "Years / production",
    production: "Production",
    year: "Year",
    sources: "Sources",
    ministryIndustry: "Ministry of Industry",
    officialReports: "Official reports (Placeholder)",
    globalDatabase: "Global database (Placeholder)",
    sourceLink: "Source link",
  },
};

const COUNTRY_LABELS = {
  "مملكة البحرين": {
    ar: "مملكة البحرين",
    fr: "Royaume de Bahrein",
    en: "Kingdom of Bahrain",
  },
  "المملكة المغربية": {
    ar: "المملكة المغربية",
    fr: "Royaume du Maroc",
    en: "Kingdom of Morocco",
  },
  "المملكة العربية السعودية": {
    ar: "المملكة العربية السعودية",
    fr: "Royaume d'Arabie saoudite",
    en: "Kingdom of Saudi Arabia",
  },
  "الجمهورية التونسية": {
    ar: "الجمهورية التونسية",
    fr: "Republique tunisienne",
    en: "Tunisian Republic",
  },
  "جمهورية مصر العربية": {
    ar: "جمهورية مصر العربية",
    fr: "Republique arabe d'Egypte",
    en: "Arab Republic of Egypt",
  },
};

const PRODUCT_LABELS = {
  "الألمنيوم الأولي": {
    ar: "الالمنيوم الاولي",
    fr: "Aluminium primaire",
    en: "Primary aluminum",
  },
  "الفوسفات": { ar: "الفوسفات", fr: "Phosphate", en: "Phosphate" },
  "النحاس": { ar: "النحاس", fr: "Cuivre", en: "Copper" },
  "الحديد": { ar: "الحديد", fr: "Fer", en: "Iron" },
  "الذهب": { ar: "الذهب", fr: "Or", en: "Gold" },
};

const UNIT_LABELS = {
  "ألف طن": { ar: "الف طن", fr: "milliers de tonnes", en: "thousand tons" },
};

const NUMBER_LOCALES = {
  ar: "ar-MA",
  fr: "fr-FR",
  en: "en-US",
};

const COUNTRY_OPTIONS = [
  "مملكة البحرين",
  "المملكة المغربية",
  "المملكة العربية السعودية",
  "الجمهورية التونسية",
  "جمهورية مصر العربية",
];

const PRODUCT_OPTIONS = [
  "الألمنيوم الأولي",
  "الفوسفات",
  "النحاس",
  "الحديد",
  "الذهب",
];

function formatNumber(n, language = "ar") {
  return new Intl.NumberFormat(NUMBER_LOCALES[language] || NUMBER_LOCALES.ar).format(n);
}

const localizeCountry = (value, language) => COUNTRY_LABELS[value]?.[language] || value;
const localizeProduct = (value, language) => PRODUCT_LABELS[value]?.[language] || value;
const localizeUnit = (value, language) => UNIT_LABELS[value]?.[language] || value;

export default function M2Page() {
  const { language } = useContext(LanguageContext);
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS.ar;

  const [country, setCountry] = useState("مملكة البحرين");
  const [product, setProduct] = useState("الألمنيوم الأولي");
  const unitLabel = "ألف طن";

  const yearsRows = useMemo(
    () => series.filter((x) => x.year <= 2022),
    []
  );

  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const labels = series.map((x) => x.year);
    const values = series.map((x) => x.val);

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: t.production,
            data: values,
            borderWidth: 3,
            tension: 0.18,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: false,
            borderColor: "rgba(8, 39, 33, 0.95)",
            pointBackgroundColor: "rgba(8, 39, 33, 0.95)",
            pointBorderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) =>
                ` ${formatNumber(context.parsed.y, language)} ${localizeUnit(unitLabel, language)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(0,0,0,.08)" },
            ticks: { font: { family: "Cairo", weight: "700" } },
          },
          y: {
            grid: { color: "rgba(0,0,0,.10)" },
            ticks: { font: { family: "Cairo" } },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [language, t.production]);

  return (
    <div className="" dir={language === "ar" ? "rtl" : "ltr"} lang={language}>
      <Menu />
      <main className="min-h-screen py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 rounded-3xl bg-gradient-to-l from-[#082721] to-[#051712] px-6 py-8 text-center text-white shadow-lg ring-1 ring-[#ddbc6b]/25">
          <h1 className="mb-2 text-2xl font-extrabold sm:text-3xl">
            {t.pageTitle}
          </h1>
          <p className="text-sm text-slate-100/80">
            {t.pageSubtitle}
          </p>
        </header>

        {/* Top filters */}
        <section className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/60">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm">
              <div className="mb-2 text-xs font-extrabold text-slate-500">
                {t.country}
              </div>
              <div className="flex items-center gap-2">
                <Flag size={16} strokeWidth={2.2} className="text-[#082721]" />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border-none bg-transparent text-sm font-bold text-slate-700 outline-none focus:ring-0"
                >
                  {COUNTRY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {localizeCountry(option, language)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm">
              <div className="mb-2 text-xs font-extrabold text-slate-500">
                {t.product}
              </div>
              <div className="flex items-center gap-2">
                <Boxes size={16} strokeWidth={2.2} className="text-[#082721]" />
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full border-none bg-transparent text-sm font-bold text-slate-700 outline-none focus:ring-0"
                >
                  {PRODUCT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {localizeProduct(option, language)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs font-semibold text-slate-500">
            {t.demoView}: {localizeCountry(country, language)} - {localizeProduct(product, language)}
          </div>
        </section>

        {/* Main layout */}
        <section className="mt-4 grid gap-4 lg:grid-cols-12">
          {/* Chart */}
          <div className="lg:col-span-9">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-base font-extrabold text-slate-800">
                  {t.trendChart}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#ddbc6b]/15 px-3 py-1 text-xs font-bold text-[#082721]">
                  <ChartLine size={14} strokeWidth={2.2} />
                  <span>{t.productionUnit}: {localizeUnit(unitLabel, language)}</span>
                </div>
              </div>

              <div className="h-[320px] sm:h-[420px]">
                <canvas ref={canvasRef} />
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4 lg:col-span-3">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 text-sm font-extrabold text-slate-800">
                {t.yearsProduction}
              </div>
              <div className="max-h-[260px] overflow-y-auto rounded-2xl border border-slate-100 bg-white">
                <table className={`min-w-full text-xs ${language === "ar" ? "text-right" : "text-left"}`}>
                  <thead className="sticky top-0 bg-slate-50 text-[11px] font-extrabold text-[#082721]">
                    <tr>
                      <th className="px-3 py-2">{t.production}</th>
                      <th className="px-3 py-2">{t.year}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearsRows.map((r) => (
                      <tr
                        key={r.year}
                        className="border-t border-slate-100 text-slate-700"
                      >
                        <td className="px-3 py-1.5 font-bold">
                          {formatNumber(r.val, language)}
                        </td>
                        <td className="px-3 py-1.5">{formatNumber(r.year, language)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 text-sm font-extrabold text-slate-800">
                {t.sources}
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-xs">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#082721]" />
                  <div>
                    <div className="font-bold">{t.ministryIndustry}</div>
                    <div className="text-[11px] text-slate-500">
                      {t.officialReports}
                    </div>
                    <button
                      type="button"
                      className="mt-1 text-[11px] font-bold text-[#082721] underline"
                    >
                      {t.sourceLink}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-xs">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <div className="font-bold">USGS</div>
                    <div className="text-[11px] text-slate-500">
                      {t.globalDatabase}
                    </div>
                    <button
                      type="button"
                      className="mt-1 text-[11px] font-bold text-[#082721] underline"
                    >
                      {t.sourceLink}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

