const db = require("../db");

// Get all trade transactions
const getAllTradeTransactions = async (req, res) => {
  try {
    const query = `
      SELECT id, country_id, mineral_id, partners_id, year, trade_type, trade_value_usd, 
             created_at, updated_at
      FROM trade_transactions
      ORDER BY year DESC, country_id ASC, mineral_id ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get trade transaction by ID
const getTradeTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, country_id, mineral_id, partners_id, year, trade_type, trade_value_usd, 
             created_at, updated_at
      FROM trade_transactions
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Trade transaction not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get trade transactions by country and year
const getTradeTransactionsByCountryYear = async (req, res) => {
  try {
    const { countryId, year } = req.params;
    const query = `
      SELECT id, country_id, mineral_id, partners_id, year, trade_type, trade_value_usd, 
             created_at, updated_at
      FROM trade_transactions
      WHERE country_id = $1 AND year = $2
      ORDER BY trade_type DESC, mineral_id ASC
    `;
    const result = await db.query(query, [countryId, year]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get trade transactions by type (import/export)
const getTradeTransactionsByType = async (req, res) => {
  try {
    const { tradeType } = req.params;
    
    if (!["import", "export"].includes(tradeType)) {
      return res.status(400).json({ message: "tradeType must be 'import' or 'export'" });
    }

    const query = `
      SELECT id, country_id, mineral_id, partners_id, year, trade_type, trade_value_usd, 
             created_at, updated_at
      FROM trade_transactions
      WHERE trade_type = $1
      ORDER BY year DESC, country_id ASC, mineral_id ASC
    `;
    const result = await db.query(query, [tradeType]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new trade transaction
const createTradeTransaction = async (req, res) => {
  try {
    const { country_id, mineral_id, partners_id, year, trade_type, trade_value_usd } = req.body;

    if (!country_id || !mineral_id || !year || !trade_type) {
      return res.status(400).json({ message: "country_id, mineral_id, year, and trade_type are required" });
    }

    if (!["import", "export"].includes(trade_type)) {
      return res.status(400).json({ message: "trade_type must be 'import' or 'export'" });
    }

    const query = `
      INSERT INTO trade_transactions 
      (country_id, mineral_id, partners_id, year, trade_type, trade_value_usd)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, country_id, mineral_id, partners_id, year, trade_type, trade_value_usd, 
                created_at, updated_at
    `;
    const result = await db.query(query, 
      [country_id, mineral_id, partners_id, year, trade_type, trade_value_usd || 0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update trade transaction
const updateTradeTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { country_id, mineral_id, partners_id, year, trade_type, trade_value_usd } = req.body;

    if (trade_type && !["import", "export"].includes(trade_type)) {
      return res.status(400).json({ message: "trade_type must be 'import' or 'export'" });
    }

    const query = `
      UPDATE trade_transactions
      SET country_id = COALESCE($1, country_id),
          mineral_id = COALESCE($2, mineral_id),
          partners_id = COALESCE($3, partners_id),
          year = COALESCE($4, year),
          trade_type = COALESCE($5, trade_type),
          trade_value_usd = COALESCE($6, trade_value_usd)
      WHERE id = $7
      RETURNING id, country_id, mineral_id, partners_id, year, trade_type, trade_value_usd, 
                created_at, updated_at
    `;
    const result = await db.query(query, 
      [country_id, mineral_id, partners_id, year, trade_type, trade_value_usd, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Trade transaction not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete trade transaction
const deleteTradeTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM trade_transactions WHERE id = $1 RETURNING id";
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Trade transaction not found" });
    }
    res.json({ message: "Trade transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTradeTransactions,
  getTradeTransactionById,
  getTradeTransactionsByCountryYear,
  getTradeTransactionsByType,
  createTradeTransaction,
  updateTradeTransaction,
  deleteTradeTransaction,
};
