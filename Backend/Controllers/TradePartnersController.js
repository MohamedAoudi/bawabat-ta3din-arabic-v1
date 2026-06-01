const db = require("../db");

// Get all trade partners
const getAllTradePartners = async (req, res) => {
  try {
    const query = `
      SELECT id, name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr, created_at, updated_at
      FROM trade_partners
      ORDER BY name_en ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get trade partner by ID
const getTradePartnerById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr, created_at, updated_at
      FROM trade_partners
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Trade partner not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new trade partner
const createTradePartner = async (req, res) => {
  try {
    const { name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr } = req.body;

    if (!name_ar || !name_en || !name_fr) {
      return res.status(400).json({ message: "name_ar, name_en, and name_fr are required" });
    }

    const query = `
      INSERT INTO trade_partners (name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr, created_at, updated_at
    `;
    const result = await db.query(query, [name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update trade partner
const updateTradePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr } = req.body;

    const query = `
      UPDATE trade_partners
      SET name_ar = COALESCE($1, name_ar),
          name_en = COALESCE($2, name_en),
          name_fr = COALESCE($3, name_fr),
          partner_category_ar = COALESCE($4, partner_category_ar),
          partner_category_en = COALESCE($5, partner_category_en),
          partner_category_fr = COALESCE($6, partner_category_fr)
      WHERE id = $7
      RETURNING id, name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr, created_at, updated_at
    `;
    const result = await db.query(query, [name_ar, name_en, name_fr, partner_category_ar, partner_category_en, partner_category_fr, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Trade partner not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete trade partner
const deleteTradePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM trade_partners WHERE id = $1 RETURNING id";
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Trade partner not found" });
    }
    res.json({ message: "Trade partner deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTradePartners,
  getTradePartnerById,
  createTradePartner,
  updateTradePartner,
  deleteTradePartner,
};
