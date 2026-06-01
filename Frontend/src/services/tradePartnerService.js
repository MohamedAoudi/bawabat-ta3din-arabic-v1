import apiClient from "./apiClient";

const API_URL = "/trade-partners";

// Get all trade partners
export const getTradePartners = async () => {
  try {
    const response = await apiClient.get(API_URL);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching trade partners:", error);
    return [];
  }
};

// Get trade partner by ID
export const getTradePartnerById = async (id) => {
  try {
    const response = await apiClient.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching trade partner ${id}:`, error);
    return null;
  }
};

// Create new trade partner (admin only)
export const createTradePartner = async (partnerData) => {
  try {
    const response = await apiClient.post(API_URL, partnerData);
    return response.data;
  } catch (error) {
    console.error("Error creating trade partner:", error);
    throw error;
  }
};

// Update trade partner (admin only)
export const updateTradePartner = async (id, partnerData) => {
  try {
    const response = await apiClient.put(`${API_URL}/${id}`, partnerData);
    return response.data;
  } catch (error) {
    console.error(`Error updating trade partner ${id}:`, error);
    throw error;
  }
};

// Delete trade partner (admin only)
export const deleteTradePartner = async (id) => {
  try {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting trade partner ${id}:`, error);
    throw error;
  }
};
