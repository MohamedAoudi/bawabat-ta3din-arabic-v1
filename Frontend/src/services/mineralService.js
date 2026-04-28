import { createCrudService } from "./crudService";

const mineralService = createCrudService("/minerals");

export const getMinerals = mineralService.getAll;
export const getMineralById = mineralService.getById;
export const createMineral = mineralService.create;
export const updateMineral = mineralService.update;
export const deleteMineral = mineralService.remove;

export default mineralService;
