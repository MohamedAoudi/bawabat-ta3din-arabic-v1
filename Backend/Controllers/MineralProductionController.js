const db = require("../db");

// Get all mineral production records
const getAllMineralProduction = async (req, res) => {
  try {
    const query = `
      SELECT id, country_id, mineral_id, year, production_quantity, normalized_quantity, 
             unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source, 
             created_at, updated_at
      FROM mineral_production
      ORDER BY year DESC, country_id ASC, mineral_id ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get mineral production by ID
const getMineralProductionById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, country_id, mineral_id, year, production_quantity, normalized_quantity, 
             unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source, 
             created_at, updated_at
      FROM mineral_production
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Mineral production record not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get mineral production by country and year
const getMineralProductionByCountryYear = async (req, res) => {
  try {
    const { countryId, year } = req.params;
    const query = `
      SELECT id, country_id, mineral_id, year, production_quantity, normalized_quantity, 
             unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source, 
             created_at, updated_at
      FROM mineral_production
      WHERE country_id = $1 AND year = $2
      ORDER BY mineral_id ASC
    `;
    const result = await db.query(query, [countryId, year]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new mineral production record
const createMineralProduction = async (req, res) => {
  try {
    const { country_id, mineral_id, year, production_quantity, normalized_quantity, 
            unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source } = req.body;

    if (!mineral_id || !year) {
      return res.status(400).json({ message: "mineral_id and year are required" });
    }

    const query = `
      INSERT INTO mineral_production 
      (country_id, mineral_id, year, production_quantity, normalized_quantity, 
       unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, country_id, mineral_id, year, production_quantity, normalized_quantity, 
                unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source, 
                created_at, updated_at
    `;
    const result = await db.query(query, 
      [country_id, mineral_id, year, production_quantity, normalized_quantity, 
       unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ message: "Record with this country, mineral, and year combination already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update mineral production record
const updateMineralProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const { country_id, mineral_id, year, production_quantity, normalized_quantity, 
            unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source } = req.body;

    const query = `
      UPDATE mineral_production
      SET country_id = COALESCE($1, country_id),
          mineral_id = COALESCE($2, mineral_id),
          year = COALESCE($3, year),
          production_quantity = COALESCE($4, production_quantity),
          normalized_quantity = COALESCE($5, normalized_quantity),
          unit_name_ar = COALESCE($6, unit_name_ar),
          unit_name_en = COALESCE($7, unit_name_en),
          unit_name_fr = COALESCE($8, unit_name_fr),
          conversion_factor = COALESCE($9, conversion_factor),
          data_source = COALESCE($10, data_source)
      WHERE id = $11
      RETURNING id, country_id, mineral_id, year, production_quantity, normalized_quantity, 
                unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source, 
                created_at, updated_at
    `;
    const result = await db.query(query, 
      [country_id, mineral_id, year, production_quantity, normalized_quantity, 
       unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Mineral production record not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete mineral production record
const deleteMineralProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM mineral_production WHERE id = $1 RETURNING id";
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Mineral production record not found" });
    }
    res.json({ message: "Mineral production record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllMineralProduction,
  getMineralProductionById,
  getMineralProductionByCountryYear,
  createMineralProduction,
  updateMineralProduction,
  deleteMineralProduction,
};
