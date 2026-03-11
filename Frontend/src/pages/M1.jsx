import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";

export const dataByMineral = {
  "الألمنيوم الأولي": {
    // Primary Aluminium - ألف طن
    2010: [
      { country: "دولة الامارات العربية المتحدة", value: 1400 },
    ],
    2011: [
      { country: "دولة الامارات العربية المتحدة", value: 1750 },
    ],
    2012: [
      { country: "دولة الامارات العربية المتحدة", value: 1814 },
    ],
    2013: [
      { country: "المملكة العربية السعودية", value: 187 },
      { country: "دولة الامارات العربية المتحدة", value: 1845 },
    ],
    2014: [
      { country: "المملكة العربية السعودية", value: 662 },
      { country: "دولة الامارات العربية المتحدة", value: 2296 },
    ],
    2015: [
      { country: "المملكة العربية السعودية", value: 839 },
      { country: "دولة الامارات العربية المتحدة", value: 2397 },
    ],
    2016: [
      { country: "المملكة العربية السعودية", value: 871 },
      { country: "جمهورية مصر العربية", value: 300 },
      { country: "دولة الامارات العربية المتحدة", value: 2471 },
    ],
    2017: [
      { country: "المملكة العربية السعودية", value: 916 },
      { country: "دولة الامارات العربية المتحدة", value: 2600 },
    ],
    2018: [
      { country: "المملكة العربية السعودية", value: 932 },
      { country: "جمهورية مصر العربية", value: 320 },
      { country: "دولة الامارات العربية المتحدة", value: 2640 },
    ],
    2019: [
      { country: "المملكة العربية السعودية", value: 762.1 },
      { country: "جمهورية مصر العربية", value: 198 },
      { country: "دولة الامارات العربية المتحدة", value: 2600 },
    ],
    2020: [
      { country: "المملكة العربية السعودية", value: 932 },
      { country: "جمهورية مصر العربية", value: 219 },
      { country: "دولة الامارات العربية المتحدة", value: 2640 },
    ],
    2021: [
      { country: "المملكة العربية السعودية", value: 796 },
      { country: "جمهورية مصر العربية", value: 320 },
      { country: "دولة الامارات العربية المتحدة", value: 2579 },
    ],
    2022: [
      { country: "المملكة العربية السعودية", value: 796 },
      { country: "جمهورية مصر العربية", value: 320 },
      { country: "دولة الامارات العربية المتحدة", value: 2505 },
    ],
    2023: [
      { country: "المملكة العربية السعودية", value: 998.9 },
      { country: "جمهورية مصر العربية", value: 320 },
      { country: "دولة الامارات العربية المتحدة", value: 2577.7 },
    ],
    2024: [
      { country: "المملكة العربية السعودية", value: 1000 },
      { country: "جمهورية مصر العربية", value: 320 },
      { country: "دولة الامارات العربية المتحدة", value: 2700 },
    ],
  },

  "الفضة": {
    // Silver - كجم
    2010: [
      { country: "المملكة العربية السعودية", value: 7670 },
      { country: "المملكة المغربية", value: 243000 },
    ],
    2011: [
      { country: "المملكة العربية السعودية", value: 5839 },
      { country: "المملكة المغربية", value: 186090 },
    ],
    2012: [
      { country: "المملكة العربية السعودية", value: 5212 },
      { country: "المملكة المغربية", value: 170340 },
    ],
    2013: [
      { country: "المملكة العربية السعودية", value: 4655 },
      { country: "المملكة المغربية", value: 194077 },
    ],
    2014: [
      { country: "المملكة العربية السعودية", value: 4800 },
      { country: "المملكة المغربية", value: 188538 },
    ],
    2015: [
      { country: "المملكة العربية السعودية", value: 4500 },
      { country: "المملكة المغربية", value: 255145 },
    ],
    2016: [
      { country: "المملكة العربية السعودية", value: 4710 },
      { country: "المملكة المغربية", value: 283495 },
    ],
    2017: [
      { country: "المملكة العربية السعودية", value: 5069 },
      { country: "المملكة المغربية", value: 292000 },
    ],
    2018: [
      { country: "المملكة العربية السعودية", value: 5322 },
      { country: "المملكة المغربية", value: 221126 },
    ],
    2019: [
      { country: "المملكة العربية السعودية", value: 7123 },
      { country: "المملكة المغربية", value: 257980 },
    ],
    2020: [
      { country: "المملكة العربية السعودية", value: 6493 },
      { country: "المملكة المغربية", value: 226796 },
    ],
    2021: [
      { country: "المملكة العربية السعودية", value: 8604 },
      { country: "المملكة المغربية", value: 226796 },
    ],
    2022: [
      { country: "المملكة العربية السعودية", value: 7500 },
      { country: "المملكة المغربية", value: 246640 },
    ],
    2023: [
      { country: "المملكة العربية السعودية", value: 8786 },
      { country: "المملكة المغربية", value: 252310 },
    ],
    2024: [
      { country: "المملكة المغربية", value: 243805 },
    ],
  },

  "الذهب": {
    // Gold - كجم
    2020: [
      { country: "المملكة العربية السعودية", value: 1200 },
      { country: "المملكة المغربية", value: 850 },
      { country: "جمهورية مصر العربية", value: 400 },
    ],
    2021: [
      { country: "المملكة العربية السعودية", value: 1350 },
      { country: "المملكة المغربية", value: 900 },
      { country: "جمهورية مصر العربية", value: 420 },
    ],
    2022: [
      { country: "المملكة العربية السعودية", value: 1420 },
      { country: "المملكة المغربية", value: 980 },
      { country: "جمهورية مصر العربية", value: 450 },
    ],
    2023: [
      { country: "المملكة العربية السعودية", value: 1500 },
      { country: "المملكة المغربية", value: 1010 },
      { country: "جمهورية مصر العربية", value: 470 },
    ],
    2024: [
      { country: "المملكة العربية السعودية", value: 1580 },
      { country: "المملكة المغربية", value: 1050 },
      { country: "جمهورية مصر العربية", value: 480 },
    ],
  },

  "الأسمدة": {
    // Fertilizers - ألف طن
    2010: [
      { country: "المملكة المغربية", value: 3713 },
      { country: "المملكة الأردنية الهاشمية", value: 759 },
    ],
    2011: [
      { country: "المملكة المغربية", value: 4350 },
      { country: "المملكة الأردنية الهاشمية", value: 722 },
    ],
    2012: [
      { country: "المملكة المغربية", value: 4500 },
      { country: "المملكة الأردنية الهاشمية", value: 640 },
    ],
    2013: [
      { country: "المملكة المغربية", value: 4659 },
      { country: "المملكة الأردنية الهاشمية", value: 678 },
    ],
    2014: [
      { country: "المملكة المغربية", value: 4800 },
      { country: "المملكة الأردنية الهاشمية", value: 886 },
    ],
    2015: [
      { country: "المملكة المغربية", value: 5210 },
      { country: "المملكة الأردنية الهاشمية", value: 619 },
    ],
    2016: [
      { country: "المملكة المغربية", value: 6960 },
      { country: "المملكة الأردنية الهاشمية", value: 547 },
    ],
    2017: [
      { country: "المملكة الأردنية الهاشمية", value: 695 },
    ],
    2018: [
      { country: "المملكة الأردنية الهاشمية", value: 882 },
    ],
    2019: [
      { country: "المملكة الأردنية الهاشمية", value: 748 },
    ],
    2020: [
      { country: "المملكة المغربية", value: 7100 },
      { country: "المملكة الأردنية الهاشمية", value: 929 },
    ],
    2021: [
      { country: "المملكة المغربية", value: 12000 },
      { country: "المملكة الأردنية الهاشمية", value: 1055 },
    ],
    2022: [
      { country: "المملكة المغربية", value: 39000 },
      { country: "المملكة الأردنية الهاشمية", value: 1993 },
    ],
    2023: [
      { country: "المملكة المغربية", value: 35000 },
      { country: "المملكة الأردنية الهاشمية", value: 1874 },
    ],
    2024: [
      { country: "المملكة الأردنية الهاشمية", value: 2057 },
    ],
  },
};

export const mineralUnits = {
  "الألمنيوم الأولي": "ألف طن",
  "الفضة": "كجم",
  "الذهب": "كجم",
  "الأسمدة": "ألف طن",
};

const mineralYears = (mineral) =>
  Object.keys(dataByMineral[mineral] || {})
    .map(Number)
    .sort((a, b) => a - b);

function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ── Line chart: evolution over all years for selected mineral ──────────────
function LineChartPanel({ mineral }) {
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
      label: country,
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
      data: { labels: years, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: { font: { family: "Cairo", size: 11 }, boxWidth: 14 },
          },
          tooltip: {
            callbacks: {
              label: (c) =>
                ` ${c.dataset.label}: ${formatNumber(c.parsed.y)} ${mineralUnits[mineral]}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "Cairo", weight: "700" } },
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
  }, [mineral]);

  return (
    <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
      <h3 className="mb-2 text-base font-extrabold text-slate-800">
        التطور السنوي — {mineral}
      </h3>
      <div className="h-[280px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

export default function M1Page() {
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
    return baseRows.filter((r) => r.country.includes(search.trim()));
  }, [baseRows, search]);

  // ── Bar chart (per year) ─────────────────────────────────────────────────
  const barCanvasRef = useRef(null);
  const barInstanceRef = useRef(null);

  useEffect(() => {
    const ctx = barCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (barInstanceRef.current) barInstanceRef.current.destroy();

    const labels = baseRows.map((r) => r.country);
    const values = baseRows.map((r) => r.value);

    barInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "الإنتاج",
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
                ` ${formatNumber(c.parsed.y)} ${mineralUnits[activeMineral]}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
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
      barInstanceRef.current?.destroy();
      barInstanceRef.current = null;
    };
  }, [baseRows, activeMineral]);

  return (
    <div className="" dir="rtl">
      <Menu />
      <main className="min-h-screen py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <header className="mb-6 rounded-3xl bg-gradient-to-l from-[#082721] to-[#051712] px-6 py-8 text-center text-white shadow-lg ring-1 ring-[#ddbc6b]/25">
            <h1 className="mb-2 text-2xl font-extrabold sm:text-3xl">
              حجم الإنتاج التعديني
            </h1>
            <p className="text-sm text-slate-100/80">
              لوحة تفاعلية — اختر المادة الخام والسنة لعرض البيانات
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
                  {m}
                  <span className="mr-2 text-[10px] opacity-60">
                    ({mineralUnits[m]})
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
                    الإنتاج حسب الدولة
                  </h3>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#ddbc6b]/15 px-3 py-1 text-xs font-bold text-[#082721]">
                    <i className="fa-solid fa-calendar-days" />
                    <span>السنة: {activeYear}</span>
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
                    الإنتاج حسب الدولة
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-extrabold text-amber-900">
                    <i className="fa-solid fa-arrow-down-wide-short" />
                    ترتيب
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="mb-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <i className="fa-solid fa-magnifying-glass text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="بحث داخل الدول..."
                      className="w-full border-none bg-transparent text-xs font-bold text-slate-700 outline-none focus:ring-0"
                    />
                  </div>

                  <div className="max-h-72 overflow-y-auto rounded-xl bg-white">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[11px] font-extrabold text-[#082721]">
                        <tr>
                          <th className="px-3 py-2">الدولة</th>
                          <th className="px-3 py-2">
                            الإنتاج ({mineralUnits[activeMineral]})
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.map((r) => (
                          <tr
                            key={r.country}
                            className="border-t border-slate-100 text-xs text-slate-700"
                          >
                            <td className="px-3 py-1.5 font-bold">{r.country}</td>
                            <td className="px-3 py-1.5">{formatNumber(r.value)}</td>
                          </tr>
                        ))}
                        {filteredRows.length === 0 && (
                          <tr>
                            <td
                              colSpan={2}
                              className="px-3 py-3 text-center text-xs text-slate-400"
                            >
                              لا توجد نتائج مطابقة.
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
                <h3 className="mb-2 text-sm font-extrabold text-slate-800">المصادر</h3>
                <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-xs">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#082721]" />
                    <div>
                      <div className="font-bold">BGS & IOCFWMC</div>
                      <div className="text-[11px] text-slate-500">
                        التقرير الاقتصادي العربي الموحد
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
            <LineChartPanel mineral={activeMineral} />
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}