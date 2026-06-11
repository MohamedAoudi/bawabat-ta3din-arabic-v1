const pool = require("../db");

const getAllLivePrices = async () => {
  const query = `SELECT * FROM mineral_prices_live WHERE deleted_at IS NULL ORDER BY price_date DESC`;
  const result = await pool.query(query);
  return result.rows;
};

const getLivePriceById = async (id) => {
  const query = `SELECT * FROM mineral_prices_live WHERE id = $1 AND deleted_at IS NULL`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const createLivePrice = async ({ mineral_production_id, price, change_percent, value_change, price_date }) => {
  const query = `
    INSERT INTO mineral_prices_live (mineral_production_id, price, change_percent, value_change, price_date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result = await pool.query(query, [mineral_production_id, price || null, change_percent || null, value_change || null, price_date]);
  return result.rows[0];
};

const updateLivePrice = async (id, priceData) => {
  const { mineral_production_id, price, change_percent, value_change, price_date } = priceData;
  const query = `
    UPDATE mineral_prices_live
    SET mineral_production_id = COALESCE($1, mineral_production_id),
        price = COALESCE($2, price),
        change_percent = COALESCE($3, change_percent),
        value_change = COALESCE($4, value_change),
        price_date = COALESCE($5, price_date),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $6 AND deleted_at IS NULL
    RETURNING *
  `;
  const result = await pool.query(query, [mineral_production_id, price, change_percent, value_change, price_date, id]);
  return result.rows[0];
};

const deleteLivePrice = async (id) => {
  const query = `
    UPDATE mineral_prices_live
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllLivePrices,
  getLivePriceById,
  createLivePrice,
  updateLivePrice,
  deleteLivePrice,
};
