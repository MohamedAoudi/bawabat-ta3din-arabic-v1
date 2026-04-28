import apiClient from "./apiClient";

const RESOURCE_PATH = "/country-trade-summaries";

export const getCountryTradeSummaries = async () => {
  const response = await apiClient.get(RESOURCE_PATH);
  return response.data;
};

export const getCountryTradeSummary = async (countryId, year, tradeType) => {
  const response = await apiClient.get(`${RESOURCE_PATH}/${countryId}/${year}/${tradeType}`);
  return response.data;
};

export const createCountryTradeSummary = async (payload) => {
  const response = await apiClient.post(RESOURCE_PATH, payload);
  return response.data;
};

export const updateCountryTradeSummary = async (countryId, year, tradeType, payload) => {
  const response = await apiClient.put(`${RESOURCE_PATH}/${countryId}/${year}/${tradeType}`, payload);
  return response.data;
};

export const deleteCountryTradeSummary = async (countryId, year, tradeType) => {
  const response = await apiClient.delete(`${RESOURCE_PATH}/${countryId}/${year}/${tradeType}`);
  return response.data;
};

const countryTradeSummaryService = {
  getAll: getCountryTradeSummaries,
  getByKey: getCountryTradeSummary,
  create: createCountryTradeSummary,
  update: updateCountryTradeSummary,
  remove: deleteCountryTradeSummary,
};

export default countryTradeSummaryService;
