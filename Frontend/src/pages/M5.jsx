import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { CalendarRange, Gem, Globe2, TrendingUp, Filter, ChevronDown, List } from "lucide-react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import { LanguageContext, ThemeContext } from "../App";
import { getCriticalMineralExportsAnalytics } from "../services/tradeTransactionService";
import { getCountries } from "../services/countryService";

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

const AVAILABLE_COUNTRIES_FALLBACK = COUNTRIES.map((c) => c.code);

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
    countryExportDetails: "آخر الدول المصدرة",
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

const localizeCountryCode = (code, language, dbCountryNames = {}) =>
  dbCountryNames[code]?.[language] ||
  COUNTRY_LABELS[code]?.[language] ||
  countryNameAr[code] ||
  code;

function textWithCount(template, count) {
  return template.replace("{count}", count);
}

export default function M5Page() {
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
        const [rows, countriesRows] = await Promise.all([getCriticalMineralExportsAnalytics(), getCountries()]);
        if (isMounted) {
          setAnalyticsRows(Array.isArray(rows) ? rows : []);
          setCountries(Array.isArray(countriesRows) ? countriesRows : []);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error?.response?.data?.error || error?.message || "Failed to load analytics data.");
          setAnalyticsRows([]);
          setCountries([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const mineralOptions = useMemo(() => {
    const products = Array.from(
      new Set(analyticsRows.map((row) => row.mineral_name).filter(Boolean))
    ).sort();
    return ["all", ...products];
  }, [analyticsRows]);

  const availableCountries = useMemo(() => {
    const fromDb = countries.map((row) => String(row.iso_code || "").toLowerCase()).filter(Boolean);
    const unique = Array.from(new Set(fromDb));
    if (unique.length) return unique.sort();

    // Fallback: if DB countries aren't available, derive from analytics data.
    const countriesFromData = Array.from(
      new Set(analyticsRows.map((row) => String(row.country_code || "").toLowerCase()).filter(Boolean))
    ).sort();

    return countriesFromData.length ? countriesFromData : AVAILABLE_COUNTRIES_FALLBACK;
  }, [countries, analyticsRows]);

  const dbCountryNames = useMemo(
    () =>
      (countries.length
        ? countries.reduce((acc, row) => {
            const code = String(row.iso_code || "").toLowerCase();
            if (!code) return acc;
            acc[code] = { ar: row.name_ar || "", en: row.name_en || "", fr: row.name_fr || "" };
            return acc;
          }, {})
        : analyticsRows.reduce((acc, row) => {
            const code = String(row.country_code || "").toLowerCase();
            if (!code) return acc;
            acc[code] = {
              ar: row.country_name_ar || "",
              en: row.country_name_en || "",
              fr: row.country_name_fr || "",
            };
            return acc;
          }, {})),
    [countries, analyticsRows]
  );

  useEffect(() => {
    if (!availableCountries.length) return;
    if (!availableCountries.includes(selectedCountry)) {
      setSelectedCountry(availableCountries.includes(DEFAULT_COUNTRY) ? DEFAULT_COUNTRY : availableCountries[0]);
    }
  }, [availableCountries, selectedCountry]);

  const productYearlyData = useMemo(() => {
    return analyticsRows
      .filter((row) => String(row.country_code || "").toLowerCase() === selectedCountry)
      .filter((row) => selectedMineral === "all" || row.mineral_name === selectedMineral)
      .reduce((acc, row) => {
        const y = String(row.year);
        acc[y] = (acc[y] || 0) + Number(row.value_usd || 0);
        return acc;
      }, {});
  }, [analyticsRows, selectedCountry, selectedMineral]);

  const referenceYears = useMemo(() => {
    return Array.from(
      new Set(
        analyticsRows
          .filter((row) => selectedMineral === "all" || row.mineral_name === selectedMineral)
          .map((row) => Number(row.year))
          .filter((year) => Number.isFinite(year))
      )
    ).sort((a, b) => b - a);
  }, [analyticsRows, selectedMineral]);

  useEffect(() => {
    if (!referenceYears.length) {
      setCountryYear(null);
      return;
    }
    setCountryYear(referenceYears[0]);
  }, [referenceYears]);

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

  const countryTableRows = useMemo(() => {
    const latestReferenceYear = referenceYears[0];
    if (!latestReferenceYear) return [];

    const valuesByCountry = analyticsRows
      .filter((row) => Number(row.year) === Number(latestReferenceYear))
      .filter((row) => selectedMineral === "all" || row.mineral_name === selectedMineral)
      .reduce((acc, row) => {
        const countryCode = String(row.country_code || "").toLowerCase();
        if (!countryCode) return acc;
        const rowValue = Number(row.value_usd || 0);
        const mineralName = row.mineral_name || "";

        if (!acc[countryCode]) {
          acc[countryCode] = { total: 0, minerals: {} };
        }

        acc[countryCode].total += rowValue;
        acc[countryCode].minerals[mineralName] = (acc[countryCode].minerals[mineralName] || 0) + rowValue;
        return acc;
      }, {});

    const total = Object.values(valuesByCountry).reduce((sum, item) => sum + item.total, 0);

    return Object.entries(valuesByCountry)
      .map(([countryCode, item]) => {
        const topMineralEntry = Object.entries(item.minerals).sort((a, b) => b[1] - a[1])[0];
        const topMineral = selectedMineral === "all" ? (topMineralEntry?.[0] || "-") : selectedMineral;

        return {
        c: countryCode,
          mineral: topMineral,
        v: item.total,
          share: total > 0 ? (item.total / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.v - a.v)
      ;
  }, [analyticsRows, referenceYears, selectedMineral]);

  const selectedCountryValue = useMemo(
    () => countryTableRows.find((row) => row.c === selectedCountry)?.v || 0,
    [countryTableRows, selectedCountry]
  );

  const selectedCountryShare = useMemo(
    () => countryTableRows.find((row) => row.c === selectedCountry)?.share || 0,
    [countryTableRows, selectedCountry]
  );

  const statusMessage = useMemo(() => {
    if (isLoading) {
      if (language === "fr") return "Chargement des donnees...";
      if (language === "en") return "Loading data...";
      return "جاري تحميل البيانات...";
    }
    if (loadError) {
      if (language === "fr") return "Erreur lors du chargement des donnees.";
      if (language === "en") return "Failed to load data.";
      return "تعذر تحميل البيانات.";
    }
    return "";
  }, [isLoading, loadError, language]);

  const countryPack = useMemo(
    () => ({
      // Donut + tooltip doivent couvrir tous les pays (pas seulement top 2).
      table: countryTableRows,
    }),
    [countryTableRows]
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

    const labels = rows.map((r) => localizeCountryCode(r.c, language, dbCountryNames));
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
                const v = c.parsed;
                return ` ${c.label}: ${formatUsd(v, language)} ${t.usd} (${Number(share).toFixed(1)}%)`;
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
  }, [countryPack, dbCountryNames, language, selectedCountryShare, t.usd]);

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      lang={language}
      className={`min-h-screen font-['Cairo'] ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}
      style={{ background: isDarkMode ? "#071611" : "#F4F7F5" }}
    >
      <Menu />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#082721] pb-36 pt-16 text-white">
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
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20" style={{ transform: "translateY(2px)" }}>
          <svg className="relative block w-full h-[56px] md:h-[90px] lg:h-[120px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path
              fill={isDarkMode ? "#0b221b" : "#F4F7F5"}
              fillOpacity="0.4"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L0,320Z"
            />
            <path
              fill={isDarkMode ? "#071611" : "#F4F7F5"}
              fillOpacity="1"
              d="M0,288L60,261.3C120,235,240,181,360,149.3C480,117,600,107,720,122.7C840,139,960,181,1080,186.7C1200,192,1320,160,1380,144L1440,128L1440,320L0,320Z"
            />
          </svg>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-24 pb-12 relative z-20">
        {statusMessage ? (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 text-sm font-bold ${
              isDarkMode ? "border border-white/10 bg-[#0d2c24] text-slate-200" : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {statusMessage}
          </div>
        ) : null}
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: t.latestYear, value: latestYear ? formatUsd(latestYear, language) : "-", icon: <CalendarRange />, color: "bg-blue-500" },
            { label: t.lastYearValue, value: formatUsd(latestYearValue, language), sub: t.usd, icon: <Gem />, color: "bg-[#ddbc6b]" },
            { label: t.yearlyAverage, value: formatUsd(avgYearlyValue, language), sub: textWithCount(t.acrossYears, countryYears.length), icon: <Globe2 />, color: "bg-emerald-500" },
            { label: t.yearlyChange, value: yoyChange !== null ? `${yoyChange.toFixed(1)}%` : "-", icon: <TrendingUp />, color: yoyChange > 0 ? "bg-green-500" : "bg-red-500" },
          ].map((card, i) => (
            <div
              key={i}
              className={`rounded-3xl p-6 border flex items-center gap-5 transition-transform hover:-translate-y-1 ${
                isDarkMode
                  ? "bg-[#0d2c24] border-white/10 shadow-none"
                  : "bg-white border-white shadow-xl shadow-slate-200/50"
              }`}
            >
              <div className={`${card.color} p-4 rounded-2xl text-white ${isDarkMode ? "shadow-none" : "shadow-lg shadow-inherit"}`}>
                {card.icon}
              </div>
              <div>
                <p className={`text-xs font-bold mb-1 ${isDarkMode ? "text-slate-300" : "text-slate-400"}`}>{card.label}</p>
                <p className={`text-xl font-black ${isDarkMode ? "text-white" : "text-slate-800"}`}>{card.value}</p>
                {card.sub && <p className={`text-[10px] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{card.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Chart Section */}
          <div className="lg:col-span-8 space-y-8">
            <div className={`rounded-[2.5rem] p-6 md:p-8 border ${isDarkMode ? "bg-[#0d2c24] border-white/10 shadow-none" : "bg-white border-slate-100 shadow-xl shadow-slate-200/60"}`}>
              <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="text-[#ddbc6b]" size={20} />
                    {t.trendAnalysis}
                  </h3>
                  <p className={`text-xs ${isDarkMode ? "text-slate-300" : "text-slate-400"}`}>{t.trendSubtitle}</p>
                </div>
                <div className={`flex gap-2 p-1.5 rounded-2xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100"}`}>
                   <button className={`px-4 py-2 text-xs font-bold rounded-xl bg-white text-[#082721] ${isDarkMode ? "shadow-none" : "shadow-sm"}`}>{t.exportsValue}</button>
                   <button className={`px-4 py-2 text-xs font-bold rounded-xl ${isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-400 hover:text-slate-600"}`}>{t.quantitiesSoon}</button>
                </div>
              </div>
              <div className="relative h-[260px] sm:h-[320px] md:h-[380px] lg:h-[400px] w-full">
                <canvas ref={canvasRef} />
              </div>
            </div>

            {/* Comparison Table */}
            <div className={`rounded-[2.5rem] overflow-hidden border ${isDarkMode ? "bg-[#0d2c24] border-white/10 shadow-none" : "bg-white border-slate-100 shadow-xl shadow-slate-200/60"}`}>
               <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? "border-white/10" : "border-slate-50"}`}>
                  <h3 className="font-bold flex items-center gap-2">
                    <List className="text-[#ddbc6b]" size={20} />
                    {t.countryExportDetails}
                  </h3>
                  <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${isDarkMode ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-500"}`}>{t.yearTag} {countryYear ? formatUsd(countryYear, language) : "-"}</span>
               </div>
               <div className="overflow-x-auto">
                 <table className={`w-full ${language === "ar" ? "text-right" : "text-left"}`}>
                  <thead className={`${isDarkMode ? "bg-white/5 text-slate-300" : "bg-slate-50/50 text-slate-400"} text-[11px] uppercase font-black`}>
                     <tr>
                       <th className="px-6 py-4">{t.arabCountry}</th>
                       <th className="px-6 py-4">{t.mineralType}</th>
                       <th className={`px-6 py-4 ${language === "ar" ? "text-left" : "text-right"}`}>{t.exportValue}</th>
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

          {/* Sidebar Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`bg-[#082721] rounded-[2.5rem] p-8 text-white relative overflow-hidden group ${isDarkMode ? "shadow-none" : "shadow-2xl shadow-emerald-900/20"}`}>
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
                          {localizeCountryCode(c, language, dbCountryNames)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">{t.mineralType}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {mineralOptions.map((m) => (
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
                    {referenceYears.slice(0, 6).map(y => (
                      <button 
                        key={y}
                        onClick={() => setCountryYear(y)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                          y === countryYear
                            ? `bg-white text-[#082721] scale-110 ${isDarkMode ? "shadow-none" : "shadow-lg"}`
                            : "bg-white/5 text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        {formatUsd(y, language)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Donut Chart Card */}
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