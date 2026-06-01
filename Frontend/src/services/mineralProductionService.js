import apiClient from "./apiClient";

const API_URL = "/mineral-production";

// Get all mineral production records
export const getMineralProduction = async () => {
  try {
    const response = await apiClient.get(API_URL);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching mineral production:", error);
    return [];
  }
};

// Get mineral production by ID
export const getMineralProductionById = async (id) => {
  try {
    const response = await apiClient.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching mineral production ${id}:`, error);
    return null;
  }
};

// Get mineral production by country and year
export const getMineralProductionByCountryYear = async (countryId, year) => {
  try {
    const response = await apiClient.get(`${API_URL}/country/${countryId}/year/${year}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching mineral production for country ${countryId}, year ${year}:`, error);
    return [];
  }
};

// Create new mineral production record (admin only)
export const createMineralProduction = async (productionData) => {
  try {
    const response = await apiClient.post(API_URL, productionData);
    return response.data;
  } catch (error) {
    console.error("Error creating mineral production:", error);
    throw error;
  }
};

// Update mineral production record (admin only)
export const updateMineralProduction = async (id, productionData) => {
  try {
    const response = await apiClient.put(`${API_URL}/${id}`, productionData);
    return response.data;
  } catch (error) {
    console.error(`Error updating mineral production ${id}:`, error);
    throw error;
  }
};

// Delete mineral production record (admin only)
export const deleteMineralProduction = async (id) => {
  try {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting mineral production ${id}:`, error);
    throw error;
  }
};
