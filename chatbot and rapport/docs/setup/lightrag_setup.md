# LightRAG Setup - AMIP

LightRAG provides document retrieval for AMIP RAG questions, especially platform explanations, methodology, data-source context, and mineral/country background that is not answered directly from SQL.

The LightRAG service is self-contained inside this project at:

```text
chatbot and repport/lightrag-server-amip/
```

It carries its own `.env` (model + keys) and `data/` (the indexed knowledge graph),
so nothing runs from outside the project.

## Start LightRAG

```bash
cd "chatbot and repport/lightrag-server-amip"
docker compose up -d
```

The chatbot endpoint is set in `chatbot and repport/.env`:

```bash
LIGHTRAG_BASE_URL=http://localhost:9622
LIGHTRAG_MODE=hybrid
LIGHTRAG_TIMEOUT=30
```

## Index AMIP Documents

Run from `chatbot and repport/`:

```bash
source .venv/bin/activate
python knowledge/ingestion/index_documents.py --source all --batch-delay 0.5
```

The ingestion script indexes:

- `knowledge/documents/amip_knowledge.md`
- `knowledge/documents/ontology.md`
- `knowledge/static/knowledge_base.yaml`

## Retrieval Modes

- `local`: specific entity or concept questions, such as phosphate coverage in Morocco.
- `global`: broader explanatory questions, such as AMIP data sources or methodology.
- `hybrid`: default mode combining local and global retrieval.

## Demo Note

If LightRAG is unavailable, the chatbot should still answer SQL, CHART, and some LIST/FAQ questions, but RAG-routed questions are not demo-safe. The latest Arabic evaluation recorded LightRAG as unavailable on 2026-06-01.
