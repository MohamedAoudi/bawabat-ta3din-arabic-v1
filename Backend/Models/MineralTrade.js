const pool = require("../db");

const getAllMineralTrades = async () => {
  const query = `SELECT * FROM mineral_trade ORDER BY mineral_name_en ASC`;
  const result = await pool.query(query);
  return result.rows;
};

const getMineralTradeById = async (id) => {
  const query = `SELECT * FROM mineral_trade WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const createMineralTrade = async ({ hs_codes, mineral_name_ar, mineral_name_en, mineral_name_fr, source_system }) => {
  const query = `
    INSERT INTO mineral_trade (hs_codes, mineral_name_ar, mineral_name_en, mineral_name_fr, source_system)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result = await pool.query(query, [hs_codes || null, mineral_name_ar, mineral_name_en, mineral_name_fr, source_system || null]);
  return result.rows[0];
};

const updateMineralTrade = async (id, mineral) => {
  const { hs_codes, mineral_name_ar, mineral_name_en, mineral_name_fr, source_system } = mineral;
  const query = `
    UPDATE mineral_trade
    SET hs_codes = COALESCE($1, hs_codes),
        mineral_name_ar = COALESCE($2, mineral_name_ar),
        mineral_name_en = COALESCE($3, mineral_name_en),
        mineral_name_fr = COALESCE($4, mineral_name_fr),
        source_system = COALESCE($5, source_system),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *
  `;
  const result = await pool.query(query, [hs_codes, mineral_name_ar, mineral_name_en, mineral_name_fr, source_system, id]);
  return result.rows[0];
};

const deleteMineralTrade = async (id) => {
  const query = `DELETE FROM mineral_trade WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllMineralTrades,
  getMineralTradeById,
  createMineralTrade,
  updateMineralTrade,
  deleteMineralTrade,
};
