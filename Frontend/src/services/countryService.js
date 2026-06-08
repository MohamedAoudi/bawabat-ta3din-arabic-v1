import apiClient from "./apiClient";

const API_URL = "/countries";

// Get all countries
export const getCountries = async () => {
  try {
    const response = await apiClient.get(API_URL);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
};

// Get country by ID
export const getCountryById = async (id) => {
  try {
    const response = await apiClient.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching country ${id}:`, error);
    return null;
  }
};

// Create new country (admin only)
export const createCountry = async (countryData) => {
  try {
    const response = await apiClient.post(API_URL, countryData);
    return response.data;
  } catch (error) {
    console.error("Error creating country:", error.response?.data || error.message || error);
    throw error;
  }
};

// Update country (admin only)
export const updateCountry = async (id, countryData) => {
  try {
    const response = await apiClient.put(`${API_URL}/${id}`, countryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating country ${id}:`, error);
    throw error;
  }
};

// Delete country (admin only)
export const deleteCountry = async (id) => {
  try {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting country ${id}:`, error);
    throw error;
  }
};
