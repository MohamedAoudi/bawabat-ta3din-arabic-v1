from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd

from pipelines.config import BASE_DIR, BILATERAL_DIR, FILES
from pipelines.db import get_cursor
from pipelines.loaders.load_bilateral_trade import BILATERAL_FILE_CANDIDATES
from pipelines.loaders.common import normalize_alias

REPORT_PATH = BASE_DIR / "warehouse" / "warehouse_build_report.md"
CANONICAL_GAPS_PATH = BASE_DIR / "data" / "processed" / "canonical_mapping_gaps.csv"

TABLES = [
    "dim_time",
    "dim_countries",
    "dim_country_aliases",
    "dim_minerals",
    "dim_canonical_minerals",
    "dim_mineral_aliases",
    "bridge_dim_minerals_canonical",
    "bridge_trade_products_canonical",
    "bridge_hs_codes_canonical",
    "bridge_price_assets_canonical",
    "dim_trade_products",
    "dim_hs_codes",
    "dim_partners",
    "dim_units",
    "dim_sources",
    "dim_price_assets",
    "fact_arab_production",
    "fact_world_production",
    "fact_trade_world",
    "fact_bilateral_trade",
    "fact_mineral_price_ticks",
    "agg_arab_production_by_country_mineral_year",
    "agg_world_production_by_mineral_year",
    "agg_trade_world_by_country_product_year_flow",
    "agg_bilateral_trade_by_country_partner_year_flow",
    "agg_country_year_trade_totals",
    "agg_mineral_price_monthly",
    "agg_mineral_price_quarterly",
    "agg_mineral_price_yearly",
    "agg_mineral_price_daily",
    "fact_mineral_reserves",
    "agg_reserves_by_country_mineral_year",
    "data_quality_issues",
]

VIEWS = [
    "v_arab_production",
    "v_world_production",
    "v_production_vs_world",
    "v_trade_world",
    "v_bilateral_trade",
    "v_country_trade_summary",
    "v_top_arab_producers",
    "v_data_quality_summary",
    "mart_production.v_production_by_canonical_mineral",
    "mart_production.v_world_production_by_canonical_mineral",
    "mart_trade.v_trade_by_canonical_mineral",
    "mart_trade.v_bilateral_trade_partner_summary",
    "mart_price.v_price_ticks_by_canonical_mineral",
    "mart_price.v_price_daily_by_canonical_mineral",
    "mart_price.v_price_monthly_by_canonical_mineral",
    "mart_price.v_price_quarterly_by_canonical_mineral",
    "mart_price.v_price_yearly_by_canonical_mineral",
    "mart_reserve.v_reserves_by_canonical_mineral",
    "mart_mineral_360.v_country_mineral_year_summary",
    "mart_mineral_360.v_mineral_year_price_summary",
]

EXPECTED_EMPTY_VIEWS = {
    "v_data_quality_summary",
    "mart_price.v_price_ticks_by_canonical_mineral",
    "mart_price.v_price_daily_by_canonical_mineral",
    "mart_price.v_price_monthly_by_canonical_mineral",
    "mart_price.v_price_quarterly_by_canonical_mineral",
    "mart_price.v_price_yearly_by_canonical_mineral",
    "mart_reserve.v_reserves_by_canonical_mineral",
    "mart_mineral_360.v_mineral_year_price_summary",
}


def _scalar(cur, query: str, params: tuple = ()) -> Any:
    cur.execute(query, params)
    return cur.fetchone()[0]


def _records(cur, query: str, params: tuple = ()) -> list[dict]:
    cur.execute(query, params)
    cols = [desc[0] for desc in cur.description]
    return [dict(zip(cols, row)) for row in cur.fetchall()]


def _source_trade_reporters() -> set[str]:
    reporters = set()
    for fname, header in [("trade_export", 1), ("trade_import", 0)]:
        path = FILES[fname]
        if not path.exists():
            continue
        df = pd.read_excel(path, header=header)
        df.columns = [str(c).strip() for c in df.columns]
        if "reporter" in df.columns:
            reporters.update(str(v).strip() for v in df["reporter"].dropna().unique())
    return reporters


def _missing_raw_files() -> list[str]:
    missing = [str(path.relative_to(BASE_DIR)) for path in FILES.values() if not path.exists()]
    if not BILATERAL_DIR.exists():
        missing.append(str(BILATERAL_DIR.relative_to(BASE_DIR)))
        return missing

    for country_dir in sorted(path for path in BILATERAL_DIR.iterdir() if path.is_dir()):
        for key, candidates in BILATERAL_FILE_CANDIDATES.items():
            if not any((country_dir / name).exists() for name in candidates):
                missing.append(
                    f"{country_dir.relative_to(BASE_DIR)}/"
                    f"{' or '.join(candidates)} ({key})"
                )
    return missing


def _orphan_count(cur, fact_table: str, fk_col: str, dim_table: str, dim_pk: str) -> int:
    return _scalar(
        cur,
        f"""
        SELECT COUNT(*)
        FROM {fact_table} f
        LEFT JOIN {dim_table} d ON d.{dim_pk} = f.{fk_col}
        WHERE f.{fk_col} IS NOT NULL AND d.{dim_pk} IS NULL
        """,
    )


def export_canonical_mapping_gaps(path: Path = CANONICAL_GAPS_PATH) -> Path:
    """Write review-ready production/trade canonical mapping gaps to CSV."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with get_cursor(commit=False) as cur:
        records = _records(
            cur,
            """
            SELECT
                'trade_world' AS gap_type,
                p.trade_product_id,
                p.product_name_en,
                f.hs_code,
                h.description_en AS hs_description_en,
                f.flow,
                COUNT(*) AS source_row_count,
                SUM(f.value_usd) AS total_value_usd,
                'Add or adjust canonical mapping for trade product and/or HS code' AS suggested_action
            FROM fact_trade_world f
            LEFT JOIN dim_trade_products p ON p.trade_product_id = f.trade_product_id
            LEFT JOIN dim_hs_codes h ON h.hs_code = f.hs_code
            LEFT JOIN mart_trade.v_trade_by_canonical_mineral mv
                ON mv.trade_world_fact_id = f.trade_world_fact_id
            WHERE mv.canonical_mineral_id IS NULL
            GROUP BY p.trade_product_id, p.product_name_en, f.hs_code, h.description_en, f.flow
            UNION ALL
            SELECT
                'arab_production' AS gap_type,
                NULL AS trade_product_id,
                m.mineral_name_en AS product_name_en,
                NULL AS hs_code,
                m.mineral_name_ar AS hs_description_en,
                NULL AS flow,
                COUNT(*) AS source_row_count,
                SUM(f.production_value_base) AS total_value_usd,
                'Add canonical mapping for production mineral' AS suggested_action
            FROM fact_arab_production f
            JOIN dim_minerals m ON m.mineral_id = f.mineral_id
            LEFT JOIN mart_production.v_production_by_canonical_mineral mv
                ON mv.production_fact_id = f.production_fact_id
            WHERE mv.canonical_mineral_id IS NULL
            GROUP BY m.mineral_name_en, m.mineral_name_ar
            ORDER BY gap_type, source_row_count DESC, product_name_en NULLS LAST, hs_code NULLS LAST
            """,
        )

    if records:
        pd.DataFrame(records).to_csv(path, index=False, encoding="utf-8-sig")
    else:
        pd.DataFrame(
            columns=[
                "gap_type",
                "trade_product_id",
                "product_name_en",
                "hs_code",
                "hs_description_en",
                "flow",
                "source_row_count",
                "total_value_usd",
                "suggested_action",
            ]
        ).to_csv(path, index=False, encoding="utf-8-sig")
    return path


def validate_warehouse(run_id: int | None = None) -> dict:
    checks = []
    with get_cursor(commit=False) as cur:
        row_counts = {table: _scalar(cur, f"SELECT COUNT(*) FROM {table}") for table in TABLES}
        view_counts = {view: _scalar(cur, f"SELECT COUNT(*) FROM {view}") for view in VIEWS}

        for table in ["dim_time", "dim_countries", "fact_arab_production", "fact_world_production", "fact_trade_world"]:
            checks.append({"name": f"{table} has rows", "status": "PASS" if row_counts[table] > 0 else "FAIL", "details": row_counts[table]})

        missing_raw = _missing_raw_files()
        checks.append({"name": "raw file presence", "status": "PASS" if not missing_raw else "WARN", "details": missing_raw})

        duplicate_groups = _scalar(
            cur,
            """
            SELECT COUNT(*) FROM (
                SELECT country_id, mineral_id, year
                FROM fact_arab_production
                GROUP BY country_id, mineral_id, year
                HAVING COUNT(*) > 1
            ) x
            """,
        )
        conflicting_rows = _scalar(cur, "SELECT COUNT(*) FROM fact_arab_production WHERE is_conflicting_duplicate")
        checks.append({"name": "duplicate production groups preserved", "status": "PASS", "details": f"{duplicate_groups} groups, {conflicting_rows} conflicting rows"})

        aliases = {normalize_alias(row["alias_name"]) for row in _records(cur, "SELECT alias_name FROM dim_country_aliases")}
        missing_reporters = sorted(r for r in _source_trade_reporters() if normalize_alias(r) not in aliases)
        checks.append({"name": "trade reporter alias coverage", "status": "PASS" if not missing_reporters else "FAIL", "details": missing_reporters})

        orphan_checks = {
            "fact_arab_production.country_id": _orphan_count(cur, "fact_arab_production", "country_id", "dim_countries", "country_id"),
            "fact_arab_production.mineral_id": _orphan_count(cur, "fact_arab_production", "mineral_id", "dim_minerals", "mineral_id"),
            "fact_arab_production.year": _orphan_count(cur, "fact_arab_production", "year", "dim_time", "year"),
            "fact_world_production.mineral_id": _orphan_count(cur, "fact_world_production", "mineral_id", "dim_minerals", "mineral_id"),
            "fact_world_production.year": _orphan_count(cur, "fact_world_production", "year", "dim_time", "year"),
            "fact_trade_world.reporter_country_id": _orphan_count(cur, "fact_trade_world", "reporter_country_id", "dim_countries", "country_id"),
            "fact_trade_world.trade_product_id": _orphan_count(cur, "fact_trade_world", "trade_product_id", "dim_trade_products", "trade_product_id"),
            "fact_trade_world.year": _orphan_count(cur, "fact_trade_world", "year", "dim_time", "year"),
            "fact_bilateral_trade.reporter_country_id": _orphan_count(cur, "fact_bilateral_trade", "reporter_country_id", "dim_countries", "country_id"),
            "fact_bilateral_trade.partner_id": _orphan_count(cur, "fact_bilateral_trade", "partner_id", "dim_partners", "partner_id"),
            "fact_bilateral_trade.year": _orphan_count(cur, "fact_bilateral_trade", "year", "dim_time", "year"),
        }
        orphans = {name: count for name, count in orphan_checks.items() if count}
        checks.append({"name": "foreign-key orphan validation", "status": "PASS" if not orphans else "FAIL", "details": orphans})

        empty_views = [view for view, count in view_counts.items() if count == 0 and view != "v_data_quality_summary"]
        checks.append({"name": "reporting views return rows", "status": "PASS" if not empty_views else "WARN", "details": empty_views})

        price_empty = row_counts["fact_mineral_price_ticks"] == 0 and row_counts["dim_price_assets"] == 0
        checks.append({
            "name": "price module population",
            "status": "WARN" if price_empty else "PASS",
            "details": "no local price source configured" if price_empty else f"{row_counts['fact_mineral_price_ticks']} price ticks",
        })

        issue_counts = _records(
            cur,
            """
            SELECT severity, issue_type, COUNT(*) AS count
            FROM data_quality_issues
            WHERE (%s IS NULL OR run_id = %s)
            GROUP BY severity, issue_type
            ORDER BY severity, issue_type
            """,
            (run_id, run_id),
        )
        error_count = sum(row["count"] for row in issue_counts if row["severity"] == "error")
        checks.append({"name": "no error-level quality issues", "status": "PASS" if error_count == 0 else "FAIL", "details": error_count})

        aggregate_mismatches = []
        arab_fact_groups = _scalar(
            cur,
            """
            SELECT COUNT(*) FROM (
                SELECT country_id, mineral_id, year
                FROM fact_arab_production
                WHERE production_value_base IS NOT NULL
                GROUP BY country_id, mineral_id, year
            ) x
            """,
        )
        if arab_fact_groups != row_counts["agg_arab_production_by_country_mineral_year"]:
            aggregate_mismatches.append(f"arab production groups fact={arab_fact_groups} agg={row_counts['agg_arab_production_by_country_mineral_year']}")

        trade_fact_groups = _scalar(
            cur,
            """
            SELECT COUNT(*) FROM (
                SELECT reporter_country_id, trade_product_id, year, flow
                FROM fact_trade_world
                WHERE trade_product_id IS NOT NULL
                GROUP BY reporter_country_id, trade_product_id, year, flow
            ) x
            """,
        )
        if trade_fact_groups != row_counts["agg_trade_world_by_country_product_year_flow"]:
            aggregate_mismatches.append(f"trade world groups fact={trade_fact_groups} agg={row_counts['agg_trade_world_by_country_product_year_flow']}")

        checks.append({"name": "aggregate row-count validation", "status": "PASS" if not aggregate_mismatches else "FAIL", "details": aggregate_mismatches})

        canonical_counts = {
            "canonical_minerals": row_counts["dim_canonical_minerals"],
            "production_bridge_links": row_counts["bridge_dim_minerals_canonical"],
            "trade_product_bridge_links": row_counts["bridge_trade_products_canonical"],
            "hs_bridge_links": row_counts["bridge_hs_codes_canonical"],
        }
        checks.append({
            "name": "canonical mineral mapping loaded",
            "status": "PASS" if all(canonical_counts.values()) else "WARN",
            "details": canonical_counts,
        })

        production_mart_rows = view_counts["mart_production.v_production_by_canonical_mineral"]
        production_mapped_rows = _scalar(
            cur,
            """
            SELECT COUNT(*)
            FROM mart_production.v_production_by_canonical_mineral
            WHERE canonical_mineral_id IS NOT NULL
            """,
        )
        checks.append({
            "name": "canonical production mart row-count safety",
            "status": "PASS" if production_mart_rows == row_counts["fact_arab_production"] else "FAIL",
            "details": f"mart={production_mart_rows}, fact={row_counts['fact_arab_production']}, mapped={production_mapped_rows}",
        })

        trade_mart_rows = view_counts["mart_trade.v_trade_by_canonical_mineral"]
        trade_mapped_rows = _scalar(
            cur,
            """
            SELECT COUNT(*)
            FROM mart_trade.v_trade_by_canonical_mineral
            WHERE canonical_mineral_id IS NOT NULL
            """,
        )
        duplicate_trade_mart_facts = _scalar(
            cur,
            """
            SELECT COUNT(*) FROM (
                SELECT trade_world_fact_id
                FROM mart_trade.v_trade_by_canonical_mineral
                GROUP BY trade_world_fact_id
                HAVING COUNT(*) > 1
            ) x
            """,
        )
        checks.append({
            "name": "canonical trade mart row-count safety",
            "status": "PASS" if trade_mart_rows == row_counts["fact_trade_world"] and duplicate_trade_mart_facts == 0 else "FAIL",
            "details": f"mart={trade_mart_rows}, fact={row_counts['fact_trade_world']}, mapped={trade_mapped_rows}, duplicated_facts={duplicate_trade_mart_facts}",
        })

        canonical_trade_gap_groups = _scalar(
            cur,
            """
            SELECT COUNT(*) FROM (
                SELECT product_name_en, hs_code, flow
                FROM mart_trade.v_trade_by_canonical_mineral
                WHERE canonical_mineral_id IS NULL
                GROUP BY product_name_en, hs_code, flow
            ) x
            """,
        )
        checks.append({
            "name": "canonical trade mapping gaps",
            "status": "WARN" if canonical_trade_gap_groups else "PASS",
            "details": f"{row_counts['fact_trade_world'] - trade_mapped_rows} unmapped trade rows across {canonical_trade_gap_groups} product/HS/flow groups",
        })

        top_issues = _records(
            cur,
            """
            SELECT severity, issue_type, entity_type, COUNT(*) AS count
            FROM data_quality_issues
            WHERE (%s IS NULL OR run_id = %s)
            GROUP BY severity, issue_type, entity_type
            ORDER BY count DESC, severity, issue_type
            LIMIT 25
            """,
            (run_id, run_id),
        )

    hard_checks = [check for check in checks if check["name"] != "duplicate production groups preserved"]
    status = "FAIL" if any(check["status"] == "FAIL" for check in hard_checks) else "PASS"
    return {
        "status": status,
        "run_id": run_id,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "row_counts": row_counts,
        "view_counts": view_counts,
        "checks": checks,
        "quality_issues": issue_counts,
        "top_quality_issues": top_issues,
        "canonical_gaps_path": str(CANONICAL_GAPS_PATH.relative_to(BASE_DIR)),
    }


def write_validation_report(result: dict, path: Path = REPORT_PATH) -> Path:
    gaps_path = export_canonical_mapping_gaps()
    lines = [
        "# AMIP Warehouse V2 Build Report",
        "",
        f"Generated at: {result['generated_at']}",
        f"Run ID: {result['run_id']}",
        f"Status: {result['status']}",
        f"Canonical mapping gaps CSV: {gaps_path.relative_to(BASE_DIR)}",
        "",
        "## Row Counts",
        "",
        "| Table | Rows |",
        "|---|---:|",
    ]
    for table, count in result["row_counts"].items():
        lines.append(f"| `{table}` | {count} |")

    lines += ["", "## View Row Counts", "", "| View | Rows |", "|---|---:|"]
    for view, count in result["view_counts"].items():
        lines.append(f"| `{view}` | {count} |")

    lines += ["", "## Validation Checks", "", "| Check | Status | Details |", "|---|---|---|"]
    for check in result["checks"]:
        lines.append(f"| {check['name']} | {check['status']} | `{check['details']}` |")

    lines += ["", "## Quality Issue Summary", "", "| Severity | Issue Type | Count |", "|---|---|---:|"]
    for issue in result["quality_issues"]:
        lines.append(f"| {issue['severity']} | {issue['issue_type']} | {issue['count']} |")

    lines += ["", "## Top Quality Issues", "", "| Severity | Issue Type | Entity Type | Count |", "|---|---|---|---:|"]
    for issue in result["top_quality_issues"]:
        lines.append(f"| {issue['severity']} | {issue['issue_type']} | {issue.get('entity_type') or ''} | {issue['count']} |")

    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path
