# Use Python 3.13 slim base image
FROM python:3.13-slim

# Set working directory inside the container
WORKDIR /app

# Copy dependency file first (for caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your project files
COPY . .

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Command to run the FastAPI app with Uvicorn
CMD ["uvicorn", "app.server.main:app", "--host", "0.0.0.0", "--port", "8080"]
