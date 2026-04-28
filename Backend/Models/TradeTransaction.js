const pool = require("../db");

const getAllTradeTransactions = async () => {
  const result = await pool.query(`
    SELECT id, country_id, mineral_id, hs_product_code, year, trade_type,
           trade_value_usd, created_at, updated_at
    FROM trade_transactions
    ORDER BY year DESC, country_id ASC, mineral_id ASC
  `);
  return result.rows;
};

const getTradeTransactionById = async (id) => {
  const result = await pool.query(
    `SELECT id, country_id, mineral_id, hs_product_code, year, trade_type,
            trade_value_usd, created_at, updated_at
     FROM trade_transactions
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const createTradeTransaction = async ({
  country_id,
  mineral_id,
  hs_product_code = null,
  year,
  trade_type,
  trade_value_usd,
}) => {
  const result = await pool.query(
    `INSERT INTO trade_transactions
      (country_id, mineral_id, hs_product_code, year, trade_type, trade_value_usd)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, country_id, mineral_id, hs_product_code, year, trade_type,
               trade_value_usd, created_at, updated_at`,
    [country_id, mineral_id, hs_product_code, year, trade_type, trade_value_usd]
  );
  return result.rows[0];
};

const updateTradeTransaction = async (id, data) => {
  const { country_id, mineral_id, hs_product_code, year, trade_type, trade_value_usd } = data;

  const result = await pool.query(
    `UPDATE trade_transactions
     SET country_id = COALESCE($1, country_id),
         mineral_id = COALESCE($2, mineral_id),
         hs_product_code = COALESCE($3, hs_product_code),
         year = COALESCE($4, year),
         trade_type = COALESCE($5, trade_type),
         trade_value_usd = COALESCE($6, trade_value_usd)
     WHERE id = $7
     RETURNING id, country_id, mineral_id, hs_product_code, year, trade_type,
               trade_value_usd, created_at, updated_at`,
    [country_id, mineral_id, hs_product_code, year, trade_type, trade_value_usd, id]
  );
  return result.rows[0];
};

const deleteTradeTransaction = async (id) => {
  const result = await pool.query("DELETE FROM trade_transactions WHERE id = $1 RETURNING id", [id]);
  return result.rows[0];
};

module.exports = {
  getAllTradeTransactions,
  getTradeTransactionById,
  createTradeTransaction,
  updateTradeTransaction,
  deleteTradeTransaction,
};
