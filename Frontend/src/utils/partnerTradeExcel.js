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

export const PARTNER_TRADE_EXCEL_KEYS = [
  "reporter_country_iso",
  "partner",
  "mineral",
  "year",
  "value_usd",
  "value_share",
  "type_trade",
];

const HEADER_ALIASES = {
  reporter_country_iso: ["reporter_country_iso", "reporter iso", "country iso", "country code", "code pays"],
  partner: ["partner", "trade partner", "partenaire"],
  mineral: ["mineral", "mineral trade", "minerai", "mineral hs", "hs code"],
  year: ["year", "annee"],
  value_usd: ["value_usd", "value", "value usd", "trade value", "valeur", "valeur usd"],
  value_share: ["value_share", "share", "part", "percentage", "pourcentage"],
  type_trade: ["type_trade", "type", "trade type", "export", "import"],
};

const DEMO_ROW = {
  reporter_country_iso: "SA",
  partner: "China",
  mineral: "Iron ore",
  year: 2023,
  value_usd: 1000000,
  value_share: 12.5,
  type_trade: "export",
};

function buildHeaderRow(t, isWorld) {
  const keys = isWorld ? PARTNER_TRADE_EXCEL_KEYS : PARTNER_TRADE_EXCEL_KEYS.filter((key) => key !== "value_share");
  return keys.map((key) => t.excelFields?.[key] || t.fields?.[key] || key);
}

function activeKeys(isWorld) {
  return isWorld ? PARTNER_TRADE_EXCEL_KEYS : PARTNER_TRADE_EXCEL_KEYS.filter((key) => key !== "value_share");
}

function findCountry(countries, rawValue) {
  const q = normalizeHeaderKey(cellToString(rawValue));
  if (!q) return null;
  return (
    countries.find(
      (country) =>
        normalizeHeaderKey(country.iso_code) === q ||
        [country.name_en, country.name_ar, country.name_fr].some((name) => normalizeHeaderKey(name) === q)
    ) || null
  );
}

function findPartner(partners, rawValue) {
  const q = normalizeHeaderKey(cellToString(rawValue));
  if (!q) return null;
  return (
    partners.find((partner) =>
      [partner.name_en, partner.name_ar, partner.name_fr, partner.code, partner.iso_code].some(
        (value) => normalizeHeaderKey(value) === q
      )
    ) || null
  );
}

function mineralCode(mineral) {
  return mineral?.hs_codes ?? mineral?.hs_minerals ?? mineral?.code ?? "";
}

function findMineral(minerals, rawValue) {
  const raw = cellToString(rawValue);
  const q = normalizeHeaderKey(raw);
  const compact = raw.replace(/\s+/g, "");
  if (!q) return null;

  return (
    minerals.find((mineral) => {
      const code = cellToString(mineralCode(mineral));
      if (code && (normalizeHeaderKey(code) === q || code.replace(/\s+/g, "") === compact)) return true;
      return [
        mineral.mineral_name_en,
        mineral.mineral_name_ar,
        mineral.mineral_name_fr,
        mineral.name_en,
        mineral.name_ar,
        mineral.name_fr,
      ].some((name) => normalizeHeaderKey(name) === q);
    }) || null
  );
}

function normalizeTypeTrade(value, fallbackType) {
  const q = normalizeHeaderKey(value);
  if (q.includes("import")) return "import";
  if (q.includes("export")) return "export";
  return fallbackType || "export";
}

function labelByLanguage(entity, language, prefixes) {
  for (const prefix of prefixes) {
    const preferred = entity?.[`${prefix}_${language}`];
    if (preferred) return preferred;
  }
  return (
    prefixes.flatMap((prefix) => [entity?.[`${prefix}_en`], entity?.[`${prefix}_fr`], entity?.[`${prefix}_ar`]]).find(Boolean) ||
    ""
  );
}

function partnerTradeToRow(row, countries, partners, minerals, t, language, isWorld) {
  const keys = activeKeys(isWorld);
  const headers = buildHeaderRow(t, isWorld);
  const country = countries.find((item) => String(item.id) === String(row.reporter_country_id));
  const partner = partners.find((item) => String(item.id) === String(row.partner_id));
  const mineral = minerals.find((item) => String(item.id) === String(row.mineral_trade_id));
  const values = {
    reporter_country_iso: country?.iso_code ?? "",
    partner: labelByLanguage(partner, language, ["name"]),
    mineral: mineralCode(mineral) || labelByLanguage(mineral, language, ["mineral_name", "name"]),
    year: row.year ?? "",
    value_usd: row.value_usd ?? "",
    value_share: row.value_share ?? "",
    type_trade: row.type_trade ?? "",
  };

  const out = {};
  keys.forEach((key, index) => {
    out[headers[index]] = values[key] ?? "";
  });
  return out;
}

export function exportPartnerTradeExcel(rows, countries, partners, minerals, t, language, isWorld, filename) {
  const headers = buildHeaderRow(t, isWorld);
  const dataRows =
    rows.length > 0
      ? rows.map((row) => partnerTradeToRow(row, countries, partners, minerals, t, language, isWorld))
      : [Object.fromEntries(headers.map((header) => [header, ""]))];
  const ws = buildStyledSheet(dataRows, headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, isWorld ? "World trade" : "Partner trade");
  downloadWorkbook(wb, filename);
}

export function exportPartnerTradeTemplateExcel(t, countries = [], partners = [], minerals = [], language, isWorld, typeFilter, filename) {
  const keys = activeKeys(isWorld);
  const headers = buildHeaderRow(t, isWorld);
  const demo = {
    ...DEMO_ROW,
    reporter_country_iso: countries[0]?.iso_code || DEMO_ROW.reporter_country_iso,
    partner: labelByLanguage(partners[0], language, ["name"]) || DEMO_ROW.partner,
    mineral: mineralCode(minerals[0]) || labelByLanguage(minerals[0], language, ["mineral_name", "name"]) || DEMO_ROW.mineral,
    type_trade: typeFilter || DEMO_ROW.type_trade,
  };
  const row = {};
  keys.forEach((key, index) => {
    row[headers[index]] = demo[key] ?? "";
  });
  const ws = buildStyledSheet([row], headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  downloadWorkbook(wb, filename);
}

export async function parsePartnerTradeExcelFile(file, countries, partners, minerals, t, isWorld, typeFilter) {
  const rawRows = await readExcelRows(file);
  if (!rawRows.length) return [];

  const keys = activeKeys(isWorld);
  const columnMap = buildColumnMap(Object.keys(rawRows[0]), keys, HEADER_ALIASES, { ...t.excelFields, ...t.fields });
  const payloads = [];

  for (const raw of rawRows) {
    const item = rowToRecord(raw, columnMap);
    if (!item.reporter_country_iso && !item.partner && !item.mineral && !item.year && !item.value_usd) continue;

    const country = findCountry(countries, item.reporter_country_iso);
    const partner = findPartner(partners, item.partner);
    const mineral = findMineral(minerals, item.mineral);
    const year = parseIntegerCell(item.year);
    const value = parseFloatCell(item.value_usd);
    const share = parseFloatCell(item.value_share);

    if (!country?.id || !partner?.id || !mineral?.id || Number.isNaN(year)) continue;

    payloads.push({
      reporter_country_id: country.id,
      partner_id: partner.id,
      mineral_trade_id: mineral.id,
      year,
      value_usd: Number.isNaN(value) ? null : value,
      value_share: isWorld && !Number.isNaN(share) ? share : undefined,
      type_trade: typeFilter || normalizeTypeTrade(item.type_trade, typeFilter),
    });
  }

  return payloads;
}

export function normalizePartnerTradePayload(payload, isWorld, typeFilter) {
  return {
    reporter_country_id: Number(payload.reporter_country_id),
    partner_id: Number(payload.partner_id),
    mineral_trade_id: Number(payload.mineral_trade_id),
    year: Number(payload.year),
    value_usd: payload.value_usd === "" || payload.value_usd == null ? null : Number(payload.value_usd),
    value_share: isWorld && payload.value_share !== "" && payload.value_share != null ? Number(payload.value_share) : undefined,
    type_trade: typeFilter || payload.type_trade || "export",
  };
}

export function partnerTradeRecordKey(payload, isWorld, typeFilter) {
  const p = normalizePartnerTradePayload(payload, isWorld, typeFilter);
  return `${p.type_trade}|${p.reporter_country_id}|${p.partner_id}|${p.mineral_trade_id}|${p.year}`;
}

export function findMatchingPartnerTrade(rows, payload, isWorld, typeFilter) {
  const p = normalizePartnerTradePayload(payload, isWorld, typeFilter);
  return (
    rows.find(
      (row) =>
        row &&
        (row.type_trade || typeFilter) === p.type_trade &&
        Number(row.reporter_country_id) === p.reporter_country_id &&
        Number(row.partner_id) === p.partner_id &&
        Number(row.mineral_trade_id) === p.mineral_trade_id &&
        Number(row.year) === p.year
    ) || null
  );
}

export function dedupePartnerTradePayloads(payloads, isWorld, typeFilter) {
  const map = new Map();
  for (const payload of payloads) {
    map.set(partnerTradeRecordKey(payload, isWorld, typeFilter), payload);
  }
  return [...map.values()];
}
