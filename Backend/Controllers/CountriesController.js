const db = require("../db");

const COUNTRY_SELECT = `
  SELECT
    c.country_id,
    c.country_name_ar,
    c.country_name_en,
    c.country_name_fr,
    c.display_order,
    c.is_arab_country,
    c.source_file,
    c.created_at,
    c.updated_at,
    iso.alias_name AS iso_code
  FROM dim_countries c
  LEFT JOIN dim_country_aliases iso
    ON iso.country_id = c.country_id
   AND iso.alias_type = 'iso_code'
`;

function mapCountryRow(row) {
  if (!row) return null;

  return {
    id: row.country_id,
    name_ar: row.country_name_ar,
    name_en: row.country_name_en,
    name_fr: row.country_name_fr,
    iso_code: row.iso_code || null,
    display_order: row.display_order,
    is_arab_country: row.is_arab_country,
    source_file: row.source_file,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function parseCountryInput(body) {
  return {
    country_name_ar: body.country_name_ar ?? body.name_ar ?? null,
    country_name_en: body.country_name_en ?? body.name_en ?? null,
    country_name_fr: body.country_name_fr ?? body.name_fr ?? null,
    iso_code: body.iso_code ? String(body.iso_code).trim().toUpperCase() : null,
    display_order:
      body.display_order === undefined || body.display_order === null || body.display_order === ""
        ? null
        : Number(body.display_order),
    is_arab_country:
      body.is_arab_country === undefined ? true : Boolean(body.is_arab_country),
    source_file: body.source_file ?? "api",
  };
}

function hasAtLeastOneName({ country_name_ar, country_name_en, country_name_fr }) {
  return Boolean(country_name_ar || country_name_en || country_name_fr);
}

async function upsertIsoAlias(client, countryId, isoCode) {
  if (!isoCode) return;

  await client.query(
    `
      DELETE FROM dim_country_aliases
      WHERE country_id = $1 AND alias_type = 'iso_code'
    `,
    [countryId]
  );

  await client.query(
    `
      INSERT INTO dim_country_aliases (
        country_id, alias_name, language_code, alias_type, source_system, is_primary
      )
      VALUES ($1, $2, 'en', 'iso_code', 'api', TRUE)
    `,
    [countryId, isoCode]
  );
}

async function getCountryRowById(id) {
  const result = await db.query(
    `${COUNTRY_SELECT} WHERE c.country_id = $1`,
    [id]
  );
  return result.rows[0];
}

const getAllCountries = async (req, res) => {
  try {
    const result = await db.query(
      `${COUNTRY_SELECT}
       ORDER BY c.display_order ASC NULLS LAST, c.country_name_en ASC NULLS LAST`
    );
    res.json(result.rows.map(mapCountryRow));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCountryById = async (req, res) => {
  try {
    const row = await getCountryRowById(req.params.id);
    if (!row) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.json(mapCountryRow(row));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCountry = async (req, res) => {
  const input = parseCountryInput(req.body);

  if (!hasAtLeastOneName(input)) {
    return res.status(400).json({
      message: "At least one country name (ar, en, or fr) is required",
    });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
        INSERT INTO dim_countries (
          country_name_ar, country_name_en, country_name_fr,
          display_order, is_arab_country, source_file
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING country_id
      `,
      [
        input.country_name_ar,
        input.country_name_en,
        input.country_name_fr,
        input.display_order ?? 0,
        input.is_arab_country,
        input.source_file,
      ]
    );

    const countryId = result.rows[0].country_id;
    await upsertIsoAlias(client, countryId, input.iso_code);
    await client.query("COMMIT");

    const row = await getCountryRowById(countryId);
    res.status(201).json(mapCountryRow(row));
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(400).json({ message: "Country name or ISO code already exists" });
    }
    if (error.code === "23514") {
      return res.status(400).json({ message: "Country must have at least one name" });
    }

    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

const updateCountry = async (req, res) => {
  const input = parseCountryInput(req.body);
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
        UPDATE dim_countries
        SET country_name_ar = COALESCE($1, country_name_ar),
            country_name_en = COALESCE($2, country_name_en),
            country_name_fr = COALESCE($3, country_name_fr),
            display_order = COALESCE($4, display_order),
            is_arab_country = COALESCE($5, is_arab_country),
            source_file = COALESCE($6, source_file),
            updated_at = NOW()
        WHERE country_id = $7
        RETURNING country_id
      `,
      [
        input.country_name_ar,
        input.country_name_en,
        input.country_name_fr,
        input.display_order,
        req.body.is_arab_country === undefined ? null : input.is_arab_country,
        input.source_file,
        req.params.id,
      ]
    );

    if (!result.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Country not found" });
    }

    const countryId = result.rows[0].country_id;
    if (input.iso_code) {
      await upsertIsoAlias(client, countryId, input.iso_code);
    }

    await client.query("COMMIT");

    const row = await getCountryRowById(countryId);
    res.json(mapCountryRow(row));
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(400).json({ message: "Country name or ISO code already exists" });
    }

    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

const deleteCountry = async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM dim_countries WHERE country_id = $1 RETURNING country_id",
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Country not found" });
    }

    res.json({ message: "Country deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
};
