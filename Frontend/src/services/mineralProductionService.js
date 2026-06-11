import apiClient from "./apiClient";

const resource = "/minerals";

export const getMineralProduction = async () => {
  const response = await apiClient.get(resource);
  return response.data;
};

export const getMineralById = async (id) => {
  const response = await apiClient.get(`${resource}/${id}`);
  return response.data;
};

export const createMineralProduction = async (payload) => {
  const response = await apiClient.post(resource, payload);
  return response.data;
};

export const updateMineralProduction = async (id, payload) => {
  const response = await apiClient.put(`${resource}/${id}`, payload);
  return response.data;
};

export const deleteMineralProduction = async (id) => {
  const response = await apiClient.delete(`${resource}/${id}`);
  return response.data;
};
