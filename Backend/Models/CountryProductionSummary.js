const pool = require("../db");

const getAllCountryProductionSummaries = async () => {
  const result = await pool.query(`
    SELECT country_id, year, mineral_id, total_production, unit_name
    FROM country_production_summary
    ORDER BY year DESC, country_id ASC, mineral_id ASC
  `);
  return result.rows;
};

const getCountryProductionSummary = async (country_id, year, mineral_id) => {
  const result = await pool.query(
    `SELECT country_id, year, mineral_id, total_production, unit_name
     FROM country_production_summary
     WHERE country_id = $1 AND year = $2 AND mineral_id = $3`,
    [country_id, year, mineral_id]
  );
  return result.rows[0];
};

const upsertCountryProductionSummary = async ({
  country_id,
  year,
  mineral_id,
  total_production,
  unit_name,
}) => {
  const result = await pool.query(
    `INSERT INTO country_production_summary
      (country_id, year, mineral_id, total_production, unit_name)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (country_id, year, mineral_id)
     DO UPDATE SET
       total_production = EXCLUDED.total_production,
       unit_name = EXCLUDED.unit_name
     RETURNING country_id, year, mineral_id, total_production, unit_name`,
    [country_id, year, mineral_id, total_production, unit_name]
  );
  return result.rows[0];
};

const deleteCountryProductionSummary = async (country_id, year, mineral_id) => {
  const result = await pool.query(
    `DELETE FROM country_production_summary
     WHERE country_id = $1 AND year = $2 AND mineral_id = $3
     RETURNING country_id, year, mineral_id`,
    [country_id, year, mineral_id]
  );
  return result.rows[0];
};

module.exports = {
  getAllCountryProductionSummaries,
  getCountryProductionSummary,
  upsertCountryProductionSummary,
  deleteCountryProductionSummary,
};
