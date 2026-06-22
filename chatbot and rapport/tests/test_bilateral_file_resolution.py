from pipelines.cleaning.clean_bilateral import _resolve_bilateral_files
from pipelines.loaders.load_bilateral_trade import _bilateral_files


def test_bilateral_loader_prefers_documented_fact_filenames(tmp_path):
    country_dir = tmp_path / "Morocco"
    country_dir.mkdir()
    expected = {
        "import_value": "fact_bilateral_import_usd.xlsx",
        "import_share": "fact_bilateral_import_pct.xlsx",
        "export_value": "fact_bilateral_export_usd.xlsx",
        "export_share": "fact_bilateral_export_pct.xlsx",
    }
    for filename in expected.values():
        (country_dir / filename).touch()

    files = _bilateral_files(country_dir)

    assert {key: path.name for key, path in files.items()} == expected


def test_bilateral_loader_accepts_legacy_short_filenames(tmp_path):
    country_dir = tmp_path / "Morocco"
    country_dir.mkdir()
    expected = {
        "import_value": "import_usd.xlsx",
        "import_share": "import_pct.xlsx",
        "export_value": "export_usd.xlsx",
        "export_share": "export_pct.xlsx",
    }
    for filename in expected.values():
        (country_dir / filename).touch()

    files = _bilateral_files(country_dir)

    assert {key: path.name for key, path in files.items()} == expected


def test_bilateral_cleaner_uses_same_documented_filenames(tmp_path):
    country_dir = tmp_path / "Algeria"
    country_dir.mkdir()
    for filename in [
        "fact_bilateral_import_usd.xlsx",
        "fact_bilateral_import_pct.xlsx",
        "fact_bilateral_export_usd.xlsx",
        "fact_bilateral_export_pct.xlsx",
    ]:
        (country_dir / filename).touch()

    files = _resolve_bilateral_files(country_dir)

    assert files["import_usd"].name == "fact_bilateral_import_usd.xlsx"
    assert files["import_pct"].name == "fact_bilateral_import_pct.xlsx"
    assert files["export_usd"].name == "fact_bilateral_export_usd.xlsx"
    assert files["export_pct"].name == "fact_bilateral_export_pct.xlsx"
