const pool = require("../db");

const getAllMinerals = async () => {
  const result = await pool.query(`
    SELECT id, name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr, created_at, updated_at
    FROM minerals
    ORDER BY name_en ASC
  `);
  return result.rows;
};

const getMineralById = async (id) => {
  const result = await pool.query(
    `SELECT id, name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr, created_at, updated_at
     FROM minerals
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const createMineral = async ({ name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr }) => {
  const result = await pool.query(
    `INSERT INTO minerals (name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr, created_at, updated_at`,
    [name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr]
  );
  return result.rows[0];
};

const updateMineral = async (id, { name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr }) => {
  const result = await pool.query(
    `UPDATE minerals
     SET name_ar = COALESCE($1, name_ar),
         name_en = COALESCE($2, name_en),
         name_fr = COALESCE($3, name_fr),
         category_name_ar = COALESCE($4, category_name_ar),
         category_name_en = COALESCE($5, category_name_en),
         category_name_fr = COALESCE($6, category_name_fr)
     WHERE id = $7
     RETURNING id, name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr, created_at, updated_at`,
    [name_ar, name_en, name_fr, category_name_ar, category_name_en, category_name_fr, id]
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
