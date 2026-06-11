const worldProductionModel = require("../Models/WorldProduction");

const getAllWorldProductions = async (req, res) => {
  try {
    const productions = await worldProductionModel.getAllWorldProductions();
    res.json(productions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWorldProductionById = async (req, res) => {
  try {
    const production = await worldProductionModel.getWorldProductionById(req.params.id);
    if (!production) {
      return res.status(404).json({ message: "World production record not found" });
    }
    res.json(production);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createWorldProduction = async (req, res) => {
  try {
    const { mineral_production_id, year } = req.body;
    if (!mineral_production_id || !year) {
      return res.status(400).json({ message: "mineral_production_id and year are required" });
    }
    const production = await worldProductionModel.createWorldProduction(req.body);
    res.status(201).json(production);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateWorldProduction = async (req, res) => {
  try {
    const production = await worldProductionModel.updateWorldProduction(req.params.id, req.body);
    if (!production) {
      return res.status(404).json({ message: "World production record not found" });
    }
    res.json(production);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteWorldProduction = async (req, res) => {
  try {
    const deleted = await worldProductionModel.deleteWorldProduction(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "World production record not found" });
    }
    res.json({ message: "World production record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllWorldProductions,
  getWorldProductionById,
  createWorldProduction,
  updateWorldProduction,
  deleteWorldProduction,
};
