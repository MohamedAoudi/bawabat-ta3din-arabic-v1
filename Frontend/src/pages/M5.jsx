import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";

const fallbackYears = [
  2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022,
  2023, 2024,
];

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

const countryNameAr = {
  Algeria: "الجزائر",
  Bahrain: "البحرين",
  Comoros: "جزر القمر",
  Djibouti: "جيبوتي",
  Egypt: "مصر",
  Iraq: "العراق",
  Jordan: "الأردن",
  Kuwait: "الكويت",
  Lebanon: "لبنان",
  Libya: "ليبيا",
  Mauritania: "موريتانيا",
  Morocco: "المغرب",
  Oman: "عُمان",
  Palestine: "فلسطين",
  Qatar: "قطر",
  "Saudi Arabia": "السعودية",
  Somalia: "الصومال",
  Sudan: "السودان",
  Syria: "سوريا",
  Tunisia: "تونس",
  "United Arab Emirates": "الإمارات",
  Yemen: "اليمن",
};

const arabCountries = new Set([
  "Algeria",
  "Bahrain",
  "Comoros",
  "Djibouti",
  "Egypt",
  "Iraq",
  "Jordan",
  "Kuwait",
  "Lebanon",
  "Libya",
  "Mauritania",
  "Morocco",
  "Oman",
  "Palestine",
  "Qatar",
  "Saudi Arabia",
  "Somalia",
  "Sudan",
  "Syria",
  "Tunisia",
  "United Arab Emirates",
  "Yemen",
]);

function parseCsvLine(line) {
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
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  result.push(current);
  return result;
}

function buildSeriesFromCsv(csvText) {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return null;

  const header = parseCsvLine(lines[0]);
  const yearIdx = header.indexOf("year");
  const qtyIdx = header.indexOf("quantity");
  const unitsIdx = header.indexOf("units");
  const typeIdx = header.indexOf("bgs_statistic_type_trans");
  const commodityIdx = header.indexOf("bgs_commodity_trans");
  const countryIdx = header.indexOf("country_trans");

  if (
    yearIdx === -1 ||
    qtyIdx === -1 ||
    unitsIdx === -1 ||
    typeIdx === -1 ||
    commodityIdx === -1 ||
    countryIdx === -1
  ) {
    return null;
  }

  const seriesByKey = {};
  const timeSeriesByKey = {};
  const allYearsSet = new Set();

  Object.keys(commodityConfig).forEach((key) => {
    seriesByKey[key] = {};
    timeSeriesByKey[key] = { arab: {}, world: {} };
  });

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cols = parseCsvLine(line);
    if (cols.length !== header.length) continue;

    const statType = cols[typeIdx];
    if (statType !== "Imports") continue;

    const commodity = cols[commodityIdx].toLowerCase();
    const yearValue = cols[yearIdx];
    let yearNumber;

    if (yearValue.includes("/")) {
      const d = new Date(yearValue);
      yearNumber = Number.isNaN(d.getTime()) ? null : d.getFullYear();
    } else {
      const parsed = parseInt(yearValue, 10);
      yearNumber = Number.isNaN(parsed) ? null : parsed;
    }

    if (!yearNumber) continue;

    const quantityRaw = cols[qtyIdx];
    if (!quantityRaw) continue;
    const quantity = parseFloat(quantityRaw);
    if (Number.isNaN(quantity)) continue;

    const units = cols[unitsIdx].toLowerCase();
    let tonnes = quantity;
    if (units.includes("kilograms")) {
      tonnes = quantity / 1000;
    }

    const commodityKey = Object.keys(commodityConfig).find((key) => {
      const csvName = commodityConfig[key].csvName.toLowerCase();
      return commodity === csvName;
    });

    if (!commodityKey) continue;

    const country = cols[countryIdx];
    allYearsSet.add(yearNumber);

    if (!seriesByKey[commodityKey][yearNumber]) {
      seriesByKey[commodityKey][yearNumber] = 0;
    }

    seriesByKey[commodityKey][yearNumber] += tonnes / 1000;

    // Track time series (world total)
    if (!timeSeriesByKey[commodityKey].world[yearNumber]) {
      timeSeriesByKey[commodityKey].world[yearNumber] = 0;
    }
    timeSeriesByKey[commodityKey].world[yearNumber] += tonnes / 1000;

    // Track time series (arab subset)
    if (arabCountries.has(country)) {
      if (!timeSeriesByKey[commodityKey].arab[yearNumber]) {
        timeSeriesByKey[commodityKey].arab[yearNumber] = 0;
      }
      timeSeriesByKey[commodityKey].arab[yearNumber] += tonnes / 1000;
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
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return null;

  const header = parseCsvLine(lines[0]);
  const yearIdx = header.indexOf("year");
  const qtyIdx = header.indexOf("quantity");
  const unitsIdx = header.indexOf("units");
  const typeIdx = header.indexOf("bgs_statistic_type_trans");
  const commodityIdx = header.indexOf("bgs_commodity_trans");
  const countryIdx = header.indexOf("country_trans");

  if (
    yearIdx === -1 ||
    qtyIdx === -1 ||
    unitsIdx === -1 ||
    typeIdx === -1 ||
    commodityIdx === -1 ||
    countryIdx === -1
  ) {
    return null;
  }

  const byProductYearCountry = {};

  Object.keys(commodityConfig).forEach((key) => {
    byProductYearCountry[key] = {};
  });

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cols = parseCsvLine(line);
    if (cols.length !== header.length) continue;

    const statType = cols[typeIdx];
    if (statType !== "Imports") continue;

    const commodity = cols[commodityIdx].toLowerCase();
    const yearValue = cols[yearIdx];
    let yearNumber;

    if (yearValue.includes("/")) {
      const d = new Date(yearValue);
      yearNumber = Number.isNaN(d.getTime()) ? null : d.getFullYear();
    } else {
      const parsed = parseInt(yearValue, 10);
      yearNumber = Number.isNaN(parsed) ? null : parsed;
    }

    if (!yearNumber) continue;

    const quantityRaw = cols[qtyIdx];
    if (!quantityRaw) continue;
    const quantity = parseFloat(quantityRaw);
    if (Number.isNaN(quantity)) continue;

    const units = cols[unitsIdx].toLowerCase();
    let tonnes = quantity;
    if (units.includes("kilograms")) {
      tonnes = quantity / 1000;
    }

    const productKey = Object.keys(commodityConfig).find((key) => {
      const csvName = commodityConfig[key].csvName.toLowerCase();
      return commodity === csvName;
    });

    if (!productKey) continue;

    const country = cols[countryIdx];
    if (!arabCountries.has(country)) continue;

    const store = byProductYearCountry[productKey];

    if (!store[yearNumber]) {
      store[yearNumber] = {};
    }
    if (!store[yearNumber][country]) {
      store[yearNumber][country] = 0;
    }
    store[yearNumber][country] += tonnes / 1000;
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

const mineralOptions = [
  { value: "gold", label: "الذهب" },
  { value: "silver", label: "الفضة" },
  { value: "copper", label: "النحاس" },
  { value: "phosphate", label: "الفوسفات" },
  { value: "iron", label: "الحديد" },
  { value: "bauxite", label: "البوكسيت" },
  { value: "aluminum", label: "الألمنيوم" },
];

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
  const [selected, setSelected] = useState(["gold", "silver"]);
  const [dynamicData, setDynamicData] = useState(null);
  const [importCountryData, setImportCountryData] = useState(null);
  const [countryProduct, setCountryProduct] = useState("gold");
  const [countryYear, setCountryYear] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("");

  const years = dynamicData?.years || fallbackYears;
  const seriesMap = dynamicData?.seriesMap || fallbackSeriesMap;
  const timeSeriesMap = dynamicData?.timeSeriesMap || {};

  useEffect(() => {
    const csvUrl = new URL(
      "../assets/Minerals_Data_ Import.csv",
      import.meta.url
    );

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
    const keys = selected.filter((k) => seriesMap[k]);
    return keys.length ? keys : ["gold"];
  }, [selected, seriesMap]);

  const countryProductData =
    importCountryData?.products?.[countryProduct] || null;

  const countryYears = countryProductData?.years || [];
  const countryDonutByYear = countryProductData?.donutByYear || {};

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

    const datasets = selectedKeys.map((k, idx) => ({
      label: seriesMap[k].name,
      data: scaleValuesByUnit(seriesMap[k].values, unit),
      borderWidth: 0,
      borderRadius: 8,
      backgroundColor: palette[idx % palette.length],
    }));

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: { labels: years, datasets },
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
                ` ${c.dataset.label}: ${c.parsed.y.toLocaleString()} ${unitLabelFor(
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
                v === 0 ? "0" : v.toLocaleString("ar-EG", { maximumFractionDigits: 0 }),
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
  }, [selectedKeys, unit]);

  useEffect(() => {
    const ctx = donutCanvasRef.current?.getContext("2d");
    if (!ctx || !countryPack) return;

    if (donutChartRef.current) {
      donutChartRef.current.destroy();
      donutChartRef.current = null;
    }

    const rows = countryPack.table || [];
    if (!rows.length || !effectiveCountry) return;

    const countryRow = rows.find((r) => r.c === effectiveCountry);
    const countryInKton = countryRow ? countryRow.v : 0;

    const totalArabInKton = rows.reduce((sum, r) => sum + r.v, 0);
    const othersInKton = Math.max(totalArabInKton - countryInKton, 0);

    const scaledCountry = scaleValuesByUnit([countryInKton], unit)[0];
    const scaledOthers = scaleValuesByUnit([othersInKton], unit)[0];

    const total = countryInKton + othersInKton;

    donutChartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          countryNameAr[effectiveCountry] || effectiveCountry,
          "باقي الدول العربية",
        ],
        datasets: [
          {
            data: [scaledCountry, scaledOthers],
            borderWidth: 0,
            cutout: "68%",
            backgroundColor: [
              "rgba(8, 39, 33, .92)",
              "rgba(16, 185, 129, .85)",
              "rgba(245, 158, 11, .85)",
              "rgba(168, 85, 247, .85)",
              "rgba(239, 68, 68, .85)",
              "rgba(20, 184, 166, .85)",
              "rgba(8, 39, 33, .55)",
            ],
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
                const baseVal =
                  c.dataIndex === 0 ? countryInKton : othersInKton;
                const pct = total ? Math.round((baseVal / total) * 100) : 0;
                return ` ${c.label}: ${v.toLocaleString()} ${unitLabelFor(
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

  const onMultiChange = (e) => {
    const values = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelected(values);
  };

  const removeSel = (key) => {
    setSelected((prev) => prev.filter((k) => k !== key));
  };

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
            مقارنة زمنية لواردات الخامات والمنتجات التعدينية، مع إمكانية اختيار عدة
            عناصر ووحدة قياس مختلفة لكل السلسلة الزمنية.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-12">
          {/* Chart */}
          <div className="lg:col-span-9">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-base font-extrabold text-slate-800">
                  الصادرات عبر السنوات (حسب العناصر المختارة)
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ddbc6b]/15 px-3 py-1 text-xs font-bold text-[#082721]">
                  <i className="fa-solid fa-scale-balanced" />
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
                التحكم
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 text-xs font-extrabold text-slate-500">
                    الخامة / المنتج (عدة اختيارات)
                  </div>
                  <select
                    multiple
                    size={7}
                    value={selectedKeys}
                    onChange={onMultiChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-sm font-bold text-slate-700 outline-none"
                  >
                    {mineralOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>

                  <div className="mt-2 text-xs leading-relaxed text-slate-500">
                    * Ctrl + كليك لاختيار عدة عناصر (Prototype).
                    <br />
                    لاحقًا يمكن استبدالها بـ Dropdown متعدد مثل Power BI.
                  </div>
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

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedKeys.map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-2 rounded-full bg-[#ddbc6b]/15 px-3 py-1 text-xs font-extrabold text-[#082721]"
                    >
                      <i className="fa-solid fa-check" />
                      {seriesMap[k].name}
                      <button
                        type="button"
                        onClick={() => removeSel(k)}
                        className="ms-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#082721]/10 text-[#082721] hover:bg-[#082721]/20"
                        aria-label={`Remove ${seriesMap[k].name}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
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
                  <i className="fa-solid fa-weight-hanging" />
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
                مقارنة دولة عربية مختارة مع باقي الدول العربية
              </div>

              <div className="mb-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="mb-2 text-xs font-extrabold text-slate-500">
                  الخامة / المنتج
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-cubes-stacked text-[#082721]" />
                  <select
                    value={countryProduct}
                    onChange={(e) => setCountryProduct(e.target.value)}
                    className="w-full border-none bg-transparent text-sm font-bold text-slate-700 outline-none focus:ring-0"
                  >
                    {mineralOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
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
               مجموع الصادرات حسب الدولة
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
                        className="border-t border-slate-100 text-slate-700"
                      >
                        <td className="px-3 py-1.5 font-bold">
                          {countryNameAr[r.c] || r.c}
                        </td>
                        <td className="px-3 py-1.5">
                          {scaleValuesByUnit([r.v], unit)[0].toLocaleString()}
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
