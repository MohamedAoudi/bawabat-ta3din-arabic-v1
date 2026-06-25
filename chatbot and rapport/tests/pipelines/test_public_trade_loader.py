from decimal import Decimal

import pandas as pd

from pipelines.loaders.load_public_trade import (
    _decimal,
    _hs_code,
    _integer,
    _prepare_fact_rows,
)


def test_numeric_helpers():
    assert _decimal("1,250.50") == Decimal("1250.50")
    assert _decimal("") is None
    assert _integer(2023.0) == 2023
    assert _integer(2023.5) is None
    assert _hs_code(260600.0) == "260600"


def test_fact_rows_are_aggregated_to_simplified_natural_key():
    export = pd.DataFrame(
        [
            {
                "reporter": "Morocco",
                "partner": "World",
                "flow": "Export",
                "aggregate_product": "Gold",
                "hs_code": 284330.0,
                "hs_description": "Gold compounds",
                "year": 2023.0,
                "value_usd": 100.0,
                "type_trade": "export",
            },
            {
                "reporter": "Morocco",
                "partner": "World",
                "flow": "Export",
                "aggregate_product": "Gold",
                "hs_code": 710812.0,
                "hs_description": "Gold",
                "year": 2023.0,
                "value_usd": 250.0,
                "type_trade": "export",
            },
            {
                "reporter": None,
                "partner": None,
                "flow": None,
                "aggregate_product": None,
                "hs_code": None,
                "hs_description": None,
                "year": None,
                "value_usd": 999.0,
                "type_trade": "export",
            },
        ]
    )

    rows, skipped, keys_by_flow, years, reporters, valid_rows = _prepare_fact_rows(
        [export],
        country_ids={"Kingdom of Morocco": 1},
        mineral_ids={"Gold": 2},
        world_partner_id=3,
    )

    assert rows == [(1, 3, 2, 2023, "export", Decimal("350.0"), None)]
    assert skipped == {"null_spacer_or_total": 1}
    assert keys_by_flow == {"export": 1}
    assert years == [2023]
    assert reporters == ["Morocco"]
    assert valid_rows == 2
