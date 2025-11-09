Project Overview

This project uses FastAPI as a backend to query BigQuery and serve the results as a secure API for the frontend.
(The frontend is described in the observable frameworks cx-analytics-hub. This frontend queries my api created in the Python fastapi framework on the backend.)

Why a Backend API?

Security: Keeps BigQuery credentials hidden; frontend never touches them.

Abstraction: Returns only the data your frontend needs.

Performance: Can cache or pre-process results before sending to the frontend.

Validation & Versioning: Ensures inputs are safe and API can evolve without breaking the frontend.

Setup Summary

Python dependencies: fastapi, uvicorn, google-cloud-bigquery, pandas (in requirements.txt).

Docker container built from project root:

gcloud builds submit --tag gcr.io/klett-cx-analytics/fastapi-app


Deployed to Cloud Run:

gcloud run deploy fastapi-app \
  --image gcr.io/klett-cx-analytics/fastapi-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated


App listens on port 8080. Frontend queries your FastAPI endpoints instead of BigQuery directly.

# FastAPI + BigQuery App Deployment to Cloud Run

## 1 Set up your Python environment
Make sure you have all Python dependencies listed in `requirements.txt`:

fastapi
uvicorn
google-cloud-bigquery
pandas



---

## 2 Build your container

From the project root (where your Dockerfile lives), which is just the customer-dashboard root:

# STEP ONE Build and push docker image:

docker buildx build --platform linux/amd64 -t gcr.io/klett-cx-analytics/customer-dashboard --push .


# OPTIONAL ALTERNATE METHOD, IGNORE THIS IF YOU DID STEP 1 and 2 above
# OR do this. However you don't have to do this if you already did
# the docker Build and push above!!
# SKIP THIS gcloud builds submit --tag gcr.io/klett-cx-analytics/fastapi-app





# STEP 2 Deploy to Cloud Run

gcloud run deploy customer-dashboard \
  --image gcr.io/klett-cx-analytics/customer-dashboard \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080


  Cloud Run will return a URL — your app is live there.

Cloud Run automatically scales your app and handles HTTPS.


# 4️ Local development (optional)

You can run the app locally using Docker to test before deployment:

# Build the container locally
docker build -t fastapi-app .

# Run the container
docker run -p 8080:8080 fastapi-app


Visit http://localhost:8080 to access your API.

# Notes 

Cloud Run expects your app to listen on port 8080.

You can attach a service account to give your app access to BigQuery.

No need to include local venv — everything your app needs is inside the container.


