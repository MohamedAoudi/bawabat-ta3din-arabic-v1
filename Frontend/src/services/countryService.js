import { createCrudService } from "./crudService";

const countryService = createCrudService("/countries");

export const getCountries = countryService.getAll;
export const getCountryById = countryService.getById;
export const createCountry = countryService.create;
export const updateCountry = countryService.update;
export const deleteCountry = countryService.remove;

export default countryService;
