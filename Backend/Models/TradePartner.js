const pool = require("../db");

const getAllTradePartners = async () => {
  const query = `SELECT * FROM trade_partners ORDER BY name_en ASC`;
  const result = await pool.query(query);
  return result.rows;
};

const getTradePartnerById = async (id) => {
  const query = `SELECT * FROM trade_partners WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const createTradePartner = async ({ name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr }) => {
  const query = `
    INSERT INTO trade_partners (name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const result = await pool.query(query, [name_ar, name_en, name_fr, partner_category_ar || null, partner_category_en || null, partner_category_fr || null]);
  return result.rows[0];
};

const updateTradePartner = async (id, partner) => {
  const { name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr } = partner;
  const query = `
    UPDATE trade_partners
    SET name_ar = COALESCE($1, name_ar),
        name_en = COALESCE($2, name_en),
        name_fr = COALESCE($3, name_fr),
        partner_category_ar = COALESCE($4, partner_category_ar),
        partner_category_en = COALESCE($5, partner_category_en),
        partner_category_fr = COALESCE($6, partner_category_fr),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING *
  `;
  const result = await pool.query(query, [name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr, id]);
  return result.rows[0];
};

const deleteTradePartner = async (id) => {
  const query = `DELETE FROM trade_partners WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllTradePartners,
  getTradePartnerById,
  createTradePartner,
  updateTradePartner,
  deleteTradePartner,
};
