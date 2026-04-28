const bilateralTradeModel = require("../Models/BilateralTrade");

const getAllBilateralTrade = async (req, res) => {
  try {
    const rows = await bilateralTradeModel.getAllBilateralTrade();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBilateralTradeById = async (req, res) => {
  try {
    const row = await bilateralTradeModel.getBilateralTradeById(req.params.id);
    if (!row) {
      return res.status(404).json({ message: "Bilateral trade not found" });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createBilateralTrade = async (req, res) => {
  try {
    const { country_id, partner_id, year, trade_type } = req.body;
    if (!country_id || !partner_id || !year || !trade_type) {
      return res.status(400).json({ message: "country_id, partner_id, year and trade_type are required" });
    }

    const row = await bilateralTradeModel.createBilateralTrade(req.body);
    res.status(201).json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBilateralTrade = async (req, res) => {
  try {
    const row = await bilateralTradeModel.updateBilateralTrade(req.params.id, req.body);
    if (!row) {
      return res.status(404).json({ message: "Bilateral trade not found" });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBilateralTrade = async (req, res) => {
  try {
    const row = await bilateralTradeModel.deleteBilateralTrade(req.params.id);
    if (!row) {
      return res.status(404).json({ message: "Bilateral trade not found" });
    }
    res.json({ message: "Bilateral trade deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllBilateralTrade,
  getBilateralTradeById,
  createBilateralTrade,
  updateBilateralTrade,
  deleteBilateralTrade,
};
