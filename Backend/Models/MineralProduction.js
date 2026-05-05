const pool = require("../db");

const getAllMineralProduction = async () => {
  const result = await pool.query(`
    SELECT id, country_id, mineral_id, year, production_quantity, normalized_quantity,
           unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source, created_at, updated_at
    FROM mineral_production
    ORDER BY year DESC, mineral_id ASC, country_id ASC NULLS FIRST
  `);
  return result.rows;
};

const getMineralProductionAnalytics = async () => {
  const result = await pool.query(
    `SELECT
       c.iso_code AS country_code,
       c.name_ar AS country_name_ar,
       c.name_en AS country_name_en,
       c.name_fr AS country_name_fr,
       m.name_ar AS mineral_name_ar,
       m.name_en AS mineral_name_en,
       m.name_fr AS mineral_name_fr,
       mp.year,
       SUM(COALESCE(mp.normalized_quantity, mp.production_quantity, 0))::double precision AS production_quantity,
       COALESCE(MAX(mp.unit_name_ar), '') AS unit_name_ar,
       COALESCE(MAX(mp.unit_name_en), '') AS unit_name_en,
       COALESCE(MAX(mp.unit_name_fr), '') AS unit_name_fr
     FROM mineral_production mp
     LEFT JOIN countries c ON c.id = mp.country_id
     LEFT JOIN minerals m ON m.id = mp.mineral_id
     WHERE mp.year IS NOT NULL
     GROUP BY
       c.iso_code, c.name_ar, c.name_en, c.name_fr,
       m.name_ar, m.name_en, m.name_fr, mp.year
     ORDER BY mp.year ASC, c.iso_code ASC, m.name_en ASC`
  );
  return result.rows;
};

const getMineralProductionById = async (id) => {
  const result = await pool.query(
    `SELECT id, country_id, mineral_id, year, production_quantity, normalized_quantity,
            unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source, created_at, updated_at
     FROM mineral_production
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const createMineralProduction = async ({
  country_id = null,
  mineral_id,
  year,
  production_quantity,
  normalized_quantity,
  unit_name_ar,
  unit_name_en,
  unit_name_fr,
  conversion_factor,
  data_source,
}) => {
  const result = await pool.query(
    `INSERT INTO mineral_production
      (country_id, mineral_id, year, production_quantity, normalized_quantity, unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, country_id, mineral_id, year, production_quantity, normalized_quantity,
               unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source, created_at, updated_at`,
    [country_id, mineral_id, year, production_quantity, normalized_quantity, unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source]
  );
  return result.rows[0];
};

const updateMineralProduction = async (id, data) => {
  const {
    country_id,
    mineral_id,
    year,
    production_quantity,
    normalized_quantity,
    unit_name_ar,
    unit_name_en,
    unit_name_fr,
    conversion_factor,
    data_source,
  } = data;

  const result = await pool.query(
    `UPDATE mineral_production
     SET country_id = COALESCE($1, country_id),
         mineral_id = COALESCE($2, mineral_id),
         year = COALESCE($3, year),
         production_quantity = COALESCE($4, production_quantity),
         normalized_quantity = COALESCE($5, normalized_quantity),
         unit_name_ar = COALESCE($6, unit_name_ar),
         unit_name_en = COALESCE($7, unit_name_en),
         unit_name_fr = COALESCE($8, unit_name_fr),
         conversion_factor = COALESCE($9, conversion_factor),
         data_source = COALESCE($10, data_source)
     WHERE id = $11
     RETURNING id, country_id, mineral_id, year, production_quantity, normalized_quantity,
               unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source, created_at, updated_at`,
    [country_id, mineral_id, year, production_quantity, normalized_quantity, unit_name_ar, unit_name_en, unit_name_fr, conversion_factor, data_source, id]
  );
  return result.rows[0];
};

const deleteMineralProduction = async (id) => {
  const result = await pool.query("DELETE FROM mineral_production WHERE id = $1 RETURNING id", [id]);
  return result.rows[0];
};

module.exports = {
  getAllMineralProduction,
  getMineralProductionAnalytics,
  getMineralProductionById,
  createMineralProduction,
  updateMineralProduction,
  deleteMineralProduction,
};
