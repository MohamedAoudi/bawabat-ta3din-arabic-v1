const db = require("../db");

// Get years from 2010 up to the current year.
// This returns a simple array of numbers (descending).
const getAllYears = async (req, res) => {
  try {
    const startYear = 2010;
    const endYear = new Date().getFullYear();
    const years = [];
    for (let y = endYear; y >= startYear; y--) years.push(y);
    return res.json(years);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllYears };
