const pool = require("../db");

const getAllArabProductions = async () => {
  const query = `SELECT * FROM arab_production ORDER BY year DESC`;
  const result = await pool.query(query);
  return result.rows;
};

const getArabProductionById = async (id) => {
  const query = `SELECT * FROM arab_production WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const createArabProduction = async ({ country_id, mineral_production_id, year, production_value, production_value_base, unit_ar, unit_fr, unit_en }) => {
  const query = `
    INSERT INTO arab_production (country_id, mineral_production_id, year, production_value, production_value_base, unit_ar, unit_fr, unit_en)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const result = await pool.query(query, [country_id, mineral_production_id, year, production_value || null, production_value_base || null, unit_ar || null, unit_fr || null, unit_en || null]);
  return result.rows[0];
};

const updateArabProduction = async (id, production) => {
  const { country_id, mineral_production_id, year, production_value, production_value_base, unit_ar, unit_fr, unit_en } = production;
  const query = `
    UPDATE arab_production
    SET country_id = COALESCE($1, country_id),
        mineral_production_id = COALESCE($2, mineral_production_id),
        year = COALESCE($3, year),
        production_value = COALESCE($4, production_value),
        production_value_base = COALESCE($5, production_value_base),
        unit_ar = COALESCE($6, unit_ar),
        unit_fr = COALESCE($7, unit_fr),
        unit_en = COALESCE($8, unit_en),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
    RETURNING *
  `;
  const result = await pool.query(query, [country_id, mineral_production_id, year, production_value, production_value_base, unit_ar, unit_fr, unit_en, id]);
  return result.rows[0];
};

const deleteArabProduction = async (id) => {
  const query = `DELETE FROM arab_production WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllArabProductions,
  getArabProductionById,
  createArabProduction,
  updateArabProduction,
  deleteArabProduction,
};
