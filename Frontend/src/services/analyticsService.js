import apiClient from "./apiClient";

// Read-only data for the public dashboard pages (M1, M2, M5, M6).
// Backed by the Express /api/analytics/* endpoints (joined over the public schema).

// Production rows (arab_production joined): country x mineral x year.
// Fields: country_id, country_code, country_name_{ar,en,fr}, mineral_id,
// mineral_name_{ar,en,fr}, year, production_quantity, production_value_base,
// unit_name_{ar,en,fr}.
export const getProductionAnalytics = async () => {
  const response = await apiClient.get("/analytics/production");
  return response.data;
};

// Trade rows (trade_world joined): reporter country x mineral x year.
// type: "export" | "import" (omit for both).
// Fields: country_id, country_code, country_name_{ar,en,fr}, mineral_id,
// mineral_name_{ar,en,fr}, year, trade_value_usd, type_trade.
export const getTradeAnalytics = async (type) => {
  const response = await apiClient.get("/analytics/trade", {
    params: type ? { type } : {},
  });
  return response.data;
};
