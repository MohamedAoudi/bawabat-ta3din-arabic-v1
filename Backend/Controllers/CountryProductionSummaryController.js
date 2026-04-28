const countryProductionSummaryModel = require("../Models/CountryProductionSummary");

const getAllCountryProductionSummaries = async (req, res) => {
  try {
    const rows = await countryProductionSummaryModel.getAllCountryProductionSummaries();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCountryProductionSummary = async (req, res) => {
  try {
    const { countryId, year, mineralId } = req.params;
    const row = await countryProductionSummaryModel.getCountryProductionSummary(countryId, year, mineralId);
    if (!row) {
      return res.status(404).json({ message: "Country production summary not found" });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const upsertCountryProductionSummary = async (req, res) => {
  try {
    const { country_id, year, mineral_id } = req.body;
    if (!country_id || !year || !mineral_id) {
      return res.status(400).json({ message: "country_id, year and mineral_id are required" });
    }

    const row = await countryProductionSummaryModel.upsertCountryProductionSummary(req.body);
    res.status(201).json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCountryProductionSummary = async (req, res) => {
  try {
    const row = await countryProductionSummaryModel.upsertCountryProductionSummary({
      country_id: req.params.countryId,
      year: req.params.year,
      mineral_id: req.params.mineralId,
      ...req.body,
    });
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCountryProductionSummary = async (req, res) => {
  try {
    const { countryId, year, mineralId } = req.params;
    const row = await countryProductionSummaryModel.deleteCountryProductionSummary(countryId, year, mineralId);
    if (!row) {
      return res.status(404).json({ message: "Country production summary not found" });
    }
    res.json({ message: "Country production summary deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCountryProductionSummaries,
  getCountryProductionSummary,
  upsertCountryProductionSummary,
  updateCountryProductionSummary,
  deleteCountryProductionSummary,
};
