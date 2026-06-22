"""
AMIP Report API
---------------
POST /report  — Generate (or return cached) a mineral PDF report.
GET  /options — List available countries and minerals from the DB.

Run from the project root:
    uvicorn src.reports.api:app --reload
"""

import glob
import hashlib
import io
import os
import re
import time
import zipfile
from datetime import datetime
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[2]

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field

from pipelines.db import get_cursor
from pipelines.config import DB_SCHEMA
from src.reports.amip_report_generator import generate_report, generate_reports_all_languages

# ─── CONFIG ───────────────────────────────────────────────────────────────────
OUTPUTS_DIR  = str(_ROOT / "artifacts" / "reports")
CACHE_TTL_S  = 24 * 3600          # 24-hour cache window
os.makedirs(OUTPUTS_DIR, exist_ok=True)

app = FastAPI(
    title="AMIP Report API",
    description="Generate multilingual mineral industry PDF reports from amip_db.",
    version="1.0.0",
)

# ─── SCHEMAS ──────────────────────────────────────────────────────────────────
class ReportParams(BaseModel):
    country:   str = Field(..., example="Morocco")
    mineral:   str = Field(..., example="Phosphate")
    year_from: int = Field(..., ge=2010, le=2024, example=2019)
    year_to:   int = Field(..., ge=2010, le=2024, example=2023)
    lang:      str = Field("en", pattern="^(en|fr|ar)$", example="en")


class ReportBatchParams(BaseModel):
    country:   str = Field(..., example="Morocco")
    mineral:   str = Field(..., example="Phosphate")
    year_from: int = Field(..., ge=2010, le=2024, example=2019)
    year_to:   int = Field(..., ge=2010, le=2024, example=2023)


# ─── HELPERS ──────────────────────────────────────────────────────────────────
def _safe_slug(text: str) -> str:
    """Return a filesystem-safe ASCII slug from any string."""
    return re.sub(r"[^A-Za-z0-9_-]", "_", text.strip())


def _find_cached(country: str, mineral: str, year_from: int,
                 year_to: int, lang: str) -> str | None:
    """Return the path of a cached PDF younger than CACHE_TTL_S, or None."""
    pattern = os.path.join(
        OUTPUTS_DIR,
        f"{_safe_slug(country)}_{_safe_slug(mineral)}_{year_from}_{year_to}_{lang}_*.pdf",
    )
    cutoff = time.time() - CACHE_TTL_S
    candidates = sorted(glob.glob(pattern), reverse=True)
    for path in candidates:
        if os.path.getmtime(path) >= cutoff:
            return path
    return None


def _output_path(country: str, mineral: str, year_from: int,
                 year_to: int, lang: str) -> str:
    ts = datetime.now().strftime("%Y%m%dT%H%M%S")
    filename = (
        f"{_safe_slug(country)}_{_safe_slug(mineral)}_"
        f"{year_from}_{year_to}_{lang}_{ts}.pdf"
    )
    return os.path.join(OUTPUTS_DIR, filename)


def _stream_pdf(path: str, filename: str) -> FileResponse:
    return FileResponse(
        path,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _qualified(table_name: str) -> str:
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", table_name):
        raise ValueError(f"Invalid table name: {table_name}")
    schema = DB_SCHEMA or "minerals"
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", schema):
        raise ValueError(f"Invalid DB_SCHEMA: {schema}")
    return f"{schema}.{table_name}"


# ─── ENDPOINTS ────────────────────────────────────────────────────────────────
@app.post("/report", summary="Generate a mineral PDF report")
def post_report(params: ReportParams) -> FileResponse:
    """
    Generate a PDF report for the requested country / mineral / year range.
    Returns a cached file if an identical request was made within the last 24 h.
    """
    if params.year_from > params.year_to:
        raise HTTPException(
            status_code=422,
            detail="year_from must be less than or equal to year_to.",
        )

    cached = _find_cached(
        params.country, params.mineral,
        params.year_from, params.year_to, params.lang,
    )
    if cached:
        return _stream_pdf(cached, os.path.basename(cached))

    out = _output_path(
        params.country, params.mineral,
        params.year_from, params.year_to, params.lang,
    )
    try:
        generate_report(
            out,
            country=params.country,
            mineral=params.mineral,
            year_from=params.year_from,
            year_to=params.year_to,
            lang=params.lang,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {exc}") from exc

    return _stream_pdf(out, os.path.basename(out))


@app.post("/report/all", summary="Generate mineral PDF reports in English, French, and Arabic")
def post_report_all(params: ReportBatchParams) -> StreamingResponse:
    """Generate all three localized PDFs and return them as a ZIP archive."""
    if params.year_from > params.year_to:
        raise HTTPException(
            status_code=422,
            detail="year_from must be less than or equal to year_to.",
        )

    batch_dir = os.path.join(
        OUTPUTS_DIR,
        (
            f"{_safe_slug(params.country)}_{_safe_slug(params.mineral)}_"
            f"{params.year_from}_{params.year_to}_{datetime.now().strftime('%Y%m%dT%H%M%S')}"
        ),
    )
    try:
        paths = generate_reports_all_languages(
            batch_dir,
            country=params.country,
            mineral=params.mineral,
            year_from=params.year_from,
            year_to=params.year_to,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {exc}") from exc

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in paths.values():
            zf.write(path, arcname=os.path.basename(path))
    buf.seek(0)
    filename = (
        f"{_safe_slug(params.country)}_{_safe_slug(params.mineral)}_"
        f"{params.year_from}_{params.year_to}_all_languages.zip"
    )
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/options", summary="List available countries and minerals")
def get_options(lang: str = "en") -> dict:
    """
    Return all distinct countries and minerals stored in the DB.
    The `lang` query parameter (en | fr | ar) controls which name column is returned.
    Falls back to the English name when the requested language column is NULL.
    """
    if lang not in ("en", "fr", "ar"):
        lang = "en"
    lang_idx = {"en": 0, "fr": 1, "ar": 2}[lang]

    with get_cursor(commit=False) as cur:
        cur.execute(
            f"""
            SELECT country_name_en, country_name_fr, country_name_ar
            FROM   {_qualified("dim_countries")}
            ORDER  BY display_order NULLS LAST, country_name_en
            """
        )
        countries = [
            (row[lang_idx] or row[0])
            for row in cur.fetchall()
            if (row[lang_idx] or row[0])
        ]

        cur.execute(
            f"""
            SELECT mineral_name_en, mineral_name_fr, mineral_name_ar
            FROM   {_qualified("dim_minerals")}
            ORDER  BY mineral_name_en
            """
        )
        minerals = [
            (row[lang_idx] or row[0])
            for row in cur.fetchall()
            if (row[lang_idx] or row[0])
        ]

    return {"countries": countries, "minerals": minerals}
