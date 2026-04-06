import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { CalendarRange, Gem, Globe2, Scale, TrendingUp, Weight, Filter, ChevronDown, List } from "lucide-react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import { LanguageContext } from "../App";
import {
  tradeCriticalMineralsData,
  tradeCriticalMineralsByYear,
} from "../tradeCriticalMineralsData";

const COUNTRIES = [
  { name: "المملكة الأردنية الهاشمية", code: "jo" },
  { name: "دولة الامارات العربية المتحدة", code: "ae" },
  { name: "مملكة البحرين", code: "bh" },
  { name: "الجمهورية التونسية", code: "tn" },
  { name: "الجمهورية الجزائرية الديمقراطية الشعبية", code: "dz" },
  { name: "جمهورية جيبوتي", code: "dj" },
  { name: "المملكة العربية السعودية", code: "sa" },
  { name: "جمهورية السودان", code: "sd" },
  { name: "الجمهورية العربية السورية", code: "sy" },
  { name: "جمهورية الصومال", code: "so" },
  { name: "جمهورية العراق", code: "iq" },
  { name: "سلطنة عمان", code: "om" },
  { name: "دولة فلسطين", code: "ps" },
  { name: "دولة قطر", code: "qa" },
  { name: "دولة الكويت", code: "kw" },
  { name: "الجمهورية اللبنانية", code: "lb" },
  { name: "دولة ليبيا", code: "ly" },
  { name: "جمهورية مصر العربية", code: "eg" },
  { name: "المملكة المغربية", code: "ma" },
  { name: "الجمهورية الإسلامية الموريتانية", code: "mr" },
  { name: "الجمهورية اليمنية", code: "ye" },
];

const countryNameAr = Object.fromEntries(COUNTRIES.map((c) => [c.code, c.name]));

const DEFAULT_COUNTRY = "ma";

const availableCountries = COUNTRIES.map((c) => c.code);

const COUNTRY_LABELS = {
  jo: { ar: "المملكة الاردنية الهاشمية", fr: "Royaume hachemite de Jordanie", en: "Hashemite Kingdom of Jordan" },
  ae: { ar: "دولة الامارات العربية المتحدة", fr: "Emirats arabes unis", en: "United Arab Emirates" },
  bh: { ar: "مملكة البحرين", fr: "Royaume de Bahrein", en: "Kingdom of Bahrain" },
  tn: { ar: "الجمهورية التونسية", fr: "Republique tunisienne", en: "Tunisian Republic" },
  dz: { ar: "الجمهورية الجزائرية الديمقراطية الشعبية", fr: "Republique algerienne democratique et populaire", en: "People's Democratic Republic of Algeria" },
  dj: { ar: "جمهورية جيبوتي", fr: "Republique de Djibouti", en: "Republic of Djibouti" },
  sa: { ar: "المملكة العربية السعودية", fr: "Royaume d'Arabie saoudite", en: "Kingdom of Saudi Arabia" },
  sd: { ar: "جمهورية السودان", fr: "Republique du Soudan", en: "Republic of the Sudan" },
  sy: { ar: "الجمهورية العربية السورية", fr: "Republique arabe syrienne", en: "Syrian Arab Republic" },
  so: { ar: "جمهورية الصومال", fr: "Republique federale de Somalie", en: "Federal Republic of Somalia" },
  iq: { ar: "جمهورية العراق", fr: "Republique d'Irak", en: "Republic of Iraq" },
  om: { ar: "سلطنة عمان", fr: "Sultanat d'Oman", en: "Sultanate of Oman" },
  ps: { ar: "دولة فلسطين", fr: "Etat de Palestine", en: "State of Palestine" },
  qa: { ar: "دولة قطر", fr: "Etat du Qatar", en: "State of Qatar" },
  kw: { ar: "دولة الكويت", fr: "Etat du Koweit", en: "State of Kuwait" },
  lb: { ar: "الجمهورية اللبنانية", fr: "Republique libanaise", en: "Lebanese Republic" },
  ly: { ar: "دولة ليبيا", fr: "Etat de Libye", en: "State of Libya" },
  eg: { ar: "جمهورية مصر العربية", fr: "Republique arabe d'Egypte", en: "Arab Republic of Egypt" },
  ma: { ar: "المملكة المغربية", fr: "Royaume du Maroc", en: "Kingdom of Morocco" },
  mr: { ar: "الجمهورية الاسلامية الموريتانية", fr: "Republique islamique de Mauritanie", en: "Islamic Republic of Mauritania" },
  ye: { ar: "الجمهورية اليمنية", fr: "Republique du Yemen", en: "Republic of Yemen" },
};

const PAGE_TRANSLATIONS = {
  ar: {
    badge: "البيانات التعدينية العربية",
    heroTitle: "الصادرات التعدينية",
    heroTitleAccent: "الاستراتيجية",
    heroSubtitle: "منصة تحليلية ذكية لرصد وتتبع تدفقات المعادن الحرجة في المنطقة العربية، توفر نظرة شاملة على القيم الاقتصادية والتوجهات السنوية.",
    latestYear: "احدث سنة",
    lastYearValue: "قيمة اخر سنة",
    yearlyAverage: "المتوسط السنوي",
    yearlyChange: "التغير السنوي",
    acrossYears: "عبر {count} سنوات",
    usd: "دولار امريكي",
    trendAnalysis: "تحليل الاتجاه الزمني",
    trendSubtitle: "تطور قيم الصادرات حسب الخام المختار",
    exportsValue: "قيمة الصادرات",
    quantitiesSoon: "الكميات (قريبا)",
    countryExportDetails: "تفاصيل الصادرات حسب الدولة",
    yearTag: "سنة",
    arabCountry: "الدولة العربية",
    exportValue: "قيمة الصادرات",
    share: "الحصة",
    filterTools: "ادوات التصفية",
    chooseCountry: "اختر الدولة",
    mineralType: "نوع المعدن",
    referenceYear: "السنة المرجعية",
    relativeDistribution: "التوزيع النسبي للصادرات",
    totalShare: "اجمالي الحصة",
    totalExports: "اجمالي الصادرات",
    allMinerals: "كل المعادن",
  },
  fr: {
    badge: "Donnees minieres arabes",
    heroTitle: "Exportations minieres",
    heroTitleAccent: "strategiques",
    heroSubtitle: "Plateforme analytique pour suivre les flux de mineraux critiques dans la region arabe et visualiser les tendances economiques annuelles.",
    latestYear: "Derniere annee",
    lastYearValue: "Valeur de la derniere annee",
    yearlyAverage: "Moyenne annuelle",
    yearlyChange: "Variation annuelle",
    acrossYears: "sur {count} ans",
    usd: "USD",
    trendAnalysis: "Analyse de tendance temporelle",
    trendSubtitle: "Evolution des valeurs d'export selon le minerai choisi",
    exportsValue: "Valeur des exportations",
    quantitiesSoon: "Quantites (bientot)",
    countryExportDetails: "Details des exportations par pays",
    yearTag: "Annee",
    arabCountry: "Pays arabe",
    exportValue: "Valeur des exportations",
    share: "Part",
    filterTools: "Outils de filtre",
    chooseCountry: "Choisir le pays",
    mineralType: "Type de minerai",
    referenceYear: "Annee de reference",
    relativeDistribution: "Distribution relative des exportations",
    totalShare: "Part totale",
    totalExports: "Exportations totales",
    allMinerals: "Tous les mineraux",
  },
  en: {
    badge: "Arab mining data",
    heroTitle: "Strategic mining",
    heroTitleAccent: "exports",
    heroSubtitle: "Smart analytics platform to monitor critical mineral flows in the Arab region with annual value trends.",
    latestYear: "Latest year",
    lastYearValue: "Last year value",
    yearlyAverage: "Yearly average",
    yearlyChange: "Year-over-year change",
    acrossYears: "across {count} years",
    usd: "USD",
    trendAnalysis: "Time trend analysis",
    trendSubtitle: "Export values over time by selected mineral",
    exportsValue: "Export value",
    quantitiesSoon: "Volumes (soon)",
    countryExportDetails: "Country export details",
    yearTag: "Year",
    arabCountry: "Arab country",
    exportValue: "Export value",
    share: "Share",
    filterTools: "Filter tools",
    chooseCountry: "Choose country",
    mineralType: "Mineral type",
    referenceYear: "Reference year",
    relativeDistribution: "Relative export distribution",
    totalShare: "Total share",
    totalExports: "Total exports",
    allMinerals: "All minerals",
  },
};

const NUMBER_LOCALES = {
  ar: "ar-MA",
  fr: "fr-FR",
  en: "en-US",
};

function formatUsd(value, language = "ar") {
  return Number(value || 0).toLocaleString(NUMBER_LOCALES[language] || NUMBER_LOCALES.ar);
}

const mineralNameAr = {
  Gold: "الذهب",
  Tin: "القصدير",
  Silver: "الفضة",
  Uranium: "اليورانيوم",
  Copper: "النحاس",
  Iron: "الحديد",
  Lead: "الرصاص",
  Zinc: "الزنك",
  Nickel: "النيكل",
  Lithium: "الليثيوم",
  Cobalt: "الكوبالت",
};

function translateMineral(name, language, fallback) {
  if (!name || name === "all") return fallback;
  if (language === "fr") {
    const mineralNameFr = {
      Gold: "Or",
      Tin: "Etain",
      Silver: "Argent",
      Uranium: "Uranium",
      Copper: "Cuivre",
      Iron: "Fer",
      Lead: "Plomb",
      Zinc: "Zinc",
      Nickel: "Nickel",
      Lithium: "Lithium",
      Cobalt: "Cobalt",
    };
    return mineralNameFr[name] || name;
  }
  if (language === "en") {
    return name;
  }
  return mineralNameAr[name] || name;
}

const localizeCountryCode = (code, language) => COUNTRY_LABELS[code]?.[language] || countryNameAr[code] || code;

function textWithCount(template, count) {
  return template.replace("{count}", count);
}

export default function M5Page() {
  const { language } = useContext(LanguageContext);
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS.ar;

  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [selectedMineral, setSelectedMineral] = useState("all");
  const [countryYear, setCountryYear] = useState(null);

  const mineralOptions = useMemo(() => {
    const products = Array.from(
      new Set(tradeCriticalMineralsData.map((row) => row.aggregate_product))
    ).sort();
    return ["all", ...products];
  }, []);

  const productYearlyData = useMemo(() => {
    if (selectedMineral === "all") return tradeCriticalMineralsByYear;

    return tradeCriticalMineralsData
      .filter((row) => row.aggregate_product === selectedMineral)
      .reduce((acc, row) => {
        const y = String(row.year);
        acc[y] = (acc[y] || 0) + (row.value_usd || 0);
        return acc;
      }, {});
  }, [selectedMineral]);

  useEffect(() => {
    const years = Object.keys(productYearlyData)
      .map(Number)
      .sort((a, b) => b - a);
    setCountryYear(years[0] || null);
  }, [productYearlyData]);

  const yearlyUsdData = useMemo(
    () =>
      Object.entries(productYearlyData)
        .map(([year, value]) => ({ year: Number(year), value }))
        .sort((a, b) => a.year - b.year),
    [productYearlyData]
  );

  const barYears = useMemo(() => yearlyUsdData.map((item) => item.year), [yearlyUsdData]);
  const chartValues = useMemo(() => yearlyUsdData.map((item) => item.value), [yearlyUsdData]);
  const totalUsd = useMemo(
    () => yearlyUsdData.reduce((sum, item) => sum + item.value, 0),
    [yearlyUsdData]
  );

  const totalGoldTin = useMemo(() => {
    return tradeCriticalMineralsData
      .filter((row) => row.aggregate_product === "Gold" || row.aggregate_product === "Tin")
      .reduce((sum, row) => sum + (row.value_usd || 0), 0);
  }, []);

  const countryYears = useMemo(() => yearlyUsdData.map((item) => item.year), [yearlyUsdData]);

  const latestYear = useMemo(
    () => (countryYears.length ? countryYears[countryYears.length - 1] : null),
    [countryYears]
  );

  const latestYearValue = useMemo(() => {
    if (!latestYear) return 0;
    return yearlyUsdData.find((item) => item.year === latestYear)?.value || 0;
  }, [latestYear, yearlyUsdData]);

  const avgYearlyValue = useMemo(() => {
    if (!yearlyUsdData.length) return 0;
    return totalUsd / yearlyUsdData.length;
  }, [totalUsd, yearlyUsdData]);

  const yoyChange = useMemo(() => {
    if (yearlyUsdData.length < 2) return null;
    const current = yearlyUsdData[yearlyUsdData.length - 1]?.value || 0;
    const previous = yearlyUsdData[yearlyUsdData.length - 2]?.value || 0;
    if (!previous) return null;
    return ((current - previous) / previous) * 100;
  }, [yearlyUsdData]);

  const countryPack = useMemo(
    () => ({
      table: [
        {
          c: selectedCountry,
          v:
            selectedCountry === "ma"
              ? yearlyUsdData.find((item) => item.year === countryYear)?.value || 0
              : 0,
        },
      ],
    }),
    [yearlyUsdData, countryYear, selectedCountry]
  );

  const effectiveCountry =
    selectedCountry && availableCountries.includes(selectedCountry)
      ? selectedCountry
      : DEFAULT_COUNTRY;

  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const donutCanvasRef = useRef(null);
  const donutChartRef = useRef(null);

  // تحسين إعدادات الرسم البياني (Colors & Fonts)
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (chartRef.current) chartRef.current.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(221, 188, 107, 0.9)");
    gradient.addColorStop(1, "rgba(8, 39, 33, 0.9)");

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: barYears,
        datasets: [{
          label: selectedMineral === "all" ? t.totalExports : translateMineral(selectedMineral, language, t.allMinerals),
          data: chartValues,
          backgroundColor: gradient,
          borderRadius: 12,
          hoverBackgroundColor: "#ddbc6b",
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }, // إخفاء الليجند لتبسيط الواجهة
          tooltip: {
            backgroundColor: "#082721",
            titleFont: { family: "Cairo", size: 14 },
            bodyFont: { family: "Cairo", size: 13 },
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: (context) => ` ${formatUsd(context.parsed.y, language)} ${t.usd}`,
            },
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: "Cairo" } } },
          y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { font: { family: "Cairo" } } }
        }
      }
    });
    return () => chartRef.current?.destroy();
  }, [barYears, chartValues, selectedMineral, language, t.totalExports, t.allMinerals, t.usd]);

  useEffect(() => {
    const ctx = donutCanvasRef.current?.getContext("2d");
    if (!ctx || !countryPack) return;

    if (donutChartRef.current) {
      donutChartRef.current.destroy();
      donutChartRef.current = null;
    }

    const rows = countryPack.table || [];
    if (!rows.length) return;

    const labels = rows.map((r) => localizeCountryCode(r.c, language));
    const values = rows.map((r) => r.v);

    donutChartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderWidth: 3,
            borderColor: "rgba(8,39,33,0.9)",
            cutout: "68%",
            backgroundColor: ["rgba(8, 39, 33, .92)"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: () => setSelectedCountry(DEFAULT_COUNTRY),
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => {
                const v = c.parsed;
                return ` ${c.label}: ${formatUsd(v, language)} ${t.usd} (100%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (donutChartRef.current) {
        donutChartRef.current.destroy();
        donutChartRef.current = null;
      }
    };
  }, [countryPack, language, t.usd]);

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} lang={language} className="min-h-screen bg-[#F4F7F5] font-['Cairo'] text-slate-800">
      <Menu />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#082721] pb-32 pt-16 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ddbc6b 1px, transparent 1px)', size: '20px 20px' }}></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest uppercase bg-[#ddbc6b]/20 border border-[#ddbc6b]/30 rounded-full text-[#ddbc6b]">
            {t.badge}
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4">{t.heroTitle} <span className="text-[#ddbc6b]">{t.heroTitleAccent}</span></h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm md:text-base leading-relaxed">
            {t.heroSubtitle}
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-24 pb-12 relative z-20">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: t.latestYear, value: latestYear ? formatUsd(latestYear, language) : "-", icon: <CalendarRange />, color: "bg-blue-500" },
            { label: t.lastYearValue, value: formatUsd(latestYearValue, language), sub: t.usd, icon: <Gem />, color: "bg-[#ddbc6b]" },
            { label: t.yearlyAverage, value: formatUsd(avgYearlyValue, language), sub: textWithCount(t.acrossYears, countryYears.length), icon: <Globe2 />, color: "bg-emerald-500" },
            { label: t.yearlyChange, value: yoyChange !== null ? `${yoyChange.toFixed(1)}%` : "-", icon: <TrendingUp />, color: yoyChange > 0 ? "bg-green-500" : "bg-red-500" },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-white flex items-center gap-5 transition-transform hover:-translate-y-1">
              <div className={`${card.color} p-4 rounded-2xl text-white shadow-lg shadow-inherit`}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 mb-1">{card.label}</p>
                <p className="text-xl font-black text-slate-800">{card.value}</p>
                {card.sub && <p className="text-[10px] text-slate-500">{card.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Chart Section */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
              <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="text-[#ddbc6b]" size={20} />
                    {t.trendAnalysis}
                  </h3>
                  <p className="text-xs text-slate-400">{t.trendSubtitle}</p>
                </div>
                <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                   <button className="px-4 py-2 text-xs font-bold rounded-xl bg-white shadow-sm text-[#082721]">{t.exportsValue}</button>
                   <button className="px-4 py-2 text-xs font-bold rounded-xl text-slate-400 hover:text-slate-600">{t.quantitiesSoon}</button>
                </div>
              </div>
              <div className="h-[400px]">
                <canvas ref={canvasRef} />
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/60 border border-slate-100">
               <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="font-bold flex items-center gap-2">
                    <List className="text-[#ddbc6b]" size={20} />
                    {t.countryExportDetails}
                  </h3>
                  <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-slate-500">{t.yearTag} {countryYear ? formatUsd(countryYear, language) : "-"}</span>
               </div>
               <div className="overflow-x-auto">
                 <table className={`w-full ${language === "ar" ? "text-right" : "text-left"}`}>
                   <thead className="bg-slate-50/50 text-slate-400 text-[11px] uppercase font-black">
                     <tr>
                       <th className="px-6 py-4">{t.arabCountry}</th>
                       <th className={`px-6 py-4 ${language === "ar" ? "text-left" : "text-right"}`}>{t.exportValue}</th>
                       <th className="px-6 py-4 text-center">{t.share}</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 text-sm font-bold">
                     {countryPack?.table?.map((r) => (
                        <tr key={r.c} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] group-hover:bg-[#ddbc6b]/20 group-hover:text-[#082721] transition-colors">{r.c.toUpperCase()}</div>
                            {localizeCountryCode(r.c, language)}
                          </td>
                          <td className={`px-6 py-4 font-black text-[#082721] ${language === "ar" ? "text-left" : "text-right"}`}>{formatUsd(r.v, language)} {t.usd}</td>
                          <td className="px-6 py-4">
                             <div className="w-24 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                                <div className="h-full bg-[#ddbc6b]" style={{width: '100%'}}></div>
                             </div>
                          </td>
                        </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>

          {/* Sidebar Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#082721] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-900/20 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#ddbc6b]/10 rounded-full blur-3xl group-hover:bg-[#ddbc6b]/20 transition-all"></div>
              
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                <Filter size={20} className="text-[#ddbc6b]" />
                {t.filterTools}
              </h3>

              <div className="space-y-6 relative z-10">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">{t.chooseCountry}</label>
                  <div className="relative">
                    <select 
                      value={effectiveCountry} 
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-[#ddbc6b] appearance-none transition-all"
                    >
                      {availableCountries.map((c) => (
                        <option key={c} value={c} className="text-slate-800">
                          {localizeCountryCode(c, language)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">{t.mineralType}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {mineralOptions.slice(0, 6).map(m => (
                      <button 
                        key={m}
                        onClick={() => setSelectedMineral(m)}
                        className={`px-3 py-3 rounded-xl text-[11px] font-bold border transition-all ${selectedMineral === m ? 'bg-[#ddbc6b] border-[#ddbc6b] text-[#082721]' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                      >
                        {translateMineral(m, language, t.allMinerals)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">{t.referenceYear}</label>
                  <div className="flex flex-wrap gap-2">
                    {countryYears.map(y => (
                      <button 
                        key={y}
                        onClick={() => setCountryYear(y)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black transition-all ${y === countryYear ? 'bg-white text-[#082721] scale-110 shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                      >
                        {formatUsd(y, language)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Donut Chart Card */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
              <h3 className="text-base font-black mb-6 text-center">{t.relativeDistribution}</h3>
              <div className="h-[250px] relative">
                <canvas ref={donutCanvasRef} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-xs text-slate-400 font-bold">{t.totalShare}</span>
                   <span className="text-2xl font-black text-[#082721]">100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}