const yearlyPriceModel = require("../Models/MineralPricesYearly");

const getAllYearlyPrices = async (req, res) => {
  try {
    const prices = await yearlyPriceModel.getAllYearlyPrices();
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getYearlyPriceById = async (req, res) => {
  try {
    const price = await yearlyPriceModel.getYearlyPriceById(req.params.id);
    if (!price) {
      return res.status(404).json({ message: "Yearly price not found" });
    }
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createYearlyPrice = async (req, res) => {
  try {
    const { mineral_production_id, price_date } = req.body;
    if (!mineral_production_id || !price_date) {
      return res.status(400).json({ message: "mineral_production_id and price_date are required" });
    }
    const price = await yearlyPriceModel.createYearlyPrice(req.body);
    res.status(201).json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateYearlyPrice = async (req, res) => {
  try {
    const price = await yearlyPriceModel.updateYearlyPrice(req.params.id, req.body);
    if (!price) {
      return res.status(404).json({ message: "Yearly price not found" });
    }
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteYearlyPrice = async (req, res) => {
  try {
    const deleted = await yearlyPriceModel.deleteYearlyPrice(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Yearly price not found" });
    }
    res.json({ message: "Yearly price soft deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllYearlyPrices,
  getYearlyPriceById,
  createYearlyPrice,
  updateYearlyPrice,
  deleteYearlyPrice,
};
