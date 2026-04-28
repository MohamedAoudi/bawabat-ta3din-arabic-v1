const pool = require("../db");

const getAllBilateralTrade = async () => {
  const result = await pool.query(`
    SELECT id, country_id, partner_id, year, trade_type, trade_value_usd,
           trade_share_percent, is_estimated, created_at, updated_at
    FROM bilateral_trade
    ORDER BY year DESC, country_id ASC, partner_id ASC
  `);
  return result.rows;
};

const getBilateralTradeById = async (id) => {
  const result = await pool.query(
    `SELECT id, country_id, partner_id, year, trade_type, trade_value_usd,
            trade_share_percent, is_estimated, created_at, updated_at
     FROM bilateral_trade
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const createBilateralTrade = async ({
  country_id,
  partner_id,
  year,
  trade_type,
  trade_value_usd,
  trade_share_percent,
  is_estimated = false,
}) => {
  const result = await pool.query(
    `INSERT INTO bilateral_trade
      (country_id, partner_id, year, trade_type, trade_value_usd, trade_share_percent, is_estimated)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, country_id, partner_id, year, trade_type, trade_value_usd,
               trade_share_percent, is_estimated, created_at, updated_at`,
    [country_id, partner_id, year, trade_type, trade_value_usd, trade_share_percent, is_estimated]
  );
  return result.rows[0];
};

const updateBilateralTrade = async (id, data) => {
  const {
    country_id,
    partner_id,
    year,
    trade_type,
    trade_value_usd,
    trade_share_percent,
    is_estimated,
  } = data;

  const result = await pool.query(
    `UPDATE bilateral_trade
     SET country_id = COALESCE($1, country_id),
         partner_id = COALESCE($2, partner_id),
         year = COALESCE($3, year),
         trade_type = COALESCE($4, trade_type),
         trade_value_usd = COALESCE($5, trade_value_usd),
         trade_share_percent = COALESCE($6, trade_share_percent),
         is_estimated = COALESCE($7, is_estimated)
     WHERE id = $8
     RETURNING id, country_id, partner_id, year, trade_type, trade_value_usd,
               trade_share_percent, is_estimated, created_at, updated_at`,
    [country_id, partner_id, year, trade_type, trade_value_usd, trade_share_percent, is_estimated, id]
  );
  return result.rows[0];
};

const deleteBilateralTrade = async (id) => {
  const result = await pool.query("DELETE FROM bilateral_trade WHERE id = $1 RETURNING id", [id]);
  return result.rows[0];
};

module.exports = {
  getAllBilateralTrade,
  getBilateralTradeById,
  createBilateralTrade,
  updateBilateralTrade,
  deleteBilateralTrade,
};
