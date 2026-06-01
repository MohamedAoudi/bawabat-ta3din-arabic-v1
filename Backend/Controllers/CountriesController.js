const db = require("../db");

// Get all countries
const getAllCountries = async (req, res) => {
  try {
    const query = `
      SELECT id, name_ar, name_en, name_fr, iso_code, display_order, created_at, updated_at
      FROM countries
      ORDER BY display_order ASC, name_en ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get country by ID
const getCountryById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, name_ar, name_en, name_fr, iso_code, display_order, created_at, updated_at
      FROM countries
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new country
const createCountry = async (req, res) => {
  try {
    const { name_ar, name_en, name_fr, iso_code, display_order } = req.body;

    if (!name_ar || !name_en || !name_fr || !iso_code) {
      return res.status(400).json({ message: "name_ar, name_en, name_fr, and iso_code are required" });
    }

    const query = `
      INSERT INTO countries (name_ar, name_en, name_fr, iso_code, display_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name_ar, name_en, name_fr, iso_code, display_order, created_at, updated_at
    `;
    const result = await db.query(query, [name_ar, name_en, name_fr, iso_code, display_order || 0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ message: "ISO code already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update country
const updateCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const { name_ar, name_en, name_fr, iso_code, display_order } = req.body;

    const query = `
      UPDATE countries
      SET name_ar = COALESCE($1, name_ar),
          name_en = COALESCE($2, name_en),
          name_fr = COALESCE($3, name_fr),
          iso_code = COALESCE($4, iso_code),
          display_order = COALESCE($5, display_order)
      WHERE id = $6
      RETURNING id, name_ar, name_en, name_fr, iso_code, display_order, created_at, updated_at
    `;
    const result = await db.query(query, [name_ar, name_en, name_fr, iso_code, display_order, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete country
const deleteCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM countries WHERE id = $1 RETURNING id";
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
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
