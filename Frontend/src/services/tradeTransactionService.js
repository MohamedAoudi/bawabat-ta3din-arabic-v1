import { createCrudService } from "./crudService";
import apiClient from "./apiClient";

const tradeTransactionService = createCrudService("/trade-transactions");

export const getTradeTransactions = tradeTransactionService.getAll;
export const getTradeTransactionById = tradeTransactionService.getById;
export const createTradeTransaction = tradeTransactionService.create;
export const updateTradeTransaction = tradeTransactionService.update;
export const deleteTradeTransaction = tradeTransactionService.remove;
export const getCriticalMineralExportsAnalytics = async () => {
  const response = await apiClient.get("/trade-transactions/analytics/critical-exports");
  return response.data;
};

export default tradeTransactionService;
