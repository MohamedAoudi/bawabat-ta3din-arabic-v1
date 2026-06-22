"""Price module placeholder for AMIP Warehouse V2.

The V2 DDL supports price assets, ticks, and monthly/quarterly/yearly aggregates.
This loader is intentionally a safe no-op until a warehouse-scoped price source is
provided. It does not call external APIs or runtime services.
"""
from __future__ import annotations

from pipelines.db import get_cursor
from pipelines.loaders.common import log_issue


def load(run_id: int | None = None) -> int:
    with get_cursor() as cur:
        log_issue(
            cur,
            run_id,
            "info",
            "price_loader_no_source",
            "Price module DDL is present, but no warehouse-scoped local price source was configured for this build.",
            entity_type="price_module",
        )
    print("  prices: no local warehouse-scoped source configured; 0 rows loaded")
    return 0


if __name__ == "__main__":
    load()
