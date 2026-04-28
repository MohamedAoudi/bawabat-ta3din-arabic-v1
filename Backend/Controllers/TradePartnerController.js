const tradePartnerModel = require("../Models/TradePartner");

const getAllTradePartners = async (req, res) => {
  try {
    const partners = await tradePartnerModel.getAllTradePartners();
    res.json(partners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTradePartnerById = async (req, res) => {
  try {
    const partner = await tradePartnerModel.getTradePartnerById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: "Trade partner not found" });
    }
    res.json(partner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTradePartner = async (req, res) => {
  try {
    const { name, partner_category } = req.body;
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const partner = await tradePartnerModel.createTradePartner({ name, partner_category });
    res.status(201).json(partner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTradePartner = async (req, res) => {
  try {
    const partner = await tradePartnerModel.updateTradePartner(req.params.id, req.body);
    if (!partner) {
      return res.status(404).json({ message: "Trade partner not found" });
    }
    res.json(partner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTradePartner = async (req, res) => {
  try {
    const partner = await tradePartnerModel.deleteTradePartner(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: "Trade partner not found" });
    }
    res.json({ message: "Trade partner deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTradePartners,
  getTradePartnerById,
  createTradePartner,
  updateTradePartner,
  deleteTradePartner,
};
