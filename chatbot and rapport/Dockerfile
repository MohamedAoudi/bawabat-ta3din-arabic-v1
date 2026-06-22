# ── Stage 1: build wheels ─────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

# Build deps for psycopg2 (libpq) and any C extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY requirements-prod.txt .
RUN pip wheel --no-cache-dir --wheel-dir /build/wheels -r requirements-prod.txt

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM python:3.12-slim

# Runtime needs only the libpq shared library, not gcc/headers
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /build/wheels /tmp/wheels
COPY requirements-prod.txt .
RUN pip install --no-cache-dir --no-index --find-links=/tmp/wheels -r requirements-prod.txt \
    && rm -rf /tmp/wheels

# Application source only — secrets are injected as env at runtime, never baked in
COPY src/ src/
COPY knowledge/ knowledge/
COPY assets/ assets/
COPY gunicorn.conf.py .

# Non-root user for security
RUN useradd -m -u 1000 amip && chown -R amip:amip /app
USER amip

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8000/health || exit 1

CMD ["gunicorn", "-c", "gunicorn.conf.py", "src.chatbot.api.app:app"]
