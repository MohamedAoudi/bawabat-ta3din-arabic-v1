import apiClient from "./apiClient";

const resource = "/trade-partners";

export const getTradePartners = async () => {
  const response = await apiClient.get(resource);
  return response.data;
};

export const getTradePartnerById = async (id) => {
  const response = await apiClient.get(`${resource}/${id}`);
  return response.data;
};

export const createTradePartner = async (payload) => {
  const response = await apiClient.post(resource, payload);
  return response.data;
};

export const updateTradePartner = async (id, payload) => {
  const response = await apiClient.put(`${resource}/${id}`, payload);
  return response.data;
};

export const deleteTradePartner = async (id) => {
  const response = await apiClient.delete(`${resource}/${id}`);
  return response.data;
};
