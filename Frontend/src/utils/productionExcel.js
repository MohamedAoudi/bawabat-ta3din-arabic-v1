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

export const PRODUCTION_EXCEL_KEYS = [
  "country_iso",
  "mineral_hs",
  "year",
  "production_quantity",
  "unit",
  "data_source",
];

const HEADER_ALIASES = {
  country_iso: ["country_iso", "iso", "iso code", "code iso", "رمز الدولة", "رمز الدولة (iso)", "country code", "country iso", "code pays"],
  mineral_hs: ["mineral_hs", "hs", "hs minerals", "hs code", "رمز hs", "رمز hs للمعدن", "mineral code", "code hs du minéral", "mineral hs code"],
  year: ["year", "année", "السنة", "annee"],
  production_quantity: ["production_quantity", "quantity", "quantité", "quantité produite", "كمية الإنتاج", "production quantity"],
  unit: ["unit", "unité", "الوحدة", "unite", "tonne", "kg"],
  data_source: ["data_source", "source", "مصدر البيانات", "data source", "source des données"],
};

const DEMO_ROW = {
  country_iso: "SA",
  mineral_hs: "260100",
  year: 2023,
  production_quantity: 1000,
  unit: "tonne",
  data_source: "USGS",
};

const UNIT_OPTIONS = [
  { key: "tonne", ar: "طن", en: "tonne", fr: "tonne" },
  { key: "kg", ar: "كيلوغرام", en: "kilogram", fr: "kilogramme" },
  { key: "unit", ar: "وحدة", en: "unit", fr: "unité" },
];

function buildHeaderRow(t) {
  return PRODUCTION_EXCEL_KEYS.map((key) => t.excelFields?.[key] || key);
}

function getTranslatedFields(t) {
  return { ...t.excelFields, ...t.fields };
}

function resolveUnitKey(raw) {
  const normalized = normalizeHeaderKey(cellToString(raw));
  if (!normalized) return null;
  const byKey = UNIT_OPTIONS.find((u) => normalizeHeaderKey(u.key) === normalized);
  if (byKey) return byKey;
  return (
    UNIT_OPTIONS.find(
      (u) =>
        normalizeHeaderKey(u.ar) === normalized ||
        normalizeHeaderKey(u.en) === normalized ||
        normalizeHeaderKey(u.fr) === normalized ||
        normalized.includes(normalizeHeaderKey(u.key))
    ) || null
  );
}

function findCountry(countries, iso) {
  const q = normalizeHeaderKey(cellToString(iso));
  if (!q) return null;
  return countries.find((c) => normalizeHeaderKey(c.iso_code) === q) || null;
}

function findMineral(minerals, hsOrName) {
  const raw = cellToString(hsOrName);
  if (!raw) return null;
  const nq = normalizeHeaderKey(raw);
  const compact = raw.replace(/\s+/g, "");

  return (
    minerals.find((m) => {
      const hs = cellToString(m.hs_minerals);
      if (hs) {
        if (normalizeHeaderKey(hs) === nq) return true;
        if (hs.replace(/\s+/g, "") === compact) return true;
      }
      return [m.name_en, m.name_ar, m.name_fr].some((name) => normalizeHeaderKey(name) === nq);
    }) || null
  );
}

function productionToRow(r, countries, minerals, t) {
  const headers = buildHeaderRow(t);
  const country = countries.find((c) => String(c.id) === String(r.country_id));
  const mineral = minerals.find((m) => String(m.id) === String(r.mineral_id));
  const unitMatch = UNIT_OPTIONS.find(
    (u) => u.ar === r.unit_name_ar || u.en === r.unit_name_en || u.fr === r.unit_name_fr
  );

  const values = {
    country_iso: country?.iso_code ?? "",
    mineral_hs: mineral?.hs_minerals ?? "",
    year: r.year ?? "",
    production_quantity: r.production_quantity ?? "",
    unit: unitMatch?.key ?? r.unit_name_en ?? "",
    data_source: r.data_source ?? "",
  };

  const row = {};
  PRODUCTION_EXCEL_KEYS.forEach((key, i) => {
    row[headers[i]] = values[key] ?? "";
  });
  return row;
}

export function exportProductionExcel(rows, countries, minerals, t) {
  const headers = buildHeaderRow(t);
  const dataRows =
    rows.length > 0
      ? rows.map((r) => productionToRow(r, countries, minerals, t))
      : [Object.fromEntries(headers.map((h) => [h, ""]))];
  const ws = buildStyledSheet(dataRows, headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Production");
  downloadWorkbook(wb, "production.xlsx");
}

export function exportProductionTemplateExcel(t, countries = [], minerals = []) {
  const headers = buildHeaderRow(t);
  const demo = {
    ...DEMO_ROW,
    country_iso: countries[0]?.iso_code || DEMO_ROW.country_iso,
    mineral_hs: minerals[0]?.hs_minerals || DEMO_ROW.mineral_hs,
  };
  const row = {};
  PRODUCTION_EXCEL_KEYS.forEach((key, i) => {
    row[headers[i]] = demo[key] ?? "";
  });
  const ws = buildStyledSheet([row], headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  downloadWorkbook(wb, "production_template.xlsx");
}

export async function parseProductionExcelFile(file, countries, minerals, t) {
  const rawRows = await readExcelRows(file);
  if (!rawRows.length) return [];

  const translatedFields = getTranslatedFields(t);
  const columnMap = buildColumnMap(
    Object.keys(rawRows[0]),
    PRODUCTION_EXCEL_KEYS,
    HEADER_ALIASES,
    translatedFields
  );

  const payloads = [];
  for (const raw of rawRows) {
    const item = rowToRecord(raw, columnMap);

    if (!item.mineral_hs && !item.year && !item.production_quantity) continue;

    const mineral = findMineral(minerals, item.mineral_hs);
    const year = parseIntegerCell(item.year);
    if (!mineral?.id || Number.isNaN(year)) continue;

    const country = findCountry(countries, item.country_iso);
    const qty = parseFloatCell(item.production_quantity);
    const unitDef = resolveUnitKey(item.unit);

    payloads.push({
      country_id: country?.id ?? null,
      mineral_id: mineral.id,
      year,
      production_quantity: Number.isNaN(qty) ? null : qty,
      unit_name_ar: unitDef?.ar ?? null,
      unit_name_en: unitDef?.en ?? null,
      unit_name_fr: unitDef?.fr ?? null,
      data_source: item.data_source || null,
    });
  }
  return payloads;
}

export function normalizeProductionPayload(payload) {
  return {
    country_id:
      payload.country_id != null && payload.country_id !== "" ? Number(payload.country_id) : null,
    mineral_id: Number(payload.mineral_id),
    year: Number(payload.year),
    production_quantity:
      payload.production_quantity == null || payload.production_quantity === ""
        ? null
        : Number(payload.production_quantity),
    unit_name_ar: payload.unit_name_ar || null,
    unit_name_en: payload.unit_name_en || null,
    unit_name_fr: payload.unit_name_fr || null,
    data_source: payload.data_source || null,
  };
}

export function productionRecordKey(payload) {
  const p = normalizeProductionPayload(payload);
  return `${p.country_id ?? "null"}|${p.mineral_id}|${p.year}`;
}

export function findMatchingProduction(rows, payload) {
  const p = normalizeProductionPayload(payload);
  return (
    rows.find((r) => {
      const rCountry =
        r.country_id == null || r.country_id === "" ? null : Number(r.country_id);
      return (
        Number(r.year) === p.year &&
        Number(r.mineral_id) === p.mineral_id &&
        rCountry === p.country_id
      );
    }) || null
  );
}

/** Dernière ligne gagne pour les doublons dans le même fichier */
export function dedupeProductionPayloads(payloads) {
  const map = new Map();
  for (const payload of payloads) {
    map.set(productionRecordKey(payload), payload);
  }
  return [...map.values()];
}
