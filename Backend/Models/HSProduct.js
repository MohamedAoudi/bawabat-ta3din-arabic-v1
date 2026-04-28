const pool = require("../db");

const getAllHSProducts = async () => {
  const result = await pool.query(`
    SELECT code, mineral_id, product_name, product_category, created_at, updated_at
    FROM hs_products
    ORDER BY code ASC
  `);
  return result.rows;
};

const getHSProductByCode = async (code) => {
  const result = await pool.query(
    `SELECT code, mineral_id, product_name, product_category, created_at, updated_at
     FROM hs_products
     WHERE code = $1`,
    [code]
  );
  return result.rows[0];
};

const createHSProduct = async ({ code, mineral_id, product_name, product_category }) => {
  const result = await pool.query(
    `INSERT INTO hs_products (code, mineral_id, product_name, product_category)
     VALUES ($1, $2, $3, $4)
     RETURNING code, mineral_id, product_name, product_category, created_at, updated_at`,
    [code, mineral_id, product_name, product_category]
  );
  return result.rows[0];
};

const updateHSProduct = async (code, { mineral_id, product_name, product_category }) => {
  const result = await pool.query(
    `UPDATE hs_products
     SET mineral_id = COALESCE($1, mineral_id),
         product_name = COALESCE($2, product_name),
         product_category = COALESCE($3, product_category)
     WHERE code = $4
     RETURNING code, mineral_id, product_name, product_category, created_at, updated_at`,
    [mineral_id, product_name, product_category, code]
  );
  return result.rows[0];
};

const deleteHSProduct = async (code) => {
  const result = await pool.query("DELETE FROM hs_products WHERE code = $1 RETURNING code", [code]);
  return result.rows[0];
};

module.exports = {
  getAllHSProducts,
  getHSProductByCode,
  createHSProduct,
  updateHSProduct,
  deleteHSProduct,
};
