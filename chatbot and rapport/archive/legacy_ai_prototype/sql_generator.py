"""
Natural language → SQL generator.
Uses the schema context + few-shot examples as system prompt.
Swap the LLM call once your AI layer is decided.
"""
from ai.schema_context.context_loader import load_context


def generate_sql(question: str, context: str = None, history: list = None) -> str | None:
    """
    Convert a natural language question to a SQL query.
    Returns SQL string or None if the question is not data-related.
    """
    context = context or load_context()
    history = history or []

    system_prompt = f"""You are a PostgreSQL expert working with an Arab minerals data warehouse.
Your job is to convert natural language questions into correct SQL queries.

{context}

Rules:
- Always use the minerals. schema prefix (e.g. minerals.dim_countries)
- Always use production_value_norm for production aggregations, not production_value
- Always filter export_value_computed = TRUE when summing export_value_usd
- Use flow = 1 for exports, flow = 2 for imports
- Include a year filter whenever possible for partition pruning
- Return ONLY the SQL query, no explanation, no markdown fences
- If the question cannot be answered with SQL from this schema, return: NO_SQL
"""

    # TODO: replace with your chosen LLM call
    # Example — Anthropic:
    #   import anthropic
    #   client = anthropic.Anthropic()
    #   msg = client.messages.create(
    #       model="claude-sonnet-4-20250514",
    #       max_tokens=1000,
    #       system=system_prompt,
    #       messages=[{"role": "user", "content": question}]
    #   )
    #   sql = msg.content[0].text.strip()
    #   return None if sql == "NO_SQL" else sql

    # Placeholder — returns None until LLM is wired up
    print(f"[sql_generator] Received: {question}")
    print("[sql_generator] LLM not wired yet — returning None")
    return None
