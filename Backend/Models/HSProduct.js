const pool = require("../db");

const getAllHSProducts = async () => {
  const result = await pool.query(`
    SELECT code, mineral_id, product_name_ar, product_name_en, product_name_fr,
           product_category_ar, product_category_en, product_category_fr, created_at, updated_at
    FROM hs_products
    ORDER BY code ASC
  `);
  return result.rows;
};

const getHSProductByCode = async (code) => {
  const result = await pool.query(
    `SELECT code, mineral_id, product_name_ar, product_name_en, product_name_fr,
            product_category_ar, product_category_en, product_category_fr, created_at, updated_at
     FROM hs_products
     WHERE code = $1`,
    [code]
  );
  return result.rows[0];
};

const createHSProduct = async ({
  code,
  mineral_id,
  product_name_ar,
  product_name_en,
  product_name_fr,
  product_category_ar,
  product_category_en,
  product_category_fr,
}) => {
  const result = await pool.query(
    `INSERT INTO hs_products
      (code, mineral_id, product_name_ar, product_name_en, product_name_fr, product_category_ar, product_category_en, product_category_fr)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING code, mineral_id, product_name_ar, product_name_en, product_name_fr,
               product_category_ar, product_category_en, product_category_fr, created_at, updated_at`,
    [code, mineral_id, product_name_ar, product_name_en, product_name_fr, product_category_ar, product_category_en, product_category_fr]
  );
  return result.rows[0];
};

const updateHSProduct = async (code, {
  mineral_id,
  product_name_ar,
  product_name_en,
  product_name_fr,
  product_category_ar,
  product_category_en,
  product_category_fr,
}) => {
  const result = await pool.query(
    `UPDATE hs_products
     SET mineral_id = COALESCE($1, mineral_id),
         product_name_ar = COALESCE($2, product_name_ar),
         product_name_en = COALESCE($3, product_name_en),
         product_name_fr = COALESCE($4, product_name_fr),
         product_category_ar = COALESCE($5, product_category_ar),
         product_category_en = COALESCE($6, product_category_en),
         product_category_fr = COALESCE($7, product_category_fr)
     WHERE code = $8
     RETURNING code, mineral_id, product_name_ar, product_name_en, product_name_fr,
               product_category_ar, product_category_en, product_category_fr, created_at, updated_at`,
    [mineral_id, product_name_ar, product_name_en, product_name_fr, product_category_ar, product_category_en, product_category_fr, code]
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
