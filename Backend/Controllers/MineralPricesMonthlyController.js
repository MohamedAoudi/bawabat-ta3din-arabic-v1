const monthlyPriceModel = require("../Models/MineralPricesMonthly");

const getAllMonthlyPrices = async (req, res) => {
  try {
    const prices = await monthlyPriceModel.getAllMonthlyPrices();
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMonthlyPriceById = async (req, res) => {
  try {
    const price = await monthlyPriceModel.getMonthlyPriceById(req.params.id);
    if (!price) {
      return res.status(404).json({ message: "Monthly price not found" });
    }
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createMonthlyPrice = async (req, res) => {
  try {
    const { mineral_production_id, price_date } = req.body;
    if (!mineral_production_id || !price_date) {
      return res.status(400).json({ message: "mineral_production_id and price_date are required" });
    }
    const price = await monthlyPriceModel.createMonthlyPrice(req.body);
    res.status(201).json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateMonthlyPrice = async (req, res) => {
  try {
    const price = await monthlyPriceModel.updateMonthlyPrice(req.params.id, req.body);
    if (!price) {
      return res.status(404).json({ message: "Monthly price not found" });
    }
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMonthlyPrice = async (req, res) => {
  try {
    const deleted = await monthlyPriceModel.deleteMonthlyPrice(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Monthly price not found" });
    }
    res.json({ message: "Monthly price soft deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllMonthlyPrices,
  getMonthlyPriceById,
  createMonthlyPrice,
  updateMonthlyPrice,
  deleteMonthlyPrice,
};
