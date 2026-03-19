import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Chart from "chart.js/auto";
import { TreemapController, TreemapElement } from "chartjs-chart-treemap";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import { dataByMineral, mineralUnits } from "./M1";

Chart.register(TreemapController, TreemapElement);

const flagModules = import.meta.glob("../assets/flags/*.webp", { eager: true });

const getCountryFlags = () => {
  const flags = {};
  const countryCodeMap = {
    "jordan.webp": "jo", "uae.webp": "ae", "bahrain.webp": "bh",
    "tunisia.webp": "tn", "algeria.webp": "dz", "djibouti.webp": "dj",
    "saudiarabe.webp": "sa", "sudan.webp": "sd", "syria.webp": "sy",
    "somalia.webp": "so", "iraq.webp": "iq", "oman.webp": "om",
    "palestine.webp": "ps", "qatar.webp": "qa", "kuwait.webp": "kw",
    "lebanon.webp": "lb", "libya.webp": "ly", "egypt.webp": "eg",
    "morocco.webp": "ma", "mauritania.webp": "mr", "yemen.webp": "ye",
  };
  Object.entries(flagModules).forEach(([path, module]) => {
    const filename = path.split("/").pop();
    const countryCode = countryCodeMap[filename];
    if (countryCode) flags[countryCode] = module.default;
  });
  return flags;
};

const countryFlags = getCountryFlags();

const FLAG_IMAGE_STYLE = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  imageRendering: "auto",
};

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

const COUNTRY_AR_TO_CSV_NAME = {
  "المملكة الأردنية الهاشمية": "Jordan",
  "دولة الامارات العربية المتحدة": "United Arab Emirates",
  "مملكة البحرين": "Bahrain",
  "الجمهورية التونسية": "Tunisia",
  "الجمهورية الجزائرية الديمقراطية الشعبية": "Algeria",
  "دولة جيبوتي": "Djibouti",
  "المملكة العربية السعودية": "Saudi Arabia",
  "جمهورية السودان": "Sudan",
  "الجمهورية العربية السورية": "Syria",
  "جمهورية الصومال": "Somalia",
  "جمهورية العراق": "Iraq",
  "سلطنة عمان": "Oman",
  "دولة فلسطين": "Palestine",
  "دولة قطر": "Qatar",
  "دولة الكويت": "Kuwait",
  "الجمهورية اللبنانية": "Lebanon",
  "دولة ليبيا": "Libya",
  "جمهورية مصر العربية": "Egypt",
  "المملكة المغربية": "Morocco",
  "الجمهورية الإسلامية الموريتانية": "Mauritania",
  "الجمهورية اليمنية": "Yemen",
};

const ARAB_COUNTRY_NAMES = COUNTRIES.map((c) => c.name);

const ALL_YEARS = Array.from(
  new Set(
    Object.values(dataByMineral)
      .flatMap((byYear) => Object.keys(byYear))
      .map(Number)
  )
).sort((a, b) => a - b);

const UNIT_LABELS = { ton: "ألف طن", kg: "كجم" };

const parseCsvLine = (line, delimiter = ",") => {
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
};

const parseYearFromCsv = (value) => {
  if (!value) return null;
  if (value.includes("/")) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.getFullYear();
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeHeaderKey = (key) =>
  String(key || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

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

const normalizeFlow = (value) => String(value || "").trim().toLowerCase();

const quantityToKton = (quantityRaw, unitsRaw) => {
  if (!quantityRaw) return null;
  const quantity = Number.parseFloat(quantityRaw);
  if (Number.isNaN(quantity)) return null;
  const units = (unitsRaw || "").toLowerCase();
  if (units.includes("kilogram")) return quantity / 1_000_000;
  if (units.includes("ton")) return quantity / 1_000;
  return quantity;
};

const buildTradeTotalsByCountry = (csvText, expectedType) => {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return {};

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const header = parseCsvLine(lines[0], delimiter);
  const normalized = header.map(normalizeHeaderKey);

  const yearIdx = normalized.indexOf("year");
  const reporterIdx = normalized.indexOf("reporter");
  const flowIdx = normalized.indexOf("flow");
  const countryIdx = normalized.indexOf("country_trans");
  const typeIdx = normalized.indexOf("bgs_statistic_type_trans");
  const unitsIdx = normalized.indexOf("units");
  const qtyIdx = normalized.indexOf("quantity");
  const valueIdx = normalized.findIndex((h) => h === "value" || h === "value (us$)");

  if (yearIdx === -1) return {};

  const totals = {};
  const expectedFlow = normalizeFlow(expectedType);

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cols = parseCsvLine(line, delimiter);
    if (cols.length < header.length) continue;

    let flowValue = "";
    if (flowIdx !== -1) {
      flowValue = normalizeFlow(cols[flowIdx]);
    } else if (typeIdx !== -1) {
      flowValue = normalizeFlow(cols[typeIdx]);
    }
    if (!flowValue.startsWith(expectedFlow)) continue;

    const year = parseYearFromCsv(cols[yearIdx]);
    if (!year) continue;

    const country = (reporterIdx !== -1 ? cols[reporterIdx] : cols[countryIdx]) || "";
    if (!country) continue;

    let value = null;
    if (valueIdx !== -1) {
      value = parseFlexibleNumber(cols[valueIdx]);
    } else if (qtyIdx !== -1) {
      value = quantityToKton(cols[qtyIdx], unitsIdx !== -1 ? cols[unitsIdx] : "");
    }
    if (value == null) continue;

    if (!totals[country]) totals[country] = {};
    totals[country][year] = (totals[country][year] || 0) + value;
  }

  return totals;
};

const buildTradeTotalsFromRawText = (rawText, expectedType) => {
  const lines = String(rawText || "").split(/\r?\n/);
  const totals = {};
  const expectedFlow = normalizeFlow(expectedType);

  let idx = {
    reporter: -1,
    flow: -1,
    year: -1,
    value: -1,
    quantity: -1,
    units: -1,
  };

  for (const line of lines) {
    const clean = line.trim();
    if (!clean) continue;
    if (/^\d+[\d.,]*$/.test(clean)) continue;

    const delimiter = line.includes("\t") ? "\t" : ",";
    const cols = parseCsvLine(line, delimiter).map((c) => String(c || "").trim());
    if (cols.length < 3) continue;

    const normalized = cols.map(normalizeHeaderKey);
    const headerLike =
      normalized.includes("reporter") &&
      normalized.includes("flow") &&
      normalized.includes("year") &&
      (normalized.includes("value") || normalized.includes("value (us$)") || normalized.includes("quantity"));

    if (headerLike) {
      idx = {
        reporter: normalized.indexOf("reporter"),
        flow: normalized.indexOf("flow"),
        year: normalized.indexOf("year"),
        value: normalized.findIndex((h) => h === "value" || h === "value (us$)"),
        quantity: normalized.indexOf("quantity"),
        units: normalized.indexOf("units"),
      };
      continue;
    }

    const flowRaw = idx.flow !== -1 ? cols[idx.flow] : cols[2];
    const flowValue = normalizeFlow(flowRaw);
    if (!flowValue.startsWith(expectedFlow)) continue;

    const reporter = idx.reporter !== -1 ? cols[idx.reporter] : cols[0];
    const yearRaw = idx.year !== -1 ? cols[idx.year] : cols[6];
    if (!reporter || !yearRaw) continue;

    const year = parseYearFromCsv(yearRaw);
    if (!year) continue;

    let value = null;
    if (idx.value !== -1) {
      value = parseFlexibleNumber(cols[idx.value]);
    } else if (idx.quantity !== -1) {
      value = quantityToKton(cols[idx.quantity], idx.units !== -1 ? cols[idx.units] : "");
    } else if (cols.length >= 8) {
      value = parseFlexibleNumber(cols[7]);
    }
    if (value == null) continue;

    if (!totals[reporter]) totals[reporter] = {};
    totals[reporter][year] = (totals[reporter][year] || 0) + value;
  }

  return totals;
};

const toTradeSeries = (totalsByCountry, countryEn) => {
  const byYear = totalsByCountry?.[countryEn] || {};
  return Object.keys(byYear)
    .map(Number)
    .sort((a, b) => a - b)
    .map((year) => ({ year, value: Number((byYear[year] || 0).toFixed(2)) }));
};

const convertVolume = (value, fromUnit, toUnit) => {
  if (value == null) return value;
  const isThousandTon = fromUnit.includes("طن");
  const isKg = fromUnit.includes("كجم");
  if (isThousandTon) { if (toUnit === "ton") return value; if (toUnit === "kg") return value * 1_000_000; }
  if (isKg) { if (toUnit === "kg") return value; if (toUnit === "ton") return value / 1_000_000; }
  return value;
};

const getCountryMineralData = (country, mineralFilter = null, toUnit = "ton") => {
  const minerals = Object.keys(dataByMineral).filter((m) =>
    !mineralFilter || mineralFilter === "all" ? true : m === mineralFilter
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
  const minerals = Object.keys(dataByMineral).filter((m) =>
    !mineralFilter || mineralFilter === "all" ? true : m === mineralFilter
  );
  const results = [];
  minerals.forEach((mineral) => {
    const row = (dataByMineral[mineral][year] || []).find((r) => r.country === country);
    if (row && row.value > 0) {
      const fromUnit = mineralUnits[mineral] || "";
      results.push({ mineral, value: convertVolume(row.value, fromUnit, toUnit), unit: UNIT_LABELS[toUnit] || "" });
    }
  });
  return results;
};

const getMineralTreemapData = (country, year, unit = "ton") => {
  const rows = getMineralShareForYear(country, year, null, unit);
  const total = rows.reduce((sum, r) => sum + (r.value || 0), 0);
  if (total <= 0) return [];
  return rows.map((r) => ({ mineral: r.mineral, value: r.value, rawValue: r.value, unit: r.unit, pct: (r.value / total) * 100 }));
};

const getComparisonData = (selectedCountry, year, mineralFilter, unit, scope) => {
  const minerals = Object.keys(dataByMineral).filter((m) =>
    !mineralFilter || mineralFilter === "all" ? true : m === mineralFilter
  );
  const countryTotals = {};
  minerals.forEach((mineral) => {
    const fromUnit = mineralUnits[mineral] || "";
    (dataByMineral[mineral][year] || []).forEach((r) => {
      if (!r.country || !r.value) return;
      if (scope === "arab" && !ARAB_COUNTRY_NAMES.includes(r.country)) return;
      const converted = convertVolume(r.value, fromUnit, unit) || 0;
      countryTotals[r.country] = (countryTotals[r.country] || 0) + converted;
    });
  });
  const sorted = Object.entries(countryTotals).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a);
  if (sorted.length === 0) return null;
  const selectedValue = countryTotals[selectedCountry] || 0;
  const others = sorted.filter(([name]) => name !== selectedCountry);
  const topOthers = others.slice(0, 8);
  const restValue = others.slice(8).reduce((s, [, v]) => s + v, 0);
  const slices = [];
  if (selectedValue > 0) slices.push({ name: selectedCountry, value: selectedValue, isSelected: true });
  topOthers.forEach(([name, value]) => slices.push({ name, value, isSelected: false }));
  if (restValue > 0) slices.push({ name: "أخرى", value: restValue, isSelected: false });
  return { slices, total: slices.reduce((s, d) => s + d.value, 0) };
};

const destroyChart = (ref) => { if (ref.current) { ref.current.destroy(); ref.current = null; } };

const fmtVal = (v) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(2)}M` : v >= 1_000 ? `${(v/1_000).toFixed(1)}K` : v.toFixed(2);

const DONUT_PALETTE = ["#10b981","#3b82f6","#f59e0b","#8b5cf6","#ef4444","#06b6d4","#84cc16","#f97316","#ec4899","#64748b","#a78bfa","#fb923c"];

// ── useChartInit: wait for container to have real size, then init chart ────────
function useChartInit(buildChart, deps) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const roRef     = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w === 0 || h === 0) return; // not ready yet

      destroyChart(chartRef);
      chartRef.current = buildChart(canvas);
    };

    // Try immediately
    init();

    // If dimensions were 0, observe until they appear
    if (!chartRef.current) {
      roRef.current = new ResizeObserver(() => {
        if (canvas.offsetWidth > 0 && canvas.offsetHeight > 0) {
          roRef.current?.disconnect();
          destroyChart(chartRef);
          chartRef.current = buildChart(canvas);
        }
      });
      roRef.current.observe(canvas);
    }

    return () => {
      roRef.current?.disconnect();
      destroyChart(chartRef);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return canvasRef;
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl p-5 sm:p-6 ${className}`}
    style={{ background:"linear-gradient(160deg,#0e4238 0%,#082c23 60%,#051a15 100%)", border:"1px solid rgba(201,168,76,0.20)", boxShadow:"0 4px 24px rgba(0,0,0,0.30),inset 0 1px 0 rgba(201,168,76,0.08)", fontFamily:"'Cairo','Tajawal',sans-serif" }}>
    {children}
  </div>
);

const CardHeader = ({ title, subtitle, children }) => (
  <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pb-4" style={{ borderBottom:"1px solid rgba(201,168,76,0.14)" }}>
    <div className="flex items-center gap-3">
      <div className="w-0.5 h-6 rounded-full flex-shrink-0" style={{ background:"linear-gradient(180deg,#C9A84C,#7a4a00)" }} />
      <div>
        <h3 className="text-sm font-extrabold text-white/90 leading-tight">{title}</h3>
        {subtitle && <p className="text-[11px] mt-0.5" style={{ color:"rgba(201,168,76,0.55)" }}>{subtitle}</p>}
      </div>
    </div>
    {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
  </div>
);

const YearPills = ({ selectedYear, onYearChange }) => (
  <div className="flex flex-wrap gap-1.5">
    {ALL_YEARS.map((yr) => (
      <button key={yr} type="button" onClick={() => onYearChange?.(yr)}
        className="rounded-full px-3 py-1 text-[11px] font-bold transition-all duration-200"
        style={selectedYear === yr
          ? { background:"linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)", color:"#082721", boxShadow:"0 2px 8px rgba(201,168,76,0.35)", border:"1px solid transparent" }
          : { background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.45)", border:"1px solid rgba(201,168,76,0.18)" }}>
        {yr}
      </button>
    ))}
  </div>
);

const ChartSectionTitle = ({ title }) => (
  <section
    style={{
      textAlign: "center",
      marginTop: 32,
      background: "linear-gradient(145deg,#071e1a 0%,#082721 40%,#0a2f28 70%,#071e1a 100%)",
      borderRadius: 13,
      padding: "28px 24px",
      boxShadow: "0 40px 80px rgba(8,39,33,0.35),inset 0 0 0 1px rgba(201,168,76,0.08)",
    }}
  >
    <h3 style={{ fontSize: "1.35rem", fontWeight: 900, color: "white", margin: 0 }}>
      <span
        style={{
          background: "linear-gradient(120deg,#c9a84c 0%,#f0d98a 40%,#c9a84c 60%,#8a6a1e 100%)",
          backgroundSize: "300% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmerGold 6s linear infinite",
        }}
      >
        {title}
      </span>
    </h3>
  </section>
);

// ── Country Hero Banner ────────────────────────────────────────────────────────
const CountryHeroBanner = ({ country, countryCode }) => {
  const flagSrc = countryFlags[countryCode];
  return (
    <div className="relative overflow-hidden rounded-2xl flex items-center gap-6 px-6 py-5"
      style={{ background:"linear-gradient(135deg,#082c23 0%,#0d3b2e 40%,#0a3028 100%)", border:"1px solid rgba(201,168,76,0.25)", boxShadow:"0 4px 24px rgba(0,0,0,0.35),inset 0 1px 0 rgba(201,168,76,0.10)", fontFamily:"'Cairo','Tajawal',sans-serif" }}>
      <div className="absolute right-0 top-0 bottom-0 w-64 pointer-events-none"
        style={{ background:"radial-gradient(ellipse at 80% 50%,rgba(201,168,76,0.08) 0%,transparent 70%)" }} />
      {flagSrc && (
        <div className="relative flex-shrink-0 overflow-hidden"
          style={{ width:160, height:110, borderRadius:14, boxShadow:"0 6px 20px rgba(0,0,0,0.5),0 0 0 1px rgba(201,168,76,0.3)" }}>
          <img src={flagSrc} alt={country} decoding="async" style={{ ...FLAG_IMAGE_STYLE, display:"block", background:"#0b1f1a" }} />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(255,255,255,0.07) 0%,transparent 60%)", borderRadius:14 }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-px flex-1" style={{ background:"linear-gradient(90deg,rgba(201,168,76,0.4),transparent)" }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color:"rgba(201,168,76,0.5)" }}>ملف الدولة</span>
        </div>
        <h2 className="font-black leading-snug" style={{ color:"#ffffff", fontSize:"clamp(16px,2.5vw,22px)", textShadow:"0 2px 12px rgba(0,0,0,0.5)" }}>{country}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] font-bold"
            style={{ background:"rgba(201,168,76,0.12)", color:"#C9A84C", border:"1px solid rgba(201,168,76,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background:"#C9A84C" }} />
            الإنتاج التعديني
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Donut ──────────────────────────────────────────────────────────────────────
const CountryComparisonDonut = ({ selectedCountry, year, mineralFilter, unit, onYearChange }) => {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const [scope, setScope] = useState("arab");
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    destroyChart(chartRef);
    const result = getComparisonData(selectedCountry, year, mineralFilter, unit, scope);
    if (!result || result.slices.length === 0) { setNoData(true); return; }
    setNoData(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const colors      = result.slices.map((s,i) => s.isSelected ? "#C9A84C" : DONUT_PALETTE[i % DONUT_PALETTE.length]);
    const borders     = result.slices.map((s) => s.isSelected ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.08)");
    const borderWidths= result.slices.map((s) => s.isSelected ? 3 : 1);
    chartRef.current = new Chart(canvas, {
      type: "doughnut",
      data: { labels: result.slices.map(s=>s.name), datasets: [{ data: result.slices.map(s=>s.value), backgroundColor: colors, borderColor: borders, borderWidth: borderWidths, hoverOffset: 10 }] },
      options: { responsive:true, maintainAspectRatio:false, cutout:"64%",
        plugins: { legend:{display:false}, tooltip:{ rtl:true, bodyFont:{family:"Cairo",size:12}, titleFont:{family:"Cairo",size:13,weight:"700"},
          callbacks:{ label(c){ const val=c.parsed; const pct=result.total>0?((val/result.total)*100).toFixed(1):0; return ` ${fmtVal(val)} ${UNIT_LABELS[unit]||""}  (${pct}%)`; } } } } },
    });
    return () => { destroyChart(chartRef); };
  }, [selectedCountry, year, mineralFilter, unit, scope]);

  const result = getComparisonData(selectedCountry, year, mineralFilter, unit, scope);
  const selectedSlice = result?.slices.find(s=>s.isSelected);
  const selectedPct   = result && selectedSlice ? ((selectedSlice.value/result.total)*100).toFixed(1) : null;

  return (
    <Card>
      <CardHeader title="مقارنة الإنتاج" subtitle={`حصة الدولة مقارنةً بـ${scope==="arab"?"الدول العربية":"دول العالم"} — سنة ${year}`}>
        <div className="flex rounded-full overflow-hidden" style={{ border:"1px solid rgba(201,168,76,0.25)" }}>
          {[{key:"arab",label:"الدول العربية"},{key:"world",label:"العالم"}].map(({key,label})=>(
            <button key={key} type="button" onClick={()=>setScope(key)}
              className="px-4 py-1.5 text-[11px] font-bold transition-all duration-200"
              style={scope===key?{background:"linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)",color:"#082721"}:{background:"transparent",color:"rgba(255,255,255,0.4)"}}>
              {label}
            </button>
          ))}
        </div>
        <YearPills selectedYear={year} onYearChange={onYearChange} />
      </CardHeader>

      {noData||!result ? (
        <div className="h-[300px] flex flex-col items-center justify-center gap-3">
          <p className="text-[13px] font-semibold" style={{ color:"rgba(255,255,255,0.25)" }}>لا توجد بيانات لسنة {year}</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div style={{ position:"relative", width:"260px", height:"260px", flexShrink:0 }}>
            <canvas ref={canvasRef} width={260} height={260} style={{ display:"block" }} />
            {selectedPct!==null && (
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                <span className="text-[30px] font-black leading-none" style={{ color:"#C9A84C" }}>{selectedPct}%</span>
                <span className="text-[10px] font-bold mt-1 text-center px-4 leading-snug" style={{ color:"rgba(255,255,255,0.35)" }}>
                  {scope==="arab"?"من الإنتاج العربي":"من الإنتاج العالمي"}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 w-full min-w-0">
            {selectedSlice && (
              <div className="rounded-xl px-4 py-3 mb-4" style={{ background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.25)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-black flex items-center gap-2" style={{ color:"#C9A84C" }}>
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background:"#C9A84C" }} />{selectedSlice.name}
                  </span>
                  <span className="text-[15px] font-black" style={{ color:"#C9A84C" }}>{selectedPct}%</span>
                </div>
                <p className="text-[10px] mt-1 font-mono" style={{ color:"rgba(201,168,76,0.45)" }}>{fmtVal(selectedSlice.value)} {UNIT_LABELS[unit]||""}</p>
              </div>
            )}
            <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight:200, scrollbarWidth:"thin", scrollbarColor:"rgba(201,168,76,0.2) transparent" }}>
              {result.slices.filter(s=>!s.isSelected).map((s)=>{
                const pct=result.total>0?(s.value/result.total)*100:0;
                const idx=result.slices.findIndex(x=>x.name===s.name);
                const color=DONUT_PALETTE[idx%DONUT_PALETTE.length];
                return (
                  <div key={s.name} className="rounded-xl px-3 py-2" style={{ background:"rgba(255,255,255,0.025)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold flex items-center gap-1.5 truncate" style={{ color }}>
                        <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background:color }} />{s.name}
                      </span>
                      <span className="text-[11px] font-bold flex-shrink-0 ml-2" style={{ color:"rgba(255,255,255,0.45)" }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-0.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full" style={{ width:`${pct}%`, background:color }} />
                    </div>
                    <p className="text-[9px] mt-0.5 font-mono" style={{ color:"rgba(255,255,255,0.22)" }}>{fmtVal(s.value)} {UNIT_LABELS[unit]||""}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 rounded-xl px-4 py-2 flex items-center justify-between" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.25)" }}>الإجمالي</span>
              <span className="text-[13px] font-black" style={{ color:"rgba(255,255,255,0.6)" }}>{fmtVal(result.total)} {UNIT_LABELS[unit]||""}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// ── Line chart ─────────────────────────────────────────────────────────────────
const CountryLineChart = ({ country, mineralFilter=null, unit="ton" }) => {
  const wrapperRef = useRef(null);

  const canvasRef = useChartInit((canvas) => {
    const { years, chartData } = getCountryMineralData(country, mineralFilter, unit);
    const palette = ["#C9A84C","#10b981","#3b82f6","#f59e0b","#8b5cf6","#ef4444","#06b6d4"];
    const datasets = chartData.filter(e=>e.values.some(v=>v!==null)).map((entry,i)=>({
      label: entry.mineral, data: entry.values,
      borderColor: palette[i%palette.length], backgroundColor: palette[i%palette.length]+"18",
      borderWidth:2, spanGaps:true, tension:0.35, pointRadius:3, pointHoverRadius:5,
    }));
    if (datasets.length===0) return null;
    return new Chart(canvas, {
      type:"line", data:{ labels:years, datasets },
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{position:"bottom",labels:{font:{family:"Cairo",size:11},boxWidth:10,color:"rgba(255,255,255,0.6)",padding:16}}, tooltip:{callbacks:{label:(c)=>` ${c.dataset.label}: ${c.parsed.y??0} ${UNIT_LABELS[unit]||""}`}} },
        scales:{ x:{grid:{display:false},border:{display:false},ticks:{font:{family:"Cairo",weight:"700"},color:"rgba(255,255,255,0.5)"}}, y:{beginAtZero:true,grid:{color:"rgba(255,255,255,0.05)"},border:{display:false},ticks:{font:{family:"Cairo"},color:"rgba(255,255,255,0.5)",callback:(v)=>v>=1e6?`${v/1e6}M`:v>=1000?`${v/1000}K`:v}} },
      },
    });
  }, [country, mineralFilter, unit]);

  return (
    <Card>
      <CardHeader title="تطوّر الإنتاج التعديني" subtitle={`${country} — جميع السنوات`} />
      <div ref={wrapperRef} style={{ position:"relative", height:"320px", width:"100%" }}>
        <canvas ref={canvasRef} style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%" }} />
      </div>
    </Card>
  );
};

// ── Bar chart ──────────────────────────────────────────────────────────────────
const CountryBarChart = ({ country, mineralFilter=null, unit="ton", selectedYear, onYearChange }) => {
  const [noData, setNoData] = useState(false);
  const slices = getMineralShareForYear(country, selectedYear, mineralFilter, unit).sort((a,b)=>b.value-a.value);
  const total  = slices.reduce((s,d)=>s+d.value, 0);

  const canvasRef = useChartInit((canvas) => {
    if (slices.length===0) { setNoData(true); return null; }
    setNoData(false);
    const colors = slices.map((_,i)=>{ const t=i/Math.max(slices.length-1,1); return `rgb(${Math.round(201+(16-201)*t)},${Math.round(168+(185-168)*t)},${Math.round(76+(129-76)*t)})`; });
    return new Chart(canvas, {
      type:"bar",
      data:{ labels:slices.map(d=>d.mineral), datasets:[{ label:`الإنتاج — ${selectedYear}`, data:slices.map(d=>d.value), backgroundColor:colors, borderColor:colors, borderWidth:0, borderRadius:6, borderSkipped:false }] },
      options:{ indexAxis:"y", responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false}, tooltip:{rtl:true,bodyFont:{family:"Cairo"},callbacks:{label:(c)=>{ const e=slices[c.dataIndex]; const pct=total>0?((e.value/total)*100).toFixed(1):0; const fmt=e.value>=1e6?`${(e.value/1e6).toFixed(2)} M`:e.value>=1000?`${(e.value/1000).toFixed(1)} K`:e.value; return ` ${fmt} ${e.unit}  (${pct}%)`; }}} },
        scales:{ x:{beginAtZero:true,grid:{color:"rgba(255,255,255,0.05)"},border:{display:false},ticks:{color:"rgba(255,255,255,0.4)",font:{family:"Cairo",size:11},callback:(v)=>v>=1e6?`${v/1e6}M`:v>=1000?`${v/1000}K`:v}}, y:{grid:{display:false},border:{display:false},ticks:{color:"rgba(255,255,255,0.75)",font:{family:"Cairo",size:12,weight:"700"}}} },
      },
    });
  }, [country, selectedYear, mineralFilter, unit]);

  const barH = Math.max(slices.length*44+40, 200);

  return (
    <Card>
      <CardHeader title="حصص الخامات حسب الحجم" subtitle={`${country} — سنة ${selectedYear}`}>
        <YearPills selectedYear={selectedYear} onYearChange={onYearChange} />
      </CardHeader>
      {noData ? (
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-[13px] font-semibold" style={{ color:"rgba(255,255,255,0.25)" }}>لا توجد بيانات لسنة {selectedYear}</p>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1" style={{ position:"relative", height:`${barH}px` }}>
            <canvas ref={canvasRef} style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%" }} />
          </div>
          <div className="xl:w-60 flex-shrink-0">
            <div className="rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between" style={{ background:"rgba(201,168,76,0.07)", border:"1px solid rgba(201,168,76,0.18)" }}>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color:"rgba(201,168,76,0.6)" }}>المجموع</span>
              <span className="text-[15px] font-black" style={{ color:"#C9A84C" }}>{fmtVal(total)}</span>
            </div>
            <div className="space-y-1.5">
              {slices.map((d,i)=>{
                const pct=total>0?(d.value/total)*100:0;
                const t=i/Math.max(slices.length-1,1);
                const color=`rgb(${Math.round(201+(16-201)*t)},${Math.round(168+(185-168)*t)},${Math.round(76+(129-76)*t)})`;
                return (
                  <div key={d.mineral} className="rounded-xl px-3 py-2" style={{ background:"rgba(255,255,255,0.025)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold" style={{ color }}>{d.mineral}</span>
                      <span className="text-[11px] font-bold" style={{ color:"#C9A84C" }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-0.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.07)" }}>
                      <div className="h-full rounded-full" style={{ width:`${pct}%`, background:color }} />
                    </div>
                    <p className="text-[9px] mt-1 font-mono" style={{ color:"rgba(255,255,255,0.28)" }}>{fmtVal(d.value)} {d.unit}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// ── Treemap ────────────────────────────────────────────────────────────────────
const MineralTreemap = ({ country, year, unit="ton", onYearChange }) => {
  const [noData, setNoData] = useState(false);
  const treeData = getMineralTreemapData(country, year, unit).sort((a, b) => b.value - a.value);

  const canvasRef = useChartInit((canvas) => {
    if (treeData.length===0) { setNoData(true); return null; }
    setNoData(false);
    const sorted = [...treeData].sort((a,b)=>b.value-a.value);
    const colorMap = {};
    sorted.forEach((d,i)=>{ const hue=160-(i/Math.max(sorted.length-1,1))*100; colorMap[d.mineral]=`hsl(${hue},60%,38%)`; });
    return new Chart(canvas, {
      type:"treemap",
      data:{ datasets:[{ label:"المعادن", tree:treeData, key:"value", groups:["mineral"],
        borderColor:"rgba(255,255,255,0.15)", borderWidth:1, spacing:2,
        backgroundColor(ctx){ const raw=ctx.raw; if(!raw) return"#10b981"; const d=raw._data||raw; return colorMap[d.mineral]||"#10b981"; },
        labels:{ display:true, align:"center", position:"middle",
          formatter(ctx){ const raw=ctx.raw; if(!raw) return""; const d=raw._data||raw; return[`${d.mineral||""}`,`${d.pct!=null?d.pct.toFixed(1):""}%`]; },
          color:"rgba(255,255,255,0.88)", font:[{family:"Cairo",size:11,weight:"700"},{family:"Cairo",size:10}],
        },
      }] },
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false}, tooltip:{callbacks:{
          title(items){ const raw=items[0]?.raw; const d=raw?._data||raw; return d?.mineral||""; },
          label(item){ const raw=item.raw; const d=raw?._data||raw; const pct=d?.pct!=null?d.pct.toFixed(1):"—"; const val=d?.rawValue!=null?fmtVal(d.rawValue):"—"; return[`${pct}% من الإنتاج`,`${val} ${d?.unit||""}`]; },
        }}},
      },
    });
  }, [country, year, unit]);

  return (
    <Card>
      <CardHeader title="توزيع المعادن حسب النسبة" subtitle={`${country} — ${year}`}>
        <YearPills selectedYear={year} onYearChange={onYearChange} />
      </CardHeader>
      {noData ? (
        <div className="h-[320px] flex items-center justify-center">
          <p className="text-[13px] font-semibold" style={{ color:"rgba(255,255,255,0.25)" }}>لا توجد بيانات</p>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1" style={{ position:"relative", height:"320px", minWidth:0 }}>
            <canvas ref={canvasRef} style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%" }} />
          </div>
          <div className="xl:w-64 flex-shrink-0 space-y-2">
            {treeData.map((item, index) => {
              const hue = 160 - (index / Math.max(treeData.length - 1, 1)) * 100;
              const color = `hsl(${hue},60%,38%)`;
              return (
                <div key={item.mineral} className="rounded-xl px-3 py-2" style={{ background:"rgba(255,255,255,0.025)" }}>
                  <div className="flex items-center justify-between mb-1 gap-3">
                    <span className="text-[11px] font-bold flex items-center gap-1.5 min-w-0" style={{ color }}>
                      <span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background:color }} />
                      <span className="truncate">{item.mineral}</span>
                    </span>
                    <span className="text-[11px] font-black flex-shrink-0" style={{ color:"#C9A84C" }}>{item.pct.toFixed(1)}%</span>
                  </div>
                  <p className="text-[9px] font-mono" style={{ color:"rgba(255,255,255,0.28)" }}>{fmtVal(item.rawValue)} {item.unit}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

const CountryTradeChart = ({ title, country, series, color }) => {
  const canvasRef = useChartInit((canvas) => {
    if (!series || series.length === 0) return null;

    return new Chart(canvas, {
      type: "line",
      data: {
        labels: series.map((d) => d.year),
        datasets: [
          {
            label: title,
            data: series.map((d) => d.value),
            borderColor: color,
            backgroundColor: `${color}26`,
            fill: true,
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            rtl: true,
            bodyFont: { family: "Cairo", size: 12 },
            titleFont: { family: "Cairo", size: 13, weight: "700" },
            callbacks: {
              label(context) {
                const v = context.parsed.y || 0;
                return ` ${v.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} $`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: "rgba(255,255,255,0.5)",
              font: { family: "Cairo", size: 11, weight: "700" },
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(255,255,255,0.06)" },
            border: { display: false },
            ticks: {
              color: "rgba(255,255,255,0.5)",
              font: { family: "Cairo", size: 11 },
              callback: (v) => {
                if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
                if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
                return v;
              },
            },
          },
        },
      },
    });
  }, [series, title, color]);

  return (
    <Card>
      <CardHeader title={title} subtitle={`${country} — القيمة بالدولار الأمريكي`} />
      {series && series.length > 0 ? (
        <div style={{ position: "relative", height: "280px", width: "100%" }}>
          <canvas
            ref={canvasRef}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          />
        </div>
      ) : (
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.25)" }}>
            لا توجد بيانات
          </p>
        </div>
      )}
    </Card>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────
const Countries = () => {
  const query = typeof window!=="undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const initialCountryCode = query.get("country");
  const initialSelected    = initialCountryCode ? (COUNTRIES.find(c=>c.code===initialCountryCode)?.name??"—") : "—";

  const lastAvailableYear = ALL_YEARS[ALL_YEARS.length - 1];

  const [selected, setSelected]               = useState(initialSelected);
  const [donutYear, setDonutYear]             = useState(lastAvailableYear);
  const [barYear, setBarYear]                 = useState(lastAvailableYear);
  const [treemapYear, setTreemapYear]         = useState(lastAvailableYear);
  const [tradeByCountry, setTradeByCountry]   = useState({ imports: null, exports: null });

  const selectedCountryObj = COUNTRIES.find(c=>c.name===selected);
  const selectedCountryCsvName = COUNTRY_AR_TO_CSV_NAME[selected] || null;

  useEffect(() => {
    let active = true;

    const combinedTradeUrl = new URL("../assets/Trade_Critical_Minerals_Morocco.txt", import.meta.url);

    fetch(combinedTradeUrl)
      .then((r) => {
        if (!r.ok) throw new Error("Missing user trade data");
        return r.text();
      })
      .then((combinedText) => {
        if (!active) return;
        setTradeByCountry({
          imports: buildTradeTotalsFromRawText(combinedText, "Import"),
          exports: buildTradeTotalsFromRawText(combinedText, "Export"),
        });
      })
      .catch(() => {
        if (!active) return;
        setTradeByCountry({ imports: {}, exports: {} });
      });

    return () => {
      active = false;
    };
  }, []);

  const importSeries = selectedCountryCsvName
    ? toTradeSeries(tradeByCountry.imports, selectedCountryCsvName)
    : [];
  const exportSeries = selectedCountryCsvName
    ? toTradeSeries(tradeByCountry.exports, selectedCountryCsvName)
    : [];

  return (
    <div dir="rtl" className="min-h-screen" style={{ background:"white", fontFamily:"'Cairo',system-ui,sans-serif" }}>
      <Menu />

      <header className="pt-14 pb-20 -mb-10 text-center relative overflow-hidden"
        style={{ background:"#082721", clipPath:"polygon(0 0,100% 0,100% 82%,0% 100%)" }}>
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-widest"
               style={{ background:"rgba(201,168,76,0.12)", color:"#C9A84C", border:"1px solid rgba(201,168,76,0.25)" }}>
            الإنتاج التعديني العربي
          </div>
          <h1 className="text-3xl font-black text-white">ملفات الدول</h1>
          <p className="text-sm text-slate-200 mt-2">اختر دولة لعرض بياناتها التعدينية</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 space-y-6">

        <section className="rounded-2xl p-5 sm:p-7"
          style={{ background:"#ffffff", border:"1px solid rgba(0,0,0,0.08)", boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h5 className="m-0 text-base font-bold text-slate-800">الدول العربية</h5>
              <p className="mt-0.5 text-sm text-slate-400">اختر دولة للوصول إلى ملفها التعديني</p>
            </div>
            <a href="countries.html" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721] shadow-sm ring-1 ring-[#082721]/20 hover:bg-slate-50 transition-colors">
              <ArrowLeft size={14} strokeWidth={2.4} /><span>المزيد</span>
            </a>
          </div>
          <div className="grid gap-y-5 gap-x-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {COUNTRIES.map((c) => (
              <button key={c.code} type="button" onClick={()=>setSelected(c.name)}
                      className="group flex flex-col items-center text-center transition-transform hover:-translate-y-1 focus:outline-none">
                <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-50 transition-all"
                  style={{ boxShadow:selected===c.name?"0 0 0 2px #C9A84C,0 4px 12px rgba(201,168,76,0.25)":"0 1px 4px rgba(0,0,0,0.08)" }}>
                  <img src={countryFlags[c.code]} alt={c.name} loading="lazy" decoding="async" style={{ ...FLAG_IMAGE_STYLE, padding:"2px", background:"#f8fafc" }} />
                  {selected===c.name && <div className="absolute inset-0 rounded-lg" style={{ background:"rgba(201,168,76,0.08)" }} />}
                </div>
                <p className={`mt-1.5 text-[11px] font-bold leading-tight transition-colors ${selected===c.name?"text-[#C9A84C]":"text-slate-600 group-hover:text-[#082721]"}`}>
                  {c.name}
                </p>
              </button>
            ))}
          </div>
          {selected&&selected!=="—"&&(
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
              <span className="text-sm text-slate-400">الدولة المختارة:</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-900 border border-emerald-100">
                {selectedCountryObj&&countryFlags[selectedCountryObj.code]&&(
                  <img src={countryFlags[selectedCountryObj.code]} alt="" decoding="async" className="h-5 w-7 object-contain rounded-sm" />
                )}
                {selected}
              </span>
            </div>
          )}
        </section>

        {selected!=="—"&&(
          <div className="space-y-5">
            {selectedCountryObj&&<CountryHeroBanner country={selected} countryCode={selectedCountryObj.code} />}

            <ChartSectionTitle title="المؤشرات التعدينية" />
            <CountryComparisonDonut key={`donut-${selected}`} selectedCountry={selected} year={donutYear} onYearChange={setDonutYear} />

            <CountryLineChart key={`line-${selected}`} country={selected} />

            <CountryBarChart key={`bar-${selected}`} country={selected} selectedYear={barYear} onYearChange={setBarYear} />

            <MineralTreemap key={`tree-${selected}`} country={selected} year={treemapYear} onYearChange={setTreemapYear} />

            <ChartSectionTitle title="الصادرات والواردات حسب الدولة" />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <CountryTradeChart
                key={`export-${selected}`}
                title="الصادرات"
                country={selected}
                series={exportSeries}
                color="#f59e0b"
              />
              <CountryTradeChart
                key={`import-${selected}`}
                title="الواردات"
                country={selected}
                series={importSeries}
                color="#3b82f6"
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Countries;