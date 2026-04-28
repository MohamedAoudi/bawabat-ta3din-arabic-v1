const yearModel = require("../Models/Year");

const getAllYears = async (req, res) => {
  try {
    const years = await yearModel.getAllYears();
    res.json(years);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getYearByValue = async (req, res) => {
  try {
    const year = await yearModel.getYearByValue(req.params.year);
    if (!year) {
      return res.status(404).json({ message: "Year not found" });
    }
    res.json(year);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createYear = async (req, res) => {
  try {
    const { year, decade } = req.body;
    if (!year || !decade) {
      return res.status(400).json({ message: "year and decade are required" });
    }

    const createdYear = await yearModel.createYear({ year, decade });
    res.status(201).json(createdYear);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateYear = async (req, res) => {
  try {
    const updatedYear = await yearModel.updateYear(req.params.year, req.body);
    if (!updatedYear) {
      return res.status(404).json({ message: "Year not found" });
    }
    res.json(updatedYear);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteYear = async (req, res) => {
  try {
    const deletedYear = await yearModel.deleteYear(req.params.year);
    if (!deletedYear) {
      return res.status(404).json({ message: "Year not found" });
    }
    res.json({ message: "Year deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllYears,
  getYearByValue,
  createYear,
  updateYear,
  deleteYear,
};
