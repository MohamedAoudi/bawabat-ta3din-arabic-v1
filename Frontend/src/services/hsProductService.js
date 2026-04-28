import { createCrudService } from "./crudService";

const hsProductService = createCrudService("/hs-products");

export const getHSProducts = hsProductService.getAll;
export const getHSProductByCode = hsProductService.getById;
export const createHSProduct = hsProductService.create;
export const updateHSProduct = hsProductService.update;
export const deleteHSProduct = hsProductService.remove;

export default hsProductService;
