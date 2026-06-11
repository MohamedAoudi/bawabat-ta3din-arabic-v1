import apiClient from "./apiClient";

const resource = "/mineral-prices/yearly";

export const getAllYearlyPrices = async () => {
  const response = await apiClient.get(resource);
  return response.data;
};

export const getYearlyPriceById = async (id) => {
  const response = await apiClient.get(`${resource}/${id}`);
  return response.data;
};

export const createYearlyPrice = async (payload) => {
  const response = await apiClient.post(resource, payload);
  return response.data;
};

export const updateYearlyPrice = async (id, payload) => {
  const response = await apiClient.put(`${resource}/${id}`, payload);
  return response.data;
};

export const deleteYearlyPrice = async (id) => {
  const response = await apiClient.delete(`${resource}/${id}`);
  return response.data;
};
