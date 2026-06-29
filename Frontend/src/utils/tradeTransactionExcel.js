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

export const TRADE_TRANSACTION_EXCEL_KEYS = ["country_iso", "mineral_hs", "year", "trade_value_usd"];

const HEADER_ALIASES = {
  country_iso: ["country_iso", "iso", "iso code", "country code", "country iso", "code pays", "code iso"],
  mineral_hs: ["mineral_hs", "hs", "hs code", "mineral code", "mineral hs code", "code hs du mineral"],
  year: ["year", "annee"],
  trade_value_usd: ["trade_value_usd", "value", "value usd", "trade value", "trade value usd", "valeur", "valeur usd"],
};

const DEMO_ROW = {
  country_iso: "SA",
  mineral_hs: "260100",
  year: 2023,
  trade_value_usd: 1000000,
};

function buildHeaderRow(t) {
  return TRADE_TRANSACTION_EXCEL_KEYS.map((key) => t.excelFields?.[key] || t.fields?.[key] || key);
}

function findCountry(countries, isoOrName) {
  const q = normalizeHeaderKey(cellToString(isoOrName));
  if (!q) return null;
  return (
    countries.find(
      (c) =>
        normalizeHeaderKey(c.iso_code) === q ||
        [c.name_en, c.name_ar, c.name_fr].some((name) => normalizeHeaderKey(name) === q)
    ) || null
  );
}

function findMineral(minerals, hsOrName) {
  const raw = cellToString(hsOrName);
  if (!raw) return null;
  const q = normalizeHeaderKey(raw);
  const compact = raw.replace(/\s+/g, "");

  return (
    minerals.find((m) => {
      const hs = cellToString(m.hs_minerals);
      if (hs && (normalizeHeaderKey(hs) === q || hs.replace(/\s+/g, "") === compact)) return true;
      return [m.name_en, m.name_ar, m.name_fr].some((name) => normalizeHeaderKey(name) === q);
    }) || null
  );
}

function tradeTransactionToRow(r, countries, minerals, t) {
  const headers = buildHeaderRow(t);
  const country = countries.find((c) => String(c.id) === String(r.country_id));
  const mineral = minerals.find((m) => String(m.id) === String(r.mineral_id));
  const values = {
    country_iso: country?.iso_code ?? "",
    mineral_hs: mineral?.hs_minerals ?? "",
    year: r.year ?? "",
    trade_value_usd: r.trade_value_usd ?? "",
  };

  const row = {};
  TRADE_TRANSACTION_EXCEL_KEYS.forEach((key, i) => {
    row[headers[i]] = values[key] ?? "";
  });
  return row;
}

export function exportTradeTransactionExcel(rows, countries, minerals, t, filename) {
  const headers = buildHeaderRow(t);
  const dataRows =
    rows.length > 0
      ? rows.map((r) => tradeTransactionToRow(r, countries, minerals, t))
      : [Object.fromEntries(headers.map((h) => [h, ""]))];
  const ws = buildStyledSheet(dataRows, headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Trade");
  downloadWorkbook(wb, filename);
}

export function exportTradeTransactionTemplateExcel(t, countries = [], minerals = [], filename) {
  const headers = buildHeaderRow(t);
  const demo = {
    ...DEMO_ROW,
    country_iso: countries[0]?.iso_code || DEMO_ROW.country_iso,
    mineral_hs: minerals[0]?.hs_minerals || DEMO_ROW.mineral_hs,
  };
  const row = {};
  TRADE_TRANSACTION_EXCEL_KEYS.forEach((key, i) => {
    row[headers[i]] = demo[key] ?? "";
  });
  const ws = buildStyledSheet([row], headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  downloadWorkbook(wb, filename);
}

export async function parseTradeTransactionExcelFile(file, countries, minerals, t, tradeType) {
  const rawRows = await readExcelRows(file);
  if (!rawRows.length) return [];

  const translatedFields = { ...t.excelFields, ...t.fields };
  const columnMap = buildColumnMap(
    Object.keys(rawRows[0]),
    TRADE_TRANSACTION_EXCEL_KEYS,
    HEADER_ALIASES,
    translatedFields
  );

  const payloads = [];
  for (const raw of rawRows) {
    const item = rowToRecord(raw, columnMap);
    if (!item.country_iso && !item.mineral_hs && !item.year && !item.trade_value_usd) continue;

    const country = findCountry(countries, item.country_iso);
    const mineral = findMineral(minerals, item.mineral_hs);
    const year = parseIntegerCell(item.year);
    const value = parseFloatCell(item.trade_value_usd);

    if (!country?.id || !mineral?.id || Number.isNaN(year)) continue;

    payloads.push({
      country_id: country.id,
      mineral_id: mineral.id,
      year,
      trade_type: tradeType,
      trade_value_usd: Number.isNaN(value) ? 0 : value,
    });
  }
  return payloads;
}

export function normalizeTradeTransactionPayload(payload, tradeType) {
  return {
    country_id: Number(payload.country_id),
    mineral_id: Number(payload.mineral_id),
    year: Number(payload.year),
    trade_type: payload.trade_type || tradeType,
    trade_value_usd: payload.trade_value_usd === "" || payload.trade_value_usd == null ? 0 : Number(payload.trade_value_usd),
  };
}

export function tradeTransactionRecordKey(payload, tradeType) {
  const p = normalizeTradeTransactionPayload(payload, tradeType);
  return `${p.trade_type}|${p.country_id}|${p.mineral_id}|${p.year}`;
}

export function findMatchingTradeTransaction(rows, payload, tradeType) {
  const p = normalizeTradeTransactionPayload(payload, tradeType);
  return (
    rows.find(
      (r) =>
        r &&
        (r.trade_type || tradeType) === p.trade_type &&
        Number(r.country_id) === p.country_id &&
        Number(r.mineral_id) === p.mineral_id &&
        Number(r.year) === p.year
    ) || null
  );
}

export function dedupeTradeTransactionPayloads(payloads, tradeType) {
  const map = new Map();
  for (const payload of payloads) {
    map.set(tradeTransactionRecordKey(payload, tradeType), payload);
  }
  return [...map.values()];
}
