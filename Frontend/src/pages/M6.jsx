import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Scale, Globe2, TrendingUp, Info, ChevronDown, Download, Layers } from "lucide-react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import { LanguageContext, ThemeContext } from "../App";
import {
  tradeCriticalMineralsImportData,
  tradeCriticalMineralsImportByYear,
} from "../tradeCriticalMineralsImportDataProcessed";

const COUNTRIES = [
  { name: "الأردن", code: "jo" },
  { name: "الإمارات", code: "ae" },
  { name: "البحرين", code: "bh" },
  { name: "تونس", code: "tn" },
  { name: "الجزائر", code: "dz" },
  { name: "جيبوتي", code: "dj" },
  { name: "السعودية", code: "sa" },
  { name: "السودان", code: "sd" },
  { name: "سوريا", code: "sy" },
  { name: "الصومال", code: "so" },
  { name: "العراق", code: "iq" },
  { name: "عمان", code: "om" },
  { name: "فلسطين", code: "ps" },
  { name: "قطر", code: "qa" },
  { name: "الكويت", code: "kw" },
  { name: "لبنان", code: "lb" },
  { name: "ليبيا", code: "ly" },
  { name: "مصر", code: "eg" },
  { name: "المغرب", code: "ma" },
  { name: "موريتانيا", code: "mr" },
  { name: "اليمن", code: "ye" },
];

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

const countryNameAr = Object.fromEntries(COUNTRIES.map((c) => [c.code, c.name]));

const countryNameLocalized = {
  jo: { ar: "الأردن", fr: "Jordanie", en: "Jordan" },
  ae: { ar: "الإمارات", fr: "Emirats arabes unis", en: "United Arab Emirates" },
  bh: { ar: "البحرين", fr: "Bahrein", en: "Bahrain" },
  tn: { ar: "تونس", fr: "Tunisie", en: "Tunisia" },
  dz: { ar: "الجزائر", fr: "Algerie", en: "Algeria" },
  dj: { ar: "جيبوتي", fr: "Djibouti", en: "Djibouti" },
  sa: { ar: "السعودية", fr: "Arabie saoudite", en: "Saudi Arabia" },
  sd: { ar: "السودان", fr: "Soudan", en: "Sudan" },
  sy: { ar: "سوريا", fr: "Syrie", en: "Syria" },
  so: { ar: "الصومال", fr: "Somalie", en: "Somalia" },
  iq: { ar: "العراق", fr: "Irak", en: "Iraq" },
  om: { ar: "عمان", fr: "Oman", en: "Oman" },
  ps: { ar: "فلسطين", fr: "Palestine", en: "Palestine" },
  qa: { ar: "قطر", fr: "Qatar", en: "Qatar" },
  kw: { ar: "الكويت", fr: "Koweit", en: "Kuwait" },
  lb: { ar: "لبنان", fr: "Liban", en: "Lebanon" },
  ly: { ar: "ليبيا", fr: "Libye", en: "Libya" },
  eg: { ar: "مصر", fr: "Egypte", en: "Egypt" },
  ma: { ar: "المغرب", fr: "Maroc", en: "Morocco" },
  mr: { ar: "موريتانيا", fr: "Mauritanie", en: "Mauritania" },
  ye: { ar: "اليمن", fr: "Yemen", en: "Yemen" },
};

const mineralNameLocalized = {
  Gold: { ar: "الذهب", fr: "Or", en: "Gold" },
  Tin: { ar: "القصدير", fr: "Etain", en: "Tin" },
  Silver: { ar: "الفضة", fr: "Argent", en: "Silver" },
  Uranium: { ar: "اليورانيوم", fr: "Uranium", en: "Uranium" },
  Copper: { ar: "النحاس", fr: "Cuivre", en: "Copper" },
  Iron: { ar: "الحديد", fr: "Fer", en: "Iron" },
  Lead: { ar: "الرصاص", fr: "Plomb", en: "Lead" },
  Zinc: { ar: "الزنك", fr: "Zinc", en: "Zinc" },
  Nickel: { ar: "النيكل", fr: "Nickel", en: "Nickel" },
  Lithium: { ar: "الليثيوم", fr: "Lithium", en: "Lithium" },
  Cobalt: { ar: "الكوبالت", fr: "Cobalt", en: "Cobalt" },
};

const PAGE_TRANSLATIONS = {
  ar: {
    pageTitle: "بوابة الواردات التعدينية",
    pageSubtitle: "تحليل البيانات الجمركية للمواد الخام في العالم العربي",
    totalImportsCumulative: "إجمالي الواردات (تراكمي)",
    mostImportedMineral: "المعدن الأكثر استيرادا",
    highPriority: "أولوية عالية",
    dataCoverage: "تغطية البيانات",
    importsTrend: "تطور قيمة الواردات عبر السنوات",
    usdHint: "بالدولار الأمريكي",
    importValue: "القيمة الاستيرادية",
    share: "الحصة",
    countryImportDetails: "تفاصيل الواردات حسب الدولة",
    yearTag: "سنة",
    filterTools: "أدوات التصفية",
    chooseCountry: "اختر الدولة",
    mineralType: "نوع المعدن",
    referenceYear: "السنة المرجعية",
    countryDetails: "تفاصيل الدولة",
    selectedCountry: "الدولة المختارة",
    selectedYear: "السنة المحددة",
    relativeDistribution: "التوزيع النسبي",
    allMinerals: "كل المعادن",
    usd: "دولار",
    importsValueLabel: "قيمة الواردات",
  },
  fr: {
    pageTitle: "Portail des importations minieres",
    pageSubtitle: "Analyse des donnees douanieres des matieres premieres dans le monde arabe",
    totalImportsCumulative: "Importations totales (cumulees)",
    mostImportedMineral: "Minerai le plus importe",
    highPriority: "Priorite elevee",
    dataCoverage: "Couverture des donnees",
    importsTrend: "Evolution de la valeur des importations",
    usdHint: "en dollars americains",
    importValue: "Valeur importee",
    share: "Part",
    countryImportDetails: "Details des importations par pays",
    yearTag: "Annee",
    filterTools: "Outils de filtre",
    chooseCountry: "Choisir le pays",
    mineralType: "Type de minerai",
    referenceYear: "Annee de reference",
    countryDetails: "Details du pays",
    selectedCountry: "Pays selectionne",
    selectedYear: "Annee selectionnee",
    relativeDistribution: "Distribution relative",
    allMinerals: "Tous les mineraux",
    usd: "USD",
    importsValueLabel: "Valeur des importations",
  },
  en: {
    pageTitle: "Mining imports portal",
    pageSubtitle: "Customs-data analysis for raw materials across the Arab world",
    totalImportsCumulative: "Total imports (cumulative)",
    mostImportedMineral: "Most imported mineral",
    highPriority: "High priority",
    dataCoverage: "Data coverage",
    importsTrend: "Import value trend over years",
    usdHint: "in US dollars",
    importValue: "Import value",
    share: "Share",
    countryImportDetails: "Import details by country",
    yearTag: "Year",
    filterTools: "Filter tools",
    chooseCountry: "Choose country",
    mineralType: "Mineral type",
    referenceYear: "Reference year",
    countryDetails: "Country details",
    selectedCountry: "Selected country",
    selectedYear: "Selected year",
    relativeDistribution: "Relative distribution",
    allMinerals: "All minerals",
    usd: "USD",
    importsValueLabel: "Import value",
  },
};

const NUMBER_LOCALES = {
  ar: "ar-MA",
  fr: "fr-FR",
  en: "en-US",
};

const formatUsdCompact = (val, language) =>
  new Intl.NumberFormat(NUMBER_LOCALES[language] || NUMBER_LOCALES.ar, {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(val || 0);

const formatFullUsd = (val, language) =>
  Number(val || 0).toLocaleString(NUMBER_LOCALES[language] || NUMBER_LOCALES.ar);

const localizeCountry = (code, language) =>
  countryNameLocalized[code]?.[language] || countryNameAr[code] || code;

const localizeMineral = (name, language, allFallback) => {
  if (!name || name === "all") return allFallback;
  return mineralNameLocalized[name]?.[language] || mineralNameAr[name] || name;
};

export default function M6Page() {
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS.ar;

  const [selectedCountry, setSelectedCountry] = useState("ma");
  const [selectedMineral, setSelectedMineral] = useState("all");
  const [countryYear, setCountryYear] = useState(null);

  // -- Data Logic --
  const mineralOptions = useMemo(() => ["all", ...new Set(tradeCriticalMineralsImportData.map(r => r.aggregate_product))].sort(), []);
  
  const productYearlyData = useMemo(() => {
    if (selectedMineral === "all") return tradeCriticalMineralsImportByYear;
    return tradeCriticalMineralsImportData.filter(r => r.aggregate_product === selectedMineral)
      .reduce((acc, r) => { acc[r.year] = (acc[r.year] || 0) + (r.value_usd || 0); return acc; }, {});
  }, [selectedMineral]);

  const yearlyUsdData = useMemo(() => Object.entries(productYearlyData).map(([year, value]) => ({ year: Number(year), value })).sort((a, b) => a.year - b.year), [productYearlyData]);
  const totalUsd = useMemo(() => yearlyUsdData.reduce((sum, item) => sum + item.value, 0), [yearlyUsdData]);
  const countryYears = useMemo(() => yearlyUsdData.map((item) => item.year), [yearlyUsdData]);
  const currentYear = countryYear || (countryYears.length ? countryYears[countryYears.length - 1] : null);

  const countryImportRows = useMemo(() => {
    if (!currentYear) return [];
    const totalsByReporter = {};
    tradeCriticalMineralsImportData
      .filter((row) => row.year === currentYear && (selectedMineral === "all" || row.aggregate_product === selectedMineral))
      .forEach((row) => {
        totalsByReporter[row.reporter] = (totalsByReporter[row.reporter] || 0) + (row.value_usd || 0);
      });
    const totalForYear = Object.values(totalsByReporter).reduce((sum, value) => sum + value, 0);
    return Object.entries(totalsByReporter)
      .map(([reporter, value]) => ({ reporter, value, share: totalForYear ? value / totalForYear : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [currentYear, selectedMineral]);

  // -- Charts Implementation --
  const mainChartRef = useRef(null);
  const donutChartRef = useRef(null);
  const canvasRef = useRef(null);
  const donutCanvasRef = useRef(null);

  // Main Trend Chart
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (mainChartRef.current) mainChartRef.current.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(221, 188, 107, 0.4)');
    gradient.addColorStop(1, 'rgba(221, 188, 107, 0)');

    mainChartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: yearlyUsdData.map(d => d.year),
        datasets: [{
          data: yearlyUsdData.map(d => d.value),
          borderColor: '#ddbc6b',
          borderWidth: 4,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHitRadius: 30,
          pointBackgroundColor: '#082721',
          pointBorderColor: '#ddbc6b',
          pointBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { padding: 12, cornerRadius: 12 } },
        scales: { 
            y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { callback: v => formatUsdCompact(v, language) } },
            x: { grid: { display: false } }
        }
      }
    });
  }, [yearlyUsdData, language]);

  // Donut Chart
  useEffect(() => {
    const ctx = donutCanvasRef.current?.getContext("2d");
    if (!ctx || countryImportRows.length === 0) return;
    if (donutChartRef.current) donutChartRef.current.destroy();

    donutChartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: countryImportRows.map(r => r.reporter),
        datasets: [{
          data: countryImportRows.map(r => r.value),
          backgroundColor: ['#ddbc6b', '#082721', '#1e4b40', '#4a6d64', '#8da49d', '#cbd5d1'],
          borderWidth: 0,
          hoverOffset: 15
        }]
      },
      options: {
        cutout: '75%',
        plugins: { legend: { display: false } },
        maintainAspectRatio: false
      }
    });
  }, [countryImportRows]);

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} className={`min-h-screen font-['Cairo'] transition-colors duration-500 ${isDarkMode ? "bg-[#050f0c]" : "bg-[#fcfdfd]"}`}>
      <Menu />
      
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-[#082721] pb-32 pt-20 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(30deg, #082721 12%, transparent 12.5%, transparent 87%, #082721 87.5%, #082721), linear-gradient(150deg, #082721 12%, transparent 12.5%, transparent 87%, #082721 87.5%, #082721), linear-gradient(30deg, #082721 12%, transparent 12.5%, transparent 87%, #082721 87.5%, #082721), linear-gradient(150deg, #082721 12%, transparent 12.5%, transparent 87%, #082721 87.5%, #082721), linear-gradient(60deg, #ddbc6b10 25%, transparent 25.5%, transparent 75%, #ddbc6b10 75%, #ddbc6b10), linear-gradient(60deg, #ddbc6b10 25%, transparent 25.5%, transparent 75%, #ddbc6b10 75%, #ddbc6b10)', backgroundSize: '40px 70px' }} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-[#ddbc6b]"></span>
                <span className="text-[#ddbc6b] text-sm font-bold tracking-[0.2em] uppercase">{t.dataCoverage} 2014-2024</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">{t.pageTitle}</h1>
              <p className="text-xl text-emerald-100/70 font-medium leading-relaxed">{t.pageSubtitle}</p>
            </div>
            <button className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl transition-all group backdrop-blur-sm">
                <Download size={18} className="text-[#ddbc6b] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">{t.exportCsv}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 -mt-16 pb-20 relative z-20">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="group bg-[#082721] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden transition-transform hover:-translate-y-1">
            <TrendingUp className="absolute right-6 top-6 w-12 h-12 text-[#ddbc6b]/10 group-hover:scale-125 transition-transform duration-700" />
            <p className="text-emerald-200/50 text-sm font-bold mb-2 uppercase tracking-wider">{t.totalImportsCumulative}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">{formatUsdCompact(totalUsd, language)}</span>
                <span className="text-[#ddbc6b] font-bold text-lg">{t.usd}</span>
            </div>
          </div>
          
          {[
            { label: t.mostImportedMineral, val: localizeMineral("Gold", language, t.allMinerals), sub: t.highPriority, icon: <Layers className="text-[#ddbc6b]" /> },
            { label: t.status, val: t.completed, sub: "100% Verified", icon: <Globe2 className="text-[#ddbc6b]" /> }
          ].map((card, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-3">{card.label}</p>
                <h3 className="text-3xl font-black text-[#082721]">{card.val}</h3>
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm font-bold text-emerald-600 bg-emerald-50 self-start px-3 py-1 rounded-full">
                {card.icon} {card.sub}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Trend Section */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-xl font-black text-[#082721] mb-1">{t.importsTrend}</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase">{t.usdHint}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="flex gap-1">
                    {['1Y', '5Y', 'ALL'].map(range => (
                        <button key={range} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${range === 'ALL' ? 'bg-white shadow-sm text-[#082721]' : 'text-slate-400 hover:text-slate-600'}`}>{range}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-[400px]">
                <canvas ref={canvasRef} />
              </div>
            </div>

            {/* Enhanced Table */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 className="font-black text-[#082721] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ddbc6b]/10 flex items-center justify-center">
                            <Scale size={20} className="text-[#ddbc6b]" />
                        </div>
                        {t.countryImportDetails}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-black text-slate-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {currentYear}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                                <th className="px-8 py-5 text-start">Market / Country</th>
                                <th className="px-8 py-5 text-center">{t.importValue}</th>
                                <th className="px-8 py-5 text-end">Market Share</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {countryImportRows.map((row, idx) => (
                                <tr key={row.reporter} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-black text-slate-300">0{idx + 1}</span>
                                            <div className="w-10 h-10 rounded-full bg-[#082721] text-[#ddbc6b] flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">
                                                {row.reporter.slice(0, 2).toUpperCase()}
                                            </div>
                                            <span className="font-black text-[#082721]">{row.reporter}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="bg-slate-100 px-4 py-1.5 rounded-lg text-sm font-black text-[#082721]">
                                            {formatFullUsd(row.value, language)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-end gap-3">
                                            <span className="text-xs font-bold text-slate-500">{Math.round(row.share * 100)}%</span>
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#ddbc6b] rounded-full" style={{ width: `${row.share * 100}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>

          {/* Right Column: Controls & Donut */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#082721] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden border border-white/5">
              <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ddbc6b] flex items-center justify-center">
                    <ChevronDown size={18} className="text-[#082721]" />
                </div>
                {t.filterTools}
              </h3>
              
              <div className="space-y-8">
                {[
                  { label: t.chooseCountry, val: selectedCountry, set: setSelectedCountry, options: COUNTRIES.map(c => ({v: c.code, l: localizeCountry(c.code, language)})) },
                  { label: t.mineralType, val: selectedMineral, set: setSelectedMineral, options: mineralOptions.map(m => ({v: m, l: localizeMineral(m, language, t.allMinerals)})) }
                ].map((filter, i) => (
                  <div key={i}>
                    <label className="text-[10px] font-black text-emerald-200/40 uppercase tracking-[0.2em] block mb-3">{filter.label}</label>
                    <div className="relative group">
                      <select 
                        value={filter.val} 
                        onChange={(e) => filter.set(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-[#ddbc6b] appearance-none transition-all cursor-pointer"
                      >
                        {filter.options.map(opt => <option key={opt.v} value={opt.v} className="text-slate-900">{opt.l}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#ddbc6b] pointer-events-none group-hover:translate-y-[-40%] transition-transform" />
                    </div>
                  </div>
                ))}

                <div>
                  <label className="text-[10px] font-black text-emerald-200/40 uppercase tracking-[0.2em] block mb-4">{t.referenceYear}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {countryYears.slice(-8).map((y) => (
                      <button
                        key={y}
                        onClick={() => setCountryYear(y)}
                        className={`py-3 rounded-xl text-[10px] font-black transition-all ${y === currentYear ? 'bg-[#ddbc6b] text-[#082721] scale-105 shadow-lg' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'}`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Relative Distribution Card */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-2 h-6 bg-[#ddbc6b] rounded-full"></div>
                    <h3 className="font-black text-[#082721]">{t.relativeDistribution}</h3>
                </div>
                <div className="h-[240px] relative flex items-center justify-center">
                    <canvas ref={donutCanvasRef} />
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-black text-[#082721]">100%</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Market Total</span>
                    </div>
                </div>
                <div className="mt-8 space-y-3">
                    {countryImportRows.slice(0, 3).map((row, i) => (
                        <div key={row.reporter} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#ddbc6b', '#082721', '#1e4b40'][i] }} />
                                <span className="text-xs font-bold text-slate-600">{row.reporter}</span>
                            </div>
                            <span className="text-xs font-black text-[#082721]">{Math.round(row.share * 100)}%</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}