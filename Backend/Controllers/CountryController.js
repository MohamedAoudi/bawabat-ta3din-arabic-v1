const countryModel = require("../Models/Country");

const getAllCountries = async (req, res) => {
  try {
    const countries = await countryModel.getAllCountries();
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCountryById = async (req, res) => {
  try {
    const country = await countryModel.getCountryById(req.params.id);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.json(country);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCountry = async (req, res) => {
  try {
    const { name_ar, name_en, name_fr, iso_code, display_order } = req.body;
    if (!name_ar || !name_en || !name_fr || !iso_code) {
      return res.status(400).json({ message: "name_ar, name_en, name_fr and iso_code are required" });
    }

    const country = await countryModel.createCountry({ name_ar, name_en, name_fr, iso_code, display_order });
    res.status(201).json(country);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCountry = async (req, res) => {
  try {
    const country = await countryModel.updateCountry(req.params.id, req.body);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.json(country);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCountry = async (req, res) => {
  try {
    const country = await countryModel.deleteCountry(req.params.id);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.json({ message: "Country deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
};
