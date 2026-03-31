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
const MINERAL_FILTER_OPTIONS = [
  { value: "all", label: "كل الخامات" },
  ...Object.keys(dataByMineral).map((mineral) => ({ value: mineral, label: mineral })),
];

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

const buildTradeByCountryYearMineralFromRawText = (rawText, expectedType) => {
  const lines = String(rawText || "").split(/\r?\n/);
  const result = {};
  const expectedFlow = normalizeFlow(expectedType);

  let idx = {
    reporter: -1,
    flow: -1,
    year: -1,
    value: -1,
    quantity: -1,
    units: -1,
    mineral: -1,
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
        mineral: normalized.indexOf("aggregate_product"),
      };
      continue;
    }

    const flowRaw = idx.flow !== -1 ? cols[idx.flow] : cols[2];
    const flowValue = normalizeFlow(flowRaw);
    if (!flowValue.startsWith(expectedFlow)) continue;

    const reporter = idx.reporter !== -1 ? cols[idx.reporter] : cols[0];
    const yearRaw = idx.year !== -1 ? cols[idx.year] : cols[6];
    const mineral = idx.mineral !== -1 ? cols[idx.mineral] : "غير مصنف";
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

    if (!result[reporter]) result[reporter] = {};
    if (!result[reporter][year]) result[reporter][year] = {};
    result[reporter][year][mineral] = (result[reporter][year][mineral] || 0) + value;
  }

  return result;
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
  const selectedRank = sorted.findIndex(([name]) => name === selectedCountry) + 1;
  const leaderName = sorted[0]?.[0] || null;
  const leaderValue = sorted[0]?.[1] || 0;
  const leaderGap = Math.max(leaderValue - selectedValue, 0);

  const others = sorted.filter(([name]) => name !== selectedCountry);
  const topOthers = others.slice(0, 8);
  const restValue = others.slice(8).reduce((s, [, v]) => s + v, 0);
  const slices = [];
  if (selectedValue > 0) slices.push({ name: selectedCountry, value: selectedValue, isSelected: true });
  topOthers.forEach(([name, value]) => slices.push({ name, value, isSelected: false }));
  if (restValue > 0) slices.push({ name: "أخرى", value: restValue, isSelected: false });
  const total = slices.reduce((s, d) => s + d.value, 0);

  return {
    slices,
    total,
    selectedValue,
    selectedRank: selectedRank > 0 ? selectedRank : null,
    leaderName,
    leaderValue,
    leaderGap,
    countriesCount: sorted.length,
    topCountries: sorted.slice(0, 3).map(([name, value]) => ({
      name,
      value,
      pct: total > 0 ? (value / total) * 100 : 0,
    })),
  };
};

const destroyChart = (ref) => { if (ref.current) { ref.current.destroy(); ref.current = null; } };

const fmtVal = (v) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toFixed(2);
};

const DONUT_PALETTE = ["#10b981","#3b82f6","#f59e0b","#8b5cf6","#ef4444","#06b6d4","#84cc16","#f97316","#ec4899","#64748b","#a78bfa","#fb923c"];

const COUNTRY_THEME_PRESETS = {
  atlas: {
    shellBg: "radial-gradient(circle at top right, rgba(201,168,76,0.18), transparent 28%), linear-gradient(160deg, #f7f4ea 0%, #eef5ef 45%, #e3ede4 100%)",
    shellBorder: "rgba(22, 101, 52, 0.14)",
    shellShadow: "0 24px 60px rgba(8,39,33,0.08)",
    cardBg: "linear-gradient(160deg,#18473e 0%,#0d342b 58%,#08211c 100%)",
    cardBorder: "rgba(201,168,76,0.24)",
    cardShadow: "0 10px 30px rgba(7,30,26,0.24), inset 0 1px 0 rgba(255,255,255,0.05)",
    titleBg: "linear-gradient(145deg,#0b2a24 0%,#11463a 45%,#0d362d 100%)",
    heroBg: "linear-gradient(135deg,#0f3c32 0%,#1e5d44 42%,#123228 100%)",
    heroGlow: "radial-gradient(circle at 82% 50%, rgba(201,168,76,0.18) 0%, transparent 68%)",
  },
  gulf: {
    shellBg: "radial-gradient(circle at top left, rgba(23, 162, 184, 0.12), transparent 30%), linear-gradient(160deg, #eef6f7 0%, #eff7f0 45%, #e7efe8 100%)",
    shellBorder: "rgba(8, 120, 110, 0.14)",
    shellShadow: "0 24px 60px rgba(3,37,46,0.08)",
    cardBg: "linear-gradient(160deg,#0e4250 0%,#0b3340 52%,#08252f 100%)",
    cardBorder: "rgba(157, 210, 194, 0.28)",
    cardShadow: "0 10px 30px rgba(7,25,33,0.24), inset 0 1px 0 rgba(255,255,255,0.05)",
    titleBg: "linear-gradient(145deg,#0b2633 0%,#114155 45%,#0d3140 100%)",
    heroBg: "linear-gradient(135deg,#0e3c48 0%,#17616b 40%,#12333c 100%)",
    heroGlow: "radial-gradient(circle at 82% 50%, rgba(157,210,194,0.22) 0%, transparent 68%)",
  },
  nile: {
    shellBg: "radial-gradient(circle at top right, rgba(217, 119, 6, 0.14), transparent 26%), linear-gradient(160deg, #faf4ea 0%, #f3f1e8 48%, #ece6db 100%)",
    shellBorder: "rgba(146, 64, 14, 0.14)",
    shellShadow: "0 24px 60px rgba(58,33,8,0.08)",
    cardBg: "linear-gradient(160deg,#4a371f 0%,#2f2416 56%,#1f180f 100%)",
    cardBorder: "rgba(245, 158, 11, 0.24)",
    cardShadow: "0 10px 30px rgba(45,26,7,0.24), inset 0 1px 0 rgba(255,255,255,0.05)",
    titleBg: "linear-gradient(145deg,#2f2417 0%,#5a4323 42%,#392b18 100%)",
    heroBg: "linear-gradient(135deg,#4f391d 0%,#795223 38%,#3d2a17 100%)",
    heroGlow: "radial-gradient(circle at 82% 50%, rgba(245,158,11,0.20) 0%, transparent 68%)",
  },
  levant: {
    shellBg: "radial-gradient(circle at top right, rgba(185, 28, 28, 0.10), transparent 30%), linear-gradient(160deg, #f7f0ef 0%, #f2f4f5 48%, #ebeef0 100%)",
    shellBorder: "rgba(127, 29, 29, 0.14)",
    shellShadow: "0 24px 60px rgba(39,19,24,0.08)",
    cardBg: "linear-gradient(160deg,#4a1f28 0%,#341922 54%,#1f1117 100%)",
    cardBorder: "rgba(248, 113, 113, 0.24)",
    cardShadow: "0 10px 30px rgba(30,10,15,0.24), inset 0 1px 0 rgba(255,255,255,0.05)",
    titleBg: "linear-gradient(145deg,#311620 0%,#5a2433 46%,#391823 100%)",
    heroBg: "linear-gradient(135deg,#4d2029 0%,#702d3b 40%,#34151d 100%)",
    heroGlow: "radial-gradient(circle at 82% 50%, rgba(248,113,113,0.18) 0%, transparent 68%)",
  },
  coast: {
    shellBg: "radial-gradient(circle at top left, rgba(37, 99, 235, 0.10), transparent 30%), linear-gradient(160deg, #eef5fb 0%, #edf6f5 45%, #e5eef0 100%)",
    shellBorder: "rgba(14, 116, 144, 0.14)",
    shellShadow: "0 24px 60px rgba(15,39,63,0.08)",
    cardBg: "linear-gradient(160deg,#103a54 0%,#0d2d40 52%,#081e2e 100%)",
    cardBorder: "rgba(125, 211, 252, 0.24)",
    cardShadow: "0 10px 30px rgba(8,28,45,0.24), inset 0 1px 0 rgba(255,255,255,0.05)",
    titleBg: "linear-gradient(145deg,#0c283d 0%,#144965 44%,#0d3348 100%)",
    heroBg: "linear-gradient(135deg,#123a51 0%,#1d5875 38%,#112f43 100%)",
    heroGlow: "radial-gradient(circle at 82% 50%, rgba(125,211,252,0.18) 0%, transparent 68%)",
  },
};

const COUNTRY_THEME_BY_CODE = {
  ma: "atlas",
  dz: "atlas",
  tn: "atlas",
  mr: "atlas",
  ae: "gulf",
  bh: "gulf",
  sa: "gulf",
  qa: "gulf",
  kw: "gulf",
  om: "gulf",
  eg: "nile",
  sd: "nile",
  jo: "levant",
  ps: "levant",
  lb: "levant",
  sy: "levant",
  iq: "levant",
  dj: "coast",
  so: "coast",
  ye: "coast",
  ly: "coast",
};

const getCountryTheme = (countryCode) => {
  const presetKey = COUNTRY_THEME_BY_CODE[countryCode] || "atlas";
  return COUNTRY_THEME_PRESETS[presetKey];
};

const MOROCCO_SNAPSHOT_2023 = {
  year: 2023,
  production: {
    totalText: "83.8 مليون طن",
    countText: "14 منتج / خام",
    topMineral: "الفوسفات",
    topValueText: "35.62 مليون طن",
  },
  tradeBalance: {
    valueText: "—",
    statusText: "—",
    tone: "neutral",
  },
  exports: {
    totalText: "473.9 مليون دولار",
    countText: "21 معدن",
    topMineral: "الفضة",
    growthText: "3.52 %",
    growthSubtext: "مقارنة بـ 2022",
    marketsText: "108 سوق",
    concentrationText: "46.8 %",
  },
  imports: {
    totalText: "952.9 مليون دولار",
    countText: "22 معدن",
    topMineral: "الألمنيوم",
    growthText: "-5.1 %",
    growthSubtext: "مقارنة بـ 2022",
    marketsText: "100 سوق",
    concentrationText: "34.7 %",
  },
};

const formatLargeTonValue = (value) => {
  if (value == null) return "—";
  if (value >= 1000) return `${(value / 1000).toFixed(2)} مليون طن`;
  return `${fmtVal(value)} ألف طن`;
};

const formatDollarValue = (value) => {
  if (value == null) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} مليون دولار`;
  return `${fmtVal(value)} دولار`;
};

const formatGrowthPercent = (value) => {
  if (value == null) return "—";
  return `${value.toFixed(2)} %`;
};

const getTopMineralEntry = (byMineral) =>
  Object.entries(byMineral || {}).sort(([, a], [, b]) => b - a)[0] || null;

const buildCountrySnapshot = ({
  country,
  countryCode,
  year,
  exportSeries,
  importSeries,
  exportBreakdownByYear,
  importBreakdownByYear,
}) => {
  if (countryCode === "ma" && year === 2023) {
    return MOROCCO_SNAPSHOT_2023;
  }

  const productionRows = getMineralShareForYear(country, year, null, "ton");
  const productionTotal = productionRows.reduce((sum, row) => sum + (row.value || 0), 0);
  const topProduction = [...productionRows].sort((a, b) => b.value - a.value)[0] || null;

  const exportsMap = new Map((exportSeries || []).map((entry) => [entry.year, entry.value]));
  const importsMap = new Map((importSeries || []).map((entry) => [entry.year, entry.value]));
  const exportValue = exportsMap.get(year) ?? null;
  const importValue = importsMap.get(year) ?? null;
  const previousExportValue = exportsMap.get(year - 1) ?? null;
  const previousImportValue = importsMap.get(year - 1) ?? null;
  const exportGrowth =
    exportValue != null && previousExportValue && previousExportValue > 0
      ? ((exportValue - previousExportValue) / previousExportValue) * 100
      : null;
  const importGrowth =
    importValue != null && previousImportValue && previousImportValue > 0
      ? ((importValue - previousImportValue) / previousImportValue) * 100
      : null;

  const exportsByMineral = exportBreakdownByYear?.[year] || {};
  const importsByMineral = importBreakdownByYear?.[year] || {};
  const topExport = getTopMineralEntry(exportsByMineral);
  const topImport = getTopMineralEntry(importsByMineral);
  const exportConcentration = topExport && exportValue ? (topExport[1] / exportValue) * 100 : null;
  const importConcentration = topImport && importValue ? (topImport[1] / importValue) * 100 : null;
  const tradeBalance =
    exportValue != null && importValue != null ? exportValue - importValue : null;

  return {
    year,
    production: {
      totalText: formatLargeTonValue(productionTotal),
      countText: productionRows.length ? `${productionRows.length} منتج / خام` : "—",
      topMineral: topProduction?.mineral || "—",
      topValueText: topProduction ? formatLargeTonValue(topProduction.value) : "—",
    },
    tradeBalance: {
      valueText: tradeBalance == null ? "—" : `${tradeBalance >= 0 ? "+" : "-"} ${formatDollarValue(Math.abs(tradeBalance))}`,
      statusText:
        tradeBalance == null ? "لا توجد بيانات" : tradeBalance > 0 ? "فائض تجاري" : tradeBalance < 0 ? "عجز تجاري" : "توازن تجاري",
      tone: tradeBalance == null ? "neutral" : tradeBalance >= 0 ? "positive" : "negative",
    },
    exports: {
      totalText: formatDollarValue(exportValue),
      countText: Object.keys(exportsByMineral).length ? `${Object.keys(exportsByMineral).length} معدن` : "—",
      topMineral: topExport?.[0] || "—",
      growthText: formatGrowthPercent(exportGrowth),
      growthSubtext: previousExportValue != null ? `مقارنة بـ ${year - 1}` : "لا توجد سنة مقارنة",
      marketsText: "—",
      concentrationText: exportConcentration != null ? `${exportConcentration.toFixed(1)} %` : "—",
    },
    imports: {
      totalText: formatDollarValue(importValue),
      countText: Object.keys(importsByMineral).length ? `${Object.keys(importsByMineral).length} معدن` : "—",
      topMineral: topImport?.[0] || "—",
      growthText: formatGrowthPercent(importGrowth),
      growthSubtext: previousImportValue != null ? `مقارنة بـ ${year - 1}` : "لا توجد سنة مقارنة",
      marketsText: "—",
      concentrationText: importConcentration != null ? `${importConcentration.toFixed(1)} %` : "—",
    },
  };
};

const SnapshotStatCard = ({
  title,
  value,
  note,
  borderColor = "rgba(201,168,76,0.9)",
  bgColor = "#ffffff",
  dark = false,
  noBorder = false,
  className = "",
  valueClassName = "",
}) => (
  <div
    className={`rounded-[18px] px-4 py-4 text-center ${className}`}
    style={{ backgroundColor: bgColor, border: noBorder ? "none" : `2px solid ${borderColor}`, boxShadow: "0 4px 12px rgba(15,23,42,0.06)" }}
  >
    <p className="text-[16px] font-bold" style={{ color: "#d4a017" }}>{title}</p>
    <p className={`mt-2 text-[25px] font-black leading-tight ${dark ? "text-white" : "text-slate-900"} ${valueClassName}`}>{value}</p>
    {note ? <p className="mt-1 text-[13px] font-semibold" style={{ color: "#d4a017" }}>{note}</p> : null}
  </div>
);

const SnapshotSectionHeader = ({ title, featured = false }) => (
  <div
    className={featured ? "mb-3 rounded-[13px] px-4 py-3 text-center" : "mb-3 rounded-sm border bg-[#f2f2f2] px-4 py-1 text-center text-[18px] font-black text-slate-800"}
    style={featured
      ? {
          background: "var(--country-title-bg, linear-gradient(145deg,#071e1a 0%,#082721 40%,#0a2f28 70%,#071e1a 100%))",
          boxShadow: "0 18px 40px rgba(8,39,33,0.18), inset 0 0 0 1px rgba(201,168,76,0.08)",
        }
      : { borderColor: "#a3a3a3" }}
  >
    {featured ? (
      <span
        className="text-[20px] font-black"
        style={{
          display: "inline-block",
          background: "linear-gradient(120deg,#c9a84c 0%,#f0d98a 40%,#c9a84c 60%,#8a6a1e 100%)",
          backgroundSize: "300% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "fadeUp 1s cubic-bezier(.16,1,.3,1) both, shimmerGold 6s linear infinite",
        }}
      >
        {title}
      </span>
    ) : (
      title
    )}
  </div>
);

const CountrySnapshotPanel = ({
  country,
  countryCode,
  year,
  onYearChange,
  exportSeries,
  importSeries,
  exportBreakdownByYear,
  importBreakdownByYear,
}) => {
  const summary = buildCountrySnapshot({
    country,
    countryCode,
    year,
    exportSeries,
    importSeries,
    exportBreakdownByYear,
    importBreakdownByYear,
  });
  const isMorocco = countryCode === "ma";
  const balanceColor =
    summary.tradeBalance.tone === "positive"
      ? "#16a34a"
      : summary.tradeBalance.tone === "negative"
        ? "#16a34a"
        : "#94a3b8";

  if (isMorocco) {
    return (
      <section className="rounded-[10px] bg-white p-1.5 sm:p-2" style={{ border: "1px solid #b8b8b8" }}>
        <div className="mb-2 flex items-center justify-end gap-3 px-1">
          <h3 className="text-[18px] font-black leading-none text-[#b8860b]">{country}</h3>
          <label className="flex items-center gap-2 text-[16px] font-bold text-slate-700">
            <span>اختر السنة :</span>
            <select
              value={2023}
              onChange={() => {}}
              disabled
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[16px] font-bold text-slate-800 outline-none disabled:cursor-not-allowed"
            >
              <option value={2023}>2023</option>
            </select>
          </label>
        </div>

        <SnapshotSectionHeader title="الإنتاج التعديني" featured />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SnapshotStatCard title="إجمالي الإنتاج التعديني" value={summary.production.totalText} borderColor="#d0a018" bgColor="#0e4238" dark noBorder className="min-h-[88px] px-3 py-3" valueClassName="text-[20px]" />
          <SnapshotStatCard title="عدد المنتجات التعدينية" value={summary.production.countText} borderColor="#d0a018" bgColor="#0e4238" dark noBorder className="min-h-[88px] px-3 py-3" valueClassName="text-[20px]" />
          <SnapshotStatCard title="أكبر منتج تعديني" value={summary.production.topMineral} borderColor="#d0a018" bgColor="#0e4238" dark noBorder className="min-h-[88px] px-3 py-3" valueClassName="text-[20px]" />
          <SnapshotStatCard title="قيمة أكبر منتج تعديني" value={summary.production.topValueText} borderColor="#d0a018" bgColor="#0e4238" dark noBorder className="min-h-[88px] px-3 py-3" valueClassName="text-[20px]" />
        </div>

        <div className="mt-2">
          <div>
            <div className="space-y-2">
              <div>
                <SnapshotSectionHeader title="الصادرات التعدينية" featured />
                <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
                  <SnapshotStatCard title="إجمالي الصادرات" value={summary.exports.totalText} borderColor="#d0a018" bgColor="#0e4238" dark noBorder className="min-h-[86px] px-3 py-3" valueClassName="text-[20px]" />
                  <SnapshotStatCard title="عدد المعادن المصدرة" value={summary.exports.countText} borderColor="#d0a018" bgColor="#0e4238" dark noBorder className="min-h-[86px] px-3 py-3" valueClassName="text-[20px]" />
                  <SnapshotStatCard title="أكبر معدن مصدر" value={summary.exports.topMineral} borderColor="#d0a018" bgColor="#0e4238" dark noBorder className="min-h-[86px] px-3 py-3" valueClassName="text-[20px]" />
                  <SnapshotStatCard title="معدل النمو السنوي للصادرات" value={summary.exports.growthText} note={`(${summary.exports.growthSubtext})`} borderColor="#b9b9b9" bgColor="#0e4238" dark noBorder className="min-h-[86px] px-3 py-3" valueClassName="text-[20px]" />
                  <SnapshotStatCard title="عدد الأسواق المصدرة" value={summary.exports.marketsText} borderColor="#d0a018" bgColor="#0e4238" dark noBorder className="min-h-[86px] px-3 py-3" valueClassName="text-[20px]" />
                  <SnapshotStatCard title="مؤشر تركّز الصادرات" value={summary.exports.concentrationText} borderColor="#d0a018" bgColor="#0e4238" dark noBorder className="min-h-[86px] px-3 py-3" valueClassName="text-[20px]" />
                </div>
              </div>

              <div>
                <SnapshotSectionHeader title="الواردات التعدينية" featured />
                <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
                  <SnapshotStatCard title="إجمالي الواردات" value={summary.imports.totalText} borderColor="#b9b9b9" bgColor="#0e4238" dark noBorder className="min-h-[86px] px-3 py-3" valueClassName="text-[20px]" />
                  <SnapshotStatCard title="عدد المعادن الواردة" value={summary.imports.countText} borderColor="#d0a018" bgColor="#0e4238" dark noBorder className="min-h-[86px] px-3 py-3" valueClassName="text-[20px]" />
                  <SnapshotStatCard title="أكبر معدن وارد" value={summary.imports.topMineral} borderColor="#d0a018" bgColor="#0e4238" dark noBorder className="min-h-[86px] px-3 py-3" valueClassName="text-[20px]" />
                  <SnapshotStatCard title="معدل النمو السنوي للواردات" value={summary.imports.growthText} note={`(${summary.imports.growthSubtext})`} borderColor="#b9b9b9" bgColor="#0e4238" dark noBorder className="min-h-[86px] px-3 py-3" valueClassName="text-[20px]" />
                  <SnapshotStatCard title="عدد الأسواق الواردة" value={summary.imports.marketsText} borderColor="#d0a018" bgColor="#0e4238" dark noBorder className="min-h-[86px] px-3 py-3" valueClassName="text-[20px]" />
                  <SnapshotStatCard title="مؤشر تركّز الواردات" value={summary.imports.concentrationText} borderColor="#d0a018" bgColor="#0e4238" dark noBorder className="min-h-[86px] px-3 py-3" valueClassName="text-[20px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] bg-[#f7f7f7] p-4 sm:p-5" style={{ border: "1px solid #d4d4d4" }}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-[16px] font-bold text-slate-700">
          <span>اختر السنة :</span>
          <select
            value={year}
            onChange={(e) => onYearChange?.(Number(e.target.value))}
            disabled={isMorocco}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[16px] font-bold text-slate-800 outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {(isMorocco ? [2023] : ALL_YEARS).map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </label>
      </div>

      <SnapshotSectionHeader title="الإنتاج التعديني" featured />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SnapshotStatCard title="إجمالي الإنتاج التعديني" value={summary.production.totalText} borderColor="#a3a3a3 " />
        <SnapshotStatCard title="عدد المنتجات التعدينية" value={summary.production.countText} borderColor="#d4a017" />
        <SnapshotStatCard title="أكبر منتج تعديني" value={summary.production.topMineral} borderColor="#a0522d" />
        <SnapshotStatCard title="قيمة أكبر منتج تعديني" value={summary.production.topValueText} borderColor="#16a34a" />
      </div>

      <div className="mt-5">
        <SnapshotSectionHeader title="التجارة التعدينية" featured />
        <div className="grid gap-3 xl:grid-cols-[180px_minmax(0,1fr)]">
          <div className="rounded-[22px] bg-white px-4 py-6 text-center" style={{ border: `2px solid ${balanceColor}` }}>
            <p className="text-[15px] font-bold" style={{ color: "#d4a017" }}>الميزان التجاري</p>
            <p className="text-[16px] font-bold" style={{ color: "#d4a017" }}>(الفائض / العجز)</p>
            <div className="mt-16 space-y-2">
              <p className="text-[28px] font-black text-slate-900">{summary.tradeBalance.statusText}</p>
              <p className="text-[32px] font-black leading-tight text-slate-900">{summary.tradeBalance.valueText}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <SnapshotSectionHeader title="الصادرات التعدينية" />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <SnapshotStatCard title="إجمالي الصادرات" value={summary.exports.totalText} borderColor="#a3a3a3" />
                <SnapshotStatCard title="عدد المعادن المصدرة" value={summary.exports.countText} borderColor="#d4a017" />
                <SnapshotStatCard title="أكبر معدن مصدر" value={summary.exports.topMineral} borderColor="#a0522d" />
                <SnapshotStatCard title="معدل النمو السنوي للصادرات" value={summary.exports.growthText} note={summary.exports.growthSubtext} borderColor="#a3a3a3" />
                <SnapshotStatCard title="عدد الأسواق المصدرة" value={summary.exports.marketsText} borderColor="#d4a017" />
                <SnapshotStatCard title="مؤشر تركّز الصادرات" value={summary.exports.concentrationText} borderColor="#a0522d" />
              </div>
            </div>

            <div>
              <SnapshotSectionHeader title="الواردات التعدينية" />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <SnapshotStatCard title="إجمالي الواردات" value={summary.imports.totalText} borderColor="#a3a3a3" />
                <SnapshotStatCard title="عدد المعادن الواردة" value={summary.imports.countText} borderColor="#d4a017" />
                <SnapshotStatCard title="أكبر معدن وارد" value={summary.imports.topMineral} borderColor="#a0522d" />
                <SnapshotStatCard title="معدل النمو السنوي للواردات" value={summary.imports.growthText} note={summary.imports.growthSubtext} borderColor="#a3a3a3" />
                <SnapshotStatCard title="عدد الأسواق الواردة" value={summary.imports.marketsText} borderColor="#d4a017" />
                <SnapshotStatCard title="مؤشر تركّز الواردات" value={summary.imports.concentrationText} borderColor="#a0522d" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

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
    style={{ background:"var(--country-card-bg, linear-gradient(160deg,#0e4238 0%,#082c23 60%,#051a15 100%))", border:"1px solid var(--country-card-border, rgba(201,168,76,0.20))", boxShadow:"var(--country-card-shadow, 0 4px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(201,168,76,0.08))", fontFamily:"'Cairo','Tajawal',sans-serif" }}>
    {children}
  </div>
);

const CardHeader = ({ title, subtitle, children }) => (
  <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pb-4" style={{ borderBottom:"1px solid rgba(201,168,76,0.14)" }}>
    <div className="flex items-center gap-3">
      <div className="w-0.5 h-6 rounded-full flex-shrink-0" style={{ background:"linear-gradient(180deg,#C9A84C,#7a4a00)" }} />
      <div>
        <h3 className="text-[18px] font-extrabold leading-tight" style={{ color: "#d4a017" }}>{title}</h3>
        {subtitle && <p className="text-[16px] mt-0.5" style={{ color: "#d4a017" }}>{subtitle}</p>}
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
      background: "var(--country-title-bg, linear-gradient(145deg,#071e1a 0%,#082721 40%,#0a2f28 70%,#071e1a 100%))",
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
const CountryHeroBanner = ({ country, countryCode, theme }) => {
  const flagSrc = countryFlags[countryCode];
  return (
    <div className="relative overflow-hidden rounded-2xl flex items-center gap-6 px-6 py-5"
      style={{ background:theme?.heroBg || "linear-gradient(135deg,#082c23 0%,#0d3b2e 40%,#0a3028 100%)", border:"1px solid rgba(201,168,76,0.25)", boxShadow:"0 4px 24px rgba(0,0,0,0.35),inset 0 1px 0 rgba(201,168,76,0.10)", fontFamily:"'Cairo','Tajawal',sans-serif" }}>
      <div className="absolute right-0 top-0 bottom-0 w-64 pointer-events-none"
        style={{ background:theme?.heroGlow || "radial-gradient(ellipse at 80% 50%,rgba(201,168,76,0.08) 0%,transparent 70%)" }} />
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
  const leaderPct = result && result.leaderValue ? ((result.leaderValue / result.total) * 100).toFixed(1) : null;

  return (
    <Card>
      <CardHeader title="مقارنة الإنتاج" subtitle={`انتاج الخامات بالحجم حسب السنة    ${year} `}>
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
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
  
            
          </div>
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
            <div className="flex-1 w-full min-w-0 space-y-3">
              {selectedSlice && (
                <div className="rounded-xl px-4 py-3" style={{ background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.25)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-black flex items-center gap-2" style={{ color:"#C9A84C" }}>
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background:"#C9A84C" }} />{selectedSlice.name}
                    </span>
                    <span className="text-[15px] font-black" style={{ color:"#C9A84C" }}>{selectedPct}%</span>
                  </div>
                  <p className="text-[10px] mt-1 font-mono" style={{ color:"rgba(201,168,76,0.45)" }}>{fmtVal(selectedSlice.value)} {UNIT_LABELS[unit]||""}</p>
                </div>
              )}

              <div className="rounded-xl p-3" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[11px] font-bold mb-2" style={{ color:"rgba(255,255,255,0.62)" }}>أكبر الدول إنتاجًا</p>
                <div className="space-y-2">
                  {result.topCountries.map((c, i) => (
                    <div key={`${c.name}-${i}`} className="rounded-lg px-3 py-2" style={{ background:"rgba(255,255,255,0.025)" }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold truncate" style={{ color: i===0 ? "#C9A84C" : "rgba(255,255,255,0.8)" }}>{c.name}</span>
                        <span className="text-[11px] font-bold" style={{ color:"rgba(255,255,255,0.55)" }}>{c.pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-0.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.07)" }}>
                        <div className="h-full rounded-full" style={{ width:`${Math.min(c.pct, 100)}%`, background:i===0?"#C9A84C":"rgba(255,255,255,0.45)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight:170, scrollbarWidth:"thin", scrollbarColor:"rgba(201,168,76,0.2) transparent" }}>
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
                      <p className="text-[9px] mt-0.5 font-mono" style={{ color:"rgba(255,255,255,0.22)" }}>{fmtVal(s.value)} {UNIT_LABELS[unit]||""}</p>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl px-4 py-2 flex items-center justify-between" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.25)" }}>الإجمالي</span>
                <span className="text-[13px] font-black" style={{ color:"rgba(255,255,255,0.6)" }}>{fmtVal(result.total)} {UNIT_LABELS[unit]||""}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// ── Line chart ─────────────────────────────────────────────────────────────────
const CountryLineChart = ({
  country,
  mineralFilter = "all",
  unit = "ton",
  onMineralFilterChange,
  onUnitChange,
}) => {
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
      <CardHeader
        title="تطوّر الإنتاج التعديني"
        subtitle={`${country} — جميع السنوات${mineralFilter !== "all" ? ` — ${mineralFilter}` : ""}`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUnitChange?.("ton")}
            className="rounded-full px-3 py-1 text-[11px] font-bold transition-all"
            style={
              unit === "ton"
                ? {
                    background: "linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)",
                    color: "#082721",
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(201,168,76,0.18)",
                  }
            }
          >
            ألف طن
          </button>
          <button
            type="button"
            onClick={() => onUnitChange?.("kg")}
            className="rounded-full px-3 py-1 text-[11px] font-bold transition-all"
            style={
              unit === "kg"
                ? {
                    background: "linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)",
                    color: "#082721",
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(201,168,76,0.18)",
                  }
            }
          >
            كجم
          </button>
        </div>

        <select
          value={mineralFilter || "all"}
          onChange={(e) => onMineralFilterChange?.(e.target.value)}
          className="rounded-full px-3 py-1.5 text-[11px] font-bold"
          style={{
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(201,168,76,0.24)",
            outline: "none",
          }}
        >
          {MINERAL_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ color: "#082721" }}>
              {opt.label}
            </option>
          ))}
        </select>
      </CardHeader>
      <div ref={wrapperRef} style={{ position:"relative", height:"320px", width:"100%" }}>
        <canvas ref={canvasRef} style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%" }} />
      </div>
    </Card>
  );
};

// ── Bar chart ──────────────────────────────────────────────────────────────────
const CountryBarChart = ({
  country,
  mineralFilter = "all",
  unit = "ton",
  selectedYear,
  onYearChange,
  onMineralFilterChange,
  onUnitChange,
}) => {
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
      <CardHeader title="انتاج الخامات بالحجم حسب السنة " subtitle={`${country} — سنة ${selectedYear}${mineralFilter !== "all" ? ` — ${mineralFilter}` : ""} (${UNIT_LABELS[unit]||""})`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUnitChange?.("ton")}
            className="rounded-full px-3 py-1 text-[11px] font-bold transition-all"
            style={
              unit === "ton"
                ? {
                    background: "linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)",
                    color: "#082721",
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(201,168,76,0.18)",
                  }
            }
          >
            ألف طن
          </button>
          <button
            type="button"
            onClick={() => onUnitChange?.("kg")}
            className="rounded-full px-3 py-1 text-[11px] font-bold transition-all"
            style={
              unit === "kg"
                ? {
                    background: "linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)",
                    color: "#082721",
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(201,168,76,0.18)",
                  }
            }
          >
            كجم
          </button>
        </div>

        <select
          value={mineralFilter || "all"}
          onChange={(e) => onMineralFilterChange?.(e.target.value)}
          className="rounded-full px-3 py-1.5 text-[11px] font-bold"
          style={{
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(201,168,76,0.24)",
            outline: "none",
          }}
        >
          {MINERAL_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ color: "#082721" }}>
              {opt.label}
            </option>
          ))}
        </select>
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
              <span className="text-[15px] font-black" style={{ color:"#C9A84C" }}>{fmtVal(total)} {UNIT_LABELS[unit]||""}</span>
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

const TradeIndicatorsPanel = ({ country, exportSeries, importSeries, exportBreakdownByYear }) => {
  const sortedExports = [...(exportSeries || [])].sort((a, b) => a.year - b.year);
  const latestExport = sortedExports[sortedExports.length - 1] || null;
  const prevExport = sortedExports[sortedExports.length - 2] || null;

  const growth =
    latestExport && prevExport && prevExport.value > 0
      ? ((latestExport.value - prevExport.value) / prevExport.value) * 100
      : null;

  const selectedYear = latestExport?.year || null;
  const exportsByMineral = selectedYear ? exportBreakdownByYear?.[selectedYear] || {} : {};
  const mineralRows = Object.entries(exportsByMineral).sort(([, a], [, b]) => b - a);
  const topMineral = mineralRows[0] || null;
  const totalExportForYear = latestExport?.value || 0;
  const concentration =
    topMineral && totalExportForYear > 0 ? (topMineral[1] / totalExportForYear) * 100 : null;

  const importsMap = new Map((importSeries || []).map((d) => [d.year, d.value]));
  const latestImportValue = selectedYear ? importsMap.get(selectedYear) || 0 : 0;
  const tradeBalance = selectedYear ? totalExportForYear - latestImportValue : null;

 
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
  const [barMineralFilter, setBarMineralFilter] = useState("all");
  const [barUnit, setBarUnit]                 = useState("ton");
  const [treemapYear, setTreemapYear]         = useState(lastAvailableYear);
  const [lineMineralFilter, setLineMineralFilter] = useState("all");
  const [lineUnit, setLineUnit]               = useState("ton");
  const [summaryYear, setSummaryYear]         = useState(lastAvailableYear);
  const [tradeByCountry, setTradeByCountry]   = useState({ imports: null, exports: null });
  const [tradeBreakdownByCountry, setTradeBreakdownByCountry] = useState({ exports: null, imports: null });

  const selectedCountryObj = COUNTRIES.find(c=>c.name===selected);
  const selectedCountryCsvName = COUNTRY_AR_TO_CSV_NAME[selected] || null;
  const selectedTheme = getCountryTheme(selectedCountryObj?.code);

  useEffect(() => {
    if (selectedCountryObj?.code === "ma") {
      setSummaryYear(2023);
      return;
    }
    setSummaryYear(lastAvailableYear);
  }, [selectedCountryObj?.code, lastAvailableYear]);

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
        setTradeBreakdownByCountry({
          exports: buildTradeByCountryYearMineralFromRawText(combinedText, "Export"),
          imports: buildTradeByCountryYearMineralFromRawText(combinedText, "Import"),
        });
      })
      .catch(() => {
        if (!active) return;
        setTradeByCountry({ imports: {}, exports: {} });
        setTradeBreakdownByCountry({ exports: {}, imports: {} });
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
  const exportBreakdownByYear =
    selectedCountryCsvName && tradeBreakdownByCountry.exports
      ? tradeBreakdownByCountry.exports[selectedCountryCsvName] || {}
      : {};
  const importBreakdownByYear =
    selectedCountryCsvName && tradeBreakdownByCountry.imports
      ? tradeBreakdownByCountry.imports[selectedCountryCsvName] || {}
      : {};

  return (
    <div dir="rtl" className="min-h-screen" style={{ background:"white", fontFamily:"'Cairo',system-ui,sans-serif" }}>
      <style>{`
        @keyframes shimmerGold {
          0% { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
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
          <div
            className="space-y-5 rounded-[28px] p-4 sm:p-5 lg:p-6"
            style={{
              background: selectedTheme.shellBg,
              border: `1px solid ${selectedTheme.shellBorder}`,
              boxShadow: selectedTheme.shellShadow,
              "--country-card-bg": selectedTheme.cardBg,
              "--country-card-border": selectedTheme.cardBorder,
              "--country-card-shadow": selectedTheme.cardShadow,
              "--country-title-bg": selectedTheme.titleBg,
            }}
          >
            {selectedCountryObj&&<CountryHeroBanner country={selected} countryCode={selectedCountryObj.code} theme={selectedTheme} />}

            {selectedCountryObj && (
              <CountrySnapshotPanel
                country={selected}
                countryCode={selectedCountryObj.code}
                year={summaryYear}
                onYearChange={setSummaryYear}
                exportSeries={exportSeries}
                importSeries={importSeries}
                exportBreakdownByYear={exportBreakdownByYear}
                importBreakdownByYear={importBreakdownByYear}
              />
            )}

            <ChartSectionTitle title="المؤشرات التعدينية" />
            <CountryComparisonDonut key={`donut-${selected}`} selectedCountry={selected} year={donutYear} onYearChange={setDonutYear} />

            <CountryLineChart
              key={`line-${selected}`}
              country={selected}
              mineralFilter={lineMineralFilter}
              unit={lineUnit}
              onMineralFilterChange={setLineMineralFilter}
              onUnitChange={setLineUnit}
            />

            <CountryBarChart
              key={`bar-${selected}`}
              country={selected}
              selectedYear={barYear}
              onYearChange={setBarYear}
              mineralFilter={barMineralFilter}
              unit={barUnit}
              onMineralFilterChange={setBarMineralFilter}
              onUnitChange={setBarUnit}
            />

            <MineralTreemap key={`tree-${selected}`} country={selected} year={treemapYear} onYearChange={setTreemapYear} />

            <ChartSectionTitle title="الصادرات والواردات" />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <CountryTradeChart
                key={`export-${selected}`}
                title="اجمالي الصادرات للمعادن "
                country={selected}
                series={exportSeries}
                color="#f59e0b"
              />
              <CountryTradeChart
                key={`import-${selected}`}
                title="اجمالي الواردات للمعادن"
                country={selected}
                series={importSeries}
                color="#3b82f6"
              />
            </div>
            <TradeIndicatorsPanel
              country={selected}
              exportSeries={exportSeries}
              importSeries={importSeries}
              exportBreakdownByYear={exportBreakdownByYear}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Countries;