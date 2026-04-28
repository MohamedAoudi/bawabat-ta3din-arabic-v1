import { createCrudService } from "./crudService";

const mineralProductionService = createCrudService("/mineral-production");

export const getMineralProduction = mineralProductionService.getAll;
export const getMineralProductionById = mineralProductionService.getById;
export const createMineralProduction = mineralProductionService.create;
export const updateMineralProduction = mineralProductionService.update;
export const deleteMineralProduction = mineralProductionService.remove;

export default mineralProductionService;
