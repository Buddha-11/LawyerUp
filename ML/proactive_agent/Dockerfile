# ============================================================================
# Stage 1: Model Download Stage
# Downloads and caches all ML models so they are baked into the final image.
# This ensures Cloud Run never pulls models at runtime — cold starts are fast.
# ============================================================================
FROM python:3.11-slim AS model-downloader

WORKDIR /app

# Install only the packages needed to download models
RUN pip install --no-cache-dir \
    sentence-transformers==2.7.0 \
    transformers==4.36.0 \
    torch==2.1.2+cpu \
    --extra-index-url https://download.pytorch.org/whl/cpu

# Download E5-Large-v2 embedding model (~1.3GB, 1024-dim)
# Saved to /app/models/e5-large-v2
RUN python -c "\
from sentence_transformers import SentenceTransformer; \
model = SentenceTransformer('intfloat/e5-large-v2'); \
model.save('/app/models/e5-large-v2'); \
print('✅ e5-large-v2 saved')"

# Download InLegalBERT NER model (~400MB)
# Saved to /app/models/InLegalBERT
RUN python -c "\
from transformers import AutoTokenizer, AutoModelForTokenClassification; \
tokenizer = AutoTokenizer.from_pretrained('law-ai/InLegalBERT'); \
model = AutoModelForTokenClassification.from_pretrained('law-ai/InLegalBERT'); \
tokenizer.save_pretrained('/app/models/InLegalBERT'); \
model.save_pretrained('/app/models/InLegalBERT'); \
print('✅ InLegalBERT saved')"


# ============================================================================
# Stage 2: Final Production Image
# ============================================================================
FROM python:3.11-slim

WORKDIR /app

# System dependencies: libgomp1 is required by PyTorch
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .

# Install CPU-only PyTorch first (avoids pulling CUDA, saves ~1.5GB)
RUN pip install --no-cache-dir \
    torch==2.1.2+cpu \
    --extra-index-url https://download.pytorch.org/whl/cpu

RUN pip install --no-cache-dir -r requirements.txt

# ── Copy pre-downloaded models from Stage 1 ──────────────────────────────────
# These are baked into the image; no network calls needed at runtime.
COPY --from=model-downloader /app/models /app/models

# ── Copy application source code ─────────────────────────────────────────────
COPY . .

# ── Patch service files to load models from local paths ──────────────────────
# google_service.py: load e5-large-v2 from /app/models/e5-large-v2
# extraction_service.py: load InLegalBERT from /app/models/InLegalBERT
ENV E5_MODEL_PATH=/app/models/e5-large-v2
ENV INLEGAL_BERT_PATH=/app/models/InLegalBERT

# ── Runtime environment ───────────────────────────────────────────────────────
# PORT is set by Cloud Run; we default to 8082 for local Docker runs
ENV PORT=8082
ENV FLASK_ENV=production
# Disable HuggingFace Hub network calls (all models are local)
ENV TRANSFORMERS_OFFLINE=1
ENV HF_DATASETS_OFFLINE=1
# Point HF cache to our baked-in models dir
ENV HF_HOME=/app/models
ENV TORCH_HOME=/app/models

# Gunicorn worker tuning for Cloud Run:
# - 1 worker per CPU (Cloud Run gives 1 vCPU by default)
# - 2 threads per worker for concurrent requests
# - 120s timeout (model inference can be slow on first call)
ENV GUNICORN_WORKERS=1
ENV GUNICORN_THREADS=2
ENV GUNICORN_TIMEOUT=120

EXPOSE 8082

# Health check used by Cloud Run readiness probes
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Start with Gunicorn (production WSGI server)
CMD exec gunicorn \
    --bind 0.0.0.0:${PORT} \
    --workers ${GUNICORN_WORKERS} \
    --threads ${GUNICORN_THREADS} \
    --timeout ${GUNICORN_TIMEOUT} \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    app:app
