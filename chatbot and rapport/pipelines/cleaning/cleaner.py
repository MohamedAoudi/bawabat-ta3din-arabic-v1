"""
Main orchestrator for the data cleaning stage.

Usage:
    python -m etl.cleaning.cleaner                  # run all steps
    python -m etl.cleaning.cleaner --step translate
    python -m etl.cleaning.cleaner --step production
    python -m etl.cleaning.cleaner --step trade
    python -m etl.cleaning.cleaner --step bilateral
    python -m etl.cleaning.cleaner --step validate
    python -m etl.cleaning.cleaner --step all
"""

import argparse
import logging
import sys
import time
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from etl.config import CLEANING_LOG, PROCESSED_DIR


# ── Logger setup ──────────────────────────────────────────────────────────────

def _setup_logger() -> logging.Logger:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    logger = logging.getLogger("cleaning")
    logger.setLevel(logging.DEBUG)
    if logger.handlers:
        return logger

    fmt = logging.Formatter("%(asctime)s  %(message)s", datefmt="%Y-%m-%dT%H:%M:%S")

    fh = logging.FileHandler(CLEANING_LOG, encoding="utf-8", mode="a")
    fh.setFormatter(fmt)
    logger.addHandler(fh)

    ch = logging.StreamHandler(sys.stdout)
    ch.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(ch)

    return logger


# ── Step runners ──────────────────────────────────────────────────────────────

def _run_step(name: str, fn, logger: logging.Logger) -> None:
    logger.info(f"\n{'='*50}")
    logger.info(f"STEP: {name.upper()}  started at {datetime.now().strftime('%H:%M:%S')}")
    logger.info("=" * 50)
    t0 = time.perf_counter()
    try:
        fn()
    except Exception as exc:
        logger.error(f"[ERROR] Step '{name}' failed: {exc}", exc_info=True)
        sys.exit(1)
    elapsed = time.perf_counter() - t0
    logger.info(f"STEP: {name.upper()}  done in {elapsed:.1f}s")


def _step_translate(logger):
    from etl.cleaning import transliterate
    _run_step("translate", transliterate.run, logger)


def _step_production(logger):
    from etl.cleaning import clean_production
    _run_step("production", clean_production.run, logger)


def _step_trade(logger):
    from etl.cleaning import clean_trade
    _run_step("trade", clean_trade.run, logger)


def _step_bilateral(logger):
    from etl.cleaning import clean_bilateral
    _run_step("bilateral", clean_bilateral.run, logger)


def _step_validate(logger):
    from etl.cleaning import validate
    _run_step("validate", validate.run, logger)


_STEPS = {
    "translate":  _step_translate,
    "production": _step_production,
    "trade":      _step_trade,
    "bilateral":  _step_bilateral,
    "validate":   _step_validate,
}

_ORDER = ["translate", "production", "trade", "bilateral", "validate"]


# ── Entry point ───────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Arab Minerals DW — data cleaning stage"
    )
    parser.add_argument(
        "--step",
        choices=[*_STEPS.keys(), "all"],
        default="all",
        help="Which cleaning step to run (default: all)",
    )
    args = parser.parse_args()

    logger = _setup_logger()
    logger.info(
        f"\n{'#'*50}\n"
        f"  Cleaning pipeline started  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"  Step: {args.step}\n"
        f"{'#'*50}"
    )

    if args.step == "all":
        for name in _ORDER:
            _STEPS[name](logger)
    else:
        _STEPS[args.step](logger)

    logger.info("\nCleaning pipeline finished successfully.")


if __name__ == "__main__":
    main()
