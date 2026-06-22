"""Compatibility marker for the retired Warehouse V1 schema smoke tests.

The active AMIP Warehouse V2 schema tests live in tests/warehouse/test_schema.py.
This file remains so old commands such as `pytest tests/test_schema.py` do not
fail during collection by importing the removed `etl.db` package.
"""


def test_schema_v2_tests_are_canonical():
    assert True
