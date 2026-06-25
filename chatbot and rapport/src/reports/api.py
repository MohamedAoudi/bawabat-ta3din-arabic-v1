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
import logging
import os
import re
import time
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[2]

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field

from pipelines.db import close_read_pool, get_pooled_cursor
from src.reports.amip_report_generator import generate_report
from src.reports.data import NoReportDataError

logger = logging.getLogger("amip.report")

# ─── CONFIG ───────────────────────────────────────────────────────────────────
OUTPUTS_DIR  = str(_ROOT / "artifacts" / "reports")
CACHE_TTL_S  = 24 * 3600          # 24-hour cache window
# Reports only accept this inclusive year range (mirrors ReportParams below);
# availability bounds are clamped to it so the UI never offers a rejected year.
YEAR_MIN     = 2010
YEAR_MAX     = 2024
os.makedirs(OUTPUTS_DIR, exist_ok=True)


def _warm_up() -> None:
    """Pay one-time costs at boot so the first user request isn't ~1.6 s slow.

    Cold start is dominated by (a) the first DB connection and (b) Arabic font
    registration + reportlab's first build. Each step is best-effort: a cold DB
    must never crash startup.
    """
    try:
        with get_pooled_cursor() as cur:        # prime the connection pool
            cur.execute("SELECT 1")
            cur.fetchone()
    except Exception as exc:
        logger.warning("DB warm-up skipped (pool not primed): %s", exc)
    try:
        from src.reports.reports.pdf.theme import _register_arabic_font
        _register_arabic_font()                 # register the Arabic TTF once
    except Exception as exc:
        logger.warning("font warm-up skipped: %s", exc)
    try:
        from io import BytesIO
        from reportlab.lib.units import mm
        from reportlab.platypus import SimpleDocTemplate, Spacer
        SimpleDocTemplate(BytesIO()).build([Spacer(1, 1 * mm)])  # warm reportlab
    except Exception as exc:
        logger.warning("PDF warm-up skipped: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    _warm_up()
    yield
    close_read_pool()


app = FastAPI(
    title="AMIP Report API",
    description="Generate multilingual mineral industry PDF reports from amip_db.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── SCHEMAS ──────────────────────────────────────────────────────────────────
class ReportParams(BaseModel):
    country:   str = Field(..., example="Morocco")
    mineral:   str = Field(..., example="Phosphate")
    year_from: int = Field(..., ge=YEAR_MIN, le=YEAR_MAX, example=2019)
    year_to:   int = Field(..., ge=YEAR_MIN, le=YEAR_MAX, example=2023)
    lang:      str = Field("en", pattern="^(en|fr|ar)$", example="en")


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
    except NoReportDataError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {exc}") from exc

    return _stream_pdf(out, os.path.basename(out))


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

    with get_pooled_cursor() as cur:
        cur.execute(
            """
            SELECT name_en, name_fr, name_ar
            FROM   public.countries
            ORDER  BY display_order NULLS LAST, name_en
            """
        )
        countries = [
            (row[lang_idx] or row[0])
            for row in cur.fetchall()
            if (row[lang_idx] or row[0])
        ]

        cur.execute(
            """
            SELECT DISTINCT mineral_name_en, mineral_name_fr, mineral_name_ar
            FROM (
                SELECT mineral_name_en, mineral_name_fr, mineral_name_ar
                FROM public.mineral_production
                UNION
                SELECT mineral_name_en, mineral_name_fr, mineral_name_ar
                FROM public.mineral_trade
            ) minerals
            -- 'All Minerals' is a bilateral-trade sentinel (no per-mineral split);
            -- exclude it so it never appears in the frontend mineral dropdown.
            WHERE mineral_name_en <> 'All Minerals'
            ORDER BY mineral_name_en
            """
        )
        minerals = [
            (row[lang_idx] or row[0])
            for row in cur.fetchall()
            if (row[lang_idx] or row[0])
        ]

    return {"countries": countries, "minerals": minerals}


@app.get("/availability", summary="Country→mineral→year combinations that yield a non-empty report")
def get_availability() -> dict:
    """
    Return only the (country, mineral) pairs that actually have production or
    trade data, each with the inclusive year span that has data. The frontend
    uses this to offer only parameter choices that produce a non-empty report
    (a pair absent here would 404 at /report).

    Keys are official English names so they match /report's `country` and
    `mineral` parameters byte-for-byte. Year spans are clamped to the report's
    accepted range so the UI never offers a year the endpoint would reject.
    """
    with get_pooled_cursor() as cur:
        cur.execute(
            """
            WITH combined AS (
                SELECT c.name_en AS country,
                       mp.mineral_name_en AS mineral,
                       ap.year
                FROM public.arab_production ap
                JOIN public.countries c ON c.id = ap.country_id
                JOIN public.mineral_production mp ON mp.id = ap.mineral_production_id
                WHERE COALESCE(ap.production_value_base, ap.production_value) IS NOT NULL
                UNION ALL
                SELECT c.name_en,
                       mt.mineral_name_en,
                       tw.year
                FROM public.trade_world tw
                JOIN public.countries c ON c.id = tw.reporter_country_id
                JOIN public.mineral_trade mt ON mt.id = tw.mineral_trade_id
                WHERE mt.mineral_name_en <> 'All Minerals'
                  AND tw.value_usd IS NOT NULL
            )
            SELECT country, mineral, MIN(year)::int AS y_min, MAX(year)::int AS y_max
            FROM   combined
            WHERE  country IS NOT NULL AND mineral IS NOT NULL
            GROUP  BY country, mineral
            ORDER  BY country, mineral
            """
        )
        pairs: dict[str, dict[str, list[int]]] = {}
        global_min: int | None = None
        global_max: int | None = None
        for country, mineral, y_min, y_max in cur.fetchall():
            y_min = max(YEAR_MIN, int(y_min))
            y_max = min(YEAR_MAX, int(y_max))
            if y_min > y_max:
                continue  # all data falls outside the report's accepted range
            pairs.setdefault(country, {})[mineral] = [y_min, y_max]
            global_min = y_min if global_min is None else min(global_min, y_min)
            global_max = y_max if global_max is None else max(global_max, y_max)

    return {
        "pairs": pairs,
        "year_min": global_min if global_min is not None else YEAR_MIN,
        "year_max": global_max if global_max is not None else YEAR_MAX,
    }
