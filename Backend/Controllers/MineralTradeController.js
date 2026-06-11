const mineralTradeModel = require("../Models/MineralTrade");

const getAllMineralTrades = async (req, res) => {
  try {
    const trades = await mineralTradeModel.getAllMineralTrades();
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMineralTradeById = async (req, res) => {
  try {
    const trade = await mineralTradeModel.getMineralTradeById(req.params.id);
    if (!trade) {
      return res.status(404).json({ message: "Mineral trade not found" });
    }
    res.json(trade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createMineralTrade = async (req, res) => {
  try {
    const { mineral_name_ar, mineral_name_en, mineral_name_fr } = req.body;
    if (!mineral_name_ar || !mineral_name_en || !mineral_name_fr) {
      return res.status(400).json({ message: "Mineral trade names are required in all languages" });
    }
    const trade = await mineralTradeModel.createMineralTrade(req.body);
    res.status(201).json(trade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateMineralTrade = async (req, res) => {
  try {
    const trade = await mineralTradeModel.updateMineralTrade(req.params.id, req.body);
    if (!trade) {
      return res.status(404).json({ message: "Mineral trade not found" });
    }
    res.json(trade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMineralTrade = async (req, res) => {
  try {
    const deleted = await mineralTradeModel.deleteMineralTrade(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Mineral trade not found" });
    }
    res.json({ message: "Mineral trade deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllMineralTrades,
  getMineralTradeById,
  createMineralTrade,
  updateMineralTrade,
  deleteMineralTrade,
};
