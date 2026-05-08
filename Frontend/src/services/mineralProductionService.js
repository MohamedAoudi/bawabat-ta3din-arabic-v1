import { createCrudService } from "./crudService";
import apiClient from "./apiClient";

const mineralProductionService = createCrudService("/mineral-production");

export const getMineralProduction = mineralProductionService.getAll;
export const getMineralProductionById = mineralProductionService.getById;
export const createMineralProduction = mineralProductionService.create;
export const updateMineralProduction = mineralProductionService.update;
export const deleteMineralProduction = mineralProductionService.remove;

const normalizeUnitFromDb = (row) => {
  const unit =
    row?.unit ||
    row?.unit_name_ar ||
    row?.unit_name_en ||
    row?.unit_name_fr ||
    row?.unite ||
    "";
  return { ...row, unit };
};

export const getMineralProductionAnalytics = async () => {
  const response = await apiClient.get("/mineral-production/analytics/overview");
  return (Array.isArray(response.data) ? response.data : []).map(normalizeUnitFromDb);
};

export const getMineralProductionTrend = async ({ country_id, mineral_id }) => {
  const response = await apiClient.get("/mineral-production/trend", {
    params: { country_id, mineral_id },
  });
  return (Array.isArray(response.data) ? response.data : []).map(normalizeUnitFromDb);
};

export default mineralProductionService;
