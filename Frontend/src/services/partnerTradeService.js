import apiClient from "./apiClient";

const resource = "/partner-trade";

export const getAllPartnerTrades = async () => {
  const response = await apiClient.get(resource);
  return response.data;
};

export const getPartnerTradeById = async (id) => {
  const response = await apiClient.get(`${resource}/${id}`);
  return response.data;
};

export const createPartnerTrade = async (payload) => {
  const response = await apiClient.post(resource, payload);
  return response.data;
};

export const updatePartnerTrade = async (id, payload) => {
  const response = await apiClient.put(`${resource}/${id}`, payload);
  return response.data;
};

export const deletePartnerTrade = async (id) => {
  const response = await apiClient.delete(`${resource}/${id}`);
  return response.data;
};
