const pool = require("./db");

const countriesSeed = [
  {
    iso_code: "JOR",
    slug: "jordan",
    name_ar: "المملكة الأردنية الهاشمية",
    name_en: "Hashemite Kingdom of Jordan",
    name_fr: "Royaume hachémite de Jordanie",
  },
  {
    iso_code: "ARE",
    slug: "uae",
    name_ar: "دولة الإمارات العربية المتحدة",
    name_en: "United Arab Emirates",
    name_fr: "Émirats arabes unis",
  },
  {
    iso_code: "BHR",
    slug: "bahrain",
    name_ar: "مملكة البحرين",
    name_en: "Kingdom of Bahrain",
    name_fr: "Royaume de Bahreïn",
  },
  {
    iso_code: "TUN",
    slug: "tunisia",
    name_ar: "الجمهورية التونسية",
    name_en: "Republic of Tunisia",
    name_fr: "République tunisienne",
  },
  {
    iso_code: "DZA",
    slug: "algeria",
    name_ar: "الجمهورية الجزائرية الديمقراطية الشعبية",
    name_en: "People's Democratic Republic of Algeria",
    name_fr: "République algérienne démocratique et populaire",
  },
  {
    iso_code: "DJI",
    slug: "djibouti",
    name_ar: "جمهورية جيبوتي",
    name_en: "Republic of Djibouti",
    name_fr: "République de Djibouti",
  },
  {
    iso_code: "SAU",
    slug: "saudiarabe",
    name_ar: "المملكة العربية السعودية",
    name_en: "Kingdom of Saudi Arabia",
    name_fr: "Royaume d’Arabie saoudite",
  },
  {
    iso_code: "SDN",
    slug: "sudan",
    name_ar: "جمهورية السودان",
    name_en: "Republic of the Sudan",
    name_fr: "République du Soudan",
  },
  {
    iso_code: "SYR",
    slug: "syria",
    name_ar: "الجمهورية العربية السورية",
    name_en: "Syrian Arab Republic",
    name_fr: "République arabe syrienne",
  },
  {
    iso_code: "SOM",
    slug: "somalia",
    name_ar: "جمهورية الصومال الفيدرالية",
    name_en: "Federal Republic of Somalia",
    name_fr: "République fédérale de Somalie",
  },
  {
    iso_code: "IRQ",
    slug: "iraq",
    name_ar: "جمهورية العراق",
    name_en: "Republic of Iraq",
    name_fr: "République d’Irak",
  },
  {
    iso_code: "OMN",
    slug: "oman",
    name_ar: "سلطنة عُمان",
    name_en: "Sultanate of Oman",
    name_fr: "Sultanat d’Oman",
  },
  {
    iso_code: "PSE",
    slug: "palestine",
    name_ar: "دولة فلسطين",
    name_en: "State of Palestine",
    name_fr: "État de Palestine",
  },
  {
    iso_code: "QAT",
    slug: "qatar",
    name_ar: "دولة قطر",
    name_en: "State of Qatar",
    name_fr: "État du Qatar",
  },
  {
    iso_code: "KWT",
    slug: "kuwait",
    name_ar: "دولة الكويت",
    name_en: "State of Kuwait",
    name_fr: "État du Koweït",
  },
  {
    iso_code: "LBN",
    slug: "lebanon",
    name_ar: "الجمهورية اللبنانية",
    name_en: "Lebanese Republic",
    name_fr: "République libanaise",
  },
  {
    iso_code: "LBY",
    slug: "libya",
    name_ar: "دولة ليبيا",
    name_en: "State of Libya",
    name_fr: "État de Libye",
  },
  {
    iso_code: "EGY",
    slug: "egypt",
    name_ar: "جمهورية مصر العربية",
    name_en: "Arab Republic of Egypt",
    name_fr: "République arabe d’Égypte",
  },
  {
    iso_code: "MAR",
    slug: "morocco",
    name_ar: "المملكة المغربية",
    name_en: "Kingdom of Morocco",
    name_fr: "Royaume du Maroc",
  },
  {
    iso_code: "MRT",
    slug: "mauritania",
    name_ar: "الجمهورية الإسلامية الموريتانية",
    name_en: "Islamic Republic of Mauritania",
    name_fr: "République islamique de Mauritanie",
  },
  {
    iso_code: "YEM",
    slug: "yemen",
    name_ar: "الجمهورية اليمنية",
    name_en: "Republic of Yemen",
    name_fr: "République du Yémen",
  },
];



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
  await seedCountries();
}

module.exports = { seedOnStartup };

