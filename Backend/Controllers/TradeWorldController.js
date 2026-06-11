const tradeWorldModel = require("../Models/TradeWorld");

const getAllTradeWorld = async (req, res) => {
  try {
    const trades = await tradeWorldModel.getAllTradeWorld();
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTradeWorldById = async (req, res) => {
  try {
    const trade = await tradeWorldModel.getTradeWorldById(req.params.id);
    if (!trade) {
      return res.status(404).json({ message: "Trade world record not found" });
    }
    res.json(trade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTradeWorld = async (req, res) => {
  try {
    const { reporter_country_id, partner_id, mineral_trade_id, year, type_trade } = req.body;
    if (!reporter_country_id || !partner_id || !mineral_trade_id || !year || !type_trade) {
      return res.status(400).json({ message: "reporter_country_id, partner_id, mineral_trade_id, year and type_trade are required" });
    }
    const trade = await tradeWorldModel.createTradeWorld(req.body);
    res.status(201).json(trade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTradeWorld = async (req, res) => {
  try {
    const trade = await tradeWorldModel.updateTradeWorld(req.params.id, req.body);
    if (!trade) {
      return res.status(404).json({ message: "Trade world record not found" });
    }
    res.json(trade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTradeWorld = async (req, res) => {
  try {
    const deleted = await tradeWorldModel.deleteTradeWorld(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Trade world record not found" });
    }
    res.json({ message: "Trade world record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTradeWorld,
  getTradeWorldById,
  createTradeWorld,
  updateTradeWorld,
  deleteTradeWorld,
};
