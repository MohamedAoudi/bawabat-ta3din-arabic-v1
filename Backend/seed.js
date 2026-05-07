const pool = require("./db");

const countriesSeed = [
  { iso_code: "JOR", slug: "jordan", name_ar: "الأردن", name_en: "Jordan", name_fr: "Jordanie" },
  { iso_code: "ARE", slug: "uae", name_ar: "الإمارات", name_en: "United Arab Emirates", name_fr: "Émirats arabes unis" },
  { iso_code: "BHR", slug: "bahrain", name_ar: "البحرين", name_en: "Bahrain", name_fr: "Bahreïn" },
  { iso_code: "TUN", slug: "tunisia", name_ar: "تونس", name_en: "Tunisia", name_fr: "Tunisie" },
  { iso_code: "DZA", slug: "algeria", name_ar: "الجزائر", name_en: "Algeria", name_fr: "Algérie" },
  { iso_code: "DJI", slug: "djibouti", name_ar: "جيبوتي", name_en: "Djibouti", name_fr: "Djibouti" },
  { iso_code: "SAU", slug: "saudiarabe", name_ar: "السعودية", name_en: "Saudi Arabia", name_fr: "Arabie saoudite" },
  { iso_code: "SDN", slug: "sudan", name_ar: "السودان", name_en: "Sudan", name_fr: "Soudan" },
  { iso_code: "SYR", slug: "syria", name_ar: "سوريا", name_en: "Syria", name_fr: "Syrie" },
  { iso_code: "SOM", slug: "somalia", name_ar: "الصومال", name_en: "Somalia", name_fr: "Somalie" },
  { iso_code: "IRQ", slug: "iraq", name_ar: "العراق", name_en: "Iraq", name_fr: "Irak" },
  { iso_code: "OMN", slug: "oman", name_ar: "عمان", name_en: "Oman", name_fr: "Oman" },
  { iso_code: "PSE", slug: "palestine", name_ar: "فلسطين", name_en: "Palestine", name_fr: "Palestine" },
  { iso_code: "QAT", slug: "qatar", name_ar: "قطر", name_en: "Qatar", name_fr: "Qatar" },
  { iso_code: "KWT", slug: "kuwait", name_ar: "الكويت", name_en: "Kuwait", name_fr: "Koweït" },
  { iso_code: "LBN", slug: "lebanon", name_ar: "لبنان", name_en: "Lebanon", name_fr: "Liban" },
  { iso_code: "LBY", slug: "libya", name_ar: "ليبيا", name_en: "Libya", name_fr: "Libye" },
  { iso_code: "EGY", slug: "egypt", name_ar: "مصر", name_en: "Egypt", name_fr: "Égypte" },
  { iso_code: "MAR", slug: "morocco", name_ar: "المغرب", name_en: "Morocco", name_fr: "Maroc" },
  { iso_code: "MRT", slug: "mauritania", name_ar: "موريتانيا", name_en: "Mauritania", name_fr: "Mauritanie" },
  { iso_code: "YEM", slug: "yemen", name_ar: "اليمن", name_en: "Yemen", name_fr: "Yémen" },
];

async function seedYears({ fromYear = 2000, toYear = new Date().getFullYear() } = {}) {
  const years = [];
  for (let y = fromYear; y <= toYear; y += 1) {
    years.push({ year: y, decade: Math.floor(y / 10) * 10 });
  }

  await pool.query("BEGIN");
  try {
    for (const row of years) {
      await pool.query(
        `
          INSERT INTO years (year, decade)
          VALUES ($1, $2)
          ON CONFLICT (year) DO UPDATE
          SET decade = EXCLUDED.decade
        `,
        [row.year, row.decade]
      );
    }
    await pool.query("COMMIT");
  } catch (e) {
    await pool.query("ROLLBACK");
    throw e;
  }
}

async function seedCountries() {
  await pool.query("BEGIN");
  try {
    for (let i = 0; i < countriesSeed.length; i += 1) {
      const c = countriesSeed[i];
      const displayOrder = i + 1;

      await pool.query(
        `
          INSERT INTO countries (name_ar, name_en, name_fr, iso_code, display_order)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (iso_code) DO UPDATE
          SET name_ar = EXCLUDED.name_ar,
              name_en = EXCLUDED.name_en,
              name_fr = EXCLUDED.name_fr,
              display_order = EXCLUDED.display_order
        `,
        [c.name_ar, c.name_en, c.name_fr, c.iso_code, displayOrder]
      );
    }
    await pool.query("COMMIT");
  } catch (e) {
    await pool.query("ROLLBACK");
    throw e;
  }
}

async function seedOnStartup() {
  await seedYears({ fromYear: 2000, toYear: new Date().getFullYear() });
  await seedCountries();
}

module.exports = { seedOnStartup };

