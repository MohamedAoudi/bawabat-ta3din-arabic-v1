const mineralProductionModel = require("../Models/MineralProduction");

const getAllMinerals = async (req, res) => {
  try {
    const minerals = await mineralProductionModel.getAllMineralProductions();
    res.json(minerals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMineralById = async (req, res) => {
  try {
    const mineral = await mineralProductionModel.getMineralProductionById(req.params.id);
    if (!mineral) {
      return res.status(404).json({ message: "Mineral not found" });
    }
    res.json(mineral);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createMineral = async (req, res) => {
  try {
    const { hs_codes, mineral_name_ar, mineral_name_en, mineral_name_fr, source_system } = req.body;
    if (!mineral_name_ar || !mineral_name_en || !mineral_name_fr) {
      return res.status(400).json({ message: "Mineral names are required in all languages" });
    }
    const mineral = await mineralProductionModel.createMineralProduction({ hs_codes, mineral_name_ar, mineral_name_en, mineral_name_fr, source_system });
    res.status(201).json(mineral);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateMineral = async (req, res) => {
  try {
    const mineral = await mineralProductionModel.updateMineralProduction(req.params.id, req.body);
    if (!mineral) {
      return res.status(404).json({ message: "Mineral not found" });
    }
    res.json(mineral);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMineral = async (req, res) => {
  try {
    const deleted = await mineralProductionModel.deleteMineralProduction(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Mineral not found" });
    }
    res.json({ message: "Mineral deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllMinerals,
  getMineralById,
  createMineral,
  updateMineral,
  deleteMineral,
};
