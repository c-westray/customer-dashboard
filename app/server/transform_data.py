# This backend file gets my data from BigQuery and transforms it.
# Then referenced and served on the api by the server.py file.
# Run $ source venv/bin/activate before working with this file
# (dependencies installed: google-cloud-bigquery, pandas)

# Use Python Client for Google BigQuery
#  https://docs.cloud.google.com/python/docs/reference/bigquery/latest

# API is enabled, now need to enable with BigQuery JSON keyfile:

#Tutorial:
# https://googleapis.dev/python/google-api-core/latest/auth.html

#Bigquery API classes, methods, and properties overview:
# https://docs.cloud.google.com/python/docs/reference/bigquery/latest/summary_overview

import os
from google.cloud import bigquery
from google.oauth2 import service_account

'''
#Remove json keys since only needed for local development.
# For Google Cloud run, do not need to authenticate with JSON keys.
# KEY_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'keys', 'bq-dashboard-key.json')


if os.path.exists(KEY_PATH):
    # Local dev
    creds = service_account.Credentials.from_service_account_file(KEY_PATH)
    client = bigquery.Client(credentials=creds, project="klett-cx-analytics")
else:
    # Cloud Run / GCP production
    client = bigquery.Client()

'''
def fetch_data():
    QUERY = """
    SELECT *
    FROM `klett-cx-analytics.license_staging_cleaned.step_zero_make_location_id`
    LIMIT 10
    """
    #BigQuery client is asynchronous, so I don't need await here.
    rows = client.query(QUERY).result()
    return rows
    '''
    for row in rows:
        print(row)
    '''
