Project Overview

This project uses FastAPI as a backend to query BigQuery and serve the results as a secure API for the frontend.
(The frontend is described in the observable frameworks cx-analytics-hub. This frontend queries my api created in the Python fastapi framework on the backend.)

Why a Backend API?

Security: Keeps BigQuery credentials hidden; frontend never touches them.
--> SHOULD have both security on the backend API AND frontend authentication

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

Cloud Run expects the app to listen on port 8080.

Can attach a service account to give the app access to BigQuery.

No need to include local venv — everything the app needs is inside the container.




Data Access Design Summary

1. API Responsibilities

The API should serve clean, structured data without being overly specialized.

It’s best to provide flexible query endpoints rather than many narrow routes.

2. Frontend Filtering

Handle most filtering (such as toggling between pilot and non-pilot schools) on the frontend after fetching data.

This keeps the UI responsive and reduces redundant API calls.

3. Efficient Fetching

Fetch all relevant data at build time or page load if the dataset is not too large.

Use caching or incremental updates if data changes frequently.

4. Optional Filtering Endpoints

If the dataset grows large, I might later add optional query parameters (e.g., /api/logins?schoolId=123&is_pilot=true) to filter results server-side.
(RATHER than my current approach of only filtering the results on the frontend)

This gives flexibility without complicating the current design.

5. Ordering

Ordering by locationId and created_month in your SQL query is mainly for readability and predictable output when calling the server-side API, not performance.

BigQuery optimizes internally, so ordering doesn’t improve query speed unless you are using clustering or partitioning.