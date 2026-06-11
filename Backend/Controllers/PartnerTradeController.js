const partnerTradeModel = require("../Models/PartnerTrade");

const getAllPartnerTrades = async (req, res) => {
  try {
    const trades = await partnerTradeModel.getAllPartnerTrades();
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPartnerTradeById = async (req, res) => {
  try {
    const trade = await partnerTradeModel.getPartnerTradeById(req.params.id);
    if (!trade) {
      return res.status(404).json({ message: "Partner trade record not found" });
    }
    res.json(trade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPartnerTrade = async (req, res) => {
  try {
    const { reporter_country_id, partner_id, mineral_trade_id, year, type_trade } = req.body;
    if (!reporter_country_id || !partner_id || !mineral_trade_id || !year || !type_trade) {
      return res.status(400).json({ message: "reporter_country_id, partner_id, mineral_trade_id, year and type_trade are required" });
    }
    const trade = await partnerTradeModel.createPartnerTrade(req.body);
    res.status(201).json(trade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePartnerTrade = async (req, res) => {
  try {
    const trade = await partnerTradeModel.updatePartnerTrade(req.params.id, req.body);
    if (!trade) {
      return res.status(404).json({ message: "Partner trade record not found" });
    }
    res.json(trade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePartnerTrade = async (req, res) => {
  try {
    const deleted = await partnerTradeModel.deletePartnerTrade(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Partner trade record not found" });
    }
    res.json({ message: "Partner trade record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllPartnerTrades,
  getPartnerTradeById,
  createPartnerTrade,
  updatePartnerTrade,
  deletePartnerTrade,
};
