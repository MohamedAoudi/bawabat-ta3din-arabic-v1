const pool = require("../db");

const getAllPartnerTrades = async () => {
  const query = `SELECT * FROM partner_trade ORDER BY year DESC`;
  const result = await pool.query(query);
  return result.rows;
};

const getPartnerTradeById = async (id) => {
  const query = `SELECT * FROM partner_trade WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const createPartnerTrade = async ({ reporter_country_id, partner_id, mineral_trade_id, year, value_usd, type_trade }) => {
  const query = `
    INSERT INTO partner_trade (reporter_country_id, partner_id, mineral_trade_id, year, value_usd, type_trade)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const result = await pool.query(query, [reporter_country_id, partner_id, mineral_trade_id, year, value_usd || null, type_trade]);
  return result.rows[0];
};

const updatePartnerTrade = async (id, trade) => {
  const { reporter_country_id, partner_id, mineral_trade_id, year, value_usd, type_trade } = trade;
  const query = `
    UPDATE partner_trade
    SET reporter_country_id = COALESCE($1, reporter_country_id),
        partner_id = COALESCE($2, partner_id),
        mineral_trade_id = COALESCE($3, mineral_trade_id),
        year = COALESCE($4, year),
        value_usd = COALESCE($5, value_usd),
        type_trade = COALESCE($6, type_trade),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING *
  `;
  const result = await pool.query(query, [reporter_country_id, partner_id, mineral_trade_id, year, value_usd, type_trade, id]);
  return result.rows[0];
};

const deletePartnerTrade = async (id) => {
  const query = `DELETE FROM partner_trade WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllPartnerTrades,
  getPartnerTradeById,
  createPartnerTrade,
  updatePartnerTrade,
  deletePartnerTrade,
};
