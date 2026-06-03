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

export { XLSX };
