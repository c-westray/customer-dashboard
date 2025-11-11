# server.py
# Serves data fetched from BigQuery from transform_data.py

import json
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from .transform_data import (
    initialize_client,
    fetch_login_data,
    fetch_logins_user_type_breakdown,
    fetch_logins_summary,
    fetch_license_data,
    fetch_assignment_data,
    default_serializer
)

app = FastAPI()

# Initialize BigQuery client once at startup
initialize_client()

# Helper function to serialize data properly, especially for datetime objects
def serialize_for_jsonresponse(data):
    return json.loads(json.dumps(data, default=default_serializer))


@app.get("/")
def root():
    return {"message": "FastAPI is working."}


@app.get("/api/logins")
def logins():
    data = fetch_login_data()
    return JSONResponse(content=serialize_for_jsonresponse(data))


@app.get("/api/logins/usertypes")
def logins_usertypes():
    data = fetch_logins_user_type_breakdown()
    return JSONResponse(content=serialize_for_jsonresponse(data))


@app.get("/api/logins/summary")
def logins_summary():
    data = fetch_logins_summary()
    return JSONResponse(content=serialize_for_jsonresponse(data))


@app.get("/api/assignments")
def assignments():
    data = fetch_assignment_data()
    return JSONResponse(content=serialize_for_jsonresponse(data))


@app.get("/api/licenses")
def licenses():
    data = fetch_license_data()
    return JSONResponse(content=serialize_for_jsonresponse(data))


'''
Typical workflow:

Make changes to your code (e.g., server.py, transform_data.py).

Rebuild the image for the correct architecture (on M1/M2 Macs):
docker buildx build --platform linux/amd64 -t gcr.io/klett-cx-analytics/customer-dashboard --push .

Make sure the Google Cloud service is running with the correct
service account:
gcloud run services update customer-dashboard \
  --service-account=cx-analytics-pipeline-runner@klett-cx-analytics.iam.gserviceaccount.com \
  --region=us-central1

Deploy the new image to Cloud Run:
gcloud run deploy customer-dashboard \
  --image gcr.io/klett-cx-analytics/customer-dashboard \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080

Optional: Faster local iteration
You can test changes locally using:
docker run -p 8080:8080 gcr.io/klett-cx-analytics/customer-dashboard
'''
