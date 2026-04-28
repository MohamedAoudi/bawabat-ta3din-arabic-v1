import apiClient from "./apiClient";

const RESOURCE_PATH = "/country-production-summaries";

export const getCountryProductionSummaries = async () => {
  const response = await apiClient.get(RESOURCE_PATH);
  return response.data;
};

export const getCountryProductionSummary = async (countryId, year, mineralId) => {
  const response = await apiClient.get(`${RESOURCE_PATH}/${countryId}/${year}/${mineralId}`);
  return response.data;
};

export const createCountryProductionSummary = async (payload) => {
  const response = await apiClient.post(RESOURCE_PATH, payload);
  return response.data;
};

export const updateCountryProductionSummary = async (countryId, year, mineralId, payload) => {
  const response = await apiClient.put(`${RESOURCE_PATH}/${countryId}/${year}/${mineralId}`, payload);
  return response.data;
};

export const deleteCountryProductionSummary = async (countryId, year, mineralId) => {
  const response = await apiClient.delete(`${RESOURCE_PATH}/${countryId}/${year}/${mineralId}`);
  return response.data;
};

const countryProductionSummaryService = {
  getAll: getCountryProductionSummaries,
  getByKey: getCountryProductionSummary,
  create: createCountryProductionSummary,
  update: updateCountryProductionSummary,
  remove: deleteCountryProductionSummary,
};

export default countryProductionSummaryService;
