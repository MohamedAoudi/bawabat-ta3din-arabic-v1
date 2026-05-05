const mineralProductionModel = require("../Models/MineralProduction");

const getMineralProductionTrend = async (req, res) => {
  try {
    const rawMineral = req.query.mineral_id;
    const mineral_id =
      rawMineral === undefined || rawMineral === null || rawMineral === "" ? null : Number(rawMineral);
    const rawCountry = req.query.country_id;
    const country_id =
      rawCountry === undefined || rawCountry === null || rawCountry === "" ? null : Number(rawCountry);

    if (mineral_id !== null && !Number.isFinite(mineral_id)) {
      return res.status(400).json({ message: "mineral_id must be a number when provided" });
    }
    if (country_id !== null && !Number.isFinite(country_id)) {
      return res.status(400).json({ message: "country_id must be a number when provided" });
    }

    const rows = await mineralProductionModel.getMineralProductionTrend({ country_id, mineral_id });
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllMineralProduction = async (req, res) => {
  try {
    const rows = await mineralProductionModel.getAllMineralProduction();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMineralProductionAnalytics = async (req, res) => {
  try {
    const rows = await mineralProductionModel.getMineralProductionAnalytics();
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
  getMineralProductionTrend,
  getAllMineralProduction,
  getMineralProductionAnalytics,
  getMineralProductionById,
  createMineralProduction,
  updateMineralProduction,
  deleteMineralProduction,
};
