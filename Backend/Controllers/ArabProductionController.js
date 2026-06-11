const arabProductionModel = require("../Models/ArabProduction");

const getAllArabProductions = async (req, res) => {
  try {
    const productions = await arabProductionModel.getAllArabProductions();
    res.json(productions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getArabProductionById = async (req, res) => {
  try {
    const production = await arabProductionModel.getArabProductionById(req.params.id);
    if (!production) {
      return res.status(404).json({ message: "Arab production record not found" });
    }
    res.json(production);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createArabProduction = async (req, res) => {
  try {
    const { country_id, mineral_production_id, year } = req.body;
    if (!country_id || !mineral_production_id || !year) {
      return res.status(400).json({ message: "country_id, mineral_production_id and year are required" });
    }
    const production = await arabProductionModel.createArabProduction(req.body);
    res.status(201).json(production);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateArabProduction = async (req, res) => {
  try {
    const production = await arabProductionModel.updateArabProduction(req.params.id, req.body);
    if (!production) {
      return res.status(404).json({ message: "Arab production record not found" });
    }
    res.json(production);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteArabProduction = async (req, res) => {
  try {
    const deleted = await arabProductionModel.deleteArabProduction(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Arab production record not found" });
    }
    res.json({ message: "Arab production record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllArabProductions,
  getArabProductionById,
  createArabProduction,
  updateArabProduction,
  deleteArabProduction,
};
