import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { CalendarRange, Globe2, TrendingUp, Filter, ChevronDown, List } from "lucide-react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import { LanguageContext, ThemeContext } from "../App";

// Services removed — local stubs to avoid external service usage in pages
const getCountries = async () => [];
const getMinerals = async () => [];
const getTradeTransactionsByType = async () => [];

const DEFAULT_COUNTRY = "ma";
const ALL_COUNTRIES_VALUE = "all";

const PAGE_TRANSLATIONS = {
  ar: {
    badge: "البيانات التعدينية العربية",
    heroTitle: "الواردات التعدينية",
    heroTitleAccent: "الاستراتيجية",
    heroSubtitle: "منصة تحليلية ذكية لرصد وتتبع تدفقات المعادن الحرجة في المنطقة العربية، مع نظرة شاملة على القيم السنوية.",
    latestYear: "احدث سنة",
    lastYearValue: "قيمة اخر سنة",
    yearlyAverage: "المتوسط السنوي",
    yearlyChange: "التغير السنوي",
    acrossYears: "عبر {count} سنوات",
    usd: "دولار امريكي",
    trendAnalysis: "تحليل الاتجاه الزمني",
    trendSubtitle: "تطور قيم الواردات حسب الخام المختار",
    importsValue: "قيمة الواردات",
    quantitiesSoon: "الكميات (قريبا)",
    countryImportDetails: "آخر الدول الموردة",
    yearTag: "سنة",
    arabCountry: "الدولة العربية",
    mineralType: "نوع المعدن",
    importValue: "قيمة الواردات",
    filterTools: "ادوات التصفية",
    chooseCountry: "اختر الدولة",
    referenceYear: "السنة المرجعية",
    relativeDistribution: "التوزيع النسبي للواردات",
    totalShare: "اجمالي الحصة",
    allMinerals: "كل المعادن",
    allCountries: "كل الدول",
  },
  fr: {
    badge: "Donnees minieres arabes",
    heroTitle: "Importations minieres",
    heroTitleAccent: "strategiques",
    heroSubtitle: "Plateforme analytique pour suivre les flux de mineraux critiques dans la region arabe avec les tendances annuelles des valeurs.",
    latestYear: "Derniere annee",
    lastYearValue: "Valeur de la derniere annee",
    yearlyAverage: "Moyenne annuelle",
    yearlyChange: "Variation annuelle",
    acrossYears: "sur {count} ans",
    usd: "USD",
    trendAnalysis: "Analyse de tendance temporelle",
    trendSubtitle: "Evolution des valeurs d'import selon le minerai choisi",
    importsValue: "Valeur des importations",
    quantitiesSoon: "Quantites (bientot)",
    countryImportDetails: "Details des importations par pays",
    yearTag: "Annee",
    arabCountry: "Pays arabe",
    mineralType: "Type de minerai",
    importValue: "Valeur des importations",
    filterTools: "Outils de filtre",
    chooseCountry: "Choisir le pays",
    referenceYear: "Annee de reference",
    relativeDistribution: "Distribution relative des importations",
    totalShare: "Part totale",
    allMinerals: "Tous les mineraux",
    allCountries: "Tous les pays",
  },
  en: {
    badge: "Arab mining data",
    heroTitle: "Strategic mining",
    heroTitleAccent: "imports",
    heroSubtitle: "Smart analytics platform to monitor critical mineral flows in the Arab region with annual import value trends.",
    latestYear: "Latest year",
    lastYearValue: "Last year value",
    yearlyAverage: "Yearly average",
    yearlyChange: "Year-over-year change",
    acrossYears: "across {count} years",
    usd: "USD",
    trendAnalysis: "Time trend analysis",
    trendSubtitle: "Import values over time by selected mineral",
    importsValue: "Import value",
    quantitiesSoon: "Volumes (soon)",
    countryImportDetails: "Country import details",
    yearTag: "Year",
    arabCountry: "Arab country",
    mineralType: "Mineral type",
    importValue: "Import value",
    filterTools: "Filter tools",
    chooseCountry: "Choose country",
    referenceYear: "Reference year",
    relativeDistribution: "Relative import distribution",
    totalShare: "Total share",
    allMinerals: "All minerals",
    allCountries: "All countries",
  },
};

const NUMBER_LOCALES = { ar: "ar-MA", fr: "fr-FR", en: "en-US" };

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

function formatUsd(value, language = "ar") {
  return Number(value || 0).toLocaleString(NUMBER_LOCALES[language] || NUMBER_LOCALES.ar);
}

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
  if (language === "en") return name;
  return mineralNameAr[name] || name;
}

function textWithCount(template, count) {
  return template.replace("{count}", count);
}

const localizeCountryCode = (code, language, dbCountryNames = {}) =>
  code === ALL_COUNTRIES_VALUE
    ? language === "fr"
      ? "Tous les pays"
      : language === "en"
        ? "All countries"
        : "كل الدول"
    : dbCountryNames[code]?.[language] || code;

export default function M6Page() {
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS.ar;

  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [selectedMineral, setSelectedMineral] = useState("all");
  const [countryYear, setCountryYear] = useState(null);
  const [analyticsRows, setAnalyticsRows] = useState([]);
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadAnalytics = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const [importRows, countriesRows, mineralsRows] = await Promise.all([
          getTradeTransactionsByType("import"),
          getCountries(),
          getMinerals(),
        ]);

        const countryById = Array.isArray(countriesRows)
          ? countriesRows.reduce((acc, country) => {
              acc[country.id] = country;
              return acc;
            }, {})
          : {};

        const mineralById = Array.isArray(mineralsRows)
          ? mineralsRows.reduce((acc, mineral) => {
              acc[mineral.id] = mineral;
              return acc;
            }, {})
          : {};

        const analyticsData = Array.isArray(importRows)
          ? importRows.map((row) => {
              const country = countryById[row.country_id] || {};
              const mineral = mineralById[row.mineral_id] || {};
              return {
                country_code: String(country.iso_code || "").toLowerCase(),
                country_name_ar: country.name_ar || "",
                country_name_en: country.name_en || "",
                country_name_fr: country.name_fr || "",
                mineral_name: mineral.name_en || mineral.name_ar || mineral.name_fr || "",
                year: row.year,
                value_usd: row.trade_value_usd,
              };
            })
          : [];

        if (isMounted) {
          setAnalyticsRows(analyticsData);
          setCountries(Array.isArray(countriesRows) ? countriesRows : []);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error?.response?.data?.error || error?.message || "Failed to load analytics data.");
          setAnalyticsRows([]);
          setCountries([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const mineralOptions = useMemo(() => {
    const products = Array.from(new Set(analyticsRows.map((row) => row.mineral_name).filter(Boolean))).sort();
    return ["all", ...products];
  }, [analyticsRows]);

  const availableCountries = useMemo(() => {
    const fromDb = countries.map((row) => String(row.iso_code || "").toLowerCase()).filter(Boolean);
    if (fromDb.length) return fromDb;
    return Array.from(new Set(analyticsRows.map((row) => String(row.country_code || "").toLowerCase()).filter(Boolean))).sort();
  }, [analyticsRows, countries]);

  const dbCountryNames = useMemo(() => {
    const namesFromCountries = countries.reduce((acc, row) => {
      const code = String(row.iso_code || "").toLowerCase();
      if (!code) return acc;
      acc[code] = { ar: row.name_ar || "", en: row.name_en || "", fr: row.name_fr || "" };
      return acc;
    }, {});
    return analyticsRows.reduce((acc, row) => {
      const code = String(row.country_code || "").toLowerCase();
      if (!code) return acc;
      acc[code] = {
        ar: row.country_name_ar || acc[code]?.ar || "",
        en: row.country_name_en || acc[code]?.en || "",
        fr: row.country_name_fr || acc[code]?.fr || "",
      };
      return acc;
    }, namesFromCountries);
  }, [analyticsRows, countries]);

  useEffect(() => {
    if (!availableCountries.length) return;
    if (selectedCountry !== ALL_COUNTRIES_VALUE && !availableCountries.includes(selectedCountry)) {
      setSelectedCountry(availableCountries.includes(DEFAULT_COUNTRY) ? DEFAULT_COUNTRY : availableCountries[0]);
    }
  }, [availableCountries, selectedCountry]);

  const productYearlyData = useMemo(() => {
    return analyticsRows
      .filter((row) => selectedCountry === ALL_COUNTRIES_VALUE || String(row.country_code || "").toLowerCase() === selectedCountry)
      .filter((row) => selectedMineral === "all" || row.mineral_name === selectedMineral)
      .reduce((acc, row) => {
        const y = String(row.year);
        acc[y] = (acc[y] || 0) + Number(row.value_usd || 0);
        return acc;
      }, {});
  }, [analyticsRows, selectedCountry, selectedMineral]);

  const referenceYears = useMemo(
    () =>
      Array.from(
        new Set(
          analyticsRows
            .filter((row) => selectedMineral === "all" || row.mineral_name === selectedMineral)
            .map((row) => Number(row.year))
            .filter((year) => Number.isFinite(year))
        )
      ).sort((a, b) => b - a),
    [analyticsRows, selectedMineral]
  );

  useEffect(() => {
    if (!referenceYears.length) return setCountryYear(null);
    setCountryYear(referenceYears[0]);
  }, [referenceYears]);

  const yearlyUsdData = useMemo(
    () => Object.entries(productYearlyData).map(([year, value]) => ({ year: Number(year), value })).sort((a, b) => a.year - b.year),
    [productYearlyData]
  );
  const barYears = useMemo(() => yearlyUsdData.map((item) => item.year), [yearlyUsdData]);
  const chartValues = useMemo(() => yearlyUsdData.map((item) => item.value), [yearlyUsdData]);
  const totalUsd = useMemo(() => yearlyUsdData.reduce((sum, item) => sum + item.value, 0), [yearlyUsdData]);
  const countryYears = useMemo(() => yearlyUsdData.map((item) => item.year), [yearlyUsdData]);
  const latestYear = useMemo(() => (countryYears.length ? countryYears[countryYears.length - 1] : null), [countryYears]);
  const latestYearValue = useMemo(() => (latestYear ? yearlyUsdData.find((item) => item.year === latestYear)?.value || 0 : 0), [latestYear, yearlyUsdData]);
  const avgYearlyValue = useMemo(() => (yearlyUsdData.length ? totalUsd / yearlyUsdData.length : 0), [totalUsd, yearlyUsdData]);
  const yoyChange = useMemo(() => {
    if (yearlyUsdData.length < 2) return null;
    const current = yearlyUsdData[yearlyUsdData.length - 1]?.value || 0;
    const previous = yearlyUsdData[yearlyUsdData.length - 2]?.value || 0;
    if (!previous) return null;
    return ((current - previous) / previous) * 100;
  }, [yearlyUsdData]);

  const allCountryRows = useMemo(() => {
    const targetYear = countryYear || referenceYears[0];
    if (!targetYear) return [];
    const valuesByCountry = analyticsRows
      .filter((row) => Number(row.year) === Number(targetYear))
      .filter((row) => selectedMineral === "all" || row.mineral_name === selectedMineral)
      .reduce((acc, row) => {
        const countryCode = String(row.country_code || "").toLowerCase();
        if (!countryCode) return acc;
        const rowValue = Number(row.value_usd || 0);
        const mineralName = row.mineral_name || "";
        if (!acc[countryCode]) acc[countryCode] = { total: 0, minerals: {} };
        acc[countryCode].total += rowValue;
        acc[countryCode].minerals[mineralName] = (acc[countryCode].minerals[mineralName] || 0) + rowValue;
        return acc;
      }, {});
    const total = Object.values(valuesByCountry).reduce((sum, item) => sum + item.total, 0);
    return Object.entries(valuesByCountry)
      .map(([countryCode, item]) => {
        const topMineralEntry = Object.entries(item.minerals).sort((a, b) => b[1] - a[1])[0];
        return {
          c: countryCode,
          mineral: selectedMineral === "all" ? topMineralEntry?.[0] || "-" : selectedMineral,
          v: item.total,
          share: total > 0 ? (item.total / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.v - a.v);
  }, [analyticsRows, referenceYears, selectedMineral, countryYear]);

  const countryTableRows = useMemo(() => {
    if (!allCountryRows.length) return [];
    if (selectedCountry === ALL_COUNTRIES_VALUE) return allCountryRows;
    return allCountryRows.filter((r) => r.c === selectedCountry);
  }, [allCountryRows, selectedCountry]);

  const selectedCountryValue = useMemo(
    () =>
      selectedCountry === ALL_COUNTRIES_VALUE
        ? allCountryRows.reduce((sum, row) => sum + row.v, 0)
        : allCountryRows.find((row) => row.c === selectedCountry)?.v || 0,
    [allCountryRows, selectedCountry]
  );
  const selectedCountryShare = useMemo(
    () =>
      selectedCountry === ALL_COUNTRIES_VALUE ? 100 : allCountryRows.find((row) => row.c === selectedCountry)?.share || 0,
    [allCountryRows, selectedCountry]
  );
  const statusMessage = useMemo(() => {
    if (isLoading) return language === "fr" ? "Chargement des donnees..." : language === "en" ? "Loading data..." : "جاري تحميل البيانات...";
    if (loadError) return language === "fr" ? "Erreur lors du chargement des donnees." : language === "en" ? "Failed to load data." : "تعذر تحميل البيانات.";
    return "";
  }, [isLoading, loadError, language]);

  const countryPack = useMemo(() => {
    if (!allCountryRows.length) return { table: [] };
    if (selectedCountry === ALL_COUNTRIES_VALUE) return { table: allCountryRows };
    return { table: allCountryRows.filter((r) => r.c === selectedCountry) };
  }, [allCountryRows, selectedCountry]);
  const effectiveCountry = selectedCountry === ALL_COUNTRIES_VALUE || (selectedCountry && availableCountries.includes(selectedCountry)) ? selectedCountry : DEFAULT_COUNTRY;

  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const donutCanvasRef = useRef(null);
  const donutChartRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (chartRef.current) chartRef.current.destroy();
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(221, 188, 107, 0.45)");
    gradient.addColorStop(1, "rgba(221, 188, 107, 0.02)");
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: barYears,
        datasets: [
          {
            label: selectedMineral === "all" ? t.importsValue : translateMineral(selectedMineral, language, t.allMinerals),
            data: chartValues,
            borderColor: "#ddbc6b",
            borderWidth: 4,
            backgroundColor: gradient,
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHitRadius: 28,
            pointBackgroundColor: "#082721",
            pointBorderColor: "#ddbc6b",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#082721",
            titleFont: { family: "Cairo", size: 14 },
            bodyFont: { family: "Cairo", size: 13 },
            padding: 12,
            cornerRadius: 10,
            callbacks: { label: (context) => ` ${formatUsd(context.parsed.y, language)} ${t.usd}` },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: "Cairo" },
              autoSkip: true,
              maxTicksLimit: 6,
              maxRotation: 0,
              minRotation: 0,
            },
          },
          y: {
            grid: { color: "rgba(0,0,0,0.05)" },
            ticks: {
              font: { family: "Cairo" },
              callback: (value) => formatUsd(value, language),
            },
          },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [barYears, chartValues, selectedMineral, language, t.importsValue, t.allMinerals, t.usd]);

  useEffect(() => {
    const ctx = donutCanvasRef.current?.getContext("2d");
    if (!ctx || !countryPack) return;
    if (donutChartRef.current) {
      donutChartRef.current.destroy();
      donutChartRef.current = null;
    }
    const rows = countryPack.table || [];
    if (!rows.length) return;
    donutChartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: rows.map((r) => localizeCountryCode(r.c, language, dbCountryNames)),
        datasets: [
          {
            data: rows.map((r) => r.v),
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
        onClick: (_evt, elements) => {
          const idx = elements?.[0]?.index ?? null;
          if (idx == null) return;
          const next = rows[idx]?.c;
          if (next) setSelectedCountry(next);
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => {
                const idx = c?.dataIndex ?? 0;
                const share = rows[idx]?.share ?? 0;
                return ` ${c.label}: ${formatUsd(c.parsed, language)} ${t.usd} (${Number(share).toFixed(1)}%)`;
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
  }, [countryPack, dbCountryNames, language, t.usd]);

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} lang={language} className={`min-h-screen font-['Cairo'] ${isDarkMode ? "text-slate-100" : "text-slate-800"}`} style={{ background: isDarkMode ? "#071611" : "#F4F7F5" }}>
      <Menu />
      <div className="relative overflow-hidden bg-[#082721] pb-36 pt-16 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ddbc6b 1px, transparent 1px)", size: "20px 20px" }}></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest uppercase bg-[#ddbc6b]/20 border border-[#ddbc6b]/30 rounded-full text-[#ddbc6b]">{t.badge}</span>
          <h1 className="text-4xl md:text-5xl font-black mb-4">{t.heroTitle} <span className="text-[#ddbc6b]">{t.heroTitleAccent}</span></h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm md:text-base leading-relaxed">{t.heroSubtitle}</p>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20" style={{ transform: "translateY(2px)" }}>
          <svg className="relative block w-full h-[56px] md:h-[90px] lg:h-[120px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill={isDarkMode ? "#0b221b" : "#F4F7F5"} fillOpacity="0.4" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L0,320Z" />
            <path fill={isDarkMode ? "#071611" : "#F4F7F5"} fillOpacity="1" d="M0,288L60,261.3C120,235,240,181,360,149.3C480,117,600,107,720,122.7C840,139,960,181,1080,186.7C1200,192,1320,160,1380,144L1440,128L1440,320L0,320Z" />
          </svg>
        </div>
      </div>

      <main className="container mx-auto px-3 sm:px-4 -mt-24 pb-12 relative z-20">
        {statusMessage ? <div className={`mb-6 rounded-2xl px-4 py-3 text-sm font-bold ${isDarkMode ? "border border-white/10 bg-[#0d2c24] text-slate-200" : "border border-slate-200 bg-white text-slate-600"}`}>{statusMessage}</div> : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: t.latestYear, value: latestYear ? formatUsd(latestYear, language) : "-", icon: <CalendarRange />, color: "bg-blue-500" },
            { label: t.lastYearValue, value: formatUsd(latestYearValue, language), sub: t.usd, icon: <TrendingUp />, color: "bg-[#ddbc6b]" },
            { label: t.yearlyAverage, value: formatUsd(avgYearlyValue, language), sub: textWithCount(t.acrossYears, countryYears.length), icon: <Globe2 />, color: "bg-emerald-500" },
            { label: t.yearlyChange, value: yoyChange !== null ? `${yoyChange.toFixed(1)}%` : "-", icon: <TrendingUp />, color: yoyChange > 0 ? "bg-green-500" : "bg-red-500" },
          ].map((card, i) => (
            <div key={i} className={`rounded-3xl p-6 border flex items-center gap-5 transition-transform hover:-translate-y-1 ${isDarkMode ? "bg-[#0d2c24] border-white/10 shadow-none" : "bg-white border-white shadow-xl shadow-slate-200/50"}`}>
              <div className={`${card.color} p-4 rounded-2xl text-white ${isDarkMode ? "shadow-none" : "shadow-lg shadow-inherit"}`}>{card.icon}</div>
              <div>
                <p className={`text-xs font-bold mb-1 ${isDarkMode ? "text-slate-300" : "text-slate-400"}`}>{card.label}</p>
                <p className={`text-xl font-black ${isDarkMode ? "text-white" : "text-slate-800"}`}>{card.value}</p>
                {card.sub && <p className={`text-[10px] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{card.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className={`rounded-[2.5rem] p-4 sm:p-6 md:p-8 border ${isDarkMode ? "bg-[#0d2c24] border-white/10 shadow-none" : "bg-white border-slate-100 shadow-xl shadow-slate-200/60"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2"><TrendingUp className="text-[#ddbc6b]" size={20} />{t.trendAnalysis}</h3>
                  <p className={`text-xs ${isDarkMode ? "text-slate-300" : "text-slate-400"}`}>{t.trendSubtitle}</p>
                </div>
                <div className={`flex w-full sm:w-auto gap-2 p-1.5 rounded-2xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100"}`}>
                  <button className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl bg-white text-[#082721] ${isDarkMode ? "shadow-none" : "shadow-sm"}`}>{t.importsValue}</button>
                  <button className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl ${isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-400 hover:text-slate-600"}`}>{t.quantitiesSoon}</button>
                </div>
              </div>
              <div className="relative h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px] w-full">
                <canvas ref={canvasRef} />
              </div>
            </div>

            <div className={`rounded-[2.5rem] overflow-hidden border ${isDarkMode ? "bg-[#0d2c24] border-white/10 shadow-none" : "bg-white border-slate-100 shadow-xl shadow-slate-200/60"}`}>
              <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? "border-white/10" : "border-slate-50"}`}>
                <h3 className="font-bold flex items-center gap-2"><List className="text-[#ddbc6b]" size={20} />{t.countryImportDetails}</h3>
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${isDarkMode ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-500"}`}>{t.yearTag} {countryYear ? formatUsd(countryYear, language) : "-"}</span>
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full ${language === "ar" ? "text-right" : "text-left"}`}>
                  <thead className={`${isDarkMode ? "bg-white/5 text-slate-300" : "bg-slate-50/50 text-slate-400"} text-[11px] uppercase font-black`}>
                    <tr>
                      <th className="px-6 py-4">{t.arabCountry}</th>
                      <th className="px-6 py-4">{t.mineralType}</th>
                      <th className={`px-6 py-4 ${language === "ar" ? "text-left" : "text-right"}`}>{t.importValue}</th>
                    </tr>
                  </thead>
                  <tbody className={`text-sm font-bold ${isDarkMode ? "divide-y divide-white/10" : "divide-y divide-slate-50"}`}>
                    {countryTableRows.map((r) => (
                      <tr key={r.c} className={`transition-colors group ${isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50/80"}`}>
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] transition-colors ${isDarkMode ? "bg-white/10 text-white group-hover:bg-[#ddbc6b]/20 group-hover:text-[#ddbc6b]" : "bg-slate-100 group-hover:bg-[#ddbc6b]/20 group-hover:text-[#082721]"}`}>{r.c.toUpperCase()}</div>
                          {localizeCountryCode(r.c, language, dbCountryNames)}
                        </td>
                        <td className="px-6 py-4">{translateMineral(r.mineral, language, t.allMinerals)}</td>
                        <td className={`px-6 py-4 font-black ${isDarkMode ? "text-[#ddbc6b]" : "text-[#082721]"} ${language === "ar" ? "text-left" : "text-right"}`}>{formatUsd(r.v, language)} {t.usd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className={`bg-[#082721] rounded-[2.5rem] p-8 text-white relative overflow-hidden group ${isDarkMode ? "shadow-none" : "shadow-2xl shadow-emerald-900/20"}`}>
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#ddbc6b]/10 rounded-full blur-3xl group-hover:bg-[#ddbc6b]/20 transition-all"></div>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3"><Filter size={20} className="text-[#ddbc6b]" />{t.filterTools}</h3>
              <div className="space-y-6 relative z-10">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">{t.chooseCountry}</label>
                  <div className="relative">
                    <select value={effectiveCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-[#ddbc6b] appearance-none transition-all">
                      <option value={ALL_COUNTRIES_VALUE} className="text-slate-800">{t.allCountries}</option>
                      {availableCountries.map((c) => <option key={c} value={c} className="text-slate-800">{localizeCountryCode(c, language, dbCountryNames)}</option>)}
                    </select>
                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">{t.mineralType}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {mineralOptions.slice(0, 6).map((m) => (
                      <button key={m} onClick={() => setSelectedMineral(m)} className={`px-3 py-3 rounded-xl text-[11px] font-bold border transition-all ${selectedMineral === m ? "bg-[#ddbc6b] border-[#ddbc6b] text-[#082721]" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>
                        {translateMineral(m, language, t.allMinerals)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">{t.referenceYear}</label>
                  <div className="flex flex-wrap gap-2">
                    {referenceYears.slice(0, 6).map((y) => (
                      <button key={y} onClick={() => setCountryYear(y)} className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black transition-all ${y === countryYear ? `bg-white text-[#082721] scale-110 ${isDarkMode ? "shadow-none" : "shadow-lg"}` : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>{formatUsd(y, language)}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className={`rounded-[2.5rem] p-6 sm:p-8 border ${isDarkMode ? "bg-[#0d2c24] border-white/10 shadow-none" : "bg-white border-slate-100 shadow-xl shadow-slate-200/60"}`}>
              <h3 className="text-base font-black mb-6 text-center">{t.relativeDistribution}</h3>
              <div className="relative h-[210px] sm:h-[240px] md:h-[250px] w-full">
                <canvas ref={donutCanvasRef} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className={`text-xs font-bold ${isDarkMode ? "text-slate-300" : "text-slate-400"}`}>{t.totalShare}</span>
                  <span className={`text-2xl font-black ${isDarkMode ? "text-[#ddbc6b]" : "text-[#082721]"}`}>{selectedCountryShare.toFixed(1)}%</span>
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
