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

# Expose port (Cloud Run will set PORT environment variable)
EXPOSE 8080

# Command to run the FastAPI app with Uvicorn, using the PORT env variable
# FastAPI app entrypoint: app.server.main:app
# $PORT is automatically provided by Cloud Run
CMD ["sh", "-c", "uvicorn app.server.server:app --host 0.0.0.0 --port ${PORT:-8080}"]

# To build:
    # docker build -t customer-dashboard .

# To run locally:  
#docker run -p 8080:8080 customer-dashboard