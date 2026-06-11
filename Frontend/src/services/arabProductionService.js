import apiClient from "./apiClient";

const resource = "/arab-production";

export const getAllArabProductions = async () => {
  const response = await apiClient.get(resource);
  return response.data;
};

export const getArabProductionById = async (id) => {
  const response = await apiClient.get(`${resource}/${id}`);
  return response.data;
};

export const createArabProduction = async (payload) => {
  const response = await apiClient.post(resource, payload);
  return response.data;
};

export const updateArabProduction = async (id, payload) => {
  const response = await apiClient.put(`${resource}/${id}`, payload);
  return response.data;
};

export const deleteArabProduction = async (id) => {
  const response = await apiClient.delete(`${resource}/${id}`);
  return response.data;
};
