const pool = require("../db");

const getAllCountries = async () => {
  const result = await pool.query(`
    SELECT id, name_ar, name_en, iso_code, display_order, created_at, updated_at
    FROM countries
    ORDER BY display_order ASC, name_en ASC
  `);
  return result.rows;
};

const getCountryById = async (id) => {
  const result = await pool.query(
    `SELECT id, name_ar, name_en, iso_code, display_order, created_at, updated_at
     FROM countries
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const createCountry = async ({ name_ar, name_en, iso_code, display_order = 0 }) => {
  const result = await pool.query(
    `INSERT INTO countries (name_ar, name_en, iso_code, display_order)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name_ar, name_en, iso_code, display_order, created_at, updated_at`,
    [name_ar, name_en, iso_code, display_order]
  );
  return result.rows[0];
};

const updateCountry = async (id, { name_ar, name_en, iso_code, display_order }) => {
  const result = await pool.query(
    `UPDATE countries
     SET name_ar = COALESCE($1, name_ar),
         name_en = COALESCE($2, name_en),
         iso_code = COALESCE($3, iso_code),
         display_order = COALESCE($4, display_order)
     WHERE id = $5
     RETURNING id, name_ar, name_en, iso_code, display_order, created_at, updated_at`,
    [name_ar, name_en, iso_code, display_order, id]
  );
  return result.rows[0];
};

const deleteCountry = async (id) => {
  const result = await pool.query("DELETE FROM countries WHERE id = $1 RETURNING id", [id]);
  return result.rows[0];
};

module.exports = {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
};
