const pool = require("../db");

const getAllYearlyPrices = async () => {
  const query = `SELECT * FROM mineral_prices_yearly WHERE deleted_at IS NULL ORDER BY price_date DESC`;
  const result = await pool.query(query);
  return result.rows;
};

const getYearlyPriceById = async (id) => {
  const query = `SELECT * FROM mineral_prices_yearly WHERE id = $1 AND deleted_at IS NULL`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const createYearlyPrice = async ({ mineral_production_id, price, max_price, min_price, avg_price, avg_change, avg_value_change, price_date }) => {
  const query = `
    INSERT INTO mineral_prices_yearly (mineral_production_id, price, max_price, min_price, avg_price, avg_change, avg_value_change, price_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const result = await pool.query(query, [mineral_production_id, price || null, max_price || null, min_price || null, avg_price || null, avg_change || null, avg_value_change || null, price_date]);
  return result.rows[0];
};

const updateYearlyPrice = async (id, priceData) => {
  const { mineral_production_id, price, max_price, min_price, avg_price, avg_change, avg_value_change, price_date } = priceData;
  const query = `
    UPDATE mineral_prices_yearly
    SET mineral_production_id = COALESCE($1, mineral_production_id),
        price = COALESCE($2, price),
        max_price = COALESCE($3, max_price),
        min_price = COALESCE($4, min_price),
        avg_price = COALESCE($5, avg_price),
        avg_change = COALESCE($6, avg_change),
        avg_value_change = COALESCE($7, avg_value_change),
        price_date = COALESCE($8, price_date),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $9 AND deleted_at IS NULL
    RETURNING *
  `;
  const result = await pool.query(query, [mineral_production_id, price, max_price, min_price, avg_price, avg_change, avg_value_change, price_date, id]);
  return result.rows[0];
};

const deleteYearlyPrice = async (id) => {
  const query = `
    UPDATE mineral_prices_yearly
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllYearlyPrices,
  getYearlyPriceById,
  createYearlyPrice,
  updateYearlyPrice,
  deleteYearlyPrice,
};
