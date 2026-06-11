import apiClient from "./apiClient";

const resource = "/mineral-prices/quarterly";

export const getAllQuarterlyPrices = async () => {
  const response = await apiClient.get(resource);
  return response.data;
};

export const getQuarterlyPriceById = async (id) => {
  const response = await apiClient.get(`${resource}/${id}`);
  return response.data;
};

export const createQuarterlyPrice = async (payload) => {
  const response = await apiClient.post(resource, payload);
  return response.data;
};

export const updateQuarterlyPrice = async (id, payload) => {
  const response = await apiClient.put(`${resource}/${id}`, payload);
  return response.data;
};

export const deleteQuarterlyPrice = async (id) => {
  const response = await apiClient.delete(`${resource}/${id}`);
  return response.data;
};
