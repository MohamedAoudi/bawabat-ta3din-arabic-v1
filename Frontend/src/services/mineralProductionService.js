import { createCrudService } from "./crudService";
import apiClient from "./apiClient";

const mineralProductionService = createCrudService("/mineral-production");

export const getMineralProduction = mineralProductionService.getAll;
export const getMineralProductionById = mineralProductionService.getById;
export const createMineralProduction = mineralProductionService.create;
export const updateMineralProduction = mineralProductionService.update;
export const deleteMineralProduction = mineralProductionService.remove;
export const getMineralProductionAnalytics = async () => {
  const response = await apiClient.get("/mineral-production/analytics/overview");
  return response.data;
};

export const getMineralProductionTrend = async ({ country_id, mineral_id }) => {
  const response = await apiClient.get("/mineral-production/trend", {
    params: { country_id, mineral_id },
  });
  return response.data;
};

export default mineralProductionService;
