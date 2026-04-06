import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Boxes, Weight } from "lucide-react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import { LanguageContext } from "../App";

const donutByYear = {
  2016: {
    arab: 69000,
    world: 79000,
    table: [
      { c: "الإمارات العربية المتحدة", v: 34815 },
      { c: "مملكة البحرين", v: 18043 },
      { c: "المملكة العربية السعودية", v: 9692 },
      { c: "سلطنة عمان", v: 5431 },
      { c: "دولة قطر", v: 8854 },
      { c: "جمهورية مصر العربية", v: 2317 },
      { c: "الإجمالي", v: 79152 },
    ],
  },
  2017: {
    arab: 67000,
    world: 82000,
    table: [
      { c: "الإمارات العربية المتحدة", v: 34000 },
      { c: "مملكة البحرين", v: 18500 },
      { c: "المملكة العربية السعودية", v: 10200 },
      { c: "سلطنة عمان", v: 5600 },
      { c: "دولة قطر", v: 9100 },
      { c: "جمهورية مصر العربية", v: 2600 },
      { c: "الإجمالي", v: 80000 },
    ],
  },
  2018: {
    arab: 71000,
    world: 85000,
    table: [
      { c: "الإمارات العربية المتحدة", v: 35500 },
      { c: "مملكة البحرين", v: 19000 },
      { c: "المملكة العربية السعودية", v: 11000 },
      { c: "سلطنة عمان", v: 5900 },
      { c: "دولة قطر", v: 9400 },
      { c: "جمهورية مصر العربية", v: 2200 },
      { c: "الإجمالي", v: 83000 },
    ],
  },
  2019: {
    arab: 72000,
    world: 86000,
    table: [
      { c: "الإمارات العربية المتحدة", v: 36000 },
      { c: "مملكة البحرين", v: 19500 },
      { c: "المملكة العربية السعودية", v: 11200 },
      { c: "سلطنة عمان", v: 6000 },
      { c: "دولة قطر", v: 9500 },
      { c: "جمهورية مصر العربية", v: 2300 },
      { c: "الإجمالي", v: 84500 },
    ],
  },
  2020: {
    arab: 65000,
    world: 83000,
    table: [
      { c: "الإمارات العربية المتحدة", v: 32000 },
      { c: "مملكة البحرين", v: 17000 },
      { c: "المملكة العربية السعودية", v: 9800 },
      { c: "سلطنة عمان", v: 5200 },
      { c: "دولة قطر", v: 8200 },
      { c: "جمهورية مصر العربية", v: 2100 },
      { c: "الإجمالي", v: 74300 },
    ],
  },
  2021: {
    arab: 68000,
    world: 80000,
    table: [
      { c: "الإمارات العربية المتحدة", v: 33000 },
      { c: "مملكة البحرين", v: 17500 },
      { c: "المملكة العربية السعودية", v: 10000 },
      { c: "سلطنة عمان", v: 5400 },
      { c: "دولة قطر", v: 8500 },
      { c: "جمهورية مصر العربية", v: 2200 },
      { c: "الإجمالي", v: 76600 },
    ],
  },
};

const years = [2016, 2017, 2018, 2019, 2020, 2021];

const PAGE_TRANSLATIONS = {
  ar: {
    pageTitle: "نسبة الانتاج العربي مقارنة بالانتاج العالمي",
    pageSubtitle: "قياس مساهمة الانتاج العربي في الانتاج العالمي عبر تمثيل دائري تفاعلي.",
    comparisonTitle: "المقارنة: الانتاج العربي مقابل العالمي",
    unit: "وحدة",
    kton: "الف طن",
    controls: "التحكم",
    product: "الخامة / المنتج",
    prototypeAlert: "Prototype: تغيير المنتج - ربط البيانات لاحقا.",
    productionByCountry: "الانتاج حسب الدولة",
    country: "الدولة",
    production: "الانتاج",
    arabProduction: "الانتاج العربي",
    worldProduction: "الانتاج العالمي",
  },
  fr: {
    pageTitle: "Part de la production arabe face a la production mondiale",
    pageSubtitle: "Mesurer la contribution de la production arabe a la production mondiale via un graphique en anneau interactif.",
    comparisonTitle: "Comparaison: production arabe vs mondiale",
    unit: "Unite",
    kton: "milliers de tonnes",
    controls: "Controles",
    product: "Minerai / produit",
    prototypeAlert: "Prototype: changement du produit - liaison des donnees ulterieurement.",
    productionByCountry: "Production par pays",
    country: "Pays",
    production: "Production",
    arabProduction: "Production arabe",
    worldProduction: "Production mondiale",
  },
  en: {
    pageTitle: "Arab production share vs global production",
    pageSubtitle: "Measure the Arab production contribution to global output through an interactive doughnut chart.",
    comparisonTitle: "Comparison: Arab vs global production",
    unit: "Unit",
    kton: "thousand tons",
    controls: "Controls",
    product: "Mineral / product",
    prototypeAlert: "Prototype: product changed - data binding will be added later.",
    productionByCountry: "Production by country",
    country: "Country",
    production: "Production",
    arabProduction: "Arab production",
    worldProduction: "Global production",
  },
};

const COUNTRY_LABELS = {
  "الإمارات العربية المتحدة": {
    ar: "الامارات العربية المتحدة",
    fr: "Emirats arabes unis",
    en: "United Arab Emirates",
  },
  "مملكة البحرين": {
    ar: "مملكة البحرين",
    fr: "Royaume de Bahrein",
    en: "Kingdom of Bahrain",
  },
  "المملكة العربية السعودية": {
    ar: "المملكة العربية السعودية",
    fr: "Royaume d'Arabie saoudite",
    en: "Kingdom of Saudi Arabia",
  },
  "سلطنة عمان": {
    ar: "سلطنة عمان",
    fr: "Sultanat d'Oman",
    en: "Sultanate of Oman",
  },
  "دولة قطر": {
    ar: "دولة قطر",
    fr: "Etat du Qatar",
    en: "State of Qatar",
  },
  "جمهورية مصر العربية": {
    ar: "جمهورية مصر العربية",
    fr: "Republique arabe d'Egypte",
    en: "Arab Republic of Egypt",
  },
  "الإجمالي": {
    ar: "الاجمالي",
    fr: "Total",
    en: "Total",
  },
};

const PRODUCT_OPTIONS = [
  "الألمنيوم الأولي",
  "الفوسفات",
  "النحاس",
  "الذهب",
];

const PRODUCT_LABELS = {
  "الألمنيوم الأولي": {
    ar: "الالمنيوم الاولي",
    fr: "Aluminium primaire",
    en: "Primary aluminum",
  },
  "الفوسفات": { ar: "الفوسفات", fr: "Phosphate", en: "Phosphate" },
  "النحاس": { ar: "النحاس", fr: "Cuivre", en: "Copper" },
  "الذهب": { ar: "الذهب", fr: "Or", en: "Gold" },
};

const NUMBER_LOCALES = {
  ar: "ar-MA",
  fr: "fr-FR",
  en: "en-US",
};

function formatNumber(n, language = "ar") {
  return new Intl.NumberFormat(NUMBER_LOCALES[language] || NUMBER_LOCALES.ar).format(n);
}

const localizeCountry = (country, language) => COUNTRY_LABELS[country]?.[language] || country;
const localizeProduct = (product, language) => PRODUCT_LABELS[product]?.[language] || product;

export default function M4Page() {
  const { language } = useContext(LanguageContext);
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS.ar;

  const [activeYear, setActiveYear] = useState(2021);
  const [product, setProduct] = useState("الألمنيوم الأولي");

  const pack = useMemo(
    () => donutByYear[activeYear] || donutByYear[2021],
    [activeYear]
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

    const { arab, world } = pack;
    const total = arab + world;
    const arabPct = total ? Math.round((arab / total) * 100) : 0;
    const worldPct = 100 - arabPct;

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [t.arabProduction, t.worldProduction],
        datasets: [
          {
            data: [arab, world],
            borderWidth: 0,
            cutout: "68%",
            backgroundColor: ["rgba(8, 39, 33, .92)", "rgba(221, 188, 107, .85)"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: { font: { family: "Cairo", weight: "700" } },
          },
          tooltip: {
            callbacks: {
              label: (c) => {
                const v = c.parsed;
                const pct = c.dataIndex === 0 ? arabPct : worldPct;
                return ` ${c.label}: ${formatNumber(v, language)} (${pct}%)`;
              },
            },
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
  }, [pack, language, t.arabProduction, t.worldProduction]);

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

        <section className="grid gap-4 lg:grid-cols-12">
          {/* Donut */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-base font-extrabold text-slate-800">
                  {t.comparisonTitle}
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ddbc6b]/15 px-3 py-1 text-xs font-bold text-[#082721]">
                  <Weight size={14} strokeWidth={2.2} />
                  {t.unit}: {t.kton}
                </span>
              </div>

              <div className="flex h-[360px] items-center justify-center sm:h-[460px]">
                <div className="h-full w-full max-w-[520px]">
                  <canvas ref={canvasRef} />
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-3 text-sm font-extrabold text-slate-800">
                {t.controls}
              </div>

              <div className="mb-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="mb-2 text-xs font-extrabold text-slate-500">
                  {t.product}
                </div>
                <div className="flex items-center gap-2">
                  <Boxes size={16} strokeWidth={2.2} className="text-[#082721]" />
                  <select
                    value={product}
                    onChange={(e) => {
                      setProduct(e.target.value);
                      // eslint-disable-next-line no-alert
                      alert(t.prototypeAlert);
                    }}
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

              <div className="mb-3 flex gap-2 overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50 px-2 py-2 shadow-sm">
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setActiveYear(y)}
                    className={`min-w-[56px] rounded-2xl border px-3 py-1 text-xs font-extrabold transition ${
                      y === activeYear
                        ? "border-[#082721] bg-[#082721] text-white"
                        : "border-transparent bg-white text-[#082721] hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {formatNumber(y, language)}
                  </button>
                ))}
              </div>

              <div className="mb-2 text-sm font-extrabold text-slate-800">
                {t.productionByCountry}
              </div>

              <div className="max-h-[330px] overflow-y-auto rounded-2xl border border-slate-100 bg-white">
                <table className={`min-w-full text-xs ${language === "ar" ? "text-right" : "text-left"}`}>
                  <thead className="sticky top-0 bg-slate-50 text-[11px] font-extrabold text-[#082721]">
                    <tr>
                      <th className="px-3 py-2">{t.country}</th>
                      <th className="px-3 py-2">{t.production}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pack.table.map((r) => (
                      <tr
                        key={r.c}
                        className="border-t border-slate-100 text-slate-700"
                      >
                        <td className="px-3 py-1.5 font-bold">{localizeCountry(r.c, language)}</td>
                        <td className="px-3 py-1.5">{formatNumber(r.v, language)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

