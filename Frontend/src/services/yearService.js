import { createCrudService } from "./crudService";

const yearService = createCrudService("/years");

export const getYears = yearService.getAll;
export const getYearByValue = yearService.getById;
export const createYear = yearService.create;
export const updateYear = yearService.update;
export const deleteYear = yearService.remove;

export default yearService;
