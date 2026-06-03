import { XLSX, buildStyledSheet, downloadWorkbook, normalizeHeaderKey } from "./excelCommon";

export const COUNTRY_EXCEL_KEYS = ["name_ar", "name_en", "name_fr", "iso_code", "display_order"];

const HEADER_ALIASES = {
  name_ar: ["name_ar", "name ar", "name (arabic)", "nom (arabe)", "الاسم (عربي)", "الاسم عربي"],
  name_en: ["name_en", "name en", "name (english)", "nom (english)", "الاسم (english)", "الاسم english"],
  name_fr: ["name_fr", "name fr", "name (french)", "nom (français)", "الاسم (français)", "الاسم français"],
  iso_code: ["iso_code", "iso code", "iso", "code iso", "رمز الدولة", "رمز الدولة (iso)", "country code"],
  display_order: ["display_order", "display order", "order", "ordre", "ترتيب العرض", "ordre d'affichage"],
};

const DEMO_ROW = {
  name_ar: "المملكة العربية السعودية",
  name_en: "Saudi Arabia",
  name_fr: "Arabie saoudite",
  iso_code: "SA",
  display_order: 1,
};

function resolveColumnKey(header) {
  const normalized = normalizeHeaderKey(header);
  for (const key of COUNTRY_EXCEL_KEYS) {
    const aliases = HEADER_ALIASES[key] || [key];
    if (aliases.some((a) => normalizeHeaderKey(a) === normalized)) return key;
  }
  return null;
}

function buildHeaderRow(t) {
  return COUNTRY_EXCEL_KEYS.map((key) => t.fields[key] || key);
}

function countryToRow(c, t) {
  const headers = buildHeaderRow(t);
  const row = {};
  COUNTRY_EXCEL_KEYS.forEach((key, i) => {
    row[headers[i]] = c[key] ?? "";
  });
  return row;
}

export function exportCountriesExcel(countries, t) {
  const headers = buildHeaderRow(t);
  const rows =
    countries.length > 0
      ? countries.map((c) => countryToRow(c, t))
      : [Object.fromEntries(headers.map((h) => [h, ""]))];
  const ws = buildStyledSheet(rows, headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Countries");
  downloadWorkbook(wb, "countries.xlsx");
}

export function exportCountriesTemplateExcel(t) {
  const headers = buildHeaderRow(t);
  const row = {};
  COUNTRY_EXCEL_KEYS.forEach((key, i) => {
    row[headers[i]] = DEMO_ROW[key] ?? "";
  });
  const ws = buildStyledSheet([row], headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  downloadWorkbook(wb, "countries_template.xlsx");
}

export async function parseCountriesExcelFile(file) {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const sheet = wb.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  if (!rawRows.length) return [];

  const firstRow = rawRows[0];
  const columnMap = {};
  Object.keys(firstRow).forEach((header) => {
    const key = resolveColumnKey(header);
    if (key) columnMap[header] = key;
  });

  if (!Object.keys(columnMap).length) {
    COUNTRY_EXCEL_KEYS.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(firstRow, key)) columnMap[key] = key;
    });
  }

  const payloads = [];
  for (const raw of rawRows) {
    const item = {};
    Object.entries(columnMap).forEach(([header, key]) => {
      const val = raw[header];
      item[key] = val != null ? String(val).trim() : "";
    });
    if (!item.name_ar && !item.name_en && !item.name_fr && !item.iso_code) continue;
    if (!item.name_ar || !item.name_en || !item.name_fr || !item.iso_code) continue;

    const order = Number.parseInt(item.display_order, 10);
    payloads.push({
      name_ar: item.name_ar,
      name_en: item.name_en,
      name_fr: item.name_fr,
      iso_code: item.iso_code.toUpperCase(),
      display_order: Number.isNaN(order) ? 0 : order,
    });
  }
  return payloads;
}
