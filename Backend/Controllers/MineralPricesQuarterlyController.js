const quarterlyPriceModel = require("../Models/MineralPricesQuarterly");

const getAllQuarterlyPrices = async (req, res) => {
  try {
    const prices = await quarterlyPriceModel.getAllQuarterlyPrices();
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getQuarterlyPriceById = async (req, res) => {
  try {
    const price = await quarterlyPriceModel.getQuarterlyPriceById(req.params.id);
    if (!price) {
      return res.status(404).json({ message: "Quarterly price not found" });
    }
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createQuarterlyPrice = async (req, res) => {
  try {
    const { mineral_production_id, price_date } = req.body;
    if (!mineral_production_id || !price_date) {
      return res.status(400).json({ message: "mineral_production_id and price_date are required" });
    }
    const price = await quarterlyPriceModel.createQuarterlyPrice(req.body);
    res.status(201).json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateQuarterlyPrice = async (req, res) => {
  try {
    const price = await quarterlyPriceModel.updateQuarterlyPrice(req.params.id, req.body);
    if (!price) {
      return res.status(404).json({ message: "Quarterly price not found" });
    }
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteQuarterlyPrice = async (req, res) => {
  try {
    const deleted = await quarterlyPriceModel.deleteQuarterlyPrice(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Quarterly price not found" });
    }
    res.json({ message: "Quarterly price soft deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllQuarterlyPrices,
  getQuarterlyPriceById,
  createQuarterlyPrice,
  updateQuarterlyPrice,
  deleteQuarterlyPrice,
};
