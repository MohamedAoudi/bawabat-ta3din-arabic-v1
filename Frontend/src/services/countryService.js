import apiClient from "./apiClient";

const resource = "/countries";

export const getCountries = async () => {
  const response = await apiClient.get(resource);
  return response.data;
};

export const getCountryById = async (id) => {
  const response = await apiClient.get(`${resource}/${id}`);
  return response.data;
};

export const createCountry = async (payload) => {
  const response = await apiClient.post(resource, payload);
  return response.data;
};

export const updateCountry = async (id, payload) => {
  const response = await apiClient.put(`${resource}/${id}`, payload);
  return response.data;
};

export const deleteCountry = async (id) => {
  const response = await apiClient.delete(`${resource}/${id}`);
  return response.data;
};
