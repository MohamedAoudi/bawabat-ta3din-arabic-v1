import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { TreemapController, TreemapElement } from "chartjs-chart-treemap";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import { dataByMineral, mineralUnits } from "./M1";

Chart.register(TreemapController, TreemapElement);

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

const ARAB_COUNTRY_NAMES = COUNTRIES.map((c) => c.name);

// ─── helpers ──────────────────────────────────────────────────────────────────
const ALL_YEARS = Array.from(
  new Set(
    Object.values(dataByMineral)
      .flatMap((byYear) => Object.keys(byYear))
      .map(Number)
  )
).sort((a, b) => a - b);

const UNIT_LABELS = {
  ton: "ألف طن",
  kg: "كجم",
};

const convertVolume = (value, fromUnit, toUnit) => {
  if (value == null) return value;
  const isThousandTon = fromUnit.includes("طن");
  const isKg = fromUnit.includes("كجم");
  if (isThousandTon) {
    if (toUnit === "ton") return value;
    if (toUnit === "kg") return value * 1_000_000;
  }
  if (isKg) {
    if (toUnit === "kg") return value;
    if (toUnit === "ton") return value / 1_000_000;
  }
  return value;
};

const getCountryMineralData = (country, mineralFilter = null, toUnit = "ton") => {
  const minerals = Object.keys(dataByMineral).filter((mineral) =>
    !mineralFilter || mineralFilter === "all" ? true : mineral === mineralFilter
  );
  const chartData = minerals.map((mineral) => {
    const fromUnit = mineralUnits[mineral] || "";
    return {
      mineral,
      values: ALL_YEARS.map((year) => {
        const row = (dataByMineral[mineral][year] || []).find((r) => r.country === country);
        const value = row ? row.value : null;
        return value != null ? convertVolume(value, fromUnit, toUnit) : null;
      }),
    };
  });
  return { years: ALL_YEARS, chartData };
};

const getMineralShareForYear = (country, year, mineralFilter = null, toUnit = "ton") => {
  const minerals = Object.keys(dataByMineral).filter((mineral) =>
    !mineralFilter || mineralFilter === "all" ? true : mineral === mineralFilter
  );
  const results = [];
  minerals.forEach((mineral) => {
    const row = (dataByMineral[mineral][year] || []).find((r) => r.country === country);
    if (row && row.value > 0) {
      const fromUnit = mineralUnits[mineral] || "";
      results.push({
        mineral,
        value: convertVolume(row.value, fromUnit, toUnit),
        unit: UNIT_LABELS[toUnit] || "",
      });
    }
  });
  return results;
};

const getMineralTreemapData = (country, year, unit = "ton") => {
  const rows = getMineralShareForYear(country, year, null, unit);
  const total = rows.reduce((sum, r) => sum + (r.value || 0), 0);
  if (total <= 0) return [];
  return rows.map((r) => {
    const pct = total ? (r.value / total) * 100 : 0;
    return { mineral: r.mineral, value: r.value, rawValue: r.value, unit: r.unit, pct };
  });
};

// ─── NEW: get comparison data per country for a year + mineral scope ──────────
// scope: "arab" = only ARAB_COUNTRY_NAMES, "world" = all countries in data
const getComparisonData = (selectedCountry, year, mineralFilter, unit, scope) => {
  const minerals = Object.keys(dataByMineral).filter((mineral) =>
    !mineralFilter || mineralFilter === "all" ? true : mineral === mineralFilter
  );
  const countryTotals = {};
  minerals.forEach((mineral) => {
    const fromUnit = mineralUnits[mineral] || "";
    const rows = dataByMineral[mineral][year] || [];
    rows.forEach((r) => {
      if (!r.country || !r.value) return;
      if (scope === "arab" && !ARAB_COUNTRY_NAMES.includes(r.country)) return;
      const converted = convertVolume(r.value, fromUnit, unit) || 0;
      countryTotals[r.country] = (countryTotals[r.country] || 0) + converted;
    });
  });

  const sorted = Object.entries(countryTotals)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  if (sorted.length === 0) return null;

  const selectedValue = countryTotals[selectedCountry] || 0;
  const MAX_SLICES = 9;
  const others = sorted.filter(([name]) => name !== selectedCountry);
  const topOthers = others.slice(0, MAX_SLICES - 1);
  const restValue = others.slice(MAX_SLICES - 1).reduce((s, [, v]) => s + v, 0);

  const slices = [];
  if (selectedValue > 0) slices.push({ name: selectedCountry, value: selectedValue, isSelected: true });
  topOthers.forEach(([name, value]) => slices.push({ name, value, isSelected: false }));
  if (restValue > 0) slices.push({ name: "أخرى", value: restValue, isSelected: false });

  const total = slices.reduce((s, d) => s + d.value, 0);
  return { slices, total };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const destroyChart = (chartRef) => {
  if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
};

const DONUT_PALETTE = [
  "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6",
  "#ef4444", "#06b6d4", "#84cc16", "#f97316",
  "#ec4899", "#64748b", "#a78bfa", "#fb923c",
];

const fmtVal = (v) =>
  v >= 1_000_000
    ? `${(v / 1_000_000).toFixed(2)}M`
    : v >= 1_000
    ? `${(v / 1_000).toFixed(1)}K`
    : v.toFixed(2);

// ─── NEW: Donut / Camembert comparison chart ──────────────────────────────────
const CountryComparisonDonut = ({ selectedCountry, year, mineralFilter, unit, onYearChange }) => {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const [scope, setScope] = useState("arab"); // "arab" | "world"
  const [noData, setNoData] = useState(false);

  const result = getComparisonData(selectedCountry, year, mineralFilter, unit, scope);

  useEffect(() => {
    if (!result || result.slices.length === 0) {
      setNoData(true);
      destroyChart(chartRef);
      return;
    }
    setNoData(false);

    const frameId = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      destroyChart(chartRef);
      const ctx = canvas.getContext("2d");

      const colors      = result.slices.map((s, i) => s.isSelected ? "#C9A84C" : DONUT_PALETTE[i % DONUT_PALETTE.length]);
      const borders     = result.slices.map((s) => s.isSelected ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.1)");
      const borderWidths= result.slices.map((s) => s.isSelected ? 3 : 1);

      chartRef.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: result.slices.map((s) => s.name),
          datasets: [{
            data:            result.slices.map((s) => s.value),
            backgroundColor: colors,
            borderColor:     borders,
            borderWidth:     borderWidths,
            hoverOffset:     10,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "64%",
          plugins: {
            legend: { display: false },
            tooltip: {
              rtl: true,
              bodyFont:  { family: "Cairo", size: 12 },
              titleFont: { family: "Cairo", size: 13, weight: "700" },
              callbacks: {
                label(c) {
                  const val = c.parsed;
                  const pct = result.total > 0 ? ((val / result.total) * 100).toFixed(1) : 0;
                  return ` ${fmtVal(val)} ${UNIT_LABELS[unit] || ""}  (${pct}%)`;
                },
              },
            },
          },
        },
      });
    });

    return () => { cancelAnimationFrame(frameId); destroyChart(chartRef); };
  }, [selectedCountry, year, mineralFilter, unit, scope]);

  const selectedSlice = result?.slices.find((s) => s.isSelected);
  const selectedPct   = result && selectedSlice
    ? ((selectedSlice.value / result.total) * 100).toFixed(1)
    : null;

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
      {/* ── Header ── */}
      <div
        className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-4"
        style={{ borderBottom: "1px solid rgba(201,168,76,0.18)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full flex-shrink-0"
               style={{ background: "linear-gradient(180deg,#C9A84C,#8B2500)" }} />
          <div>
            <h3 className="text-[13px] font-extrabold text-white/90 tracking-wide leading-tight">
              مقارنة الإنتاج — {selectedCountry}
            </h3>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(201,168,76,0.6)" }}>
              حصة الدولة مقارنةً بـ{scope === "arab" ? "الدول العربية" : "دول العالم"} — سنة {year}
            </p>
          </div>
        </div>

        {/* Controls: scope toggle + year pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Scope toggle pill */}
          <div className="flex rounded-full overflow-hidden"
               style={{ border: "1px solid rgba(201,168,76,0.3)" }}>
            {[
              { key: "arab",  label: "🌍 الدول العربية" },
              { key: "world", label: "🌐 العالم" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setScope(key)}
                className="px-4 py-1.5 text-[11px] font-bold transition-all duration-200"
                style={
                  scope === key
                    ? { background: "linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)", color: "#082721" }
                    : { background: "transparent", color: "rgba(255,255,255,0.5)" }
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* Year pills */}
          <div className="flex flex-wrap gap-1.5">
            {ALL_YEARS.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => onYearChange?.(yr)}
                className="rounded-full px-3 py-1 text-[11px] font-bold transition-all duration-200"
                style={
                  year === yr
                    ? { background: "linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)", color: "#082721", boxShadow: "0 2px 8px rgba(201,168,76,0.4)", border: "1px solid transparent" }
                    : { background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(201,168,76,0.2)" }
                }
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      {noData || !result ? (
        <div className="h-[320px] flex flex-col items-center justify-center gap-3">
          <svg className="w-10 h-10 opacity-20" fill="none" stroke="#C9A84C" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
          </svg>
          <p className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
            لا توجد بيانات للمقارنة في سنة {year}
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-center">

          {/* ── Donut + centre badge ── */}
          <div className="relative flex-shrink-0" style={{ width: 280, height: 280 }}>
            <canvas
              ref={canvasRef}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            />
            {selectedPct !== null && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}
              >
                <span className="text-[32px] font-black leading-none" style={{ color: "#C9A84C" }}>
                  {selectedPct}%
                </span>
                <span className="text-[10px] font-bold mt-1 text-center px-6 leading-snug"
                      style={{ color: "rgba(255,255,255,0.45)" }}>
                  {scope === "arab" ? "من الإنتاج العربي" : "من الإنتاج العالمي"}
                </span>
              </div>
            )}
          </div>

          {/* ── Legend + stats ── */}
          <div className="flex-1 w-full min-w-0">

            {/* Selected country highlight */}
            {selectedSlice && (
              <div
                className="rounded-2xl px-4 py-3 mb-4"
                style={{ background: "rgba(201,168,76,0.10)", border: "1px solid rgba(201,168,76,0.35)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-black flex items-center gap-2" style={{ color: "#C9A84C" }}>
                    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: "#C9A84C" }} />
                    {selectedSlice.name}
                  </span>
                  <span className="text-[15px] font-black" style={{ color: "#C9A84C" }}>
                    {selectedPct}%
                  </span>
                </div>
                <p className="text-[10px] mt-1 font-mono" style={{ color: "rgba(201,168,76,0.55)" }}>
                  {fmtVal(selectedSlice.value)} {UNIT_LABELS[unit] || ""}
                </p>
              </div>
            )}

            {/* Other countries list */}
            <div
              className="space-y-2 overflow-y-auto pr-1"
              style={{ maxHeight: "210px", scrollbarWidth: "thin", scrollbarColor: "rgba(201,168,76,0.25) transparent" }}
            >
              {result.slices
                .filter((s) => !s.isSelected)
                .map((s, i) => {
                  const pct   = result.total > 0 ? (s.value / result.total) * 100 : 0;
                  const idx   = result.slices.findIndex((x) => x.name === s.name);
                  const color = DONUT_PALETTE[idx % DONUT_PALETTE.length];
                  return (
                    <div key={s.name} className="rounded-xl px-3 py-2"
                         style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold flex items-center gap-1.5 truncate" style={{ color }}>
                          <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                          {s.name}
                        </span>
                        <span className="text-[11px] font-bold flex-shrink-0 ml-2"
                              style={{ color: "rgba(255,255,255,0.55)" }}>
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <p className="text-[9px] mt-0.5 font-mono" style={{ color: "rgba(255,255,255,0.28)" }}>
                        {fmtVal(s.value)} {UNIT_LABELS[unit] || ""}
                      </p>
                    </div>
                  );
                })}
            </div>

            {/* Total footer */}
            <div
              className="mt-3 rounded-xl px-4 py-2 flex items-center justify-between"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "rgba(255,255,255,0.3)" }}>
                الإجمالي
              </span>
              <span className="text-[13px] font-black" style={{ color: "rgba(255,255,255,0.65)" }}>
                {fmtVal(result.total)} {UNIT_LABELS[unit] || ""}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Line chart ───────────────────────────────────────────────────────────────
const CountryLineChart = ({ country, mineralFilter = null, unit = "ton" }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      destroyChart(chartRef);
      const ctx = canvas.getContext("2d");
      const { years, chartData } = getCountryMineralData(country, mineralFilter, unit);
      const palette = ["#C9A84C","#10b981","#3b82f6","#f59e0b","#8b5cf6","#ef4444","#06b6d4"];
      const datasets = chartData
        .filter((entry) => entry.values.some((v) => v !== null))
        .map((entry, i) => ({
          label: entry.mineral,
          data: entry.values,
          borderColor: palette[i % palette.length],
          backgroundColor: palette[i % palette.length] + "22",
          borderWidth: 2, spanGaps: true, tension: 0.35, pointRadius: 3,
        }));
      if (datasets.length === 0) return;
      chartRef.current = new Chart(ctx, {
        type: "line",
        data: { labels: years, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { font: { family: "Cairo", size: 11 }, boxWidth: 12, color: "rgba(255,255,255,0.7)" } },
            tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${c.parsed.y ?? 0} ${UNIT_LABELS[unit]||""}` } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { family: "Cairo", weight: "700" }, color: "rgba(255,255,255,0.6)" } },
            y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.06)" }, ticks: { font: { family: "Cairo" }, color: "rgba(255,255,255,0.6)", callback: (v) => v>=1_000_000?`${v/1_000_000}M`:v>=1_000?`${v/1_000}K`:v } },
          },
        },
      });
    });
    return () => { cancelAnimationFrame(frameId); destroyChart(chartRef); };
  }, [country, mineralFilter, unit]);

  return (
    <div className="rounded-3xl p-5 sm:p-6"
         style={{ background:"linear-gradient(145deg,#0d3b33,#082721)", border:"1px solid rgba(201,168,76,0.25)", boxShadow:"0 8px 32px rgba(0,0,0,0.35)", fontFamily:"'Cairo','Tajawal',sans-serif" }}>
      <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom:"1px solid rgba(201,168,76,0.18)" }}>
        <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background:"linear-gradient(180deg,#C9A84C,#8B2500)" }} />
        <h3 className="text-[13px] font-extrabold text-white/90 tracking-wide">تطوّر الإنتاج التعديني — {country}</h3>
      </div>
      <div className="relative" style={{ height:"340px" }}>
        <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />
      </div>
    </div>
  );
};

// ─── Bar chart ────────────────────────────────────────────────────────────────
const CountryBarChart = ({ country, mineralFilter=null, unit="ton", selectedYear, onYearChange }) => {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const [noData, setNoData] = useState(false);

  const slices = getMineralShareForYear(country, selectedYear, mineralFilter, unit).sort((a,b)=>b.value-a.value);
  const total  = slices.reduce((s,d)=>s+d.value,0);

  useEffect(() => {
    if (slices.length===0) { setNoData(true); destroyChart(chartRef); return; }
    setNoData(false);
    const frameId = requestAnimationFrame(()=>{
      const canvas = canvasRef.current; if (!canvas) return;
      destroyChart(chartRef);
      const ctx = canvas.getContext("2d");
      const colors = slices.map((_,i)=>{
        const t=i/Math.max(slices.length-1,1);
        return `rgb(${Math.round(201+(16-201)*t)},${Math.round(168+(185-168)*t)},${Math.round(76+(129-76)*t)})`;
      });
      chartRef.current = new Chart(ctx,{
        type:"bar",
        data:{ labels:slices.map(d=>d.mineral), datasets:[{ label:`الإنتاج — ${selectedYear}`, data:slices.map(d=>d.value), backgroundColor:colors, borderColor:colors, borderWidth:0, borderRadius:6, borderSkipped:false }] },
        options:{ indexAxis:"y", responsive:true, maintainAspectRatio:false,
          plugins:{ legend:{display:false}, tooltip:{ rtl:true, bodyFont:{family:"Cairo"}, callbacks:{ label:(c)=>{ const e=slices[c.dataIndex]; const pct=total>0?((e.value/total)*100).toFixed(1):0; const fmt=e.value>=1_000_000?`${(e.value/1_000_000).toFixed(2)} M`:e.value>=1_000?`${(e.value/1_000).toFixed(1)} K`:e.value; return ` ${fmt} ${e.unit}  (${pct}%)`; } } } },
          scales:{
            x:{ beginAtZero:true, grid:{color:"rgba(255,255,255,0.06)"}, border:{color:"rgba(201,168,76,0.15)"}, ticks:{color:"rgba(255,255,255,0.45)", font:{family:"Cairo",size:11}, callback:(v)=>v>=1_000_000?`${v/1_000_000}M`:v>=1_000?`${v/1_000}K`:v} },
            y:{ grid:{display:false}, border:{display:false}, ticks:{color:"rgba(255,255,255,0.8)", font:{family:"Cairo",size:12,weight:"700"}} },
          },
        },
      });
    });
    return ()=>{ cancelAnimationFrame(frameId); destroyChart(chartRef); };
  },[country, selectedYear, mineralFilter, unit]);

  const barAreaHeight = Math.max(slices.length*44+40,200);

  return (
    <div className="rounded-3xl p-5 sm:p-6"
         style={{ background:"linear-gradient(145deg,#0d3b33,#082721)", border:"1px solid rgba(201,168,76,0.25)", boxShadow:"0 8px 32px rgba(0,0,0,0.35)", fontFamily:"'Cairo','Tajawal',sans-serif" }}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pb-4" style={{ borderBottom:"1px solid rgba(201,168,76,0.18)" }}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background:"linear-gradient(180deg,#C9A84C,#8B2500)" }} />
          <div>
            <h3 className="text-[13px] font-extrabold text-white/90 tracking-wide leading-tight">حصص الخامات حسب الحجم</h3>
            <p className="text-[10px] mt-0.5" style={{ color:"rgba(201,168,76,0.6)" }}>{country} — سنة {selectedYear}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-widest flex-shrink-0" style={{ color:"rgba(201,168,76,0.6)" }}>السنة</span>
          <div className="flex flex-wrap gap-1.5">
            {ALL_YEARS.map((yr)=>(
              <button key={yr} type="button" onClick={()=>onYearChange?.(yr)} className="rounded-full px-3 py-1 text-[12px] font-bold transition-all duration-200"
                style={selectedYear===yr?{background:"linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)",color:"#082721",boxShadow:"0 2px 8px rgba(201,168,76,0.4)",border:"1px solid transparent"}:{background:"transparent",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(201,168,76,0.2)"}}>
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>
      {noData ? (
        <div className="h-[300px] flex flex-col items-center justify-center gap-3">
          <p className="text-[13px] font-semibold" style={{ color:"rgba(255,255,255,0.3)" }}>لا توجد بيانات لسنة {selectedYear}</p>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 relative" style={{ height:`${barAreaHeight}px` }}>
            <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />
          </div>
          <div className="xl:w-64 flex-shrink-0">
            <div className="rounded-2xl px-4 py-3 mb-4 flex items-center justify-between" style={{ background:"rgba(201,168,76,0.07)", border:"1px solid rgba(201,168,76,0.2)" }}>
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color:"rgba(201,168,76,0.7)" }}>المجموع</span>
              <span className="text-[15px] font-black" style={{ color:"#C9A84C" }}>{fmtVal(total)}</span>
            </div>
            <div className="space-y-2">
              {slices.map((d,i)=>{
                const pct=total>0?(d.value/total)*100:0;
                const t=i/Math.max(slices.length-1,1);
                const color=`rgb(${Math.round(201+(16-201)*t)},${Math.round(168+(185-168)*t)},${Math.round(76+(129-76)*t)})`;
                return (
                  <div key={d.mineral} className="rounded-xl px-3 py-2" style={{ background:"rgba(255,255,255,0.03)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold" style={{ color }}>{d.mineral}</span>
                      <span className="text-[11px] font-bold" style={{ color:"#C9A84C" }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width:`${pct}%`, background:color }} />
                    </div>
                    <p className="text-[10px] mt-1 font-mono" style={{ color:"rgba(255,255,255,0.35)" }}>{fmtVal(d.value)} {d.unit}</p>
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

// ─── Treemap ──────────────────────────────────────────────────────────────────
const MineralTreemap = ({ country, year, unit="ton" }) => {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const [noData, setNoData] = useState(false);

  useEffect(()=>{
    const treeData = getMineralTreemapData(country, year, unit);
    if (treeData.length===0) { setNoData(true); destroyChart(chartRef); return; }
    setNoData(false);
    const frameId = requestAnimationFrame(()=>{
      const canvas = canvasRef.current; if (!canvas) return;
      destroyChart(chartRef);
      const ctx = canvas.getContext("2d");
      const sortedData = [...treeData].sort((a,b)=>b.value-a.value);
      const colorMap = {};
      sortedData.forEach((d,i)=>{ const hue=160-(i/Math.max(sortedData.length-1,1))*100; colorMap[d.mineral]=`hsl(${hue},65%,40%)`; });
      chartRef.current = new Chart(ctx,{
        type:"treemap",
        data:{ datasets:[{ label:"المعادن", tree:treeData, key:"value", groups:["mineral"], borderColor:"rgba(255,255,255,0.2)", borderWidth:1, spacing:2,
          backgroundColor(ctx){ const raw=ctx.raw; if(!raw)return"#10b981"; const datum=raw._data||raw; return colorMap[datum.mineral]||"#10b981"; },
          labels:{ display:true, align:"center", position:"middle",
            formatter(ctx){ const raw=ctx.raw; if(!raw)return""; const datum=raw._data||raw; return [`${datum.mineral||""}`,`${datum.pct!=null?datum.pct.toFixed(1):""}%`]; },
            color:"rgba(255,255,255,0.9)",
            font:[{family:"Cairo",size:11,weight:"700"},{family:"Cairo",size:10}],
          },
        }]},
        options:{ responsive:true, maintainAspectRatio:false,
          plugins:{ legend:{display:false}, tooltip:{ callbacks:{
            title(items){ const raw=items[0]?.raw; const datum=raw?._data||raw; return datum?.mineral||""; },
            label(item){ const raw=item.raw; const datum=raw?._data||raw; const pct=datum?.pct!=null?datum.pct.toFixed(1):"—"; const val=datum?.rawValue!=null?fmtVal(datum.rawValue):"—"; return [`${pct}% من الإنتاج`,`${val} ${datum?.unit||""}`]; },
          }}},
        },
      });
    });
    return ()=>{ cancelAnimationFrame(frameId); destroyChart(chartRef); };
  },[country, year, unit]);

  return (
    <div className="rounded-3xl p-5 sm:p-6"
         style={{ background:"linear-gradient(145deg,#0d3b33,#082721)", border:"1px solid rgba(201,168,76,0.25)", boxShadow:"0 8px 32px rgba(0,0,0,0.35)", fontFamily:"'Cairo','Tajawal',sans-serif" }}>
      <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom:"1px solid rgba(201,168,76,0.18)" }}>
        <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background:"linear-gradient(180deg,#C9A84C,#8B2500)" }} />
        <h3 className="text-[13px] font-extrabold text-white/90 tracking-wide">توزيع المعادن حسب النسبة — {country} ({year})</h3>
      </div>
      {noData ? (
        <div className="h-[340px] flex flex-col items-center justify-center gap-3">
          <p className="text-[13px] font-semibold" style={{ color:"rgba(255,255,255,0.3)" }}>لا توجد بيانات</p>
        </div>
      ) : (
        <div className="relative" style={{ height:"340px" }}>
          <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />
        </div>
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const Countries = () => {
  const [selected, setSelected]         = useState("—");
  const [selectedMineral, setSelectedMineral] = useState("all");
  const [volumeUnit, setVolumeUnit]     = useState("ton");
  const [selectedYear, setSelectedYear] = useState(ALL_YEARS[ALL_YEARS.length - 1]);

  const mineralList = Object.keys(dataByMineral);

  return (
    <div dir="rtl" className="min-h-screen text-slate-800"
         style={{ fontFamily:"'Cairo', system-ui, sans-serif" }}>
      <Menu />

      <header
        className="bg-gradient-to-r from-[#082721] to-[#051712] text-white pt-12 pb-20 -mb-10 text-center"
        style={{ clipPath:"polygon(0 0, 100% 0, 100% 85%, 0% 100%)" }}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 space-y-8">

        {/* Country selector */}
        <section className="bg-white/95 rounded-3xl shadow-xl shadow-slate-900/10 border border-slate-200/70 p-5 sm:p-7">
          <div className="rounded-2xl bg-white p-5 shadow-lg shadow-slate-900/10 border border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h5 className="m-0 text-base font-bold text-slate-800">الدول العربية</h5>
                <p className="mt-1 text-sm text-slate-500">اختر دولة بسرعة للوصول إلى ملفها (واجهة تجريبية)</p>
              </div>
              <a href="countries.html"
                 className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721] shadow-sm ring-1 ring-[#082721]/40 hover:bg-slate-50 transition-colors">
                <i className="fa-solid fa-arrow-left" />
                <span>المزيد</span>
              </a>
            </div>

            <div className="grid gap-y-6 gap-x-4 sm:gap-x-5 md:gap-x-6 lg:gap-x-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
              {COUNTRIES.map((c) => (
                <button key={c.code} type="button" onClick={()=>setSelected(c.name)}
                        className="group flex flex-col items-center text-center transition-transform hover:-translate-y-1 focus:outline-none">
                  <div className="relative flex h-16 w-28 items-center justify-center overflow-hidden rounded-md bg-slate-50 shadow-sm transition-all"
                       style={{ boxShadow:selected===c.name?"0 0 0 2px #C9A84C, 0 4px 12px rgba(201,168,76,0.3)":undefined }}>
                    <img src={countryFlags[c.code]} alt={c.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <p className={`mt-2 text-sm font-bold transition-colors ${selected===c.name?"text-[#C9A84C]":"text-[#082721] group-hover:text-emerald-900"}`}>
                    {c.name}
                  </p>
                </button>
              ))}
            </div>

            {selected && selected !== "—" && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  الدولة المختارة:{" "}
                  <span className="font-bold text-[#082721] bg-emerald-50 px-2 py-1 rounded">{selected}</span>
                </p>
              </div>
            )}
          </div>
        </section>

        {selected !== "—" && (
          <div className="space-y-6">
            {/* Global filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">المعدن:</span>
                <select value={selectedMineral} onChange={(e)=>setSelectedMineral(e.target.value)}
                        className="rounded-md border border-slate-200 bg-white py-1 px-2 text-sm">
                  <option value="all">الكل</option>
                  {mineralList.map((m)=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">الوحدة:</span>
                <select value={volumeUnit} onChange={(e)=>setVolumeUnit(e.target.value)}
                        className="rounded-md border border-slate-200 bg-white py-1 px-2 text-sm">
                  <option value="ton">طن</option>
                  <option value="kg">كجم</option>
                </select>
              </div>
            </div>

            {/* ★ NEW: Donut comparison chart — first position */}
            <CountryComparisonDonut
              selectedCountry={selected}
              year={selectedYear}
              mineralFilter={selectedMineral}
              unit={volumeUnit}
              onYearChange={setSelectedYear}
            />

            <CountryLineChart country={selected} mineralFilter={selectedMineral} unit={volumeUnit} />

            <CountryBarChart
              country={selected}
              mineralFilter={selectedMineral}
              unit={volumeUnit}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />

            <MineralTreemap country={selected} year={selectedYear} unit={volumeUnit} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Countries;