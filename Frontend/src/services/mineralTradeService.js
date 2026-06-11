import apiClient from "./apiClient";

const resource = "/mineral-trade";

export const getAllMineralTrades = async () => {
  const response = await apiClient.get(resource);
  return response.data;
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
