import {
  XLSX,
  buildColumnMap,
  buildStyledSheet,
  cellToString,
  downloadWorkbook,
  normalizeHeaderKey,
  parseFloatCell,
  parseIntegerCell,
  readExcelRows,
  rowToRecord,
} from "./excelCommon";

export const WORLD_PRODUCTION_EXCEL_KEYS = [
  "mineral_hs",
  "year",
  "production_value",
  "production_value_base",
  "unit_ar",
  "unit_fr",
  "unit_en",
];

const HEADER_ALIASES = {
  mineral_hs: ["mineral_hs", "hs", "hs code", "mineral hs code", "code hs", "رمز hs"],
  year: ["year", "annee", "année", "السنة"],
  production_value: ["production_value", "production", "value", "valeur", "قيمة الإنتاج"],
  production_value_base: ["production_value_base", "base value", "normalized value", "valeur normalisée", "القيمة المعيارية"],
  unit_ar: ["unit_ar", "unit arabic", "unité arabe", "الوحدة عربي"],
  unit_fr: ["unit_fr", "unit french", "unité français", "الوحدة français"],
  unit_en: ["unit_en", "unit english", "unité english", "الوحدة english"],
};

const DEMO_ROW = {
  mineral_hs: "260100",
  year: 2023,
  production_value: 1000,
  production_value_base: 1000,
  unit_ar: "طن",
  unit_fr: "tonne",
  unit_en: "tonne",
};

function buildHeaderRow(t) {
  return WORLD_PRODUCTION_EXCEL_KEYS.map((key) => t.excelFields?.[key] || t.fields?.[key] || key);
}

function findMineral(minerals, hsOrName) {
  const raw = cellToString(hsOrName);
  if (!raw) return null;
  const nq = normalizeHeaderKey(raw);
  const compact = raw.replace(/\s+/g, "");

  return (
    minerals.find((m) => {
      const hs = cellToString(m.hs_codes ?? m.hs_minerals);
      if (hs && (normalizeHeaderKey(hs) === nq || hs.replace(/\s+/g, "") === compact)) return true;
      return [m.mineral_name_ar, m.mineral_name_en, m.mineral_name_fr, m.name_ar, m.name_en, m.name_fr].some(
        (name) => normalizeHeaderKey(name) === nq
      );
    }) || null
  );
}

function mineralHs(mineral) {
  return mineral?.hs_codes ?? mineral?.hs_minerals ?? "";
}

function worldProductionToRow(row, minerals, t) {
  const headers = buildHeaderRow(t);
  const mineral = minerals.find((m) => String(m.id) === String(row.mineral_production_id));
  const values = {
    mineral_hs: mineralHs(mineral),
    year: row.year ?? "",
    production_value: row.production_value ?? "",
    production_value_base: row.production_value_base ?? "",
    unit_ar: row.unit_ar ?? "",
    unit_fr: row.unit_fr ?? "",
    unit_en: row.unit_en ?? "",
  };
  const output = {};
  WORLD_PRODUCTION_EXCEL_KEYS.forEach((key, index) => {
    output[headers[index]] = values[key] ?? "";
  });
  return output;
}

export function exportWorldProductionExcel(rows, minerals, t) {
  const headers = buildHeaderRow(t);
  const dataRows =
    rows.length > 0
      ? rows.map((row) => worldProductionToRow(row, minerals, t))
      : [Object.fromEntries(headers.map((header) => [header, ""]))];
  const ws = buildStyledSheet(dataRows, headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "World production");
  downloadWorkbook(wb, "world_production.xlsx");
}

export function exportWorldProductionTemplateExcel(t, minerals = []) {
  const headers = buildHeaderRow(t);
  const demo = { ...DEMO_ROW, mineral_hs: mineralHs(minerals[0]) || DEMO_ROW.mineral_hs };
  const row = {};
  WORLD_PRODUCTION_EXCEL_KEYS.forEach((key, index) => {
    row[headers[index]] = demo[key] ?? "";
  });
  const ws = buildStyledSheet([row], headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  downloadWorkbook(wb, "world_production_template.xlsx");
}

export async function parseWorldProductionExcelFile(file, minerals, t) {
  const rawRows = await readExcelRows(file);
  if (!rawRows.length) return [];

  const translatedFields = { ...t.excelFields, ...t.fields };
  const columnMap = buildColumnMap(Object.keys(rawRows[0]), WORLD_PRODUCTION_EXCEL_KEYS, HEADER_ALIASES, translatedFields);

  const payloads = [];
  for (const raw of rawRows) {
    const item = rowToRecord(raw, columnMap);
    if (!item.mineral_hs && !item.year && !item.production_value && !item.production_value_base) continue;

    const mineral = findMineral(minerals, item.mineral_hs);
    const year = parseIntegerCell(item.year);
    if (!mineral?.id || Number.isNaN(year)) continue;

    const value = parseFloatCell(item.production_value);
    const baseValue = parseFloatCell(item.production_value_base);
    payloads.push({
      mineral_production_id: mineral.id,
      year,
      production_value: Number.isNaN(value) ? null : value,
      production_value_base: Number.isNaN(baseValue) ? null : baseValue,
      unit_ar: item.unit_ar || null,
      unit_fr: item.unit_fr || null,
      unit_en: item.unit_en || null,
    });
  }
  return payloads;
}

export function worldProductionRecordKey(payload) {
  return `${Number(payload.mineral_production_id)}|${Number(payload.year)}`;
}

export function dedupeWorldProductionPayloads(payloads) {
  const map = new Map();
  for (const payload of payloads) {
    map.set(worldProductionRecordKey(payload), payload);
  }
  return [...map.values()];
}

export function findMatchingWorldProduction(rows, payload) {
  return (
    rows.find(
      (row) =>
        Number(row.mineral_production_id) === Number(payload.mineral_production_id) &&
        Number(row.year) === Number(payload.year)
    ) || null
  );
}
