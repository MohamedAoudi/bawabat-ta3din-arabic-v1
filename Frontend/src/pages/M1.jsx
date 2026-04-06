import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownWideNarrow, CalendarDays, Search } from "lucide-react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import { LanguageContext } from "../App";

export const dataByMineral = {
  "الذهب": {
    // Gold - كجم
    2010: [
      { country: "الجمهورية الإسلامية الموريتانية", value: 7589 },
      { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 723 },
      { country: "المملكة العربية السعودية", value: 4400 },
      { country: "المملكة المغربية", value: 650 },
      { country: "جمهورية السودان", value: 34000 },
      { country: "جمهورية مصر العربية", value: 4451 },
    ],
    2011: [
      { country: "الجمهورية الإسلامية الموريتانية", value: 7473 },
      { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 340 },
      { country: "المملكة العربية السعودية", value: 4612 },
      { country: "المملكة المغربية", value: 520 },
      { country: "جمهورية السودان", value: 38000 },
      { country: "جمهورية مصر العربية", value: 7439 },
    ],
    2012: [
      { country: "الجمهورية الإسلامية الموريتانية", value: 6889 },
      { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 264 },
      { country: "المملكة العربية السعودية", value: 4292 },
      { country: "المملكة المغربية", value: 532 },
      { country: "جمهورية السودان", value: 40000 },
      { country: "جمهورية مصر العربية", value: 8523 },
    ],
    2013: [
      { country: "الجمهورية الإسلامية الموريتانية", value: 9355 },
      { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 140 },
      { country: "المملكة العربية السعودية", value: 4158 },
      { country: "المملكة المغربية", value: 463 },
      { country: "جمهورية السودان", value: 70000 },
      { country: "جمهورية مصر العربية", value: 12616 },
    ],
    2014: [
      { country: "الجمهورية الإسلامية الموريتانية", value: 8771 },
      { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 85 },
      { country: "المملكة العربية السعودية", value: 4789 },
      { country: "المملكة المغربية", value: 377 },
      { country: "جمهورية السودان", value: 73400 },
      { country: "جمهورية مصر العربية", value: 13202 },
    ],
    2015: [
      { country: "الجمهورية الإسلامية الموريتانية", value: 8025 },
      { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 106 },
      { country: "المملكة العربية السعودية", value: 5089 },
      { country: "المملكة المغربية", value: 448 },
      { country: "جمهورية السودان", value: 82300 },
      { country: "جمهورية مصر العربية", value: 15651 },
    ],
    2016: [
      { country: "الجمهورية الإسلامية الموريتانية", value: 6495 },
      { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 102 },
      { country: "المملكة العربية السعودية", value: 6946 },
      { country: "المملكة المغربية", value: 352 },
      { country: "جمهورية السودان", value: 93400 },
      { country: "جمهورية مصر العربية", value: 17140 },
    ],
    2017: [
      { country: "الجمهورية الإسلامية الموريتانية", value: 8292 },
      { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 134 },
      { country: "المملكة العربية السعودية", value: 10333 },
      { country: "المملكة المغربية", value: 220 },
      { country: "جمهورية السودان", value: 107300 },
      { country: "جمهورية مصر العربية", value: 16941 },
    ],
    2018: [
      { country: "الجمهورية الإسلامية الموريتانية", value: 8448 },
      { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 128 },
      { country: "المملكة العربية السعودية", value: 11765 },
      { country: "المملكة المغربية", value: 386 },
      { country: "جمهورية السودان", value: 93600 },
      { country: "جمهورية مصر العربية", value: 14694 },
    ],
    2019: [
      { country: "الجمهورية الإسلامية الموريتانية", value: 12252 },
      { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 52 },
      { country: "المملكة العربية السعودية", value: 12593 },
      { country: "المملكة المغربية", value: 221 },
      { country: "جمهورية السودان", value: 90000 },
      { country: "جمهورية مصر العربية", value: 14946 },
    ],
    2020: [
      { country: "الجمهورية الإسلامية الموريتانية", value: 12873 },
      { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 71 },
      { country: "المملكة العربية السعودية", value: 11822 },
      { country: "المملكة المغربية", value: 200 },
      { country: "جمهورية السودان", value: 93600 },
      { country: "جمهورية مصر العربية", value: 14070 },
    ],
    2021: [
      { country: "الجمهورية الإسلامية الموريتانية", value: 5922 },
      { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 41 },
      { country: "المملكة العربية السعودية", value: 11153 },
      { country: "المملكة المغربية", value: 200 },
      { country: "جمهورية السودان", value: 49700 },
      { country: "جمهورية مصر العربية", value: 14900 },
    ],
    2022: [
      { country: "الجمهورية الإسلامية الموريتانية", value: 16250 },
      { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 100 },
      { country: "المملكة العربية السعودية", value: 13200 },
      { country: "المملكة المغربية", value: 100 },
      { country: "جمهورية السودان", value: 35700 },
      { country: "جمهورية مصر العربية", value: 14100 },
    ],
    2023: [
      { country: "الجمهورية الإسلامية الموريتانية", value: 18319 },
      { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 102 },
      { country: "المملكة العربية السعودية", value: 12976 },
      { country: "المملكة المغربية", value: 100 },
      { country: "جمهورية السودان", value: 49700 },
      { country: "جمهورية مصر العربية", value: 12900 },
    ],
    2024: [
      { country: "الجمهورية الإسلامية الموريتانية", value: 21900 },
      { country: "المملكة العربية السعودية", value: 12000 },
      { country: "جمهورية السودان", value: 73800 },
      { country: "جمهورية مصر العربية", value: 14174 },
    ],
  },

  "التلك": {
    // Talc - طن
    2010: [
      { country: "المملكة المغربية", value: 27066 },
    ],
    2011: [
      { country: "المملكة المغربية", value: 5129 },
    ],
    2012: [
      { country: "المملكة المغربية", value: 200 },
    ],
  },

  "الجبس": {
    // Gypsum - طن
    2010: [
      { country: "المملكة المغربية", value: 200000 },
    ],
    2011: [
      { country: "المملكة المغربية", value: 200000 },
    ],
    2012: [
      { country: "المملكة المغربية", value: 200000 },
    ],
    2013: [
      { country: "المملكة المغربية", value: 200000 },
    ],
    2014: [
      { country: "المملكة المغربية", value: 200000 },
    ],
    2015: [
      { country: "المملكة المغربية", value: 200000 },
    ],
    2016: [
      { country: "المملكة المغربية", value: 200000 },
    ],
    2017: [
      { country: "المملكة المغربية", value: 200000 },
    ],
    2018: [
      { country: "المملكة المغربية", value: 200000 },
    ],
    2019: [
      { country: "المملكة المغربية", value: 200000 },
    ],
  },

  "الحديد (محتوى الحديد Fe-Content)": {
    // Iron (Fe-Content) - طن
    2016: [
      { country: "المملكة المغربية", value: 5510 },
    ],
    2017: [
      { country: "المملكة المغربية", value: 36120 },
    ],
    2018: [
      { country: "المملكة المغربية", value: 18520 },
    ],
    2019: [
      { country: "المملكة المغربية", value: 99500 },
    ],
    2020: [
      { country: "المملكة المغربية", value: 14090 },
    ],
  },

  "الباريت": {
    // Baryte - ألف طن
    2010: [
      { country: "المملكة المغربية", value: 572.429 },
    ],
    2011: [
      { country: "المملكة المغربية", value: 769.504 },
    ],
    2012: [
      { country: "المملكة المغربية", value: 1021.4 },
    ],
    2013: [
      { country: "المملكة المغربية", value: 1094.5 },
    ],
    2014: [
      { country: "المملكة المغربية", value: 1006.6 },
    ],
    2015: [
      { country: "المملكة المغربية", value: 1212.13 },
    ],
    2016: [
      { country: "المملكة المغربية", value: 676.94 },
    ],
    2017: [
      { country: "المملكة المغربية", value: 818.016 },
    ],
    2018: [
      { country: "المملكة المغربية", value: 899.365 },
    ],
    2019: [
      { country: "المملكة المغربية", value: 12100 },
    ],
    2020: [
      { country: "المملكة المغربية", value: 410 },
    ],
    2021: [
      { country: "المملكة المغربية", value: 1100 },
    ],
    2022: [
      { country: "المملكة المغربية", value: 1200 },
    ],
    2023: [
      { country: "المملكة المغربية", value: 1000 },
    ],
    2024: [
      { country: "المملكة المغربية", value: 1200 },
    ],
  },

  "الأسمنت": {
    // Cement - ألف طن
    2010: [
      { country: "المملكة المغربية", value: 14700 },
    ],
    2011: [
      { country: "المملكة المغربية", value: 16300 },
    ],
    2012: [
      { country: "المملكة المغربية", value: 16300 },
    ],
    2013: [
      { country: "المملكة المغربية", value: 16900 },
    ],
    2014: [
      { country: "المملكة المغربية", value: 14320 },
    ],
    2015: [
      { country: "المملكة المغربية", value: 14460 },
    ],
    2016: [
      { country: "المملكة المغربية", value: 0 },
    ],
    2017: [
      { country: "المملكة المغربية", value: 13850 },
    ],
    2018: [
      { country: "المملكة المغربية", value: 13400 },
    ],
    2019: [
      { country: "المملكة المغربية", value: 43730 },
    ],
    2020: [
      { country: "المملكة المغربية", value: 12310 },
    ],
    2021: [
      { country: "المملكة المغربية", value: 12560 },
    ],
    2022: [
      { country: "المملكة المغربية", value: 13080 },
    ],
    2023: [
      { country: "المملكة المغربية", value: 12510 },
    ],
    2024: [
      { country: "المملكة المغربية", value: 13690 },
    ],
  },

};

export const mineralUnits = {
  "الذهب": "كجم",
  "التلك": "طن",
  "الجبس": "طن",
  "الحديد (محتوى الحديد Fe-Content)": "طن",
  "الباريت": "ألف طن",
  "الأسمنت": "ألف طن",
};

const PAGE_TRANSLATIONS = {
  ar: {
    pageTitle: "حجم الإنتاج التعديني",
    pageSubtitle: "لوحة تفاعلية لعرض حجم الإنتاج التعديني حسب الدولة، الخام، والفترة الزمنية",
    annualEvolution: "التطور السنوي",
    productionByCountry: "الإنتاج حسب الدولة",
    yearLabel: "السنة",
    ranking: "ترتيب",
    searchPlaceholder: "بحث داخل الدول...",
    country: "الدولة",
    production: "الإنتاج",
    noResults: "لا توجد نتائج مطابقة.",
    sources: "المصادر",
    arabEconomicReport: "التقرير الاقتصادي العربي الموحد",
  },
  fr: {
    pageTitle: "Volume de la production miniere",
    pageSubtitle: "Tableau de bord interactif de la production miniere par pays, minerai et periode.",
    annualEvolution: "Evolution annuelle",
    productionByCountry: "Production par pays",
    yearLabel: "Annee",
    ranking: "Classement",
    searchPlaceholder: "Rechercher un pays...",
    country: "Pays",
    production: "Production",
    noResults: "Aucun resultat correspondant.",
    sources: "Sources",
    arabEconomicReport: "Rapport economique arabe unifie",
  },
  en: {
    pageTitle: "Mining production volume",
    pageSubtitle: "Interactive dashboard showing mining production by country, mineral, and period.",
    annualEvolution: "Annual trend",
    productionByCountry: "Production by country",
    yearLabel: "Year",
    ranking: "Ranking",
    searchPlaceholder: "Search countries...",
    country: "Country",
    production: "Production",
    noResults: "No matching results.",
    sources: "Sources",
    arabEconomicReport: "Unified Arab Economic Report",
  },
};

const MINERAL_LABELS = {
  "الذهب": { ar: "الذهب", fr: "Or", en: "Gold" },
  "التلك": { ar: "التلك", fr: "Talc", en: "Talc" },
  "الجبس": { ar: "الجبس", fr: "Gypse", en: "Gypsum" },
  "الحديد (محتوى الحديد Fe-Content)": {
    ar: "الحديد (محتوى الحديد Fe-Content)",
    fr: "Fer (teneur en Fe)",
    en: "Iron (Fe content)",
  },
  "الباريت": { ar: "الباريت", fr: "Barytine", en: "Baryte" },
  "الأسمنت": { ar: "الاسمنت", fr: "Ciment", en: "Cement" },
};

const UNIT_LABELS = {
  "كجم": { ar: "كجم", fr: "kg", en: "kg" },
  "طن": { ar: "طن", fr: "tonnes", en: "tons" },
  "ألف طن": { ar: "الف طن", fr: "milliers de tonnes", en: "thousand tons" },
};

const COUNTRY_LABELS = {
  "الجمهورية الإسلامية الموريتانية": {
    ar: "الجمهورية الاسلامية الموريتانية",
    fr: "Republique islamique de Mauritanie",
    en: "Islamic Republic of Mauritania",
  },
  "الجمهورية الجزائرية الديمقراطية الشعبية": {
    ar: "الجمهورية الجزائرية الديمقراطية الشعبية",
    fr: "Republique algerienne democratique et populaire",
    en: "People's Democratic Republic of Algeria",
  },
  "المملكة العربية السعودية": {
    ar: "المملكة العربية السعودية",
    fr: "Royaume d'Arabie saoudite",
    en: "Kingdom of Saudi Arabia",
  },
  "المملكة المغربية": {
    ar: "المملكة المغربية",
    fr: "Royaume du Maroc",
    en: "Kingdom of Morocco",
  },
  "جمهورية السودان": {
    ar: "جمهورية السودان",
    fr: "Republique du Soudan",
    en: "Republic of the Sudan",
  },
  "جمهورية مصر العربية": {
    ar: "جمهورية مصر العربية",
    fr: "Republique arabe d'Egypte",
    en: "Arab Republic of Egypt",
  },
};

const NUMBER_LOCALES = {
  ar: "ar-MA",
  fr: "fr-FR",
  en: "en-US",
};

const mineralYears = (mineral) =>
  Object.keys(dataByMineral[mineral] || {})
    .map(Number)
    .sort((a, b) => a - b);

function formatNumber(n, language = "ar") {
  const locale = NUMBER_LOCALES[language] || NUMBER_LOCALES.ar;
  return new Intl.NumberFormat(locale).format(n);
}

const getLocalizedMineral = (mineral, language) =>
  MINERAL_LABELS[mineral]?.[language] || mineral;

const getLocalizedUnit = (unit, language) =>
  UNIT_LABELS[unit]?.[language] || unit;

const getLocalizedMineralUnit = (mineral, language) =>
  getLocalizedUnit(mineralUnits[mineral], language);

const getLocalizedCountry = (country, language) =>
  COUNTRY_LABELS[country]?.[language] || country;

const wrapLabel = (text, maxCharsPerLine = 12) => {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  if (!words.length) return [""];

  const lines = [];
  let current = words[0];

  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]}`;
    if (next.length <= maxCharsPerLine) {
      current = next;
    } else {
      lines.push(current);
      current = words[i];
    }
  }

  lines.push(current);
  return lines;
};

// Draw each country name below the last visible point (pip) on the line chart.
const linePointCountryLabelPlugin = {
  id: "linePointCountryLabelPlugin",
  afterDatasetsDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    ctx.save();
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const lineHeight = 10;
    const labelGap = 6;
    const anchorGap = 18;
    ctx.font = "700 8px Cairo";

    const labelEntries = [];

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (!meta || meta.hidden || !meta.data?.length) return;

      let lastPoint = null;
      for (let i = meta.data.length - 1; i >= 0; i -= 1) {
        const val = dataset.data?.[i];
        if (val == null) continue;
        lastPoint = meta.data[i];
        break;
      }

      if (!lastPoint) return;

      const label = dataset.label || "";
      const lines = wrapLabel(label, 12);
      const textW = Math.max(...lines.map((line) => ctx.measureText(line).width));
      const textH = lines.length * lineHeight;

      labelEntries.push({
        color: dataset.borderColor || "#082721",
        height: textH,
        lines,
        point: lastPoint,
        preferredY: lastPoint.y,
        width: textW,
      });
    });

    if (!labelEntries.length) {
      ctx.restore();
      return;
    }

    labelEntries.sort((a, b) => a.preferredY - b.preferredY);

    labelEntries.forEach((entry, index) => {
      const halfHeight = entry.height / 2;
      const minY =
        index === 0
          ? chartArea.top + halfHeight
          : labelEntries[index - 1].y +
            labelEntries[index - 1].height / 2 +
            labelGap +
            halfHeight;
      entry.y = Math.max(entry.preferredY, minY);
    });

    for (let index = labelEntries.length - 1; index >= 0; index -= 1) {
      const entry = labelEntries[index];
      const halfHeight = entry.height / 2;
      const maxY =
        index === labelEntries.length - 1
          ? chartArea.bottom - halfHeight
          : labelEntries[index + 1].y -
            labelEntries[index + 1].height / 2 -
            labelGap -
            halfHeight;
      entry.y = Math.min(entry.y, maxY);
    }

    const labelX = chartArea.right + 110;

    labelEntries.forEach((entry) => {
      ctx.strokeStyle = entry.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(entry.point.x + 6, entry.point.y);
      ctx.lineTo(labelX - entry.width - anchorGap, entry.y);
      ctx.stroke();

      ctx.fillStyle = entry.color;
      entry.lines.forEach((line, idx) => {
        const offsetY = (idx - (entry.lines.length - 1) / 2) * lineHeight;
        ctx.fillText(line, labelX, entry.y + offsetY);
      });
    });

    ctx.restore();
  },
};

// ── Line chart: evolution over all years for selected mineral ──────────────
function LineChartPanel({ mineral, language, annualEvolutionLabel }) {
  const canvasRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (instanceRef.current) instanceRef.current.destroy();

    const years = mineralYears(mineral);
    const countriesSet = new Set();
    years.forEach((y) =>
      (dataByMineral[mineral][y] || []).forEach((r) =>
        countriesSet.add(r.country)
      )
    );
    const countries = [...countriesSet];

    const palette = [
      "#082721", "#ddbc6b", "#10b981", "#3b82f6",
      "#f59e0b", "#8b5cf6", "#ef4444",
    ];

    const datasets = countries.map((country, i) => ({
      label: getLocalizedCountry(country, language),
      data: years.map((y) => {
        const row = (dataByMineral[mineral][y] || []).find(
          (r) => r.country === country
        );
        return row ? row.value : null;
      }),
      borderColor: palette[i % palette.length],
      backgroundColor: palette[i % palette.length] + "22",
      borderWidth: 2.5,
      pointRadius: 4,
      tension: 0.35,
      spanGaps: true,
    }));

    instanceRef.current = new Chart(ctx, {
      type: "line",
      plugins: [linePointCountryLabelPlugin],
      data: { labels: years, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            right: 120,
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: { font: { family: "Cairo", size: 11 }, boxWidth: 14 },
          },
          tooltip: {
            callbacks: {
              label: (c) =>
                ` ${c.dataset.label}: ${formatNumber(c.parsed.y, language)} ${getLocalizedMineralUnit(mineral, language)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45,
              font: { family: "Cairo", weight: "700" },
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,.08)" },
            ticks: {
              font: { family: "Cairo" },
              callback: (v) => {
                if (v >= 1_000_000) return `${v / 1_000_000}M`;
                if (v >= 1_000) return `${v / 1_000}K`;
                return v;
              },
            },
          },
        },
      },
    });

    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [mineral, language]);

  return (
    <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
      <h3 className="mb-2 text-base font-extrabold text-slate-800">
        {annualEvolutionLabel} - {getLocalizedMineral(mineral, language)}
      </h3>
      <div className="h-[280px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

export default function M1Page() {
  const { language } = useContext(LanguageContext);
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS.ar;

  const minerals = Object.keys(dataByMineral);
  const [activeMineral, setActiveMineral] = useState(minerals[0]);
  const [activeYear, setActiveYear] = useState(() => {
    const ys = mineralYears(minerals[0]);
    return ys[ys.length - 1];
  });
  const [search, setSearch] = useState("");

  // When mineral changes, reset year to latest available
  const availableYears = useMemo(
    () => mineralYears(activeMineral),
    [activeMineral]
  );

  const handleMineralChange = (m) => {
    setActiveMineral(m);
    const ys = mineralYears(m);
    setActiveYear(ys[ys.length - 1]);
    setSearch("");
  };

  const baseRows = useMemo(() => {
    const rows = dataByMineral[activeMineral]?.[activeYear] || [];
    return [...rows].sort((a, b) => b.value - a.value);
  }, [activeMineral, activeYear]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return baseRows;
    const query = search.trim().toLowerCase();
    return baseRows.filter((r) => {
      const localizedCountry = getLocalizedCountry(r.country, language).toLowerCase();
      const rawCountry = r.country.toLowerCase();
      return localizedCountry.includes(query) || rawCountry.includes(query);
    });
  }, [baseRows, search, language]);

  // ── Bar chart (per year) ─────────────────────────────────────────────────
  const barCanvasRef = useRef(null);
  const barInstanceRef = useRef(null);

  useEffect(() => {
    const ctx = barCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (barInstanceRef.current) barInstanceRef.current.destroy();

    const labels = baseRows.map((r) => getLocalizedCountry(r.country, language));
    const values = baseRows.map((r) => r.value);

    barInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: t.production,
            data: values,
            backgroundColor: "rgba(8, 39, 33, 0.82)",
            borderRadius: 10,
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
              label: (c) =>
                ` ${formatNumber(c.parsed.y, language)} ${getLocalizedMineralUnit(activeMineral, language)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 10,
              padding: 12,
              callback(value) {
                return wrapLabel(this.getLabelForValue(value), 12);
              },
              font: { family: "Cairo", weight: "700", size: 9 },
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,.08)" },
            ticks: {
              font: { family: "Cairo" },
              callback: (v) => {
                if (v >= 1_000_000) return `${v / 1_000_000}M`;
                if (v >= 1_000) return `${v / 1_000}K`;
                return v;
              },
            },
          },
        },
      },
    });

    return () => {
      barInstanceRef.current?.destroy();
      barInstanceRef.current = null;
    };
  }, [baseRows, activeMineral, language, t.production]);

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

          {/* Filters */}
          <section className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/60">

            {/* Mineral selector */}
            <div className="mb-3 flex gap-2 flex-wrap">
              {minerals.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMineralChange(m)}
                  className={`inline-flex items-center rounded-2xl border px-4 py-1.5 text-sm font-extrabold transition ${
                    m === activeMineral
                      ? "border-[#082721] bg-[#082721] text-white shadow-sm"
                      : "border-slate-200 bg-white text-[#082721] hover:bg-slate-50"
                  }`}
                >
                  {getLocalizedMineral(m, language)}
                  <span className="mr-2 text-[10px] opacity-60">
                    ({getLocalizedMineralUnit(m, language)})
                  </span>
                </button>
              ))}
            </div>

            {/* Year bar */}
            <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50 px-2 py-2 shadow-sm">
              {availableYears.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setActiveYear(y)}
                  className={`inline-flex items-center rounded-2xl border px-3 py-1 text-xs font-extrabold transition ${
                    y === activeYear
                      ? "border-[#082721] bg-[#082721] text-white shadow-sm"
                      : "border-transparent bg-white text-[#082721] hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </section>

          {/* Main layout */}
          <section className="mt-4 grid gap-4 lg:grid-cols-12">

            {/* Bar chart */}
            <div className="lg:col-span-8">
              <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-extrabold text-slate-800">
                    {t.productionByCountry}
                  </h3>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#ddbc6b]/15 px-3 py-1 text-xs font-bold text-[#082721]">
                    <CalendarDays size={14} strokeWidth={2.2} />
                    <span>{t.yearLabel}: {activeYear}</span>
                  </div>
                </div>
                <div className="mt-1 h-[320px] sm:h-[360px]">
                  <canvas ref={barCanvasRef} />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="space-y-4 lg:col-span-4">
              <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-slate-800">
                    {t.productionByCountry}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-extrabold text-amber-900">
                    <ArrowDownWideNarrow size={13} strokeWidth={2.2} />
                    {t.ranking}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="mb-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <Search size={14} strokeWidth={2.2} className="text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="w-full border-none bg-transparent text-xs font-bold text-slate-700 outline-none focus:ring-0"
                    />
                  </div>

                  <div className="max-h-72 overflow-y-auto rounded-xl bg-white">
                    <table className={`min-w-full text-xs ${language === "ar" ? "text-right" : "text-left"}`}>
                      <thead className="bg-slate-50 text-[11px] font-extrabold text-[#082721]">
                        <tr>
                          <th className="px-3 py-2">{t.country}</th>
                          <th className="px-3 py-2">
                            {t.production} ({getLocalizedMineralUnit(activeMineral, language)})
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.map((r) => (
                          <tr
                            key={r.country}
                            className="border-t border-slate-100 text-xs text-slate-700"
                          >
                            <td className="px-3 py-1.5 font-bold">{getLocalizedCountry(r.country, language)}</td>
                            <td className="px-3 py-1.5">{formatNumber(r.value, language)}</td>
                          </tr>
                        ))}
                        {filteredRows.length === 0 && (
                          <tr>
                            <td
                              colSpan={2}
                              className="px-3 py-3 text-center text-xs text-slate-400"
                            >
                              {t.noResults}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Sources */}
              <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
                <h3 className="mb-2 text-sm font-extrabold text-slate-800">{t.sources}</h3>
                <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-xs">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#082721]" />
                    <div>
                      <div className="font-bold">BGS & IOCFWMC</div>
                      <div className="text-[11px] text-slate-500">
                        {t.arabEconomicReport}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-xs">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                    <div>
                      <div className="font-bold">USGS</div>
                      <div className="text-[11px] text-slate-500">
                        U.S. Geological Survey
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Line chart — full width below */}
          <section className="mt-4">
            <LineChartPanel
              mineral={activeMineral}
              language={language}
              annualEvolutionLabel={t.annualEvolution}
            />
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}