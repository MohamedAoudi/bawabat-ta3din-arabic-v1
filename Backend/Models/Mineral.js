const pool = require("../db");

const getAllMinerals = async () => {
  const result = await pool.query(`
    SELECT id, name_ar, name_en, category_name, created_at, updated_at
    FROM minerals
    ORDER BY name_en ASC
  `);
  return result.rows;
};

const getMineralById = async (id) => {
  const result = await pool.query(
    `SELECT id, name_ar, name_en, category_name, created_at, updated_at
     FROM minerals
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const createMineral = async ({ name_ar, name_en, category_name }) => {
  const result = await pool.query(
    `INSERT INTO minerals (name_ar, name_en, category_name)
     VALUES ($1, $2, $3)
     RETURNING id, name_ar, name_en, category_name, created_at, updated_at`,
    [name_ar, name_en, category_name]
  );
  return result.rows[0];
};

const updateMineral = async (id, { name_ar, name_en, category_name }) => {
  const result = await pool.query(
    `UPDATE minerals
     SET name_ar = COALESCE($1, name_ar),
         name_en = COALESCE($2, name_en),
         category_name = COALESCE($3, category_name)
     WHERE id = $4
     RETURNING id, name_ar, name_en, category_name, created_at, updated_at`,
    [name_ar, name_en, category_name, id]
  );
  return result.rows[0];
};

const deleteMineral = async (id) => {
  const result = await pool.query("DELETE FROM minerals WHERE id = $1 RETURNING id", [id]);
  return result.rows[0];
};

module.exports = {
  getAllMinerals,
  getMineralById,
  createMineral,
  updateMineral,
  deleteMineral,
};
