const mineralModel = require("../Models/Mineral");

const getAllMinerals = async (req, res) => {
  try {
    const minerals = await mineralModel.getAllMinerals();
    res.json(minerals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMineralById = async (req, res) => {
  try {
    const mineral = await mineralModel.getMineralById(req.params.id);
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
    const { name_ar, name_en, category_name } = req.body;
    if (!name_ar || !name_en) {
      return res.status(400).json({ message: "name_ar and name_en are required" });
    }

    const mineral = await mineralModel.createMineral({ name_ar, name_en, category_name });
    res.status(201).json(mineral);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateMineral = async (req, res) => {
  try {
    const mineral = await mineralModel.updateMineral(req.params.id, req.body);
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
    const mineral = await mineralModel.deleteMineral(req.params.id);
    if (!mineral) {
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
