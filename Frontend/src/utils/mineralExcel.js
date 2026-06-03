import XLSX from "xlsx-js-style";

/** Vert principal du site (mode clair) */
const SITE_GREEN = "082721";

const HEADER_STYLE = {
  font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
  fill: { patternType: "solid", fgColor: { rgb: SITE_GREEN } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
};

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

function normalizeHeaderKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function resolveColumnKey(header) {
  const normalized = normalizeHeaderKey(header);
  for (const key of MINERAL_EXCEL_KEYS) {
    const aliases = HEADER_ALIASES[key] || [key];
    if (aliases.some((a) => normalizeHeaderKey(a) === normalized)) return key;
  }
  return null;
}

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

function applySheetPresentation(ws, columnCount) {
  if (!ws["!ref"]) return;

  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let c = range.s.c; c < range.s.c + columnCount; c += 1) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[addr]) ws[addr].s = HEADER_STYLE;
  }

  ws["!rows"] = [{ hpt: 30 }];
  ws["!cols"] = Array.from({ length: columnCount }, () => ({ wch: 24 }));
}

function buildStyledSheet(rows, headers) {
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  applySheetPresentation(ws, headers.length);
  return ws;
}

function downloadWorkbook(wb, filename) {
  XLSX.writeFile(wb, filename);
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

export async function parseMineralsExcelFile(file) {
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
    MINERAL_EXCEL_KEYS.forEach((key) => {
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
