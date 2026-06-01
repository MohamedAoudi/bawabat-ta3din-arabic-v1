import apiClient from "./apiClient";

const API_URL = "/trade-transactions";

// Get all trade transactions
export const getTradeTransactions = async () => {
  try {
    const response = await apiClient.get(API_URL);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching trade transactions:", error);
    return [];
  }
};

// Get trade transaction by ID
export const getTradeTransactionById = async (id) => {
  try {
    const response = await apiClient.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching trade transaction ${id}:`, error);
    return null;
  }
};

// Get trade transactions by country and year
export const getTradeTransactionsByCountryYear = async (countryId, year) => {
  try {
    const response = await apiClient.get(`${API_URL}/country/${countryId}/year/${year}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching trade transactions for country ${countryId}, year ${year}:`, error);
    return [];
  }
};

// Get trade transactions by type (import/export)
export const getTradeTransactionsByType = async (tradeType) => {
  try {
    const response = await apiClient.get(`${API_URL}/type/${tradeType}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching trade transactions by type ${tradeType}:`, error);
    return [];
  }
};

// Create new trade transaction (admin only)
export const createTradeTransaction = async (transactionData) => {
  try {
    const response = await apiClient.post(API_URL, transactionData);
    return response.data;
  } catch (error) {
    console.error("Error creating trade transaction:", error);
    throw error;
  }
};

// Update trade transaction (admin only)
export const updateTradeTransaction = async (id, transactionData) => {
  try {
    const response = await apiClient.put(`${API_URL}/${id}`, transactionData);
    return response.data;
  } catch (error) {
    console.error(`Error updating trade transaction ${id}:`, error);
    throw error;
  }
};

// Delete trade transaction (admin only)
export const deleteTradeTransaction = async (id) => {
  try {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting trade transaction ${id}:`, error);
    throw error;
  }
};
