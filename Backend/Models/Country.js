const pool = require("../db");

const getAllCountries = async () => {
  const query = `SELECT * FROM countries ORDER BY display_order ASC, name_en ASC`;
  const result = await pool.query(query);
  return result.rows;
};

const getCountryById = async (id) => {
  const query = `SELECT * FROM countries WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const createCountry = async ({ name_ar, name_en, name_fr, iso_code, display_order }) => {
  const query = `
    INSERT INTO countries (name_ar, name_en, name_fr, iso_code, display_order)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result = await pool.query(query, [name_ar, name_en, name_fr, iso_code, display_order || 0]);
  return result.rows[0];
};

const updateCountry = async (id, country) => {
  const { name_ar, name_en, name_fr, iso_code, display_order } = country;
  const query = `
    UPDATE countries
    SET name_ar = COALESCE($1, name_ar),
        name_en = COALESCE($2, name_en),
        name_fr = COALESCE($3, name_fr),
        iso_code = COALESCE($4, iso_code),
        display_order = COALESCE($5, display_order),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *
  `;
  const result = await pool.query(query, [name_ar, name_en, name_fr, iso_code, display_order, id]);
  return result.rows[0];
};

const deleteCountry = async (id) => {
  const query = `DELETE FROM countries WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
};
