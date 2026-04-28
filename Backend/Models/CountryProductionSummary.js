const pool = require("../db");

const getAllCountryProductionSummaries = async () => {
  const result = await pool.query(`
    SELECT country_id, year, mineral_id, total_production, unit_name_ar, unit_name_en, unit_name_fr
    FROM country_production_summary
    ORDER BY year DESC, country_id ASC, mineral_id ASC
  `);
  return result.rows;
};

const getCountryProductionSummary = async (country_id, year, mineral_id) => {
  const result = await pool.query(
    `SELECT country_id, year, mineral_id, total_production, unit_name_ar, unit_name_en, unit_name_fr
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
  unit_name_ar,
  unit_name_en,
  unit_name_fr,
}) => {
  const result = await pool.query(
    `INSERT INTO country_production_summary
      (country_id, year, mineral_id, total_production, unit_name_ar, unit_name_en, unit_name_fr)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (country_id, year, mineral_id)
     DO UPDATE SET
       total_production = EXCLUDED.total_production,
       unit_name_ar = EXCLUDED.unit_name_ar,
       unit_name_en = EXCLUDED.unit_name_en,
       unit_name_fr = EXCLUDED.unit_name_fr
     RETURNING country_id, year, mineral_id, total_production, unit_name_ar, unit_name_en, unit_name_fr`,
    [country_id, year, mineral_id, total_production, unit_name_ar, unit_name_en, unit_name_fr]
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
