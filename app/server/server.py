# Serves data fetched from bigquery from transform_data.py

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from google.cloud import bigquery
import pandas as pd
from transform_data import fetch_data 

app = FastAPI()

@app.get("/")
def run_query():
    rows = fetch_data()
    #Convert BigQuery Row objects to dictionaries
    output = [dict(row) for row in rows]
    #JSONREsponse is a class provided by FastAPI, will return object "data" in the api response with the output.
    return JSONResponse(content="data": output)
    ''' #output is a list of dictionaries, e.g.:
    [
        {"name": "Alice", "location": "NY"},
        {"name": "Bob", "location": "CA"}
    ]
    '''


@app.get("api/logins")

def get_logins():
    client = bigquery.Client()
    query = """
    SELECT * FROM `klett-cx-analytics.license_staging_cleaned.step_zero_make_location_id`
    """

df = client.query 


'''Deploying to Cloud Run: 
#Install Gcloud CLI: https://docs.cloud.google.com/sdk/docs/install

# Enable necessary APIs
# These sould already be nabled
gcloud services enable run.googleapis.com bigquery.googleapis.com

# Set your GCP project (only need to do once)
gcloud config set project klett-cx-analytics

# Build container and push to Google Container Registry
gcloud builds submit --tag gcr.io/klett-cx-analytics/transform-data

If this takes a long time:
Once you’ve submitted the build with gcloud builds submit, the actual build happens in Google Cloud, not on your laptop. You can safely close it — the process will continue in the cloud.

You’ll just need to check back later (or run the gcloud builds list or gcloud builds describe [BUILD_ID] commands) to see when it’s done.

# Deploy to Cloud Run
gcloud run deploy transform-data \
  --image gcr.io/klett-cx-analytics/transform-data \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --service-account YOUR_SERVICE_ACCOUNT_EMAIL
'''
