import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import { dataByMineral, mineralUnits } from "./M1";

// Import all flag files dynamically from the flags folder
const flagModules = import.meta.glob("../assets/flags/*.webp", { eager: true });

const getCountryFlags = () => {
  const flags = {};
  const countryCodeMap = {
    "jordan.webp": "jo",
    "uae.webp": "ae",
    "bahrain.webp": "bh",
    "tunisia.webp": "tn",
    "algeria.webp": "dz",
    "djibouti.webp": "dj",
    "saudiarabe.webp": "sa",
    "sudan.webp": "sd",
    "syria.webp": "sy",
    "somalia.webp": "so",
    "iraq.webp": "iq",
    "oman.webp": "om",
    "palestine.webp": "ps",
    "qatar.webp": "qa",
    "kuwait.webp": "kw",
    "lebanon.webp": "lb",
    "libya.webp": "ly",
    "egypt.webp": "eg",
    "morocco.webp": "ma",
    "mauritania.webp": "mr",
    "yemen.webp": "ye",
  };
  Object.entries(flagModules).forEach(([path, module]) => {
    const filename = path.split("/").pop();
    const countryCode = countryCodeMap[filename];
    if (countryCode) flags[countryCode] = module.default;
  });
  return flags;
};

const countryFlags = getCountryFlags();

const COUNTRIES = [
  { name: "المملكة الأردنية الهاشمية", code: "jo" },
  { name: "دولة الامارات العربية المتحدة", code: "ae" },
  { name: "مملكة البحرين", code: "bh" },
  { name: "الجمهورية التونسية", code: "tn" },
  { name: "الجمهورية الجزائرية الديمقراطية الشعبية", code: "dz" },
  { name: "دولة جيبوتي", code: "dj" },
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

// ─── helpers ──────────────────────────────────────────────────────────────────
const ALL_YEARS = Array.from(
  new Set(
    Object.values(dataByMineral)
      .flatMap((byYear) => Object.keys(byYear))
      .map(Number)
  )
).sort((a, b) => a - b);

const getCountryMineralData = (country) => {
  const minerals = Object.keys(dataByMineral);
  const chartData = minerals.map((mineral) => ({
    mineral,
    values: ALL_YEARS.map((year) => {
      const row = (dataByMineral[mineral][year] || []).find((r) => r.country === country);
      return row ? row.value : null;
    }),
  }));
  return { years: ALL_YEARS, chartData };
};

// Returns minerals + their value for a given country + year (for pie)
const getMineralShareForYear = (country, year) => {
  const minerals = Object.keys(dataByMineral);
  const results = [];
  minerals.forEach((mineral) => {
    const row = (dataByMineral[mineral][year] || []).find((r) => r.country === country);
    if (row && row.value > 0) {
      results.push({ mineral, value: row.value, unit: mineralUnits[mineral] || "" });
    }
  });
  return results;
};

// ─── Pie colour palette (same tokens as Menu) ─────────────────────────────────
const PIE_PALETTE = [
  "#C9A84C", "#082721", "#8B2500", "#10b981", "#3b82f6",
  "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16",
  "#f97316", "#ec4899", "#64748b",
];

// ─── Line chart ───────────────────────────────────────────────────────────────
const CountryLineChart = ({ country }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (chartRef.current) chartRef.current.destroy();

    const { years, chartData } = getCountryMineralData(country);
    const palette = ["#082721", "#C9A84C", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

    const datasets = chartData.map((entry, i) => ({
      label: entry.mineral,
      data: entry.values,
      borderColor: palette[i % palette.length],
      backgroundColor: palette[i % palette.length] + "22",
      borderWidth: 2,
      spanGaps: true,
      tension: 0.35,
      pointRadius: 3,
    }));

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: { labels: years, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: { family: "Cairo", size: 11 }, boxWidth: 12 },
          },
          tooltip: {
            callbacks: {
              label: (c) => {
                const mineral = c.dataset.label;
                const unit = mineralUnits[mineral] || "";
                return ` ${mineral}: ${c.parsed.y ?? 0} ${unit}`;
              },
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

    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, [country]);

  return (
    <div
      className="rounded-3xl p-5 sm:p-6"
      style={{
        background: "linear-gradient(145deg,#0d3b33,#082721)",
        border: "1px solid rgba(201,168,76,0.25)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        fontFamily: "'Cairo','Tajawal',sans-serif",
      }}
    >
      {/* header */}
      <div className="flex items-center gap-2 mb-4 pb-3"
           style={{ borderBottom: "1px solid rgba(201,168,76,0.18)" }}>
        <div className="w-1 h-5 rounded-full flex-shrink-0"
             style={{ background: "linear-gradient(180deg,#C9A84C,#8B2500)" }} />
        <h3 className="text-[13px] font-extrabold text-white/90 tracking-wide">
          تطوّر الإنتاج التعديني — {country}
        </h3>
      </div>
      <div className="h-[340px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

// ─── Bar chart — minerals by volume for a selected year ──────────────────────
const CountryBarChart = ({ country }) => {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const [selectedYear, setSelectedYear] = useState(ALL_YEARS[ALL_YEARS.length - 1]);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (chartRef.current) chartRef.current.destroy();

    const data = getMineralShareForYear(country, selectedYear);
    if (data.length === 0) { setNoData(true); return; }
    setNoData(false);

    // Sort descending by value
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const labels = sorted.map((d) => d.mineral);
    const values = sorted.map((d) => d.value);
    const total  = values.reduce((s, v) => s + v, 0);

    // Gradient bars: gold for the biggest, fading to dark green
    const colors = sorted.map((_, i) => {
      const t = i / Math.max(sorted.length - 1, 1); // 0 → 1
      // interpolate #C9A84C → #10b981
      const r = Math.round(201 + (16  - 201) * t);
      const g = Math.round(168 + (185 - 168) * t);
      const b = Math.round(76  + (129 - 76)  * t);
      return `rgb(${r},${g},${b})`;
    });

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: `الإنتاج — ${selectedYear}`,
          data: values,
          backgroundColor: colors,
          borderColor: colors.map((c) => c.replace("rgb", "rgba").replace(")", ",0.9)")),
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: "y",          // ← horizontal bars
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            rtl: true,
            bodyFont: { family: "Cairo" },
            callbacks: {
              label: (c) => {
                const entry = sorted[c.dataIndex];
                const pct   = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
                const fmt   = entry.value >= 1_000_000
                  ? `${(entry.value / 1_000_000).toFixed(2)} M`
                  : entry.value >= 1_000
                  ? `${(entry.value / 1_000).toFixed(1)} K`
                  : entry.value;
                return ` ${fmt} ${entry.unit}  (${pct}%)`;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: "rgba(255,255,255,0.06)" },
            border: { color: "rgba(201,168,76,0.15)" },
            ticks: {
              color: "rgba(255,255,255,0.45)",
              font: { family: "Cairo", size: 11 },
              callback: (v) => {
                if (v >= 1_000_000) return `${v / 1_000_000}M`;
                if (v >= 1_000)     return `${v / 1_000}K`;
                return v;
              },
            },
          },
          y: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: "rgba(255,255,255,0.8)",
              font: { family: "Cairo", size: 12, weight: "700" },
            },
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, [country, selectedYear]);

  const slices = getMineralShareForYear(country, selectedYear)
    .sort((a, b) => b.value - a.value);
  const total = slices.reduce((s, d) => s + d.value, 0);

  return (
    <div
      className="rounded-3xl p-5 sm:p-6"
      style={{
        background: "linear-gradient(145deg,#0d3b33,#082721)",
        border: "1px solid rgba(201,168,76,0.25)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        fontFamily: "'Cairo','Tajawal',sans-serif",
      }}
    >
      {/* ── header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pb-4"
           style={{ borderBottom: "1px solid rgba(201,168,76,0.18)" }}>

        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full flex-shrink-0"
               style={{ background: "linear-gradient(180deg,#C9A84C,#8B2500)" }} />
          <div>
            <h3 className="text-[13px] font-extrabold text-white/90 tracking-wide leading-tight">
              حصص الخامات حسب الحجم
            </h3>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(201,168,76,0.6)" }}>
              {country} — سنة {selectedYear}
            </p>
          </div>
        </div>

        {/* Year pills — same style as menu action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-widest flex-shrink-0"
                style={{ color: "rgba(201,168,76,0.6)" }}>
            السنة
          </span>
          <div className="flex flex-wrap gap-1.5">
            {ALL_YEARS.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className="rounded-full px-3 py-1 text-[12px] font-bold transition-all duration-200"
                style={
                  selectedYear === yr
                    ? {
                        background: "linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)",
                        color: "#082721",
                        boxShadow: "0 2px 8px rgba(201,168,76,0.4)",
                        border: "1px solid transparent",
                      }
                    : {
                        background: "transparent",
                        color: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(201,168,76,0.2)",
                      }
                }
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── chart or empty state ─────────────────────────────────────────────── */}
      {noData ? (
        <div className="h-[300px] flex flex-col items-center justify-center gap-3">
          <svg className="w-10 h-10 opacity-25" fill="none" stroke="#C9A84C" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <p className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
            لا توجد بيانات لسنة {selectedYear}
          </p>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6">

          {/* bar chart */}
          <div
            className="flex-1"
            style={{ minHeight: `${Math.max(slices.length * 44 + 40, 200)}px` }}
          >
            <canvas ref={canvasRef} />
          </div>

          {/* summary table */}
          <div className="xl:w-64 flex-shrink-0">
            {/* total badge */}
            <div
              className="rounded-2xl px-4 py-3 mb-4 flex items-center justify-between"
              style={{
                background: "rgba(201,168,76,0.07)",
                border: "1px solid rgba(201,168,76,0.2)",
              }}
            >
              <span className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: "rgba(201,168,76,0.7)" }}>
                المجموع
              </span>
              <span className="text-[15px] font-black" style={{ color: "#C9A84C" }}>
                {total >= 1_000_000
                  ? `${(total / 1_000_000).toFixed(2)}M`
                  : total >= 1_000
                  ? `${(total / 1_000).toFixed(1)}K`
                  : total}
              </span>
            </div>

            {/* rows */}
            <div className="space-y-2">
              {slices.map((d, i) => {
                const pct = total > 0 ? ((d.value / total) * 100) : 0;
                const fmt = d.value >= 1_000_000
                  ? `${(d.value / 1_000_000).toFixed(2)}M`
                  : d.value >= 1_000
                  ? `${(d.value / 1_000).toFixed(1)}K`
                  : d.value;
                // same color interpolation as bars
                const t = i / Math.max(slices.length - 1, 1);
                const r = Math.round(201 + (16  - 201) * t);
                const g = Math.round(168 + (185 - 168) * t);
                const b = Math.round(76  + (129 - 76)  * t);
                const color = `rgb(${r},${g},${b})`;

                return (
                  <div key={d.mineral}
                       className="rounded-xl px-3 py-2"
                       style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold" style={{ color }}>
                        {d.mineral}
                      </span>
                      <span className="text-[11px] font-bold" style={{ color: "#C9A84C" }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    {/* progress bar */}
                    <div className="h-1 rounded-full overflow-hidden"
                         style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <p className="text-[10px] mt-1 font-mono"
                       style={{ color: "rgba(255,255,255,0.35)" }}>
                      {fmt} {d.unit}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const Countries = () => {
  const [selected, setSelected] = useState("—");

  return (
    <div
      dir="rtl"
      className="min-h-screen text-slate-800"
      style={{ fontFamily: "'Cairo', system-ui, sans-serif" }}
    >
      <Menu />

      {/* Hero */}
      <header
        className="bg-gradient-to-r from-[#082721] to-[#051712] text-white pt-12 pb-20 -mb-10 text-center"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 0% 100%)" }}
      />

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 space-y-8">

        {/* Country selector card */}
        <section className="bg-white/95 rounded-3xl shadow-xl shadow-slate-900/10 border border-slate-200/70 p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-0">الدول العربية</h2>
              <p className="text-slate-500 text-sm mt-1">
                اختر دولة للاطلاع على ملخص سريع لبياناتها التعدينية (واجهة تجريبية).
              </p>
            </div>
            <p className="text-slate-500 text-sm">
              الدولة المختارة:{" "}
              <span className="font-bold text-[#082721]">{selected}</span>
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg shadow-slate-900/10 border border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h5 className="m-0 text-base font-bold text-slate-800">الدول العربية</h5>
                <p className="mt-1 text-sm text-slate-500">
                  اختر دولة بسرعة للوصول إلى ملفها (واجهة تجريبية)
                </p>
              </div>
              <a
                href="countries.html"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold
                           text-[#082721] shadow-sm ring-1 ring-[#082721]/40 hover:bg-slate-50 transition-colors"
              >
                <i className="fa-solid fa-arrow-left" />
                <span>المزيد</span>
              </a>
            </div>

            {/* Flag grid */}
            <div className="grid gap-y-6 gap-x-4 sm:gap-x-5 md:gap-x-6 lg:gap-x-8
                            grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelected(c.name)}
                  className={`group flex flex-col items-center text-center transition-transform hover:-translate-y-1 focus:outline-none`}
                >
                  <div
                    className="relative flex h-16 w-28 items-center justify-center overflow-hidden rounded-md bg-slate-50 shadow-sm transition-all"
                    style={{
                      boxShadow: selected === c.name
                        ? "0 0 0 2px #C9A84C, 0 4px 12px rgba(201,168,76,0.3)"
                        : undefined,
                      ring: selected === c.name ? "2px solid #C9A84C" : undefined,
                    }}
                  >
                    <img
                      src={countryFlags[c.code]}
                      alt={c.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className={`mt-2 text-sm font-bold transition-colors ${
                    selected === c.name ? "text-[#C9A84C]" : "text-[#082721] group-hover:text-emerald-900"
                  }`}>
                    {c.name}
                  </p>
                </button>
              ))}
            </div>

            {selected && selected !== "—" && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  الدولة المختارة:{" "}
                  <span className="font-bold text-[#082721] bg-emerald-50 px-2 py-1 rounded">
                    {selected}
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Charts — only shown when a country is selected */}
        {selected !== "—" && (
          <div className="space-y-6">
            {/* Line chart */}
            <CountryLineChart country={selected} />

            {/* Bar chart — minerals by volume */}
            <CountryBarChart country={selected} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Countries;