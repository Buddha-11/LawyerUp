# Use an official Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt


# Expose port
EXPOSE 8080

# Start the app
CMD ["python", "app.py"]
