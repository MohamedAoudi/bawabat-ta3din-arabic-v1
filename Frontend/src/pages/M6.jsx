import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Scale, Weight, Globe2, Pickaxe, TrendingUp, Info } from "lucide-react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import { LanguageContext } from "../App";
import {
  tradeCriticalMineralsImportData,
  tradeCriticalMineralsImportByYear,
} from "../tradeCriticalMineralsImportDataProcessed";

const COUNTRIES = [
  { name: "الأردن", code: "jo" }, { name: "الإمارات", code: "ae" }, { name: "البحرين", code: "bh" },
  { name: "تونس", code: "tn" }, { name: "الجزائر", code: "dz" }, { name: "جيبوتي", code: "dj" },
  { name: "السعودية", code: "sa" }, { name: "السودان", code: "sd" }, { name: "سوريا", code: "sy" },
  { name: "الصومال", code: "so" }, { name: "العراق", code: "iq" }, { name: "عمان", code: "om" },
  { name: "فلسطين", code: "ps" }, { name: "قطر", code: "qa" }, { name: "الكويت", code: "kw" },
  { name: "لبنان", code: "lb" }, { name: "ليبيا", code: "ly" }, { name: "مصر", code: "eg" },
  { name: "المغرب", code: "ma" }, { name: "موريتانيا", code: "mr" }, { name: "اليمن", code: "ye" },
];

const mineralNameAr = {
  Gold: "الذهب", Tin: "القصدير", Silver: "الفضة", Uranium: "اليورانيوم",
  Copper: "النحاس", Iron: "الحديد", Lead: "الرصاص", Zinc: "الزنك",
  Nickel: "النيكل", Lithium: "الليثيوم", Cobalt: "الكوبالت",
};

const countryNameAr = Object.fromEntries(COUNTRIES.map(c => [c.code, c.name]));

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
    allMinerals: "كل المعادن",
    importsValueLabel: "قيمة الواردات",
    totalImportsCumulative: "إجمالي الواردات (تراكمي)",
    usd: "دولار",
    mostImportedMineral: "المعدن الأكثر استيرادا",
    highPriority: "أولوية عالية",
    dataCoverage: "تغطية البيانات",
    importsTrend: "تطور قيمة الواردات عبر السنوات",
    usdHint: "بالدولار الأمريكي",
    countryDetails: "تفاصيل الدولة",
    selectedCountry: "الدولة المختارة",
    selectedYear: "السنة المحددة",
    relativeDistribution: "التوزيع النسبي",
    detailedTable: "جدول البيانات التفصيلي",
    exportCsv: "تصدير CSV",
    year: "العام",
    mineral: "المعدن",
    importValue: "القيمة الاستيرادية",
    status: "الحالة",
    totalMaterials: "إجمالي المواد",
    completed: "مكتمل",
  },
  fr: {
    pageTitle: "Portail des importations minieres",
    pageSubtitle: "Analyse des donnees douanieres des matieres premieres dans le monde arabe",
    allMinerals: "Tous les mineraux",
    importsValueLabel: "Valeur des importations",
    totalImportsCumulative: "Importations totales (cumulees)",
    usd: "USD",
    mostImportedMineral: "Minerai le plus importe",
    highPriority: "Priorite elevee",
    dataCoverage: "Couverture des donnees",
    importsTrend: "Evolution de la valeur des importations",
    usdHint: "en dollars americains",
    countryDetails: "Details du pays",
    selectedCountry: "Pays selectionne",
    selectedYear: "Annee selectionnee",
    relativeDistribution: "Distribution relative",
    detailedTable: "Tableau detaille",
    exportCsv: "Exporter CSV",
    year: "Annee",
    mineral: "Minerai",
    importValue: "Valeur importee",
    status: "Statut",
    totalMaterials: "Total des matieres",
    completed: "Complete",
  },
  en: {
    pageTitle: "Mining imports portal",
    pageSubtitle: "Customs-data analysis for raw materials across the Arab world",
    allMinerals: "All minerals",
    importsValueLabel: "Import value",
    totalImportsCumulative: "Total imports (cumulative)",
    usd: "USD",
    mostImportedMineral: "Most imported mineral",
    highPriority: "High priority",
    dataCoverage: "Data coverage",
    importsTrend: "Import value trend over years",
    usdHint: "in US dollars",
    countryDetails: "Country details",
    selectedCountry: "Selected country",
    selectedYear: "Selected year",
    relativeDistribution: "Relative distribution",
    detailedTable: "Detailed data table",
    exportCsv: "Export CSV",
    year: "Year",
    mineral: "Mineral",
    importValue: "Import value",
    status: "Status",
    totalMaterials: "Total materials",
    completed: "Completed",
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
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS.ar;

  const [selectedCountry, setSelectedCountry] = useState("ma");
  const [selectedMineral, setSelectedMineral] = useState("all");
  const [countryYear, setCountryYear] = useState(null);

  // -- Data Processing (Logic remains same for consistency) --
  const mineralOptions = useMemo(() => ["all", ...new Set(tradeCriticalMineralsImportData.map(r => r.aggregate_product))].sort(), []);
  
  const productYearlyData = useMemo(() => {
    if (selectedMineral === "all") return tradeCriticalMineralsImportByYear;
    return tradeCriticalMineralsImportData.filter(r => r.aggregate_product === selectedMineral)
      .reduce((acc, r) => { acc[r.year] = (acc[r.year] || 0) + (r.value_usd || 0); return acc; }, {});
  }, [selectedMineral]);

  const yearlyUsdData = useMemo(() => Object.entries(productYearlyData).map(([year, value]) => ({ year: Number(year), value })).sort((a, b) => a.year - b.year), [productYearlyData]);
  const totalUsd = useMemo(() => yearlyUsdData.reduce((sum, item) => sum + item.value, 0), [yearlyUsdData]);
  
  useEffect(() => {
    if (!countryYear && yearlyUsdData.length > 0) setCountryYear(yearlyUsdData[yearlyUsdData.length - 1].year);
  }, [yearlyUsdData]);

  // -- Charts Refs --
  const mainChartRef = useRef(null);
  const donutChartRef = useRef(null);
  const canvasRef = useRef(null);
  const donutCanvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (mainChartRef.current) mainChartRef.current.destroy();

    mainChartRef.current = new Chart(ctx, {
      type: 'line', // Changed to Line for a more "modern" trend feel
      data: {
        labels: yearlyUsdData.map(d => d.year),
        datasets: [{
          label: t.importsValueLabel,
          data: yearlyUsdData.map(d => d.value),
          borderColor: '#ddbc6b',
          backgroundColor: 'rgba(221, 188, 107, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#082721'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { ticks: { callback: v => formatUsdCompact(v, language) } } }
      }
    });
  }, [yearlyUsdData, language, t.importsValueLabel]);

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} lang={language} className="bg-[#f8fafc] min-h-screen font-['Cairo']">
      <Menu />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#082721] flex items-center gap-3">
              <Pickaxe className="text-[#ddbc6b]" size={32} />
              {t.pageTitle}
            </h1>
            <p className="text-slate-500 mt-1">{t.pageSubtitle}</p>
          </div>
          
          <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-200 gap-2">
            <select 
              value={selectedCountry} 
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 ring-[#ddbc6b]"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{localizeCountry(c.code, language)}</option>
              ))}
            </select>
            <select 
              value={selectedMineral} 
              onChange={(e) => setSelectedMineral(e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 ring-[#ddbc6b]"
            >
              {mineralOptions.map((m) => (
                <option key={m} value={m}>{localizeMineral(m, language, t.allMinerals)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#082721] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-emerald-200/70 text-sm font-bold">{t.totalImportsCumulative}</p>
              <h3 className="text-3xl font-black mt-2">{formatUsdCompact(totalUsd, language)} <span className="text-sm font-normal">{t.usd}</span></h3>
            </div>
            <TrendingUp className="absolute -bottom-4 -left-4 w-24 h-24 text-white/5" />
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-bold">{t.mostImportedMineral}</p>
            <h3 className="text-2xl font-black text-[#082721] mt-2">{localizeMineral("Gold", language, t.allMinerals)} <span className="text-[#ddbc6b] text-sm">{t.highPriority}</span></h3>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-bold">{t.dataCoverage}</p>
            <h3 className="text-2xl font-black text-[#082721] mt-2">2014 - 2024</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-[#082721]">{t.importsTrend}</h3>
              <div className="flex items-center gap-2 text-xs font-bold bg-slate-100 px-3 py-1 rounded-full">
                <Info size={14} /> {t.usdHint}
              </div>
            </div>
            <div className="h-[400px]">
              <canvas ref={canvasRef}></canvas>
            </div>
          </div>

          {/* Side Details */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#ddbc6b]/10 p-6 rounded-[2rem] border border-[#ddbc6b]/20">
              <h3 className="font-bold text-[#082721] mb-4 flex items-center gap-2">
                <Globe2 size={20} /> {t.countryDetails}
              </h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <p className="text-xs text-slate-500 mb-1">{t.selectedCountry}</p>
                  <p className="font-black text-[#082721]">{localizeCountry(selectedCountry, language)}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <p className="text-xs text-slate-500 mb-1">{t.selectedYear}</p>
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {yearlyUsdData.slice(-5).map(d => (
                      <button 
                        key={d.year}
                        onClick={() => setCountryYear(d.year)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${countryYear === d.year ? 'bg-[#082721] text-white' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {formatFullUsd(d.year, language)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
              <h3 className="font-bold text-[#082721] mb-4">{t.relativeDistribution}</h3>
              <div className="h-[200px] relative">
                <canvas ref={donutCanvasRef}></canvas>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <p className="text-[10px] font-bold text-slate-400">100%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="mt-8 bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-[#082721]">{t.detailedTable}</h3>
            <button className="text-xs font-bold text-sky-600 hover:underline">{t.exportCsv}</button>
          </div>
          <div className="overflow-x-auto">
            <table className={`w-full ${language === "ar" ? "text-right" : "text-left"}`}>
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">{t.year}</th>
                  <th className="px-6 py-4">{t.mineral}</th>
                  <th className="px-6 py-4">{t.importValue}</th>
                  <th className="px-6 py-4">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {yearlyUsdData.slice(0, 5).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{formatFullUsd(row.year, language)}</td>
                    <td className="px-6 py-4 text-slate-600">{localizeMineral(selectedMineral, language, t.totalMaterials)}</td>
                    <td className="px-6 py-4 font-mono font-bold text-[#082721]">{formatFullUsd(row.value, language)} {t.usd}</td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-bold">{t.completed}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}