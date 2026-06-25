import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

RAW_DIR = BASE_DIR / os.getenv("RAW_DATA_DIR", "data/raw")
BILATERAL_DIR = BASE_DIR / os.getenv("BILATERAL_DIR", "data/raw/bilateral")
PROCESSED_DIR = BASE_DIR / os.getenv("PROCESSED_DIR", "data/processed")
WAREHOUSE_DIR = BASE_DIR / "warehouse"
CLEANING_LOG = PROCESSED_DIR / "cleaning_log.txt"
VALIDATION_REPORT = PROCESSED_DIR / "validation_report.txt"
TRANSLATIONS_MINERALS_LOOKUP = PROCESSED_DIR / "translations_minerals_lookup.json"
TRANSLATIONS_COUNTRIES_LOOKUP = PROCESSED_DIR / "translations_countries_lookup.json"

# Expected raw workbook names in data/raw/. Keep these aligned with the
# committed/raw-delivered AMIP source layout so ETL runs are reproducible.
FILES = {
    "arab_production": RAW_DIR / "fact_arab_production.xlsx",
    "world_production": RAW_DIR / "fact_world_production.xlsx",
    "countries_ref": RAW_DIR / "ref_countries.xlsx",
    "minerals_hs_ref": RAW_DIR / "ref_minerals_hs.xlsx",
    "trade_export": RAW_DIR / "fact_trade_export.xlsx",
    "trade_import": RAW_DIR / "fact_trade_import.xlsx",
}

DB = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "dbname": os.getenv("DB_NAME", "arab_minerals_dw"),
    "user": os.getenv("DB_USER", "AIDSMO"),
    "password": os.getenv("DB_PASSWORD", ""),
    "options": f"-c search_path={os.getenv('DB_SCHEMA', 'minerals')}",
}
DB_SCHEMA = os.getenv("DB_SCHEMA", "minerals")

# Minimum fuzzy-match score (0–100) for _translate_term to accept a match.
FUZZY_MATCH_THRESHOLD: int = 80

UNIT_DEFINITIONS = [
    {
        "unit_ar": "طن",
        "unit_en": "tonne",
        "unit_fr": "tonne",
        "measurement_type": "mass",
        "multiplier_to_base": 1.0,
        "base_unit_ar": "طن",
        "base_unit_en": "tonne",
        "base_unit_fr": "tonne",
    },
    {
        "unit_ar": "ألف طن",
        "unit_en": "thousand tonnes",
        "unit_fr": "millier de tonnes",
        "measurement_type": "mass",
        "multiplier_to_base": 1000.0,
        "base_unit_ar": "طن",
        "base_unit_en": "tonne",
        "base_unit_fr": "tonne",
    },
    {
        "unit_ar": "الف طن",
        "unit_en": "thousand tonnes",
        "unit_fr": "millier de tonnes",
        "measurement_type": "mass",
        "multiplier_to_base": 1000.0,
        "base_unit_ar": "طن",
        "base_unit_en": "tonne",
        "base_unit_fr": "tonne",
    },
    {
        "unit_ar": "مليون طن",
        "unit_en": "million tonnes",
        "unit_fr": "million de tonnes",
        "measurement_type": "mass",
        "multiplier_to_base": 1_000_000.0,
        "base_unit_ar": "طن",
        "base_unit_en": "tonne",
        "base_unit_fr": "tonne",
    },
    {
        "unit_ar": "كجم",
        "unit_en": "kilogram",
        "unit_fr": "kilogramme",
        "measurement_type": "mass",
        "multiplier_to_base": 0.001,
        "base_unit_ar": "طن",
        "base_unit_en": "tonne",
        "base_unit_fr": "tonne",
    },
    {
        "unit_ar": "كيلو جرام",
        "unit_en": "kilogram",
        "unit_fr": "kilogramme",
        "measurement_type": "mass",
        "multiplier_to_base": 0.001,
        "base_unit_ar": "طن",
        "base_unit_en": "tonne",
        "base_unit_fr": "tonne",
    },
    {
        "unit_ar": "متر مكعب",
        "unit_en": "cubic metre",
        "unit_fr": "metre cube",
        "measurement_type": "volume",
        "multiplier_to_base": 1.0,
        "base_unit_ar": "متر مكعب",
        "base_unit_en": "cubic metre",
        "base_unit_fr": "metre cube",
    },
    {
        "unit_ar": "الف متر مكعب",
        "unit_en": "thousand cubic metres",
        "unit_fr": "millier de metres cubes",
        "measurement_type": "volume",
        "multiplier_to_base": 1000.0,
        "base_unit_ar": "متر مكعب",
        "base_unit_en": "cubic metre",
        "base_unit_fr": "metre cube",
    },
    {
        "unit_ar": "مليون متر مكعب",
        "unit_en": "million cubic metres",
        "unit_fr": "million de metres cubes",
        "measurement_type": "volume",
        "multiplier_to_base": 1_000_000.0,
        "base_unit_ar": "متر مكعب",
        "base_unit_en": "cubic metre",
        "base_unit_fr": "metre cube",
    },
]

UNIT_MULTIPLIERS = {
    item["unit_ar"]: item["multiplier_to_base"]
    for item in UNIT_DEFINITIONS
}

# Official Arabic names from countries_ref.xlsx mapped to common English names used for analytics.
COUNTRY_AR_TO_COMMON_EN = {
    "المملكة الأردنية الهاشمية": "Jordan",
    "دولة الامارات العربية المتحدة": "United Arab Emirates",
    "مملكة البحرين": "Bahrain",
    "الجمهورية التونسية": "Tunisia",
    "الجمهورية الجزائرية الديمقراطية الشعبية": "Algeria",
    "جمهورية جيبوتي": "Djibouti",
    "المملكة العربية السعودية": "Saudi Arabia",
    "جمهورية السودان": "Sudan",
    "الجمهورية العربية السورية": "Syria",
    "جمهورية الصومال الفدرالية": "Somalia",
    "جمهورية العراق": "Iraq",
    "سلطنة عمان": "Oman",
    "دولة الكويت": "Kuwait",
    "دولة قطر": "Qatar",
    "الجمهورية اللبنانية": "Lebanon",
    "دولة ليبيا": "Libya",
    "جمهورية مصر العربية": "Egypt",
    "المملكة المغربية": "Morocco",
    "الجمهورية الاسلامية الموريتانية": "Mauritania",
    "الجمهورية اليمنية": "Yemen",
    "فلسطين": "Palestine",
}

COUNTRY_ALIASES_EN_TO_AR = {
    "Algeria": "الجمهورية الجزائرية الديمقراطية الشعبية",
    "Bahrain": "مملكة البحرين",
    "Bahrain, Kingdom of": "مملكة البحرين",
    "Djibouti": "جمهورية جيبوتي",
    "Egypt": "جمهورية مصر العربية",
    "Iraq": "جمهورية العراق",
    "Jordan": "المملكة الأردنية الهاشمية",
    "Kuwait": "دولة الكويت",
    "Kuwait, the State of": "دولة الكويت",
    "Lebanon": "الجمهورية اللبنانية",
    "Lebanese Republic": "الجمهورية اللبنانية",
    "Libya": "دولة ليبيا",
    "Mauritania": "الجمهورية الاسلامية الموريتانية",
    "Morocco": "المملكة المغربية",
    "Oman": "سلطنة عمان",
    "Palestine": "فلسطين",
    "Qatar": "دولة قطر",
    "Saudi Arabia": "المملكة العربية السعودية",
    "Saudi Arabia, Kingdom of": "المملكة العربية السعودية",
    "Somalia": "جمهورية الصومال الفدرالية",
    "Sudan": "جمهورية السودان",
    "Syria": "الجمهورية العربية السورية",
    "Syrian Arab Republic": "الجمهورية العربية السورية",
    "Tunisia": "الجمهورية التونسية",
    "United Arab Emirates": "دولة الامارات العربية المتحدة",
    "UAE": "دولة الامارات العربية المتحدة",
    "Yemen": "الجمهورية اليمنية",
}

FOLDER_ALIASES_EN_TO_AR = {
    "Algeria": "الجمهورية الجزائرية الديمقراطية الشعبية",
    "Bahrain": "مملكة البحرين",
    "Djibouti": "جمهورية جيبوتي",
    "Egypt": "جمهورية مصر العربية",
    "Iraq": "جمهورية العراق",
    "Jordan": "المملكة الأردنية الهاشمية",
    "Kuwait": "دولة الكويت",
    "Lebanon": "الجمهورية اللبنانية",
    "Libya": "دولة ليبيا",
    "Mauritania": "الجمهورية الاسلامية الموريتانية",
    "Morocco": "المملكة المغربية",
    "Oman": "سلطنة عمان",
    "Qatar": "دولة قطر",
    "Saudi_Arabia": "المملكة العربية السعودية",
    "Somalia": "جمهورية الصومال الفدرالية",
    "Sudan": "جمهورية السودان",
    "Syria": "الجمهورية العربية السورية",
    "Tunisia": "الجمهورية التونسية",
    "UAE": "دولة الامارات العربية المتحدة",
}

REGIONAL_KEYWORDS = [
    "Asia", "Europe", "Africa", "America", "Pacific", "OECD", "OPEC",
    "Arab", "Gulf", "Maghreb", "Middle East", "Low income", "High income",
    "Middle income", "developing",
]


def get_partner_type(partner_name: str) -> str:
    text = partner_name.strip()
    if text.lower() == "world":
        return "world"
    for keyword in REGIONAL_KEYWORDS:
        if keyword.lower() in text.lower():
            return "region"
    return "country"
