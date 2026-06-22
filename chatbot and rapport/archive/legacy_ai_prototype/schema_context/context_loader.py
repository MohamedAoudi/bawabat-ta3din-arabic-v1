from pathlib import Path

CONTEXT_DIR = Path(__file__).parent


def load_context() -> str:
    """Load schema summary + few-shot examples into a single context string."""
    summary  = (CONTEXT_DIR / "schema_summary.md").read_text(encoding="utf-8")
    examples = (CONTEXT_DIR / "example_queries.md").read_text(encoding="utf-8")
    return f"{summary}\n\n## Example queries\n{examples}"
