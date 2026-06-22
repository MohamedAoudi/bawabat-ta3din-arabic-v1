# AMIP LightRAG Server

This folder contains the Docker Compose setup for the LightRAG service used by the AMIP chatbot.

## Setup

```bash
cd lightrag-server-amip
cp .env.example .env
# Edit .env with your local API keys and model settings.
docker compose up -d
```

The service is exposed on `http://localhost:9622` from the host machine and stores runtime data under `data/rag_storage/`.

## Runtime Data

The `data/` directory is intentionally ignored because it contains generated LightRAG indexes, caches, and local runtime state. On a new computer, start the service and re-ingest the knowledge documents from the main project `knowledge/` folder.
