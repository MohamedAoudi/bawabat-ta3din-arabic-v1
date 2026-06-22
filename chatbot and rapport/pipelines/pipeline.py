"""AMIP Warehouse V2 build pipeline.

Usage:
    python -m pipelines.pipeline
    python -m pipelines.pipeline --step 03
    python -m pipelines.pipeline --skip-ddl
"""
from __future__ import annotations

import argparse
import time

from pipelines.config import DB, RAW_DIR
from pipelines.db import assert_safe_v2_build_target, create_database_if_absent, execute_ddl_files
from pipelines.loaders import (
    load_arab_production,
    load_bilateral_trade,
    load_canonical_minerals,
    load_dims_static,
    load_prices,
    load_trade_aggregate,
    load_world_production,
    refresh_aggregations,
)
from pipelines.loaders.common import finish_run, start_run
from pipelines.validation import validate_warehouse, write_validation_report


STEPS = [
    ("00", "Static dimensions and aliases", load_dims_static.load),
    ("01", "Arab production", load_arab_production.load),
    ("02", "World production", load_world_production.load),
    ("03", "World/aggregate trade", load_trade_aggregate.load),
    ("04", "Bilateral trade", load_bilateral_trade.load),
    ("05", "Canonical mineral mappings", load_canonical_minerals.load),
    ("06", "Prices", load_prices.load),
    ("07", "Refresh aggregations", refresh_aggregations.refresh),
]


def initialize_database(skip_ddl: bool = False):
    created = create_database_if_absent()
    if created:
        print(f"Created database {DB['dbname']}")
    if skip_ddl:
        print("Skipping DDL application by request")
        return
    assert_safe_v2_build_target()
    execute_ddl_files()
    print("Warehouse V2 DDL applied")


def run(only_step: str | None = None, skip_ddl: bool = False, skip_validation: bool = False):
    total_start = time.time()
    initialize_database(skip_ddl=skip_ddl)

    run_id = start_run("amip_warehouse_v2", RAW_DIR, notes=f"only_step={only_step or 'all'}")
    rows_loaded = 0
    try:
        for code, label, fn in STEPS:
            if only_step and code != only_step:
                continue
            print(f"\n[{code}] {label}")
            start = time.time()
            rows = fn(run_id=run_id)
            rows_loaded += rows or 0
            print(f"    completed in {time.time() - start:.1f}s")

        if not skip_validation:
            print("\n[08] Warehouse validation")
            result = validate_warehouse(run_id=run_id)
            report_path = write_validation_report(result)
            print(f"    validation report: {report_path}")
            if result["status"] != "PASS":
                print(f"    validation status: {result['status']}")

        finish_run(run_id, status="success", rows_loaded=rows_loaded)
    except Exception:
        finish_run(run_id, status="failed", rows_loaded=rows_loaded)
        raise

    print(f"\nPipeline complete in {time.time() - total_start:.1f}s")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--step", help="Run only this step code, e.g. 03")
    parser.add_argument("--skip-ddl", action="store_true", help="Do not create/apply DDL before loading")
    parser.add_argument("--skip-validation", action="store_true", help="Do not run validation/reporting")
    args = parser.parse_args()
    run(only_step=args.step, skip_ddl=args.skip_ddl, skip_validation=args.skip_validation)
