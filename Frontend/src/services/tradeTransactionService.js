import { createCrudService } from "./crudService";

const tradeTransactionService = createCrudService("/trade-transactions");

export const getTradeTransactions = tradeTransactionService.getAll;
export const getTradeTransactionById = tradeTransactionService.getById;
export const createTradeTransaction = tradeTransactionService.create;
export const updateTradeTransaction = tradeTransactionService.update;
export const deleteTradeTransaction = tradeTransactionService.remove;

export default tradeTransactionService;
