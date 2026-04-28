const pool = require("../db");

const getAllTradePartners = async () => {
  const result = await pool.query(`
    SELECT id, name, partner_category, created_at, updated_at
    FROM trade_partners
    ORDER BY name ASC
  `);
  return result.rows;
};

const getTradePartnerById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, partner_category, created_at, updated_at
     FROM trade_partners
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const createTradePartner = async ({ name, partner_category }) => {
  const result = await pool.query(
    `INSERT INTO trade_partners (name, partner_category)
     VALUES ($1, $2)
     RETURNING id, name, partner_category, created_at, updated_at`,
    [name, partner_category]
  );
  return result.rows[0];
};

const updateTradePartner = async (id, { name, partner_category }) => {
  const result = await pool.query(
    `UPDATE trade_partners
     SET name = COALESCE($1, name),
         partner_category = COALESCE($2, partner_category)
     WHERE id = $3
     RETURNING id, name, partner_category, created_at, updated_at`,
    [name, partner_category, id]
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
