# Project Structure - AMIP

Last updated: 2026-06-01

AMIP is organized around the existing warehouse, ETL, chatbot, reports, knowledge, and tests folders. The runtime code is not under the legacy `07_ai_layer` tree anymore; that folder remains archived/legacy support only.

```text
arab-minerals-dw/
├── warehouse/
│   ├── ddl/                 Warehouse V2 schema, dimensions, facts, aggregates, indexes
│   ├── views/               Reporting/chatbot SQL views
│   └── warehouse_build_report.md
├── pipelines/
│   ├── config.py            Raw file paths, database settings, aliases
│   ├── pipeline.py          AMIP Warehouse V2 build runner
│   ├── loaders/             Dimension, production, trade, bilateral, price no-op, aggregates
│   └── cleaning/            Source cleaning helpers
├── data/
│   ├── raw/                 Source workbooks expected by pipelines/config.py
│   └── processed/           Generated lookup/translation artifacts
├── src/
│   ├── chatbot/
│   │   ├── api/app.py       FastAPI chatbot API
│   │   ├── core/            Routing, SQL, chart, cache, sessions, events
│   │   ├── guardrails/      SQL validator
│   │   ├── list_bot/        LIST/FAQ handler
│   │   ├── rag/             LightRAG client
│   │   └── router/          Intent and user/context detectors
│   └── reports/
│       ├── api.py           FastAPI report API
│       ├── data.py          Warehouse-backed report payloads
│       └── pdf/             ReportLab PDF builder and components
├── knowledge/
│   ├── static/              LIST/FAQ YAML
│   ├── documents/           AMIP knowledge and ontology documents for RAG
│   ├── prompts/             SQL and assistant prompt assets
│   └── ingestion/           LightRAG ingestion script
├── tests/
│   ├── chatbot/             Chatbot unit/eval tests and Arabic QA fixture
│   ├── warehouse/           Warehouse V2 schema smoke tests
│   └── test_insights.py     Report insight tests
├── docs/
│   ├── architecture/
│   ├── demo/
│   └── setup/
├── docker-compose.redis.yml Dedicated local Redis for AMIP
├── requirements.txt         Root install requirements
├── .env.example             Placeholder-only env template
└── README.md
```

External service folder used during demos:

```text
../lightrag-server-amip/
├── docker-compose.yml
└── data/rag_storage/
```

## Runtime Entry Points

```bash
gunicorn -c gunicorn.conf.py src.chatbot.api.app:app
gunicorn -c gunicorn.conf.py src.reports.api:app
python -m pipelines.pipeline
python knowledge/ingestion/index_documents.py --source all
```

Production note: `--reload` must never be used in production.

## Test Entry Points

```bash
python -m pytest --collect-only -q
python -m pytest tests/chatbot tests/test_insights.py -q
python -m pytest tests/warehouse/test_schema.py -q
```

The warehouse schema tests require PostgreSQL. Arabic QA evaluation requires PostgreSQL and OpenAI; RAG-routed answers also require LightRAG.
