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
    const { name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr } = req.body;
    if (!name_ar || !name_en || !name_fr) {
      return res.status(400).json({ message: "Partner names are required in all languages" });
    }
    const partner = await tradePartnerModel.createTradePartner({ name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr });
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
    const deleted = await tradePartnerModel.deleteTradePartner(req.params.id);
    if (!deleted) {
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
