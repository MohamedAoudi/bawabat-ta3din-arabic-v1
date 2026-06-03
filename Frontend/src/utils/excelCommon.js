import XLSX from "xlsx-js-style";

/** Vert principal du site (mode clair) */
export const SITE_GREEN = "082721";

export const HEADER_STYLE = {
  font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
  fill: { patternType: "solid", fgColor: { rgb: SITE_GREEN } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
};

export function normalizeHeaderKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function cellToString(val) {
  if (val == null || val === "") return "";
  if (typeof val === "number" && Number.isFinite(val)) {
    return Number.isInteger(val) ? String(val) : String(val);
  }
  return String(val).trim();
}

export function parseIntegerCell(val) {
  const s = cellToString(val);
  if (!s) return NaN;
  const n = Number.parseInt(s, 10);
  return Number.isNaN(n) ? NaN : n;
}

export function parseFloatCell(val) {
  const s = cellToString(val).replace(/,/g, "");
  if (!s) return NaN;
  const n = Number.parseFloat(s);
  return Number.isNaN(n) ? NaN : n;
}

/** Associe les libellés exportés (traduits) aux clés techniques */
export function resolveColumnKey(header, keys, staticAliases = {}, translatedFields = {}) {
  const normalized = normalizeHeaderKey(header);
  if (!normalized) return null;

  for (const key of keys) {
    const candidates = [key, translatedFields[key], ...(staticAliases[key] || [])].filter(Boolean);
    for (const candidate of candidates) {
      const nc = normalizeHeaderKey(candidate);
      if (nc === normalized || normalized.includes(nc) || nc.includes(normalized)) {
        return key;
      }
    }
  }
  return null;
}

export function buildColumnMap(headerKeys, keys, staticAliases = {}, translatedFields = {}) {
  const columnMap = {};
  headerKeys.forEach((header) => {
    const key = resolveColumnKey(header, keys, staticAliases, translatedFields);
    if (key) columnMap[header] = key;
  });

  if (!Object.keys(columnMap).length && headerKeys.length === keys.length) {
    headerKeys.forEach((header, index) => {
      columnMap[header] = keys[index];
    });
  }

  return columnMap;
}

export function rowToRecord(raw, columnMap) {
  const item = {};
  Object.entries(columnMap).forEach(([header, key]) => {
    item[key] = cellToString(raw[header]);
  });
  return item;
}

export function applySheetPresentation(ws, columnCount) {
  if (!ws["!ref"]) return;

  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let c = range.s.c; c < range.s.c + columnCount; c += 1) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[addr]) ws[addr].s = HEADER_STYLE;
  }

  ws["!rows"] = [{ hpt: 30 }];
  ws["!cols"] = Array.from({ length: columnCount }, () => ({ wch: 24 }));
}

export function buildStyledSheet(rows, headers) {
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  applySheetPresentation(ws, headers.length);
  return ws;
}

export function downloadWorkbook(wb, filename) {
  XLSX.writeFile(wb, filename);
}

export async function readExcelRows(file) {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const sheet = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

export { XLSX };
