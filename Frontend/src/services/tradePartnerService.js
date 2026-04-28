import { createCrudService } from "./crudService";

const tradePartnerService = createCrudService("/trade-partners");

export const getTradePartners = tradePartnerService.getAll;
export const getTradePartnerById = tradePartnerService.getById;
export const createTradePartner = tradePartnerService.create;
export const updateTradePartner = tradePartnerService.update;
export const deleteTradePartner = tradePartnerService.remove;

export default tradePartnerService;
