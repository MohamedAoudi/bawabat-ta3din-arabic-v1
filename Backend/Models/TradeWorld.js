const pool = require("../db");

const getAllTradeWorld = async () => {
  const query = `SELECT * FROM trade_world ORDER BY year DESC`;
  const result = await pool.query(query);
  return result.rows;
};

const getTradeWorldById = async (id) => {
  const query = `SELECT * FROM trade_world WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const createTradeWorld = async ({ reporter_country_id, partner_id, mineral_trade_id, year, value_usd, value_share, type_trade }) => {
  const query = `
    INSERT INTO trade_world (reporter_country_id, partner_id, mineral_trade_id, year, value_usd, value_share, type_trade)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const result = await pool.query(query, [reporter_country_id, partner_id, mineral_trade_id, year, value_usd || null, value_share || null, type_trade]);
  return result.rows[0];
};

const updateTradeWorld = async (id, trade) => {
  const { reporter_country_id, partner_id, mineral_trade_id, year, value_usd, value_share, type_trade } = trade;
  const query = `
    UPDATE trade_world
    SET reporter_country_id = COALESCE($1, reporter_country_id),
        partner_id = COALESCE($2, partner_id),
        mineral_trade_id = COALESCE($3, mineral_trade_id),
        year = COALESCE($4, year),
        value_usd = COALESCE($5, value_usd),
        value_share = COALESCE($6, value_share),
        type_trade = COALESCE($7, type_trade),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *
  `;
  const result = await pool.query(query, [reporter_country_id, partner_id, mineral_trade_id, year, value_usd, value_share, type_trade, id]);
  return result.rows[0];
};

const deleteTradeWorld = async (id) => {
  const query = `DELETE FROM trade_world WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllTradeWorld,
  getTradeWorldById,
  createTradeWorld,
  updateTradeWorld,
  deleteTradeWorld,
};
