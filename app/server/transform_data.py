# This backend file gets my data from BigQuery and transforms it.
# Then referenced and served on the API by the server.py file.

import os
from dotenv import load_dotenv
from google.cloud import bigquery
from google.oauth2 import service_account

current_directory = os.path.dirname(__file__)
project_root = os.path.join(current_directory, '..', '..')
path_to_dotenv = os.path.join(project_root, '.env' ) 
# print('Path to .env: ', path_to_dotenv)
# print('.env exists?', os.path.isfile(path_to_dotenv))
load_dotenv(path_to_dotenv)

# Get env vars from the .env now that it's loaded. 
# project_root is a relative path to the project root.
# then the "GOOGLE_APPLICATION_CREDENTIALS=./keys/jsonkeyfilename.json
path_to_key = os.path.join(project_root, os.getenv("GOOGLE_APPLICATION_CREDENTIALS")) 
print(path_to_key)
print('json key exists?', os.path.isfile(path_to_key))

project_id = os.getenv("GOOGLE_CLOUD_PROJECT")

if path_to_key is None:
    raise ValueError("No key found.")
elif project_id is None:
    raise ValueError("No project_id found.")

# Debug
print("BigQuery Json Key:", path_to_key)
print("Project ID:", project_id)

# Optional: set environment variable for other libraries
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = path_to_key


# Instantiate BigQuery client
if (path_to_key):
    print('Local development: Authenticating with BigQuery Json Key')
    creds = service_account.Credentials.from_service_account_file(path_to_key)
    client = bigquery.Client(credentials=creds, project=project_id)
else:
    print('Production: Connecting to BigQuery Client')
    client = bigquery.Client()

'''

# client = bigquery.Client()

def fetch_data():
    QUERY = """
    SELECT *
    FROM `klett-cx-analytics.license_staging_cleaned.step_zero_make_location_id`
    LIMIT 100
    """
    # Execute query
    rows = client.query(QUERY).result()
    
    # Return rows
    return rows
 '''