import apiClient from "./apiClient";

const API_URL = "/years";

// Get all years
export const getYears = async () => {
  try {
    const response = await apiClient.get(API_URL);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching years:", error);
    return [];
  }
};

// Get year by ID
export const getYearById = async (year) => {
  try {
    const response = await apiClient.get(`${API_URL}/${year}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching year ${year}:`, error);
    return null;
  }
};

// Create new year (admin only)
export const createYear = async (yearData) => {
  try {
    const response = await apiClient.post(API_URL, yearData);
    return response.data;
  } catch (error) {
    console.error("Error creating year:", error);
    throw error;
  }
};

// Update year (admin only)
export const updateYear = async (year, yearData) => {
  try {
    const response = await apiClient.put(`${API_URL}/${year}`, yearData);
    return response.data;
  } catch (error) {
    console.error(`Error updating year ${year}:`, error);
    throw error;
  }
};

// Delete year (admin only)
export const deleteYear = async (year) => {
  try {
    const response = await apiClient.delete(`${API_URL}/${year}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting year ${year}:`, error);
    throw error;
  }
};
