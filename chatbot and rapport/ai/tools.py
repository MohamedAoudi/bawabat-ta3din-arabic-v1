"""
Tool definitions for the AI agent.
Each tool wraps a capability the agent can invoke.
"""
import io
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path
from etl.db import get_connection


OUTPUT_DIR = Path("data/processed/charts")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def query_database(sql: str) -> dict:
    """Execute a read-only SQL query and return rows + column names."""
    conn = get_connection()
    try:
        df = pd.read_sql_query(sql, conn)
        return {
            "columns": list(df.columns),
            "rows":    df.values.tolist(),
            "df":      df,
        }
    except Exception as e:
        return {"error": str(e), "rows": [], "columns": []}
    finally:
        conn.close()


def generate_chart(result: dict, question: str = "") -> str | None:
    """
    Auto-generate a chart from query results.
    Returns path to saved PNG, or None if chart cannot be generated.
    """
    df = result.get("df")
    if df is None or df.empty:
        return None

    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    text_cols    = df.select_dtypes(exclude="number").columns.tolist()

    if not numeric_cols:
        return None

    fig, ax = plt.subplots(figsize=(10, 5))
    fig.patch.set_facecolor("white")

    x_col = text_cols[0] if text_cols else df.index
    y_col = numeric_cols[0]

    # Choose chart type based on data shape
    if len(df) <= 20 and text_cols:
        ax.bar(df[x_col].astype(str), df[y_col], color="#1D9E75")
        ax.set_xlabel(x_col)
    else:
        ax.plot(df[x_col] if text_cols else df.index, df[y_col],
                marker="o", color="#1D9E75", linewidth=2)
        ax.set_xlabel(x_col if text_cols else "Index")

    ax.set_ylabel(y_col)
    ax.set_title(question[:80] if question else y_col, fontsize=11, pad=12)
    ax.spines[["top", "right"]].set_visible(False)
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()

    chart_path = OUTPUT_DIR / f"chart_{hash(question) % 100000}.png"
    fig.savefig(chart_path, dpi=150, bbox_inches="tight")
    plt.close(fig)

    return str(chart_path)
