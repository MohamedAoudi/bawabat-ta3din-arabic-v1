import apiClient from "./apiClient";

const resource = "/world-production";

export const getAllWorldProductions = async () => {
  const response = await apiClient.get(resource);
  return response.data;
};

export const getWorldProductionById = async (id) => {
  const response = await apiClient.get(`${resource}/${id}`);
  return response.data;
};

export const createWorldProduction = async (payload) => {
  const response = await apiClient.post(resource, payload);
  return response.data;
};

export const updateWorldProduction = async (id, payload) => {
  const response = await apiClient.put(`${resource}/${id}`, payload);
  return response.data;
};

export const deleteWorldProduction = async (id) => {
  const response = await apiClient.delete(`${resource}/${id}`);
  return response.data;
};
