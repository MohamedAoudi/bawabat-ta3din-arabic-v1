import apiClient from "./apiClient";

const resource = "/trade-world";

export const getAllTradeWorld = async () => {
  const response = await apiClient.get(resource);
  return response.data;
};

export const getTradeWorldById = async (id) => {
  const response = await apiClient.get(`${resource}/${id}`);
  return response.data;
};

export const createTradeWorld = async (payload) => {
  const response = await apiClient.post(resource, payload);
  return response.data;
};

export const updateTradeWorld = async (id, payload) => {
  const response = await apiClient.put(`${resource}/${id}`, payload);
  return response.data;
};

export const deleteTradeWorld = async (id) => {
  const response = await apiClient.delete(`${resource}/${id}`);
  return response.data;
};
