const pool = require("../db");

// Read-only analytics endpoints for the public dashboard pages (M1, M2, M5, M6).
// These return joined / dashboard-shaped rows from the public schema so the
// frontend pages don't have to download whole tables and join client-side.

// M1 (production volume) + M2 (production trend).
// Grain: country x mineral x year (arab_production).
// production_quantity = the value in its own reported unit (unit_name_*).
// production_value_base = normalized within a unit family (mass->tonnes,
// volume->m³) — use this for any cross-country / cross-mineral aggregation,
// because some bulk minerals are reported in different units per country.
const getProduction = async (req, res) => {
  try {
    const query = `
      SELECT
        ap.country_id,
        c.iso_code                       AS country_code,
        c.name_ar                        AS country_name_ar,
        c.name_en                        AS country_name_en,
        c.name_fr                        AS country_name_fr,
        ap.mineral_production_id         AS mineral_id,
        m.mineral_name_ar,
        m.mineral_name_en,
        m.mineral_name_fr,
        ap.year,
        ap.production_value              AS production_quantity,
        ap.production_value_base,
        ap.unit_ar                       AS unit_name_ar,
        ap.unit_en                       AS unit_name_en,
        ap.unit_fr                       AS unit_name_fr
      FROM arab_production ap
      JOIN countries c          ON c.id = ap.country_id
      JOIN mineral_production m  ON m.id = ap.mineral_production_id
      ORDER BY ap.year ASC, m.mineral_name_en ASC, c.name_en ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// M5 (exports) + M6 (imports).
// Grain: reporter country x mineral x year (trade_world, partner = "World").
// Optional ?type=export|import filter.
const getTrade = async (req, res) => {
  try {
    const type = req.query.type ? String(req.query.type).toLowerCase() : null;
    if (type && type !== "export" && type !== "import") {
      return res.status(400).json({ message: "type must be 'export' or 'import'" });
    }

    const query = `
      SELECT
        tw.reporter_country_id           AS country_id,
        c.iso_code                       AS country_code,
        c.name_ar                        AS country_name_ar,
        c.name_en                        AS country_name_en,
        c.name_fr                        AS country_name_fr,
        tw.mineral_trade_id              AS mineral_id,
        mt.mineral_name_ar,
        mt.mineral_name_en,
        mt.mineral_name_fr,
        tw.year,
        tw.value_usd                     AS trade_value_usd,
        tw.type_trade
      FROM trade_world tw
      JOIN countries c       ON c.id = tw.reporter_country_id
      JOIN mineral_trade mt  ON mt.id = tw.mineral_trade_id
      WHERE ($1::text IS NULL OR tw.type_trade = $1)
      ORDER BY tw.year ASC, mt.mineral_name_en ASC, c.name_en ASC
    `;
    const result = await pool.query(query, [type]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProduction,
  getTrade,
};
