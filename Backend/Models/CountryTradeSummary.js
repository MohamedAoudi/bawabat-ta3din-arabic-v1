const pool = require("../db");

const getAllCountryTradeSummaries = async () => {
  const result = await pool.query(`
    SELECT country_id, year, trade_type, total_trade_usd, total_import_usd, total_export_usd
    FROM country_trade_summary
    ORDER BY year DESC, country_id ASC, trade_type ASC
  `);
  return result.rows;
};

const getCountryTradeSummary = async (country_id, year, trade_type) => {
  const result = await pool.query(
    `SELECT country_id, year, trade_type, total_trade_usd, total_import_usd, total_export_usd
     FROM country_trade_summary
     WHERE country_id = $1 AND year = $2 AND trade_type = $3`,
    [country_id, year, trade_type]
  );
  return result.rows[0];
};

const upsertCountryTradeSummary = async ({
  country_id,
  year,
  trade_type,
  total_trade_usd,
  total_import_usd,
  total_export_usd,
}) => {
  const result = await pool.query(
    `INSERT INTO country_trade_summary
      (country_id, year, trade_type, total_trade_usd, total_import_usd, total_export_usd)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (country_id, year, trade_type)
     DO UPDATE SET
       total_trade_usd = EXCLUDED.total_trade_usd,
       total_import_usd = EXCLUDED.total_import_usd,
       total_export_usd = EXCLUDED.total_export_usd
     RETURNING country_id, year, trade_type, total_trade_usd, total_import_usd, total_export_usd`,
    [country_id, year, trade_type, total_trade_usd, total_import_usd, total_export_usd]
  );
  return result.rows[0];
};

const deleteCountryTradeSummary = async (country_id, year, trade_type) => {
  const result = await pool.query(
    `DELETE FROM country_trade_summary
     WHERE country_id = $1 AND year = $2 AND trade_type = $3
     RETURNING country_id, year, trade_type`,
    [country_id, year, trade_type]
  );
  return result.rows[0];
};

module.exports = {
  getAllCountryTradeSummaries,
  getCountryTradeSummary,
  upsertCountryTradeSummary,
  deleteCountryTradeSummary,
};
