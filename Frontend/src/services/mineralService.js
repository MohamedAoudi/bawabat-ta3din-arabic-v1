import apiClient from "./apiClient";

const API_URL = "/minerals";

// Get all minerals
export const getMinerals = async () => {
  try {
    const response = await apiClient.get(API_URL);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching minerals:", error);
    return [];
  }
};

// Get mineral by ID
export const getMineralById = async (id) => {
  try {
    const response = await apiClient.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching mineral ${id}:`, error);
    return null;
  }
};

// Create new mineral (admin only)
export const createMineral = async (mineralData) => {
  try {
    const response = await apiClient.post(API_URL, mineralData);
    return response.data;
  } catch (error) {
    console.error("Error creating mineral:", error);
    throw error;
  }
};

// Update mineral (admin only)
export const updateMineral = async (id, mineralData) => {
  try {
    const response = await apiClient.put(`${API_URL}/${id}`, mineralData);
    return response.data;
  } catch (error) {
    console.error(`Error updating mineral ${id}:`, error);
    throw error;
  }
};

// Delete mineral (admin only)
export const deleteMineral = async (id) => {
  try {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting mineral ${id}:`, error);
    throw error;
  }
};
