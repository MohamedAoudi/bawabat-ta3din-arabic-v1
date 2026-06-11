import apiClient from "./apiClient";

const resource = "/mineral-prices/monthly";

export const getAllMonthlyPrices = async () => {
  const response = await apiClient.get(resource);
  return response.data;
};

export const getMonthlyPriceById = async (id) => {
  const response = await apiClient.get(`${resource}/${id}`);
  return response.data;
};

export const createMonthlyPrice = async (payload) => {
  const response = await apiClient.post(resource, payload);
  return response.data;
};

export const updateMonthlyPrice = async (id, payload) => {
  const response = await apiClient.put(`${resource}/${id}`, payload);
  return response.data;
};

export const deleteMonthlyPrice = async (id) => {
  const response = await apiClient.delete(`${resource}/${id}`);
  return response.data;
};
