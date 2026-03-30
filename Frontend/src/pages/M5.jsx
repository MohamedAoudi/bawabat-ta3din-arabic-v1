import { useEffect, useMemo, useRef, useState } from "react";
import { Scale, Weight } from "lucide-react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";

const MIN_YEAR = 2010;
const MAX_YEAR = 2023;

const fallbackYears = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, i) => MIN_YEAR + i
);

const fallbackSeriesMap = {
  gold: {
    name: "الذهب",
    values: [251, 193, 177, 199, 194, 6, 6, 7, 129, 130, 133, 9, 9, 1, 36],
  },
  silver: {
    name: "الفضة",
    values: [52, 58, 61, 97, 101, 111, 124, 143, 129, 130, 133, 82, 79, 31, 36],
  },
  copper: {
    name: "النحاس",
    values: [20, 22, 24, 28, 26, 30, 33, 29, 35, 38, 41, 37, 34, 32, 30],
  },
  phosphate: {
    name: "الفوسفات",
    values: [90, 92, 95, 98, 100, 105, 110, 120, 115, 118, 116, 114, 117, 121, 123],
  },
  iron: {
    name: "الحديد",
    values: [70, 71, 75, 77, 80, 82, 85, 88, 90, 92, 93, 91, 94, 96, 98],
  },
  bauxite: {
    name: "البوكسيت",
    values: [10, 12, 13, 14, 16, 15, 18, 20, 22, 21, 23, 24, 25, 24, 26],
  },
  aluminum: {
    name: "الألمنيوم",
    values: [40, 42, 43, 45, 47, 48, 50, 52, 54, 55, 56, 58, 59, 60, 61],
  },
};

const commodityConfig = {
  gold: { csvName: "gold", label: "الذهب" },
  silver: { csvName: "silver", label: "الفضة" },
  copper: { csvName: "copper", label: "النحاس" },
  phosphate: { csvName: "phosphate rock", label: "الفوسفات" },
  iron: { csvName: "iron ore", label: "الحديد" },
  bauxite: {
    csvName: "bauxite, alumina and aluminium",
    label: "البوكسيت",
  },
  aluminum: { csvName: "aluminium", label: "الألمنيوم" },
};

const DEFAULT_COUNTRY = "Morocco";

const countryNameAr = {
  Jordan: "المملكة الأردنية الهاشمية",
  "United Arab Emirates": "دولة الامارات العربية المتحدة",
  Bahrain: "مملكة البحرين",
  Tunisia: "الجمهورية التونسية",
  Algeria: "الجمهورية الجزائرية الديمقراطية الشعبية",
  Djibouti: "دولة جيبوتي",
  "Saudi Arabia": "المملكة العربية السعودية",
  Sudan: "جمهورية السودان",
  Syria: "الجمهورية العربية السورية",
  Somalia: "جمهورية الصومال",
  Iraq: "جمهورية العراق",
  Oman: "سلطنة عمان",
  Palestine: "دولة فلسطين",
  Qatar: "دولة قطر",
  Kuwait: "دولة الكويت",
  Lebanon: "الجمهورية اللبنانية",
  Libya: "دولة ليبيا",
  Egypt: "جمهورية مصر العربية",
  Morocco: "المملكة المغربية",
  Mauritania: "الجمهورية الإسلامية الموريتانية",
  Yemen: "الجمهورية اليمنية",
  Comoros: "اتحاد جزر القمر",
};

const arabCountryList = [
  "Jordan",
  "United Arab Emirates",
  "Bahrain",
  "Tunisia",
  "Algeria",
  "Djibouti",
  "Saudi Arabia",
  "Sudan",
  "Syria",
  "Somalia",
  "Iraq",
  "Oman",
  "Palestine",
  "Qatar",
  "Kuwait",
  "Lebanon",
  "Libya",
  "Egypt",
  "Morocco",
  "Mauritania",
  "Yemen",
];

const arabCountries = new Set(arabCountryList);

function parseCsvLine(line, delimiter = ",") {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  result.push(current);
  return result;
}

const normalizeHeaderKey = (key) =>
  String(key || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const parseYearFromValue = (value) => {
  if (!value) return null;
  if (String(value).includes("/")) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.getFullYear();
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseFlexibleNumber = (raw) => {
  if (raw == null) return null;
  let s = String(raw).trim().replace(/\s+/g, "");
  if (!s) return null;

  const commaIdx = s.lastIndexOf(",");
  const dotIdx = s.lastIndexOf(".");

  if (commaIdx !== -1 && dotIdx !== -1) {
    if (commaIdx > dotIdx) {
      s = s.replace(/\./g, "").replace(/,/g, ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (commaIdx !== -1) {
    s = s.replace(/,/g, ".");
  }

  const parsed = Number.parseFloat(s);
  return Number.isNaN(parsed) ? null : parsed;
};

function buildSeriesFromCsv(csvText) {
  const lines = String(csvText || "").split(/\r?\n/);
  if (lines.length < 2) return null;

  const seriesByKey = {};
  const timeSeriesByKey = {};
  const allYearsSet = new Set();

  Object.keys(commodityConfig).forEach((key) => {
    seriesByKey[key] = {};
    timeSeriesByKey[key] = { arab: {}, world: {} };
  });

  let idx = {
    reporter: -1,
    flow: -1,
    year: -1,
    value: -1,
    commodity: -1,
  };

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i] || "";
    if (!line.trim()) continue;
    if (/^(trade in critical minerals|export|import)$/i.test(line.trim())) continue;

    const delimiter = line.includes("\t") ? "\t" : ",";
    const cols = parseCsvLine(line, delimiter).map((c) => String(c || "").trim());
    if (cols.length < 5) continue;

    const normalized = cols.map(normalizeHeaderKey);
    const headerLike =
      normalized.includes("reporter") &&
      normalized.includes("flow") &&
      normalized.includes("year") &&
      normalized.includes("aggregate_product") &&
      (normalized.includes("value") || normalized.includes("value (us$)"));

    if (headerLike) {
      idx = {
        reporter: normalized.indexOf("reporter"),
        flow: normalized.indexOf("flow"),
        year: normalized.indexOf("year"),
        value: normalized.findIndex((h) => h === "value" || h === "value (us$)"),
        commodity: normalized.indexOf("aggregate_product"),
      };
      continue;
    }

    const flowRaw = idx.flow !== -1 ? cols[idx.flow] : cols[2];
    if (String(flowRaw).toLowerCase() !== "export") continue;

    const commodityRaw = idx.commodity !== -1 ? cols[idx.commodity] : cols[3];
    const commodity = String(commodityRaw || "").toLowerCase();

    const yearRaw = idx.year !== -1 ? cols[idx.year] : cols[6];
    const yearNumber = parseYearFromValue(yearRaw);
    if (!yearNumber) continue;
    if (yearNumber < MIN_YEAR || yearNumber > MAX_YEAR) continue;

    const valueRaw = idx.value !== -1 ? cols[idx.value] : cols[7];
    const value = parseFlexibleNumber(valueRaw);
    if (value == null) continue;

    const commodityKey = Object.keys(commodityConfig).find((key) => {
      const csvName = commodityConfig[key].csvName.toLowerCase();
      return commodity === csvName;
    });

    if (!commodityKey) continue;

    const country = idx.reporter !== -1 ? cols[idx.reporter] : cols[0];
    allYearsSet.add(yearNumber);

    if (!seriesByKey[commodityKey][yearNumber]) {
      seriesByKey[commodityKey][yearNumber] = 0;
    }

    // Stored as "kton" in internal helpers; for this file it's monetary value,
    // but we keep same scaling pipeline for UI consistency.
    seriesByKey[commodityKey][yearNumber] += value;

    // Track time series (world total)
    if (!timeSeriesByKey[commodityKey].world[yearNumber]) {
      timeSeriesByKey[commodityKey].world[yearNumber] = 0;
    }
    timeSeriesByKey[commodityKey].world[yearNumber] += value;

    // Track time series (arab subset)
    if (arabCountries.has(country)) {
      if (!timeSeriesByKey[commodityKey].arab[yearNumber]) {
        timeSeriesByKey[commodityKey].arab[yearNumber] = 0;
      }
      timeSeriesByKey[commodityKey].arab[yearNumber] += value;
    }
  }

  if (!allYearsSet.size) return null;

  const years = Array.from(allYearsSet).sort((a, b) => a - b);

  const seriesMap = {};
  const timeSeriesMap = {};
  Object.keys(commodityConfig).forEach((key) => {
    const yearToValue = seriesByKey[key];
    const values = years.map((y) => {
      const val = yearToValue[y] || 0;
      return Number(val.toFixed(2));
    });

    seriesMap[key] = {
      name: commodityConfig[key].label,
      values,
    };

    // Build time series for each commodity
    const timeSeries = [];
    years.forEach((y) => {
      const arab = Number((timeSeriesByKey[key].arab[y] || 0).toFixed(2));
      const world = Number((timeSeriesByKey[key].world[y] || 0).toFixed(2));
      timeSeries.push({ year: y, arab, world });
    });
    timeSeriesMap[key] = timeSeries;
  });

  return { years, seriesMap, timeSeriesMap };
}

function buildImportCountryDataFromCsv(csvText) {
  const lines = String(csvText || "").split(/\r?\n/);
  if (lines.length < 2) return null;

  const byProductYearCountry = {};

  Object.keys(commodityConfig).forEach((key) => {
    byProductYearCountry[key] = {};
  });

  let idx = {
    reporter: -1,
    flow: -1,
    year: -1,
    value: -1,
    commodity: -1,
  };

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i] || "";
    if (!line.trim()) continue;
    if (/^(trade in critical minerals|export|import)$/i.test(line.trim())) continue;

    const delimiter = line.includes("\t") ? "\t" : ",";
    const cols = parseCsvLine(line, delimiter).map((c) => String(c || "").trim());
    if (cols.length < 5) continue;

    const normalized = cols.map(normalizeHeaderKey);
    const headerLike =
      normalized.includes("reporter") &&
      normalized.includes("flow") &&
      normalized.includes("year") &&
      normalized.includes("aggregate_product") &&
      (normalized.includes("value") || normalized.includes("value (us$)"));

    if (headerLike) {
      idx = {
        reporter: normalized.indexOf("reporter"),
        flow: normalized.indexOf("flow"),
        year: normalized.indexOf("year"),
        value: normalized.findIndex((h) => h === "value" || h === "value (us$)"),
        commodity: normalized.indexOf("aggregate_product"),
      };
      continue;
    }

    const flowRaw = idx.flow !== -1 ? cols[idx.flow] : cols[2];
    if (String(flowRaw).toLowerCase() !== "export") continue;

    const commodityRaw = idx.commodity !== -1 ? cols[idx.commodity] : cols[3];
    const commodity = String(commodityRaw || "").toLowerCase();

    const yearRaw = idx.year !== -1 ? cols[idx.year] : cols[6];
    const yearNumber = parseYearFromValue(yearRaw);
    if (!yearNumber) continue;
    if (yearNumber < MIN_YEAR || yearNumber > MAX_YEAR) continue;

    const valueRaw = idx.value !== -1 ? cols[idx.value] : cols[7];
    const value = parseFlexibleNumber(valueRaw);
    if (value == null) continue;

    const productKey = Object.keys(commodityConfig).find((key) => {
      const csvName = commodityConfig[key].csvName.toLowerCase();
      return commodity === csvName;
    });

    if (!productKey) continue;

    const country = idx.reporter !== -1 ? cols[idx.reporter] : cols[0];

    const store = byProductYearCountry[productKey];

    if (!store[yearNumber]) {
      store[yearNumber] = {};
    }
    if (!store[yearNumber][country]) {
      store[yearNumber][country] = 0;
    }
    store[yearNumber][country] += value;
  }

  const products = {};

  Object.keys(byProductYearCountry).forEach((key) => {
    const byYear = byProductYearCountry[key];
    const yearSet = new Set(Object.keys(byYear).map(Number));
    if (!yearSet.size) return;

    const years = Array.from(yearSet).sort((a, b) => a - b);
    const donutByYear = {};

    years.forEach((y) => {
      const countries = byYear[y] || {};
      const rows = Object.entries(countries)
        .map(([c, v]) => ({ c, v: Number(v.toFixed(2)) }))
        .sort((a, b) => b.v - a.v);

      donutByYear[y] = { table: rows };
    });

    products[key] = { years, donutByYear };
  });

  return { products };
}

function unitLabelFor(unit) {
  if (unit === "kg") return "كجم";
  if (unit === "ton") return "طن";
  return "ألف طن";
}

function scaleValueByUnit(valueInKton, unit) {
  if (valueInKton == null) return 0;
  if (unit === "kg") {
    // ألف طن -> كجم
    return valueInKton * 1_000_000;
  }
  if (unit === "ton") {
    // ألف طن -> طن
    return valueInKton * 1_000;
  }
  // القيمة الأصلية: ألف طن
  return valueInKton;
}

function scaleValuesByUnit(valuesInKton, unit) {
  if (unit === "kg") {
    // ألف طن -> كجم
    return valuesInKton.map((v) => v * 1_000_000);
  }
  if (unit === "ton") {
    // ألف طن -> طن
    return valuesInKton.map((v) => v * 1_000);
  }
  // القيمة الأصلية: ألف طن
  return valuesInKton;
}

export default function M5Page() {
  const [unit, setUnit] = useState("kg");
  const [dynamicData, setDynamicData] = useState(null);
  const [importCountryData, setImportCountryData] = useState(null);
  const [barCountriesFilter, setBarCountriesFilter] = useState([]);
  const [countryYear, setCountryYear] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("");

  const years = dynamicData?.years || fallbackYears;
  const seriesMap = dynamicData?.seriesMap || fallbackSeriesMap;
  const timeSeriesMap = dynamicData?.timeSeriesMap || {};

  useEffect(() => {
    // Reuse the same trade source used in Countries page.
    const csvUrl = new URL("../assets/Trade_Critical_Minerals_Morocco.txt", import.meta.url);

    fetch(csvUrl)
      .then((res) => res.text())
      .then((text) => {
        const built = buildSeriesFromCsv(text);
        if (built) {
          setDynamicData(built);
        }
        const countryBuilt = buildImportCountryDataFromCsv(text);
        if (countryBuilt) {
          setImportCountryData(countryBuilt);
        }
      })
      .catch(() => {
        // ignore, fallback data will be used
      });
  }, []);

  const selectedKeys = useMemo(() => {
    const keys = Object.keys(seriesMap).filter((k) => commodityConfig[k]);
    return keys.length ? keys : Object.keys(commodityConfig);
  }, [seriesMap]);

  const barYears = useMemo(() => {
    const set = new Set();
    selectedKeys.forEach((key) => {
      const yrs = importCountryData?.products?.[key]?.years || [];
      yrs.forEach((y) => set.add(y));
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [importCountryData, selectedKeys]);

  const barCountries = useMemo(
    () => arabCountryList.filter((country) => countryNameAr[country]),
    []
  );

  const effectiveBarCountries =
    barCountriesFilter.length > 0
      ? barCountriesFilter.filter((c) => barCountries.includes(c))
      : barCountries.includes(DEFAULT_COUNTRY)
        ? [DEFAULT_COUNTRY]
        : barCountries.slice(0, 3);

  useEffect(() => {
    if (!barCountries.length) return;
    setBarCountriesFilter((prev) => {
      const valid = prev.filter((c) => barCountries.includes(c));
      return valid.length
        ? valid
        : barCountries.includes(DEFAULT_COUNTRY)
          ? [DEFAULT_COUNTRY]
          : barCountries.slice(0, 3);
    }
    );
  }, [barCountries]);

  const countryYears = useMemo(() => {
    const set = new Set();
    selectedKeys.forEach((key) => {
      const yrs = importCountryData?.products?.[key]?.years || [];
      yrs.forEach((y) => set.add(y));
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [importCountryData, selectedKeys]);

  const countryDonutByYear = useMemo(() => {
    const combined = {};
    countryYears.forEach((year) => {
      const countryTotals = {};
      selectedKeys.forEach((key) => {
        const rows = importCountryData?.products?.[key]?.donutByYear?.[year]?.table || [];
        rows.forEach((r) => {
          countryTotals[r.c] = (countryTotals[r.c] || 0) + (r.v || 0);
        });
      });
      combined[year] = {
        table: Object.entries(countryTotals)
          .map(([c, v]) => ({ c, v: Number(v.toFixed(2)) }))
          .sort((a, b) => b.v - a.v),
      };
    });
    return combined;
  }, [countryYears, importCountryData, selectedKeys]);

  useEffect(() => {
    if (!countryYears.length) return;
    setCountryYear((prev) =>
      prev && countryYears.includes(prev)
        ? prev
        : countryYears[countryYears.length - 1]
    );
  }, [countryYears]);

  const countryPack = useMemo(() => {
    if (!countryYear || !countryDonutByYear[countryYear]) {
      return null;
    }
    return countryDonutByYear[countryYear];
  }, [countryYear, countryDonutByYear]);

  const availableCountries = useMemo(() => {
    if (!countryPack?.table) return [];
    return countryPack.table.map((r) => r.c);
  }, [countryPack]);

  const effectiveCountry =
    selectedCountry && availableCountries.includes(selectedCountry)
      ? selectedCountry
      : availableCountries.includes(DEFAULT_COUNTRY)
        ? DEFAULT_COUNTRY
        : availableCountries[0] || "";

  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const donutCanvasRef = useRef(null);
  const donutChartRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const palette = [
      "rgba(8, 39, 33, .85)", // primary
      "rgba(16, 185, 129, .85)", // emerald
      "rgba(245, 158, 11, .85)", // amber
      "rgba(168, 85, 247, .85)", // violet
      "rgba(239, 68, 68, .85)", // red
      "rgba(20, 184, 166, .85)", // teal
      "rgba(8, 39, 33, .55)", // primary (light)
    ];

    if (!barYears.length || !effectiveBarCountries.length) return;

    const datasets = effectiveBarCountries.map((country, idx) => {
      const data = barYears.map((year) => {
        const totalInKton = selectedKeys.reduce((sum, k) => {
          const product = importCountryData?.products?.[k];
          const row = product?.donutByYear?.[year]?.table?.find(
            (r) => r.c === country
          );
          return sum + (row ? row.v : 0);
        }, 0);
        return scaleValueByUnit(totalInKton, unit);
      });

      return {
        label: countryNameAr[country] || country,
        data,
        borderWidth: 0,
        borderRadius: 8,
        backgroundColor: palette[idx % palette.length],
      };
    });

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: { labels: barYears, datasets },
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
              label: (c) =>
                ` ${c.dataset.label}: ${c.parsed.y.toLocaleString("fr-FR")} ${unitLabelFor(
                  unit
                )}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(0,0,0,.08)" },
            ticks: { font: { family: "Cairo", weight: "700" } },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,.10)" },
            ticks: {
              font: { family: "Cairo" },
              callback: (v) =>
                v === 0 ? "0" : v.toLocaleString("fr-FR", { maximumFractionDigits: 0 }),
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
  }, [selectedKeys, unit, barYears, effectiveBarCountries, importCountryData, seriesMap]);

  useEffect(() => {
    const ctx = donutCanvasRef.current?.getContext("2d");
    if (!ctx || !countryPack) return;

    if (donutChartRef.current) {
      donutChartRef.current.destroy();
      donutChartRef.current = null;
    }

    const rows = countryPack.table || [];
    if (!rows.length) return;

    const totalArabInKton = rows.reduce((sum, r) => sum + r.v, 0);
    const labels = rows.map((r) => countryNameAr[r.c] || r.c);
    const values = rows.map((r) => scaleValuesByUnit([r.v], unit)[0]);
    const borderWidths = rows.map((r) => (r.c === effectiveCountry ? 3 : 1));
    const borderColors = rows.map((r) =>
      r.c === effectiveCountry ? "rgba(8,39,33,0.9)" : "rgba(255,255,255,0.9)"
    );

    const colorPalette = [
      "rgba(8, 39, 33, .92)",
      "rgba(16, 185, 129, .85)",
      "rgba(245, 158, 11, .85)",
      "rgba(168, 85, 247, .85)",
      "rgba(239, 68, 68, .85)",
      "rgba(20, 184, 166, .85)",
      "rgba(59, 130, 246, .85)",
      "rgba(217, 119, 6, .85)",
      "rgba(5, 150, 105, .85)",
      "rgba(14, 116, 144, .85)",
      "rgba(8, 39, 33, .55)",
    ];
    const backgroundColors = rows.map((_, i) => colorPalette[i % colorPalette.length]);

    donutChartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderWidth: borderWidths,
            borderColor: borderColors,
            cutout: "68%",
            backgroundColor: backgroundColors,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_evt, elements) => {
          if (!elements?.length) return;
          const idx = elements[0].index;
          const clickedCountry = rows[idx]?.c;
          if (clickedCountry) setSelectedCountry(clickedCountry);
        },
        onHover: (evt, elements) => {
          const target = evt?.native?.target;
          if (!target) return;
          target.style.cursor = elements?.length ? "pointer" : "default";
        },
        plugins: {
          legend: {
            position: "top",
            labels: { font: { family: "Cairo", weight: "700" } },
          },
          tooltip: {
            callbacks: {
              label: (c) => {
                const v = c.parsed;
                const baseVal = rows[c.dataIndex]?.v || 0;
                const pct = totalArabInKton
                  ? Math.round((baseVal / totalArabInKton) * 100)
                  : 0;
                return ` ${c.label}: ${v.toLocaleString("fr-FR")} ${unitLabelFor(
                  unit
                )} (${pct}%)`;
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
  }, [countryPack, unit, effectiveCountry]);

  return (
    <div className="" dir="rtl">
      <Menu />
      <main className="min-h-screen py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 rounded-3xl bg-gradient-to-l from-[#082721] to-[#051712] px-6 py-8 text-center text-white shadow-lg ring-1 ring-[#ddbc6b]/25">
          <h1 className="mb-2 text-2xl font-extrabold sm:text-3xl">
            الصادرات التعدينية
          </h1>
          <p className="text-sm text-slate-100/80">
            مقارنة زمنية لإجمالي صادرات المعادن حسب الدولة والسنة.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-12">
          {/* Chart */}
          <div className="lg:col-span-9">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-base font-extrabold text-slate-800">
اجمالي الصادرات التعدينية للدول العربية حسب السنة والخام والمنتج    
            </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ddbc6b]/15 px-3 py-1 text-xs font-bold text-[#082721]">
                  <Scale size={14} strokeWidth={2.2} />
                  وحدة الإنتاج:{" "}
                  <span className="font-extrabold">{unitLabelFor(unit)}</span>
                </span>
              </div>

              <div className="h-[340px] sm:h-[440px]">
                <canvas ref={canvasRef} />
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4 lg:col-span-3">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 text-sm font-extrabold text-slate-800">
                
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 text-xs font-extrabold text-slate-500">
                    الدول 
                  </div>
                  <select
                    multiple
                    size={8}
                    value={effectiveBarCountries}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions).map((o) => o.value);
                      setBarCountriesFilter(values);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none"
                  >
                    {barCountries.map((c) => (
                      <option key={c} value={c}>
                        {countryNameAr[c] || c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 text-xs font-extrabold text-slate-500">
                    وحدة الإنتاج
                  </div>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none"
                  >
                    <option value="kg">كجم</option>
                    <option value="ton">طن</option>
                    <option value="kton">ألف طن</option>
                  </select>
                </div>

              </div>
            </div>

            
          </div>
        </section>

        {/* Country distribution donut (similar to M5) */}
        <section className="mt-10 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-base font-extrabold text-slate-800">
                  توزيع الصادرات حسب الدولة العربية
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ddbc6b]/15 px-3 py-1 text-xs font-bold text-[#082721]">
                  <Weight size={14} strokeWidth={2.2} />
                  وحدة:{" "}
                  <span className="font-extrabold">{unitLabelFor(unit)}</span>
                </span>
              </div>

              <div className="flex h-[320px] items-center justify-center sm:h-[420px]">
                <div className="h-full w-full max-w-[520px]">
                  <canvas ref={donutCanvasRef} />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-3 text-sm font-extrabold text-slate-800">
                مقارنة دولة مختارة مع باقي الدول
              </div>

              <div className="mb-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="mb-2 text-xs font-extrabold text-slate-500">
                  الدولة
                </div>
                <select
                  value={effectiveCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                >
                  {availableCountries.map((c) => (
                    <option key={c} value={c}>
                      {countryNameAr[c] || c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3 flex gap-2 overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50 px-2 py-2 shadow-sm">
                {countryYears.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setCountryYear(y)}
                    className={`min-w-[56px] rounded-2xl border px-3 py-1 text-xs font-extrabold transition ${
                      y === countryYear
                        ? "border-[#082721] bg-[#082721] text-white"
                        : "border-transparent bg-white text-[#082721] hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>

              <div className="mb-2 text-sm font-extrabold text-slate-800">
               مجموع الصادرات حسب الدول
              </div>

              <div className="mb-2 rounded-xl bg-[#ddbc6b]/10 px-3 py-2 text-xs font-bold text-[#082721]">
                الدولة المختارة: {countryNameAr[effectiveCountry] || effectiveCountry || "-"}
              </div>

              <div className="max-h-[260px] overflow-y-auto rounded-2xl border border-slate-100 bg-white">
                <table className="min-w-full text-xs">
                  <thead className="sticky top-0 bg-slate-50 text-[11px] font-extrabold text-[#082721]">
                    <tr>
                      <th className="px-3 py-2">الدولة</th>
                      <th className="px-3 py-2">
                       مجموع الصادرات ({unitLabelFor(unit)})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {countryPack?.table?.map((r) => (
                      <tr
                        key={r.c}
                        onClick={() => setSelectedCountry(r.c)}
                        className={`border-t text-slate-700 cursor-pointer transition-colors ${
                          r.c === effectiveCountry
                            ? "border-[#082721]/20 bg-[#082721]/10"
                            : "border-slate-100 hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-3 py-1.5 font-bold">
                          {countryNameAr[r.c] || r.c}
                        </td>
                        <td className="px-3 py-1.5">
                        {scaleValuesByUnit([r.v], unit)[0].toLocaleString("fr-FR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
        </div>
        <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 text-sm font-extrabold text-slate-800">
                المصادر
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-xs">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-900" />
                  <div>
                    <div className="font-bold">
                      الجمهورية الجزائرية الديمقراطية الشعبية
                    </div>
                    <div className="text-[11px] text-slate-500">
                      الديوان/الوزارة (Placeholder)
                    </div>
                    <button
                      type="button"
                      className="mt-1 text-[11px] font-bold text-sky-800 underline"
                    >
                      رابط المصدر
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-xs">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <div className="font-bold">المملكة العربية السعودية</div>
                    <div className="text-[11px] text-slate-500">
                      Ma&apos;aden / تقارير (Placeholder)
                    </div>
                    <button
                      type="button"
                      className="mt-1 text-[11px] font-bold text-sky-800 underline"
                    >
                      رابط المصدر
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-xs">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div>
                    <div className="font-bold">المملكة المغربية</div>
                    <div className="text-[11px] text-slate-500">
                      وزارة/مؤسسة (Placeholder)
                    </div>
                    <button
                      type="button"
                      className="mt-1 text-[11px] font-bold text-sky-800 underline"
                    >
                      رابط المصدر
                    </button>
                  </div>
                </div>
              </div>
            </div>
      </main>
      <Footer />
    </div>
  );
}
