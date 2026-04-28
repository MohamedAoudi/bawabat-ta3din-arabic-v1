const mineralProductionModel = require("../Models/MineralProduction");

const getAllMineralProduction = async (req, res) => {
  try {
    const rows = await mineralProductionModel.getAllMineralProduction();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMineralProductionById = async (req, res) => {
  try {
    const row = await mineralProductionModel.getMineralProductionById(req.params.id);
    if (!row) {
      return res.status(404).json({ message: "Mineral production not found" });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createMineralProduction = async (req, res) => {
  try {
    const { mineral_id, year } = req.body;
    if (!mineral_id || !year) {
      return res.status(400).json({ message: "mineral_id and year are required" });
    }

    const row = await mineralProductionModel.createMineralProduction(req.body);
    res.status(201).json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateMineralProduction = async (req, res) => {
  try {
    const row = await mineralProductionModel.updateMineralProduction(req.params.id, req.body);
    if (!row) {
      return res.status(404).json({ message: "Mineral production not found" });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMineralProduction = async (req, res) => {
  try {
    const row = await mineralProductionModel.deleteMineralProduction(req.params.id);
    if (!row) {
      return res.status(404).json({ message: "Mineral production not found" });
    }
    res.json({ message: "Mineral production deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllMineralProduction,
  getMineralProductionById,
  createMineralProduction,
  updateMineralProduction,
  deleteMineralProduction,
};
