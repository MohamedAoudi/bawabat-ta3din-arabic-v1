"""
AI Agent entry point.
Placeholder — swap the LLM client once you decide on the AI layer.
Supports: Anthropic Claude, OpenAI GPT, LightRAG (graph-RAG).
"""
from pathlib import Path
from ai.schema_context.context_loader import load_context
from ai.tools import query_database, generate_chart
from ai.sql_generator import generate_sql


CONTEXT = load_context()


def chat(user_message: str, history: list[dict] = None) -> dict:
    """
    Main chatbot entrypoint.
    Returns: { "answer": str, "sql": str | None, "chart_path": str | None }
    """
    history = history or []

    # 1. Generate SQL from natural language
    sql = generate_sql(user_message, context=CONTEXT, history=history)

    # 2. Execute SQL
    result = query_database(sql) if sql else None

    # 3. Generate chart if result has numeric data
    chart_path = None
    if result and result.get("rows"):
        chart_path = generate_chart(result, question=user_message)

    # 4. Build answer
    # TODO: replace with your chosen LLM call
    answer = _placeholder_answer(user_message, sql, result)

    return {
        "answer":     answer,
        "sql":        sql,
        "data":       result,
        "chart_path": chart_path,
    }


def _placeholder_answer(question: str, sql: str, result) -> str:
    """
    Placeholder — replace with actual LLM call.
    Example for Anthropic:
        import anthropic
        client = anthropic.Anthropic()
        msg = client.messages.create(model="claude-opus-4-5", ...)
    Example for OpenAI:
        import openai
        client = openai.OpenAI()
        msg = client.chat.completions.create(model="gpt-4o", ...)
    """
    if result and result.get("rows"):
        return f"Query returned {len(result['rows'])} rows. [LLM answer goes here]"
    return "No results found for your question. [LLM answer goes here]"


if __name__ == "__main__":
    print("Arab Minerals Chatbot (prototype)")
    print("Type 'exit' to quit.\n")
    history = []
    while True:
        q = input("You: ").strip()
        if q.lower() in ("exit", "quit"):
            break
        response = chat(q, history)
        print(f"\nAnswer: {response['answer']}")
        if response["sql"]:
            print(f"SQL:    {response['sql']}")
        if response["chart_path"]:
            print(f"Chart:  {response['chart_path']}")
        print()
        history.append({"role": "user",      "content": q})
        history.append({"role": "assistant", "content": response["answer"]})
