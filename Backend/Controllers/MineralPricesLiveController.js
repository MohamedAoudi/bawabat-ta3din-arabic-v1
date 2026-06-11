const livePriceModel = require("../Models/MineralPricesLive");

const getAllLivePrices = async (req, res) => {
  try {
    const prices = await livePriceModel.getAllLivePrices();
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLivePriceById = async (req, res) => {
  try {
    const price = await livePriceModel.getLivePriceById(req.params.id);
    if (!price) {
      return res.status(404).json({ message: "Live price not found" });
    }
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createLivePrice = async (req, res) => {
  try {
    const { mineral_production_id, price_date } = req.body;
    if (!mineral_production_id || !price_date) {
      return res.status(400).json({ message: "mineral_production_id and price_date are required" });
    }
    const price = await livePriceModel.createLivePrice(req.body);
    res.status(201).json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateLivePrice = async (req, res) => {
  try {
    const price = await livePriceModel.updateLivePrice(req.params.id, req.body);
    if (!price) {
      return res.status(404).json({ message: "Live price not found" });
    }
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteLivePrice = async (req, res) => {
  try {
    const deleted = await livePriceModel.deleteLivePrice(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Live price not found" });
    }
    res.json({ message: "Live price soft deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllLivePrices,
  getLivePriceById,
  createLivePrice,
  updateLivePrice,
  deleteLivePrice,
};
