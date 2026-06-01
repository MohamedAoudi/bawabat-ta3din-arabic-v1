const db = require("../db");

// Get all minerals
const getAllMinerals = async (req, res) => {
  try {
    const query = `
      SELECT id, hs_minerals, name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr, created_at, updated_at
      FROM minerals
      ORDER BY name_en ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get mineral by ID
const getMineralById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, hs_minerals, name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr, created_at, updated_at
      FROM minerals
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Mineral not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new mineral
const createMineral = async (req, res) => {
  try {
    const { hs_minerals, name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr } = req.body;

    if (!hs_minerals || !name_ar || !name_en || !name_fr) {
      return res.status(400).json({ message: "hs_minerals, name_ar, name_en, and name_fr are required" });
    }

    const query = `
      INSERT INTO minerals (hs_minerals, name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, hs_minerals, name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr, created_at, updated_at
    `;
    const result = await db.query(query, [hs_minerals, name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update mineral
const updateMineral = async (req, res) => {
  try {
    const { id } = req.params;
    const { hs_minerals, name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr } = req.body;

    const query = `
      UPDATE minerals
      SET hs_minerals = COALESCE($1, hs_minerals),
          name_ar = COALESCE($2, name_ar),
          name_en = COALESCE($3, name_en),
          name_fr = COALESCE($4, name_fr),
          category_name_ar = COALESCE($5, category_name_ar),
          category_name_en = COALESCE($6, category_name_en),
          category_name_fr = COALESCE($7, category_name_fr)
      WHERE id = $8
      RETURNING id, hs_minerals, name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr, created_at, updated_at
    `;
    const result = await db.query(query, [hs_minerals, name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Mineral not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete mineral
const deleteMineral = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM minerals WHERE id = $1 RETURNING id";
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
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
