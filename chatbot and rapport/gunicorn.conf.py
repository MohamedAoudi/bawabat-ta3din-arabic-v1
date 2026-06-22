import os
import sys

# The app is I/O-bound (LLM + DB) and async; a few uvicorn workers go far.
workers = int(os.getenv("GUNICORN_WORKERS", "4"))
worker_class = "uvicorn.workers.UvicornWorker"
bind = os.getenv("GUNICORN_BIND", "0.0.0.0:8000")
timeout = int(os.getenv("GUNICORN_TIMEOUT", "120"))
keepalive = 5
preload_app = os.getenv("GUNICORN_PRELOAD_APP", str(sys.platform != "darwin")).lower() == "true"
worker_tmp_dir = os.getenv("GUNICORN_WORKER_TMP_DIR") or (
    "/dev/shm" if os.path.isdir("/dev/shm") else "/tmp"
)
accesslog = "-"
errorlog = "-"
