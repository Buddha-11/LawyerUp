#!/bin/bash
# ============================================================================
# deploy_proactive_agent.sh
# One-shot script to build & deploy the Proactive Case Monitoring Agent
# to Google Cloud Run.
#
# PREREQUISITES:
#   1. Google Cloud SDK installed and authenticated: gcloud auth login
#   2. Docker installed (used for local build)
#   3. Cloud Run API enabled: gcloud services enable run.googleapis.com
#   4. Artifact Registry API enabled:
#      gcloud services enable artifactregistry.googleapis.com
#   5. Secret Manager API enabled (for service account key):
#      gcloud services enable secretmanager.googleapis.com
#
# USAGE:
#   chmod +x deploy_proactive_agent.sh
#   ./deploy_proactive_agent.sh
# ============================================================================

set -e  # Exit immediately on error

# ── Configuration ─────────────────────────────────────────────────────────────
PROJECT_ID="tutorial-5151c"          # <-- Your GCP project ID
REGION="asia-south1"               # Mumbai (closest to India)
SERVICE_NAME="proactive-agent"
REPO_NAME="lawyerup-repo"          # Artifact Registry repo name
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}"
IMAGE_TAG="latest"
FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"

# Cloud Run resource config
# - 4 vCPU, 8Gi RAM to handle torch + two large ML models
# - Min instances = 0 (scale to zero when idle, saves cost)
# - Max instances = 3 (prevents runaway billing)
# - 300s request timeout (analysis pipeline can be slow)
MEMORY="8Gi"
CPU="4"
MIN_INSTANCES="0"
MAX_INSTANCES="3"
REQUEST_TIMEOUT="300"
CONCURRENCY="5"           # Low concurrency per instance (ML is CPU-bound)

echo "============================================================"
echo "  LawyerUp - Proactive Agent Deployment to Cloud Run"
echo "============================================================"
echo "  Project   : ${PROJECT_ID}"
echo "  Region    : ${REGION}"
echo "  Image     : ${FULL_IMAGE}"
echo "  Memory    : ${MEMORY} | CPU: ${CPU}"
echo "============================================================"
echo ""

# ── Step 1: Set active project ────────────────────────────────────────────────
echo "[1/7] Setting GCP project to: ${PROJECT_ID}"
gcloud config set project "${PROJECT_ID}"

# ── Step 2: Create Artifact Registry repository (idempotent) ──────────────────
echo "[2/7] Ensuring Artifact Registry repository exists..."
gcloud artifacts repositories describe "${REPO_NAME}" \
    --location="${REGION}" 2>/dev/null \
|| gcloud artifacts repositories create "${REPO_NAME}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="LawyerUp Docker Images"

# ── Step 3: Authenticate Docker to push to Artifact Registry ─────────────────
echo "[3/7] Configuring Docker authentication..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# ── Step 4: Build the Docker image ────────────────────────────────────────────
echo "[4/7] Building Docker image (this may take 20-30 minutes on first run)..."
echo "      Reason: Downloading and baking ~1.7GB of ML models into the image."
docker build \
    --platform linux/amd64 \
    --tag "${FULL_IMAGE}" \
    --file Dockerfile \
    .

echo "      ✅ Docker build complete"

# ── Step 5: Push to Artifact Registry ────────────────────────────────────────
echo "[5/7] Pushing image to Artifact Registry..."
docker push "${FULL_IMAGE}"
echo "      ✅ Image pushed: ${FULL_IMAGE}"

# ── Step 6: Store Firebase service account key in Secret Manager ──────────────
echo "[6/7] Storing Firebase credentials in Secret Manager..."

SECRET_NAME="proactive-agent-firebase-key"

# Create the secret if it doesn't exist
gcloud secrets describe "${SECRET_NAME}" 2>/dev/null \
|| gcloud secrets create "${SECRET_NAME}" \
    --replication-policy="automatic"

# Add latest version from local file
gcloud secrets versions add "${SECRET_NAME}" \
    --data-file="serviceAccountKey.json" 2>/dev/null \
|| echo "      (secret version already exists or key not updated)"

echo "      ✅ Firebase key stored in Secret Manager: ${SECRET_NAME}"

# ── Step 7: Deploy to Cloud Run ───────────────────────────────────────────────
echo "[7/7] Deploying to Cloud Run..."

gcloud run deploy "${SERVICE_NAME}" \
    --image="${FULL_IMAGE}" \
    --platform=managed \
    --region="${REGION}" \
    --allow-unauthenticated \
    --memory="${MEMORY}" \
    --cpu="${CPU}" \
    --min-instances="${MIN_INSTANCES}" \
    --max-instances="${MAX_INSTANCES}" \
    --timeout="${REQUEST_TIMEOUT}" \
    --concurrency="${CONCURRENCY}" \
    --set-secrets="/secrets/serviceAccountKey.json=${SECRET_NAME}:latest" \
    --set-env-vars="\
FLASK_ENV=production,\
TRANSFORMERS_OFFLINE=1,\
HF_DATASETS_OFFLINE=1,\
E5_MODEL_PATH=/app/models/e5-large-v2,\
INLEGAL_BERT_PATH=/app/models/InLegalBERT,\
FIREBASE_CREDENTIALS_PATH=/secrets/serviceAccountKey.json,\
GEMINI_API_KEY=${GEMINI_API_KEY},\
GOOGLE_SEARCH_API_KEY=${GOOGLE_SEARCH_API_KEY},\
GOOGLE_CSE_ID=${GOOGLE_CSE_ID},\
PINECONE_API_KEY=${PINECONE_API_KEY},\
PINECONE_INDEX_NAME=${PINECONE_INDEX_NAME},\
PINECONE_INDEX_HOST=${PINECONE_INDEX_HOST},\
PINECONE_DIM=${PINECONE_DIM},\
PINECONE_METRIC=${PINECONE_METRIC},\
PINECONE_REGION=${PINECONE_REGION}"

echo ""
echo "============================================================"
echo "  ✅ DEPLOYMENT COMPLETE"
echo "============================================================"

# Get the deployed URL
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
    --region="${REGION}" \
    --format="value(status.url)")

echo "  Service URL : ${SERVICE_URL}"
echo "  Health check: ${SERVICE_URL}/health"
echo ""
echo "  Test it:"
echo "    curl ${SERVICE_URL}/health"
echo "============================================================"
