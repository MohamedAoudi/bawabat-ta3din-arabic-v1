import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";

const fallbackDonutByYear = {
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

const fallbackYears = [2016, 2017, 2018, 2019, 2020, 2021];

const exportProductConfig = {
  aluminum: { label: "الألمنيوم الأولي", csvName: "aluminium, primary" },
  phosphate: { label: "الفوسفات", csvName: "phosphate rock" },
  copper: { label: "النحاس", csvName: "copper" },
  gold: { label: "الذهب", csvName: "gold" },
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

function buildExportDataFromCsv(csvText) {
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

  const dataByProduct = {};

  Object.keys(exportProductConfig).forEach((key) => {
    dataByProduct[key] = {
      arabByYear: {},
      worldByYear: {},
      byCountry: {},
    };
  });

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cols = parseCsvLine(line);
    if (cols.length !== header.length) continue;

    const statType = cols[typeIdx];
    if (statType !== "Exports") continue;

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

    const productKey = Object.keys(exportProductConfig).find((key) => {
      const csvName = exportProductConfig[key].csvName.toLowerCase();
      return commodity === csvName;
    });

    if (!productKey) continue;

    const country = cols[countryIdx];
    const store = dataByProduct[productKey];

    if (!store.worldByYear[yearNumber]) {
      store.worldByYear[yearNumber] = 0;
    }
    store.worldByYear[yearNumber] += tonnes / 1000;

    if (arabCountries.has(country)) {
      if (!store.arabByYear[yearNumber]) {
        store.arabByYear[yearNumber] = 0;
      }
      store.arabByYear[yearNumber] += tonnes / 1000;

      if (!store.byCountry[yearNumber]) {
        store.byCountry[yearNumber] = {};
      }
      if (!store.byCountry[yearNumber][country]) {
        store.byCountry[yearNumber][country] = 0;
      }
      store.byCountry[yearNumber][country] += tonnes / 1000;
    }
  }

  const products = {};

  Object.keys(dataByProduct).forEach((key) => {
    const { arabByYear, worldByYear, byCountry } = dataByProduct[key];
    const yearSet = new Set([
      ...Object.keys(worldByYear).map(Number),
      ...Object.keys(arabByYear).map(Number),
    ]);
    if (!yearSet.size) {
      return;
    }
    const years = Array.from(yearSet).sort((a, b) => a - b);
    const donutByYear = {};

    years.forEach((y) => {
      const arab = Number((arabByYear[y] || 0).toFixed(2));
      const world = Number((worldByYear[y] || 0).toFixed(2));

      const countries = byCountry[y] || {};
      const tableRows = Object.entries(countries)
        .map(([c, v]) => ({ c, v: Number(v.toFixed(2)) }))
        .sort((a, b) => b.v - a.v);

      const arabSum = tableRows.reduce((sum, r) => sum + r.v, 0);
      tableRows.push({ c: "الإجمالي العربي", v: Number(arabSum.toFixed(2)) });

      donutByYear[y] = {
        arab,
        world,
        table: tableRows,
      };
    });

    products[key] = { years, donutByYear };
  });

  return { products };
}

function formatNumber(n) {
  if (n == null || Number.isNaN(n)) return "-";
  return n.toLocaleString("ar-EG");
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

export default function M5Page() {
  const [activeYear, setActiveYear] = useState(2021);
  const [product, setProduct] = useState("aluminum");
  const [unit, setUnit] = useState("kton");
  const [exportData, setExportData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("");

  const currentProductData =
    exportData?.products?.[product] || null;

  const years = currentProductData?.years || fallbackYears;
  const donutByYear =
    currentProductData?.donutByYear || fallbackDonutByYear;

  const pack = useMemo(
    () => donutByYear[activeYear] || donutByYear[years[years.length - 1]],
    [activeYear, donutByYear, years]
  );

  const availableCountries = useMemo(() => {
    if (!pack?.table) return [];
    return pack.table
      .filter((r) => !r.c.includes("الإجمالي"))
      .map((r) => r.c);
  }, [pack]);

  const effectiveCountry =
    selectedCountry && availableCountries.includes(selectedCountry)
      ? selectedCountry
      : availableCountries[0] || "";

  useEffect(() => {
    const csvUrl = new URL(
      "../assets/Minerals_Data_Export .csv",
      import.meta.url
    );

    fetch(csvUrl)
      .then((res) => res.text())
      .then((text) => {
        const built = buildExportDataFromCsv(text);
        if (built) {
          setExportData(built);
        }
      })
      .catch(() => {
        // ignore, fallback data will be used
      });
  }, []);

  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const tableRows = pack.table || [];

    const countryRow = tableRows.find((r) => r.c === effectiveCountry);
    const countryInKton = countryRow ? countryRow.v : 0;

    const arabTotalInKton = tableRows
      .filter((r) => !r.c.includes("الإجمالي"))
      .reduce((sum, r) => sum + r.v, 0);

    const othersInKton = Math.max(arabTotalInKton - countryInKton, 0);

    const scaledCountry = scaleValueByUnit(countryInKton, unit);
    const scaledOthers = scaleValueByUnit(othersInKton, unit);

    const totalArab = countryInKton + othersInKton;
    const countryPct = totalArab
      ? Math.round((countryInKton / totalArab) * 100)
      : 0;
    const othersPct = 100 - countryPct;

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          effectiveCountry ? `إنتاج ${effectiveCountry}` : "الدولة المختارة",
          "باقي الدول العربية",
        ],
        datasets: [
          {
            data: [scaledCountry, scaledOthers],
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
                const pct = c.dataIndex === 0 ? countryPct : othersPct;
                return ` ${c.label}: ${formatNumber(
                  v
                )} ${unitLabelFor(unit)} (${pct}%)`;
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
  }, [pack, unit, effectiveCountry]);

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
            مقارنة حصة دولة عربية مختارة من صادرات خام/منتج معين مقابل باقي الدول
            العربية.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-12">
          {/* Donut */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-base font-extrabold text-slate-800">
                  المقارنة: الدولة المختارة مقابل باقي الدول العربية
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ddbc6b]/15 px-3 py-1 text-xs font-bold text-[#082721]">
                  <i className="fa-solid fa-weight-hanging" />
                  وحدة: <span className="font-extrabold">{unitLabelFor(unit)}</span>
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
                التحكم
              </div>

              <div className="mb-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="mb-2 text-xs font-extrabold text-slate-500">
                  الخامة / المنتج
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-cubes-stacked text-[#082721]" />
                  <select
                    value={product}
                    onChange={(e) => {
                      setProduct(e.target.value);
                    }}
                    className="w-full border-none bg-transparent text-sm font-bold text-slate-700 outline-none focus:ring-0"
                  >
                    <option value="aluminum">
                      {exportProductConfig.aluminum.label}
                    </option>
                    <option value="phosphate">
                      {exportProductConfig.phosphate.label}
                    </option>
                    <option value="copper">
                      {exportProductConfig.copper.label}
                    </option>
                    <option value="gold">
                      {exportProductConfig.gold.label}
                    </option>
                  </select>
                </div>
              </div>

              <div className="mb-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="mb-2 text-xs font-extrabold text-slate-500">
                  وحدة القياس
                </div>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="kton">ألف طن</option>
                  <option value="ton">طن</option>
                  <option value="kg">كجم</option>
                </select>
              </div>

              <div className="mb-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="mb-2 text-xs font-extrabold text-slate-500">
                  الدولة (ضمن الدول العربية)
                </div>
                <select
                  value={effectiveCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                >
                  {availableCountries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
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
                    {y}
                  </button>
                ))}
              </div>

              <div className="mb-2 text-sm font-extrabold text-slate-800">
                مجموع الصادرات حسب الدولة
              </div>

              <div className="max-h-[330px] overflow-y-auto rounded-2xl border border-slate-100 bg-white">
                <table className="min-w-full text-xs">
                  <thead className="sticky top-0 bg-slate-50 text-[11px] font-extrabold text-[#082721]">
                    <tr>
                      <th className="px-3 py-2">الدولة</th>
                      <th className="px-3 py-2">مجموع الصادرات ({unitLabelFor(unit)})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pack.table.map((r) => (
                      <tr
                        key={r.c}
                        className="border-t border-slate-100 text-slate-700"
                      >
                        <td className="px-3 py-1.5 font-bold">{r.c}</td>
                        <td className="px-3 py-1.5">
                          {formatNumber(scaleValueByUnit(r.v, unit))}
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
      </main>
      <Footer />
    </div>
  );
}

