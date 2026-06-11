import apiClient from "./apiClient";

const resource = "/mineral-prices/live";

export const getAllLivePrices = async () => {
  const response = await apiClient.get(resource);
  return response.data;
};

export const getLivePriceById = async (id) => {
  const response = await apiClient.get(`${resource}/${id}`);
  return response.data;
};

export const createLivePrice = async (payload) => {
  const response = await apiClient.post(resource, payload);
  return response.data;
};

export const updateLivePrice = async (id, payload) => {
  const response = await apiClient.put(`${resource}/${id}`, payload);
  return response.data;
};

export const deleteLivePrice = async (id) => {
  const response = await apiClient.delete(`${resource}/${id}`);
  return response.data;
};
