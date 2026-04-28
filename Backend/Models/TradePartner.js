const pool = require("../db");

const getAllTradePartners = async () => {
  const result = await pool.query(`
    SELECT id, name_ar, name_en, name_fr,
           partner_category_ar, partner_category_en, partner_category_fr,
           created_at, updated_at
    FROM trade_partners
    ORDER BY name_en ASC
  `);
  return result.rows;
};

const getTradePartnerById = async (id) => {
  const result = await pool.query(
    `SELECT id, name_ar, name_en, name_fr,
            partner_category_ar, partner_category_en, partner_category_fr,
            created_at, updated_at
     FROM trade_partners
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const createTradePartner = async ({
  name_ar,
  name_en,
  name_fr,
  partner_category_ar,
  partner_category_en,
  partner_category_fr,
}) => {
  const result = await pool.query(
    `INSERT INTO trade_partners
      (name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name_ar, name_en, name_fr,
               partner_category_ar, partner_category_en, partner_category_fr, created_at, updated_at`,
    [name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr]
  );
  return result.rows[0];
};

const updateTradePartner = async (id, {
  name_ar,
  name_en,
  name_fr,
  partner_category_ar,
  partner_category_en,
  partner_category_fr,
}) => {
  const result = await pool.query(
    `UPDATE trade_partners
     SET name_ar = COALESCE($1, name_ar),
         name_en = COALESCE($2, name_en),
         name_fr = COALESCE($3, name_fr),
         partner_category_ar = COALESCE($4, partner_category_ar),
         partner_category_en = COALESCE($5, partner_category_en),
         partner_category_fr = COALESCE($6, partner_category_fr)
     WHERE id = $7
     RETURNING id, name_ar, name_en, name_fr,
               partner_category_ar, partner_category_en, partner_category_fr, created_at, updated_at`,
    [name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr, id]
  );
  return result.rows[0];
};

const deleteTradePartner = async (id) => {
  const result = await pool.query("DELETE FROM trade_partners WHERE id = $1 RETURNING id", [id]);
  return result.rows[0];
};

module.exports = {
  getAllTradePartners,
  getTradePartnerById,
  createTradePartner,
  updateTradePartner,
  deleteTradePartner,
};
