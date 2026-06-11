const pool = require("../db");

const getAllWorldProductions = async () => {
  const query = `SELECT * FROM world_production ORDER BY year DESC`;
  const result = await pool.query(query);
  return result.rows;
};

const getWorldProductionById = async (id) => {
  const query = `SELECT * FROM world_production WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const createWorldProduction = async ({ mineral_production_id, year, production_value, production_value_base, unit_ar, unit_fr, unit_en }) => {
  const query = `
    INSERT INTO world_production (mineral_production_id, year, production_value, production_value_base, unit_ar, unit_fr, unit_en)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const result = await pool.query(query, [mineral_production_id, year, production_value || null, production_value_base || null, unit_ar || null, unit_fr || null, unit_en || null]);
  return result.rows[0];
};

const updateWorldProduction = async (id, production) => {
  const { mineral_production_id, year, production_value, production_value_base, unit_ar, unit_fr, unit_en } = production;
  const query = `
    UPDATE world_production
    SET mineral_production_id = COALESCE($1, mineral_production_id),
        year = COALESCE($2, year),
        production_value = COALESCE($3, production_value),
        production_value_base = COALESCE($4, production_value_base),
        unit_ar = COALESCE($5, unit_ar),
        unit_fr = COALESCE($6, unit_fr),
        unit_en = COALESCE($7, unit_en),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *
  `;
  const result = await pool.query(query, [mineral_production_id, year, production_value, production_value_base, unit_ar, unit_fr, unit_en, id]);
  return result.rows[0];
};

const deleteWorldProduction = async (id) => {
  const query = `DELETE FROM world_production WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllWorldProductions,
  getWorldProductionById,
  createWorldProduction,
  updateWorldProduction,
  deleteWorldProduction,
};
