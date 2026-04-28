import apiClient from "./apiClient";

export const createCrudService = (resourcePath) => ({
  getAll: async () => {
    const response = await apiClient.get(resourcePath);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`${resourcePath}/${id}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await apiClient.post(resourcePath, payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await apiClient.put(`${resourcePath}/${id}`, payload);
    return response.data;
  },

  remove: async (id) => {
    const response = await apiClient.delete(`${resourcePath}/${id}`);
    return response.data;
  },
});
