"""
LightRAG document ingestion script for the AMIP Chatbot.

Pulls content from selected sources and indexes it into the LightRAG server
so that RAG-intent questions can retrieve relevant context:

  documents     — every Markdown file under knowledge/documents/ recursively
  ontology      — ontology sections from knowledge/documents/ontology.md
  knowledge_base— portal FAQ entries from knowledge/static/knowledge_base.yaml
  amip_knowledge— AMIP knowledge base document from knowledge/documents/amip_knowledge.md

Each document is POSTed to LightRAG's /insert endpoint one at a time with a
configurable delay to avoid overwhelming the service. Progress is printed to
stdout. Errors are logged and skipped — the script never aborts mid-run.

Usage:
    python knowledge/ingestion/index_documents.py
    python knowledge/ingestion/index_documents.py --source ontology
    python knowledge/ingestion/index_documents.py --source knowledge_base
    python knowledge/ingestion/index_documents.py --source all --batch-delay 0.5
    python knowledge/ingestion/index_documents.py --dry-run
"""

from __future__ import annotations

import argparse
import asyncio
import re
import time
from pathlib import Path

import httpx
import yaml

# ---------------------------------------------------------------------------
# Paths and configuration
# ---------------------------------------------------------------------------

_ROOT: Path = Path(__file__).resolve().parents[2]
_DOCUMENTS_DIR: Path = _ROOT / "knowledge" / "documents"
_ONTOLOGY_PATH: Path = _ROOT / "knowledge" / "documents" / "ontology.md"
_AMIP_KNOWLEDGE_PATH: Path = _ROOT / "knowledge" / "documents" / "amip_knowledge.md"
_KB_PATH: Path = _ROOT / "knowledge" / "static" / "knowledge_base.yaml"

import sys

if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from src.chatbot.config import (
    LIGHTRAG_BASE_URL,
    LIGHTRAG_TIMEOUT,
)

_INSERT_ENDPOINT: str = f"{LIGHTRAG_BASE_URL}/documents/text"

# ---------------------------------------------------------------------------
# LightRAG insert helper
# ---------------------------------------------------------------------------


async def _insert(client: httpx.AsyncClient, text: str, label: str) -> bool:
    """
    POST one document to LightRAG's /insert endpoint.

    Args:
        client: Shared httpx.AsyncClient for the run.
        text:   Document text to index.
        label:  Human-readable label for logging.

    Returns:
        True on success, False on any error.
    """
    try:
        response = await client.post(
            _INSERT_ENDPOINT,
            json={"text": text},
            timeout=LIGHTRAG_TIMEOUT,
        )
        response.raise_for_status()
        return True
    except httpx.HTTPStatusError as exc:
        print(f"  [SKIP] {label} — HTTP {exc.response.status_code}")
        return False
    except Exception as exc:
        print(f"  [SKIP] {label} — {exc}")
        return False


# ---------------------------------------------------------------------------
# Source: Markdown documents
# ---------------------------------------------------------------------------


async def index_markdown_documents(
    client: httpx.AsyncClient,
    dry_run: bool,
    batch_delay: float,
) -> tuple[int, int]:
    """Index every Markdown file under knowledge/documents recursively."""
    print("\n── Markdown documents (knowledge/documents/**/*.md) ─")
    ok = errors = 0

    if not _DOCUMENTS_DIR.exists():
        print(f"  [SKIP] {_DOCUMENTS_DIR} not found")
        return 0, 0

    paths = sorted(_DOCUMENTS_DIR.rglob("*.md"))
    print(f"  Found {len(paths)} Markdown documents")
    for path in paths:
        label = str(path.relative_to(_ROOT))
        text = path.read_text(encoding="utf-8").strip()
        if not text:
            print(f"  [SKIP] {label} is empty")
            errors += 1
            continue
        if dry_run:
            print(f"  [DRY RUN] Would index: {label} ({len(text)} chars)")
            ok += 1
        else:
            success = await _insert(client, text, label)
            if success:
                ok += 1
            else:
                errors += 1
            if batch_delay > 0:
                await asyncio.sleep(batch_delay)

    return ok, errors


# ---------------------------------------------------------------------------
# Source: AMIP ontology sections
# ---------------------------------------------------------------------------

async def index_ontology(
    client: httpx.AsyncClient,
    dry_run: bool,
    batch_delay: float,
) -> tuple[int, int]:
    """Parse ontology.md and index each AMIP ontology section as a document."""
    print("\n── AMIP ontology (ontology.md) ────────────────────")
    ok = errors = 0

    if not _ONTOLOGY_PATH.exists():
        print(f"  [SKIP] {_ONTOLOGY_PATH} not found")
        return 0, 0

    content = _ONTOLOGY_PATH.read_text(encoding="utf-8")

    # Split on level-2 headings (## Sector Name)
    sections = re.split(r"\n(?=## )", content.strip())
    sections = [s.strip() for s in sections if s.strip() and s.startswith("##")]

    print(f"  Found {len(sections)} ontology sections")
    for section in sections:
        label = section.splitlines()[0].lstrip("# ").strip()
        if dry_run:
            print(f"  [DRY RUN] Would index: {label}")
            ok += 1
        else:
            success = await _insert(client, section, label)
            if success:
                ok += 1
            else:
                errors += 1
            if batch_delay > 0:
                await asyncio.sleep(batch_delay)

    return ok, errors


# ---------------------------------------------------------------------------
# Source: knowledge base entries from knowledge_base.yaml
# ---------------------------------------------------------------------------


def _format_kb_entry(entry: dict) -> str:
    """Format a knowledge base entry as a multilingual document."""
    parts = [f"Topic: {entry.get('id', '')}"]
    answer_block = entry.get("answer", {})
    for lang, text in answer_block.items():
        if text:
            parts.append(f"[{lang.upper()}] {text.strip()}")
    return "\n".join(parts)


async def index_knowledge_base(
    client: httpx.AsyncClient,
    dry_run: bool,
    batch_delay: float,
) -> tuple[int, int]:
    """Index all knowledge base entries from knowledge_base.yaml."""
    print("\n── Knowledge base (knowledge_base.yaml) ───────────")
    ok = errors = 0

    if not _KB_PATH.exists():
        print(f"  [SKIP] {_KB_PATH} not found")
        return 0, 0

    with _KB_PATH.open(encoding="utf-8") as fh:
        data = yaml.safe_load(fh)
    entries = data.get("entries", [])

    print(f"  Found {len(entries)} KB entries")
    for entry in entries:
        label = entry.get("id", "unknown")
        text = _format_kb_entry(entry)
        if dry_run:
            print(f"  [DRY RUN] Would index: {label}")
            ok += 1
        else:
            success = await _insert(client, text, label)
            if success:
                ok += 1
            else:
                errors += 1
            if batch_delay > 0:
                await asyncio.sleep(batch_delay)

    return ok, errors


# ---------------------------------------------------------------------------
# Main runner
# ---------------------------------------------------------------------------


async def index_amip_knowledge(
    client: httpx.AsyncClient,
    dry_run: bool,
    batch_delay: float,
) -> tuple[int, int]:
    """Index the AMIP knowledge base document from amip_knowledge.md."""
    print("\n── AMIP Knowledge Document (amip_knowledge.md) ─────")
    if not _AMIP_KNOWLEDGE_PATH.exists():
        print(f"  [SKIP] {_AMIP_KNOWLEDGE_PATH} not found")
        return 0, 1
    text = _AMIP_KNOWLEDGE_PATH.read_text(encoding="utf-8").strip()
    if not text:
        print("  [SKIP] File is empty")
        return 0, 1
    if dry_run:
        print(f"  [DRY RUN] Would index amip_knowledge.md ({len(text)} chars)")
        return 1, 0
    success = await _insert(client, text, "amip_knowledge.md")
    return (1, 0) if success else (0, 1)


async def run(source: str, dry_run: bool, batch_delay: float) -> None:
    """Run the ingestion pipeline for the selected source(s)."""
    print(f"\nAMIP LightRAG Ingestion")
    print(f"Target  : {_INSERT_ENDPOINT}")
    print(f"Source  : {source}")
    print(f"Dry run : {dry_run}")
    print(f"Delay   : {batch_delay}s between inserts")

    total_ok = total_errors = 0
    start = time.perf_counter()

    async with httpx.AsyncClient() as client:
        if source in ("documents", "all"):
            ok, err = await index_markdown_documents(client, dry_run, batch_delay)
            total_ok += ok
            total_errors += err

        if source == "ontology":
            ok, err = await index_ontology(client, dry_run, batch_delay)
            total_ok += ok
            total_errors += err

        if source == "amip_knowledge":
            ok, err = await index_amip_knowledge(client, dry_run, batch_delay)
            total_ok += ok
            total_errors += err

        if source in ("knowledge_base", "all"):
            ok, err = await index_knowledge_base(client, dry_run, batch_delay)
            total_ok += ok
            total_errors += err

    elapsed = time.perf_counter() - start
    print(f"\n{'─' * 50}")
    print(
        f"Done in {elapsed:.1f}s — {total_ok} indexed, {total_errors} skipped/errored"
    )


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Index AMIP documents into LightRAG for RAG retrieval."
    )
    parser.add_argument(
        "--source",
        choices=["documents", "ontology", "knowledge_base", "amip_knowledge", "all"],
        default="all",
        help="Which document source to index (default: all).",
    )
    parser.add_argument(
        "--batch-delay",
        type=float,
        default=0.2,
        metavar="SECONDS",
        help="Delay in seconds between insert requests (default: 0.2).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be indexed without sending any requests.",
    )
    args = parser.parse_args()
    asyncio.run(
        run(source=args.source, dry_run=args.dry_run, batch_delay=args.batch_delay)
    )


if __name__ == "__main__":
    main()
