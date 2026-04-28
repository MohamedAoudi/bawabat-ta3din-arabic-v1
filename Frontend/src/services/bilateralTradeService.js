import { createCrudService } from "./crudService";

const bilateralTradeService = createCrudService("/bilateral-trade");

export const getBilateralTrade = bilateralTradeService.getAll;
export const getBilateralTradeById = bilateralTradeService.getById;
export const createBilateralTrade = bilateralTradeService.create;
export const updateBilateralTrade = bilateralTradeService.update;
export const deleteBilateralTrade = bilateralTradeService.remove;

export default bilateralTradeService;
