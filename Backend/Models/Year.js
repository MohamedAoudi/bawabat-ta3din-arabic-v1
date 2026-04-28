const pool = require("../db");

const getAllYears = async () => {
  const result = await pool.query(`
    SELECT year, decade
    FROM years
    ORDER BY year DESC
  `);
  return result.rows;
};

const getYearByValue = async (year) => {
  const result = await pool.query(
    `SELECT year, decade
     FROM years
     WHERE year = $1`,
    [year]
  );
  return result.rows[0];
};

const createYear = async ({ year, decade }) => {
  const result = await pool.query(
    `INSERT INTO years (year, decade)
     VALUES ($1, $2)
     RETURNING year, decade`,
    [year, decade]
  );
  return result.rows[0];
};

const updateYear = async (year, { decade }) => {
  const result = await pool.query(
    `UPDATE years
     SET decade = COALESCE($1, decade)
     WHERE year = $2
     RETURNING year, decade`,
    [decade, year]
  );
  return result.rows[0];
};

const deleteYear = async (year) => {
  const result = await pool.query("DELETE FROM years WHERE year = $1 RETURNING year", [year]);
  return result.rows[0];
};

module.exports = {
  getAllYears,
  getYearByValue,
  createYear,
  updateYear,
  deleteYear,
};
