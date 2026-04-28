const countryTradeSummaryModel = require("../Models/CountryTradeSummary");

const getAllCountryTradeSummaries = async (req, res) => {
  try {
    const rows = await countryTradeSummaryModel.getAllCountryTradeSummaries();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCountryTradeSummary = async (req, res) => {
  try {
    const { countryId, year, tradeType } = req.params;
    const row = await countryTradeSummaryModel.getCountryTradeSummary(countryId, year, tradeType);
    if (!row) {
      return res.status(404).json({ message: "Country trade summary not found" });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const upsertCountryTradeSummary = async (req, res) => {
  try {
    const { country_id, year, trade_type } = req.body;
    if (!country_id || !year || !trade_type) {
      return res.status(400).json({ message: "country_id, year and trade_type are required" });
    }

    const row = await countryTradeSummaryModel.upsertCountryTradeSummary(req.body);
    res.status(201).json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCountryTradeSummary = async (req, res) => {
  try {
    const row = await countryTradeSummaryModel.upsertCountryTradeSummary({
      country_id: req.params.countryId,
      year: req.params.year,
      trade_type: req.params.tradeType,
      ...req.body,
    });
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCountryTradeSummary = async (req, res) => {
  try {
    const { countryId, year, tradeType } = req.params;
    const row = await countryTradeSummaryModel.deleteCountryTradeSummary(countryId, year, tradeType);
    if (!row) {
      return res.status(404).json({ message: "Country trade summary not found" });
    }
    res.json({ message: "Country trade summary deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCountryTradeSummaries,
  getCountryTradeSummary,
  upsertCountryTradeSummary,
  updateCountryTradeSummary,
  deleteCountryTradeSummary,
};
