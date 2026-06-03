import { XLSX, buildColumnMap, buildStyledSheet, downloadWorkbook, readExcelRows, rowToRecord } from "./excelCommon";

export const MINERAL_EXCEL_KEYS = [
  "hs_minerals",
  "name_ar",
  "name_en",
  "name_fr",
  "category_name_ar",
  "category_name_en",
  "category_name_fr",
];

const HEADER_ALIASES = {
  hs_minerals: ["hs_minerals", "hs minerals", "hs minerals code", "رمز hs minerals", "رمز hs", "code hs"],
  name_ar: ["name_ar", "name ar", "name (arabic)", "nom (arabe)", "الاسم (عربي)", "الاسم عربي"],
  name_en: ["name_en", "name en", "name (english)", "nom (english)", "الاسم (english)", "الاسم english"],
  name_fr: ["name_fr", "name fr", "name (french)", "nom (français)", "الاسم (français)", "الاسم français"],
  category_name_ar: ["category_name_ar", "category ar", "category (arabic)", "catégorie (arabe)", "الفئة (عربي)"],
  category_name_en: ["category_name_en", "category en", "category (english)", "catégorie (english)", "الفئة (english)"],
  category_name_fr: ["category_name_fr", "category fr", "category (french)", "catégorie (français)", "الفئة (français)"],
};

const DEMO_ROW = {
  hs_minerals: "260100",
  name_ar: "حديد خام",
  name_en: "Iron ore",
  name_fr: "Minerai de fer",
  category_name_ar: "معادن حديدية",
  category_name_en: "Iron ores",
  category_name_fr: "Minerais de fer",
};

function buildHeaderRow(t) {
  return MINERAL_EXCEL_KEYS.map((key) => t.fields[key] || key);
}

function mineralToRow(m, t) {
  const headers = buildHeaderRow(t);
  const row = {};
  MINERAL_EXCEL_KEYS.forEach((key, i) => {
    row[headers[i]] = m[key] ?? "";
  });
  return row;
}

export function exportMineralsExcel(minerals, t) {
  const headers = buildHeaderRow(t);
  const rows =
    minerals.length > 0
      ? minerals.map((m) => mineralToRow(m, t))
      : [Object.fromEntries(headers.map((h) => [h, ""]))];
  const ws = buildStyledSheet(rows, headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Minerals");
  downloadWorkbook(wb, "minerals.xlsx");
}

export function exportMineralsTemplateExcel(t) {
  const headers = buildHeaderRow(t);
  const row = {};
  MINERAL_EXCEL_KEYS.forEach((key, i) => {
    row[headers[i]] = DEMO_ROW[key] ?? "";
  });
  const ws = buildStyledSheet([row], headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  downloadWorkbook(wb, "minerals_template.xlsx");
}

export async function parseMineralsExcelFile(file, t) {
  const rawRows = await readExcelRows(file);
  if (!rawRows.length) return [];

  const columnMap = buildColumnMap(Object.keys(rawRows[0]), MINERAL_EXCEL_KEYS, HEADER_ALIASES, t.fields);

  const payloads = [];
  for (const raw of rawRows) {
    const item = rowToRecord(raw, columnMap);
    if (!item.hs_minerals && !item.name_ar && !item.name_en && !item.name_fr) continue;
    if (!item.name_ar || !item.name_en || !item.name_fr || !item.hs_minerals) continue;
    payloads.push({
      hs_minerals: item.hs_minerals,
      name_ar: item.name_ar,
      name_en: item.name_en,
      name_fr: item.name_fr,
      category_name_ar: item.category_name_ar || null,
      category_name_en: item.category_name_en || null,
      category_name_fr: item.category_name_fr || null,
    });
  }
  return payloads;
}
