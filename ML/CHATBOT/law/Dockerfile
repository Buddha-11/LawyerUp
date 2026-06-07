# Use Python slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy everything before installing requirements
COPY . .

# Install dependencies
RUN pip install --upgrade pip \
 && pip install -r requirements.txt

# Pre-download Hugging Face models so Cloud Run doesn't time out on cold starts
RUN python -c "from src.helper import download_hugging_face_embeddings; download_hugging_face_embeddings()"

# Expose port
EXPOSE 8080

# Start the app
CMD ["python", "app.py"]
