const tradeTransactionModel = require("../Models/TradeTransaction");

const getAllTradeTransactions = async (req, res) => {
  try {
    const rows = await tradeTransactionModel.getAllTradeTransactions();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCriticalMineralExportsAnalytics = async (req, res) => {
  try {
    const rows = await tradeTransactionModel.getCriticalMineralExportsAnalytics();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTradeTransactionById = async (req, res) => {
  try {
    const row = await tradeTransactionModel.getTradeTransactionById(req.params.id);
    if (!row) {
      return res.status(404).json({ message: "Trade transaction not found" });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTradeTransaction = async (req, res) => {
  try {
    const { country_id, mineral_id, year, trade_type } = req.body;
    if (!country_id || !mineral_id || !year || !trade_type) {
      return res.status(400).json({ message: "country_id, mineral_id, year and trade_type are required" });
    }

    const row = await tradeTransactionModel.createTradeTransaction(req.body);
    res.status(201).json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTradeTransaction = async (req, res) => {
  try {
    const row = await tradeTransactionModel.updateTradeTransaction(req.params.id, req.body);
    if (!row) {
      return res.status(404).json({ message: "Trade transaction not found" });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTradeTransaction = async (req, res) => {
  try {
    const row = await tradeTransactionModel.deleteTradeTransaction(req.params.id);
    if (!row) {
      return res.status(404).json({ message: "Trade transaction not found" });
    }
    res.json({ message: "Trade transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTradeTransactions,
  getCriticalMineralExportsAnalytics,
  getTradeTransactionById,
  createTradeTransaction,
  updateTradeTransaction,
  deleteTradeTransaction,
};
