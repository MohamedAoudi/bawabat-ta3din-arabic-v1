import apiClient from "./apiClient";

const resource = "/mineral-trade";

export const getAllMineralTrades = async () => {
  const response = await apiClient.get(resource);
  return response.data;
};

// Trade minerals shaped as { id, name_ar, name_en, name_fr } for the
// dashboard pages (M5/M6) whose lookups expect generic `name_*` fields.
export const getTradeMinerals = async () => {
  const response = await apiClient.get(resource);
  return (Array.isArray(response.data) ? response.data : []).map((m) => ({
    id: m.id,
    name_ar: m.mineral_name_ar,
    name_en: m.mineral_name_en,
    name_fr: m.mineral_name_fr,
  }));
};

export const getMineralTradeById = async (id) => {
  const response = await apiClient.get(`${resource}/${id}`);
  return response.data;
};

export const createMineralTrade = async (payload) => {
  const response = await apiClient.post(resource, payload);
  return response.data;
};

export const updateMineralTrade = async (id, payload) => {
  const response = await apiClient.put(`${resource}/${id}`, payload);
  return response.data;
};

export const deleteMineralTrade = async (id) => {
  const response = await apiClient.delete(`${resource}/${id}`);
  return response.data;
};
