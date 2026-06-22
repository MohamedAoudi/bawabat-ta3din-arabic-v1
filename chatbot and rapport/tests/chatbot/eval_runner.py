"""
Evaluation runner for the AMIP Chatbot.

Runs route-check fixtures through either the in-process hybrid router or a live
POST /chat endpoint, computes route accuracy breakdowns, checks cross-language
consistency triplets, optionally smoke-tests POST /report, writes structured
results to eval_results_amip.json, and prints a Markdown summary.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


_DEFAULT_QUESTIONS_PATH = Path(__file__).parent / "test_questions_detailed_ar.json"
_DEFAULT_OUTPUT_JSON = Path("eval_results_amip.json")
_ANSWER_PREVIEW_CHARS = 160
_LANGUAGES = ("ar", "en", "fr")
_OUT_OF_SCOPE_EXPECTED = "REJECTED_OR_CLARIFY"
_REJECTION_ROUTES = {"REFUSED", "REJECTED", "CLARIFY", "CLARIFICATION", "CLARIFYING"}

_PDF_SMOKE_TESTS: list[dict[str, Any]] = [
    {
        "id": "pdf_001",
        "country": "Morocco",
        "mineral": "phosphate",
        "year_from": 2018,
        "year_to": 2022,
        "lang": "en",
    },
    {
        "id": "pdf_002",
        "country": "Algérie",
        "mineral": "fer",
        "year_from": 2019,
        "year_to": 2022,
        "lang": "fr",
    },
    {
        "id": "pdf_003",
        "country": "المغرب",
        "mineral": "الفوسفات",
        "year_from": 2018,
        "year_to": 2022,
        "lang": "ar",
    },
]

_SECRET_PATTERNS = (
    re.compile(
        r"(?i)\b(api[_-]?key|access[_-]?token|auth[_-]?token|secret|password|passwd|pwd)"
        r"\s*[:=]\s*['\"]?[^'\"\s,;&]+"
    ),
    re.compile(r"(?i)\b(bearer)\s+[a-z0-9._~+/=-]+"),
    re.compile(r"(?i)\b([a-z][a-z0-9+.-]*://[^:/@\s]+):([^@\s/]+)@"),
)


def _redact_string(value: str) -> str:
    redacted = _SECRET_PATTERNS[0].sub(r"\1=<redacted>", value)
    redacted = _SECRET_PATTERNS[1].sub(r"\1 <redacted>", redacted)
    redacted = _SECRET_PATTERNS[2].sub(r"\1:<redacted>@", redacted)
    return redacted


def _redact(value: Any) -> Any:
    if isinstance(value, str):
        return _redact_string(value)
    if isinstance(value, list):
        return [_redact(item) for item in value]
    if isinstance(value, dict):
        return {key: _redact(item) for key, item in value.items()}
    return value


def _preview(text: str, max_chars: int = _ANSWER_PREVIEW_CHARS) -> str:
    compact = " ".join(text.split())
    return compact[:max_chars]


def _markdown_escape(value: Any) -> str:
    text = "" if value is None else str(value)
    return text.replace("\\", "\\\\").replace("|", "\\|").replace("\n", " ")


def _detect_language(message: str) -> str:
    if re.search(r"[\u0600-\u06ff]", message):
        return "ar"
    words = set(re.findall(r"\b\w+\b", message.lower()))
    if words & {"le", "la", "les", "des", "est", "une", "un", "dans", "de", "du", "que", "qui", "quels"}:
        return "fr"
    return "en"


def _normalize_route(route: Any) -> str:
    if route is None:
        return "UNKNOWN"
    text = str(route).strip()
    if not text:
        return "UNKNOWN"
    upper = text.upper()
    if upper == "CLARIFY":
        return "CLARIFY"
    return upper


def _expected_bucket(expected_route: str | None) -> str:
    if expected_route == _OUT_OF_SCOPE_EXPECTED:
        return "OUT_OF_SCOPE"
    return _normalize_route(expected_route)


def _route_matches(actual_route: Any, expected_route: str | None, response: dict | None = None) -> bool | None:
    if not expected_route:
        return None
    actual = _normalize_route(actual_route)
    if expected_route == _OUT_OF_SCOPE_EXPECTED:
        has_clarification = bool(response and response.get("clarification"))
        return actual in _REJECTION_ROUTES or has_clarification
    return actual == _normalize_route(expected_route)


def _percent(correct: int, total: int) -> str:
    return f"{(correct / total * 100):.1f}%" if total else "n/a"


def _percent_value(correct: int, total: int) -> float | None:
    return round(correct / total * 100, 1) if total else None


def _percentile(values: list[float], pct: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    if len(ordered) == 1:
        return ordered[0]
    pos = (len(ordered) - 1) * pct
    lower = int(pos)
    upper = min(lower + 1, len(ordered) - 1)
    weight = pos - lower
    return ordered[lower] * (1 - weight) + ordered[upper] * weight


def _http_post_json(url: str, payload: dict[str, Any], timeout: float) -> tuple[int, bytes, dict[str, Any] | None]:
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        body = response.read()
        content_type = response.headers.get("Content-Type", "")
        parsed = json.loads(body.decode("utf-8")) if "json" in content_type else None
        return response.status, body, parsed


async def _run_question_direct(q: dict[str, Any]) -> dict[str, Any]:
    from src.chatbot.core import hybrid_router
    from src.chatbot.core.pipeline import detect_language
    from src.chatbot.core.session import load_session

    message = q.get("message") or q.get("question", "")
    language = q.get("language") or detect_language(message)
    session = load_session(session_id=None, user_type=None, language=language)
    start = time.perf_counter()
    try:
        result = await hybrid_router.route(message=message, session=session)
        latency_ms = (time.perf_counter() - start) * 1000
        return _build_route_record(q, result, language, latency_ms, status_code=None, transport="direct")
    except Exception as exc:
        latency_ms = (time.perf_counter() - start) * 1000
        return _build_error_record(q, language, latency_ms, str(exc), transport="direct")


async def _run_question_http(q: dict[str, Any], chat_url: str, timeout: float) -> dict[str, Any]:
    message = q.get("message") or q.get("question", "")
    language = q.get("language") or _detect_language(message)
    start = time.perf_counter()
    try:
        status, _body, result = await asyncio.to_thread(
            _http_post_json,
            chat_url,
            {"message": message, "language": language},
            timeout,
        )
        latency_ms = (time.perf_counter() - start) * 1000
        if result is None:
            return _build_error_record(q, language, latency_ms, "non_json_chat_response", "http", status)
        return _build_route_record(q, result, language, latency_ms, status_code=status, transport="http")
    except Exception as exc:
        latency_ms = (time.perf_counter() - start) * 1000
        return _build_error_record(q, language, latency_ms, str(exc), transport="http", status_code=None)


def _build_route_record(
    q: dict[str, Any],
    result: dict[str, Any],
    language: str,
    latency_ms: float,
    status_code: int | None,
    transport: str,
) -> dict[str, Any]:
    answer = _redact_string(result.get("answer", "") or "")
    expected_route = q.get("expected_intent") or q.get("expected_route")
    actual_route = result.get("intent") or result.get("route") or "UNKNOWN"
    must_contain = q.get("must_contain", []) or []
    missing_must_contain = [term for term in must_contain if term not in answer]
    route_passed = _route_matches(actual_route, expected_route, result)
    record = {
        "id": q.get("id"),
        "theme": q.get("theme") or q.get("topic", ""),
        "language": language,
        "question": q.get("message") or q.get("question", ""),
        "expected_route": expected_route,
        "expected_handler_bucket": _expected_bucket(expected_route),
        "actual_route": _normalize_route(actual_route),
        "route_passed": route_passed,
        "answer_full": answer,
        "answer_preview": _preview(answer),
        "must_contain": must_contain,
        "missing_must_contain": missing_must_contain,
        "must_contain_passed": not missing_must_contain,
        "needs_database_verification": q.get("needs_database_verification"),
        "safe_for_demo": q.get("safe_for_demo"),
        "error": _redact(result.get("error")),
        "sql": _redact(result.get("sql")),
        "row_count": result.get("row_count"),
        "chart_type": result.get("chart_type"),
        "from_cache": result.get("from_cache"),
        "latency_ms": round(latency_ms, 1),
        "http_status": status_code,
        "transport": transport,
        "topic": q.get("topic") or q.get("theme", ""),
        "expected_intent": expected_route,
        "intent": _normalize_route(actual_route),
        "answer": _preview(answer),
        "must_contain_ok": not missing_must_contain,
    }
    return record


def _build_error_record(
    q: dict[str, Any],
    language: str,
    latency_ms: float,
    error: str,
    transport: str,
    status_code: int | None = None,
) -> dict[str, Any]:
    expected_route = q.get("expected_intent") or q.get("expected_route")
    return {
        "id": q.get("id"),
        "theme": q.get("theme") or q.get("topic", ""),
        "language": language,
        "question": q.get("message") or q.get("question", ""),
        "expected_route": expected_route,
        "expected_handler_bucket": _expected_bucket(expected_route),
        "actual_route": "ERROR",
        "route_passed": False if expected_route else None,
        "answer_full": "",
        "answer_preview": "",
        "must_contain": q.get("must_contain", []) or [],
        "missing_must_contain": q.get("must_contain", []) or [],
        "must_contain_passed": False if q.get("must_contain") else True,
        "needs_database_verification": q.get("needs_database_verification"),
        "safe_for_demo": q.get("safe_for_demo"),
        "error": _redact_string(error),
        "sql": None,
        "row_count": None,
        "chart_type": None,
        "from_cache": None,
        "latency_ms": round(latency_ms, 1),
        "http_status": status_code,
        "transport": transport,
        "topic": q.get("topic") or q.get("theme", ""),
        "expected_intent": expected_route,
        "intent": "ERROR",
        "answer": "",
        "must_contain_ok": False if q.get("must_contain") else True,
    }


async def run_eval(
    questions_path: Path,
    limit: int | None,
    mode: str,
    chat_url: str,
    timeout: float,
) -> list[dict[str, Any]]:
    with questions_path.open(encoding="utf-8") as fh:
        questions: list[dict[str, Any]] = json.load(fh)
    if limit:
        questions = questions[:limit]

    results: list[dict[str, Any]] = []
    for q in questions:
        if mode == "http":
            record = await _run_question_http(q, chat_url, timeout)
        else:
            record = await _run_question_direct(q)
        results.append(record)
    return results


async def run_pdf_smoke_tests(report_url: str, timeout: float) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    for item in _PDF_SMOKE_TESTS:
        payload = {key: value for key, value in item.items() if key != "id"}
        start = time.perf_counter()
        try:
            status, body, _parsed = await asyncio.to_thread(_http_post_json, report_url, payload, timeout)
            latency_s = time.perf_counter() - start
            results.append(
                {
                    **item,
                    "http_status": status,
                    "response_size_kb": round(len(body) / 1024, 1),
                    "latency_s": round(latency_s, 2),
                    "passed": status == 200 and len(body) > 0 and body[:4] == b"%PDF",
                    "error": None,
                }
            )
        except urllib.error.HTTPError as exc:
            body = exc.read()
            latency_s = time.perf_counter() - start
            results.append(
                {
                    **item,
                    "http_status": exc.code,
                    "response_size_kb": round(len(body) / 1024, 1),
                    "latency_s": round(latency_s, 2),
                    "passed": False,
                    "error": _redact_string(body.decode("utf-8", errors="replace")[:500]),
                }
            )
        except Exception as exc:
            latency_s = time.perf_counter() - start
            results.append(
                {
                    **item,
                    "http_status": None,
                    "response_size_kb": 0,
                    "latency_s": round(latency_s, 2),
                    "passed": False,
                    "error": _redact_string(str(exc)),
                }
            )
    return results


def _scoreable(results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [record for record in results if record.get("expected_route")]


def _counts_by(rows: list[dict[str, Any]], key: str) -> dict[str, dict[str, int]]:
    counts: dict[str, dict[str, int]] = {}
    for record in rows:
        bucket = str(record.get(key) or "UNKNOWN")
        counts.setdefault(bucket, {"total": 0, "correct": 0})
        counts[bucket]["total"] += 1
        if record.get("route_passed"):
            counts[bucket]["correct"] += 1
    return counts


def _consistency_stats(results: list[dict[str, Any]]) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    triplet_re = re.compile(r"^consistency_triplets_(\d+)_(ar|en|fr)$")
    groups: dict[str, list[dict[str, Any]]] = {}
    for record in results:
        match = triplet_re.match(str(record.get("id") or ""))
        if match:
            groups.setdefault(match.group(1), []).append(record)

    details: list[dict[str, Any]] = []
    fully_consistent = 0
    for group_id, records in sorted(groups.items()):
        routes = {_normalize_route(record.get("actual_route")) for record in records}
        languages = {record.get("language") for record in records}
        complete = len(records) == 3 and set(_LANGUAGES) == languages
        consistent = complete and len(routes) == 1
        fully_consistent += 1 if consistent else 0
        details.append(
            {
                "triplet": group_id,
                "complete": complete,
                "consistent": consistent,
                "routes": {record["language"]: record.get("actual_route") for record in records},
            }
        )
    stats = {
        "triplets_tested": len(details),
        "fully_consistent": fully_consistent,
        "consistency_percent": _percent_value(fully_consistent, len(details)),
    }
    return stats, details


def build_summary(results: list[dict[str, Any]], pdf_results: list[dict[str, Any]]) -> dict[str, Any]:
    route_rows = _scoreable(results)
    correct_route = sum(1 for record in route_rows if record.get("route_passed"))
    by_handler = _counts_by(route_rows, "expected_handler_bucket")
    by_language = _counts_by(route_rows, "language")
    consistency, consistency_details = _consistency_stats(results)

    matrix: dict[str, dict[str, dict[str, int]]] = {}
    for record in route_rows:
        handler = record.get("expected_handler_bucket") or "UNKNOWN"
        language = record.get("language") or "unknown"
        matrix.setdefault(handler, {})
        matrix[handler].setdefault(language, {"total": 0, "correct": 0})
        matrix[handler][language]["total"] += 1
        if record.get("route_passed"):
            matrix[handler][language]["correct"] += 1

    latency: dict[str, dict[str, float | int]] = {}
    for handler in sorted(by_handler):
        values = [
            float(record["latency_ms"])
            for record in route_rows
            if record.get("expected_handler_bucket") == handler and record.get("latency_ms") is not None
        ]
        latency[handler] = {
            "count": len(values),
            "mean_ms": round(sum(values) / len(values), 1) if values else 0,
            "p50_ms": round(_percentile(values, 0.50), 1),
            "p95_ms": round(_percentile(values, 0.95), 1),
        }

    out_of_scope = [record for record in route_rows if record.get("expected_route") == _OUT_OF_SCOPE_EXPECTED]
    out_correct = sum(1 for record in out_of_scope if record.get("route_passed"))

    return {
        "total_route_checks": len(route_rows),
        "correct_route": correct_route,
        "overall_accuracy_percent": _percent_value(correct_route, len(route_rows)),
        "per_handler": by_handler,
        "per_language": by_language,
        "handler_language_matrix": matrix,
        "cross_language_consistency": consistency,
        "cross_language_consistency_details": consistency_details,
        "latency_per_handler": latency,
        "out_of_scope": {
            "total": len(out_of_scope),
            "rejected_or_clarified": out_correct,
            "rejection_percent": _percent_value(out_correct, len(out_of_scope)),
        },
        "pdf_smoke": {
            "total": len(pdf_results),
            "passed": sum(1 for item in pdf_results if item.get("passed")),
        },
    }


def build_markdown(
    questions_path: Path,
    mode: str,
    chat_url: str,
    report_url: str | None,
    results: list[dict[str, Any]],
    pdf_results: list[dict[str, Any]],
    summary: dict[str, Any],
    output_json: Path,
) -> str:
    lines: list[str] = [
        "# AMIP Chatbot Evaluation Results",
        "",
        f"- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"- Dataset: `{questions_path}`",
        f"- Chat mode: `{mode}`" + (f" (`{chat_url}`)" if mode == "http" else ""),
        f"- Results JSON: `{output_json}`",
    ]
    if report_url:
        lines.append(f"- PDF report endpoint: `{report_url}`")
    lines.extend(
        [
            "",
            "## Overall Route Accuracy",
            "",
            "| Metric | Value |",
            "|---|---:|",
            f"| Total route checks | {summary['total_route_checks']} |",
            f"| Correct route checks | {summary['correct_route']} |",
            f"| Overall accuracy | {_percent(summary['correct_route'], summary['total_route_checks'])} |",
            "",
            "## Per-Handler Accuracy",
            "",
            "| Handler | Total | Correct | Accuracy |",
            "|---|---:|---:|---:|",
        ]
    )
    for handler, counts in sorted(summary["per_handler"].items()):
        lines.append(
            f"| `{_markdown_escape(handler)}` | {counts['total']} | {counts['correct']} | "
            f"{_percent(counts['correct'], counts['total'])} |"
        )

    lines.extend(["", "## Per-Language Accuracy", "", "| Language | Total | Correct | Accuracy |", "|---|---:|---:|---:|"])
    for language, counts in sorted(summary["per_language"].items()):
        lines.append(
            f"| `{_markdown_escape(language)}` | {counts['total']} | {counts['correct']} | "
            f"{_percent(counts['correct'], counts['total'])} |"
        )

    lines.extend(
        [
            "",
            "## Handler x Language Matrix",
            "",
            "| Handler | AR | EN | FR |",
            "|---|---:|---:|---:|",
        ]
    )
    for handler, lang_counts in sorted(summary["handler_language_matrix"].items()):
        cells = []
        for language in _LANGUAGES:
            counts = lang_counts.get(language, {"total": 0, "correct": 0})
            cells.append(f"{counts['correct']}/{counts['total']} ({_percent(counts['correct'], counts['total'])})")
        lines.append(f"| `{_markdown_escape(handler)}` | {cells[0]} | {cells[1]} | {cells[2]} |")

    consistency = summary["cross_language_consistency"]
    lines.extend(
        [
            "",
            "## Cross-Language Consistency",
            "",
            "| Triplets tested | Fully consistent | Consistency |",
            "|---:|---:|---:|",
            f"| {consistency['triplets_tested']} | {consistency['fully_consistent']} | "
            f"{_percent(consistency['fully_consistent'], consistency['triplets_tested'])} |",
            "",
            "| Triplet | AR route | EN route | FR route | Consistent |",
            "|---|---|---|---|---|",
        ]
    )
    for detail in summary["cross_language_consistency_details"]:
        routes = detail["routes"]
        lines.append(
            f"| {detail['triplet']} | `{routes.get('ar', '')}` | `{routes.get('en', '')}` | "
            f"`{routes.get('fr', '')}` | {'yes' if detail['consistent'] else 'no'} |"
        )

    lines.extend(["", "## Latency By Handler", "", "| Handler | Count | Mean ms | P50 ms | P95 ms |", "|---|---:|---:|---:|---:|"])
    for handler, stats in sorted(summary["latency_per_handler"].items()):
        lines.append(
            f"| `{_markdown_escape(handler)}` | {stats['count']} | {stats['mean_ms']:.1f} | "
            f"{stats['p50_ms']:.1f} | {stats['p95_ms']:.1f} |"
        )

    out = summary["out_of_scope"]
    lines.extend(
        [
            "",
            "## Out-Of-Scope Rejection Rate",
            "",
            "| Total | Rejected or clarified | Rate |",
            "|---:|---:|---:|",
            f"| {out['total']} | {out['rejected_or_clarified']} | "
            f"{_percent(out['rejected_or_clarified'], out['total'])} |",
            "",
            "## PDF Generator Smoke Tests",
            "",
            "| ID | Country | Mineral | Years | Lang | Status | Size KB | Latency s | Passed | Error |",
            "|---|---|---|---|---|---:|---:|---:|---|---|",
        ]
    )
    if pdf_results:
        for item in pdf_results:
            years = f"{item['year_from']}-{item['year_to']}"
            lines.append(
                f"| `{item['id']}` | {_markdown_escape(item['country'])} | {_markdown_escape(item['mineral'])} | "
                f"{years} | `{item['lang']}` | {item.get('http_status') or ''} | "
                f"{item.get('response_size_kb', 0)} | {item.get('latency_s', 0)} | "
                f"{'yes' if item.get('passed') else 'no'} | {_markdown_escape(item.get('error') or '')} |"
            )
    else:
        lines.append("| skipped |  |  |  |  |  |  |  | no | PDF smoke tests were not requested |")

    failures = [
        record
        for record in results
        if record.get("route_passed") is False or bool(record.get("error"))
    ]
    lines.extend(
        [
            "",
            "## Errors And Failed Route Checks",
            "",
            "| ID | Lang | Expected | Actual | Latency ms | Error |",
            "|---|---|---|---|---:|---|",
        ]
    )
    if failures:
        for record in failures:
            lines.append(
                f"| `{_markdown_escape(record.get('id'))}` | `{record.get('language')}` | "
                f"`{_markdown_escape(record.get('expected_handler_bucket'))}` | "
                f"`{_markdown_escape(record.get('actual_route'))}` | {record.get('latency_ms')} | "
                f"{_markdown_escape(record.get('error') or '')} |"
            )
    else:
        lines.append("| None |  |  |  |  |  |")

    return "\n".join(lines).rstrip() + "\n"


def write_results_json(
    output_json: Path,
    questions_path: Path,
    mode: str,
    chat_url: str,
    report_url: str | None,
    results: list[dict[str, Any]],
    pdf_results: list[dict[str, Any]],
    summary: dict[str, Any],
) -> None:
    payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "questions_path": str(questions_path),
        "mode": mode,
        "chat_url": chat_url if mode == "http" else None,
        "report_url": report_url,
        "summary": summary,
        "route_results": results,
        "pdf_smoke_results": pdf_results,
    }
    output_json.parent.mkdir(parents=True, exist_ok=True)
    with output_json.open("w", encoding="utf-8") as fh:
        json.dump(_redact(payload), fh, ensure_ascii=False, indent=2)
        fh.write("\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run AMIP chatbot route and report evaluations.")
    parser.add_argument("--file", type=Path, default=_DEFAULT_QUESTIONS_PATH)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--mode", choices=("direct", "http"), default="direct")
    parser.add_argument("--chat-url", default="http://127.0.0.1:8000/chat")
    parser.add_argument("--report-url", default="http://127.0.0.1:8001/report")
    parser.add_argument("--timeout", type=float, default=60.0)
    parser.add_argument("--run-pdf-smoke", action="store_true")
    parser.add_argument("--output-json", type=Path, default=_DEFAULT_OUTPUT_JSON)
    parser.add_argument("--report-md", type=Path, default=None)
    args = parser.parse_args()

    results = asyncio.run(
        run_eval(
            questions_path=args.file,
            limit=args.limit,
            mode=args.mode,
            chat_url=args.chat_url,
            timeout=args.timeout,
        )
    )
    pdf_results = (
        asyncio.run(run_pdf_smoke_tests(args.report_url, args.timeout))
        if args.run_pdf_smoke
        else []
    )
    summary = build_summary(results, pdf_results)
    write_results_json(
        output_json=args.output_json,
        questions_path=args.file,
        mode=args.mode,
        chat_url=args.chat_url,
        report_url=args.report_url if args.run_pdf_smoke else None,
        results=results,
        pdf_results=pdf_results,
        summary=summary,
    )
    markdown = build_markdown(
        questions_path=args.file,
        mode=args.mode,
        chat_url=args.chat_url,
        report_url=args.report_url if args.run_pdf_smoke else None,
        results=results,
        pdf_results=pdf_results,
        summary=summary,
        output_json=args.output_json,
    )
    print(markdown)
    if args.report_md:
        args.report_md.parent.mkdir(parents=True, exist_ok=True)
        args.report_md.write_text(markdown, encoding="utf-8")


if __name__ == "__main__":
    main()
