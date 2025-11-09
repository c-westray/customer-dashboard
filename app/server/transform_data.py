# This backend file gets my data from BigQuery and transforms it.
# Then referenced and served on the API by the server.py file.

import os
from dotenv import load_dotenv
from google.cloud import bigquery
from google.oauth2 import service_account
import pandas as pd
import json
from datetime import date, datetime

def default_serializer(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()  # 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM:SS'
    raise TypeError(f"Type {type(obj)} not serializable")

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
# if there is a file saved in the keys folder, connect using the key for local developement
if os.path.isfile(path_to_key):
    print('Local development: Authenticating with BigQuery Json Key')
    # Set up credentials using python bigquery client (from google.oauth2 import service_account)
    creds = service_account.Credentials.from_service_account_file(path_to_key)
    client = bigquery.Client(credentials=creds, project=project_id)
else:
    print('Production: Connecting to BigQuery Client. For Google Cloud Run')
    client = bigquery.Client()


def write_to_file(filepath, filename, data):
    path = os.path.join(filepath, filename)
    try:
        # Creates new file
        with open(path, "x") as f:
            #f.write(data)
            json.dump(data, f, indent=4, default=default_serializer) #serializes dates properly for json
            print("File created successfully.")
    except FileExistsError:
        print("Error: File already exists.")
        inputstatus = True
        while (inputstatus):
            replace = input("Would you like to replace the file? (y/n) ").strip().lower()
            if replace == 'y':
                with open(path, "w") as f:
                    # f.write(data)
                    json.dump(data, f, indent=4, default=default_serializer) #serializes dates properly for json
                    print("File created successfully.")
                    inputstatus = False
            elif replace == 'n':
                print("Ok, ending program.")
                inputstatus = False
            else:
                print("Invalid input. Try again")

def fetch_license_data():
        QUERY = (
             'SELECT *'
             'FROM `klett-cx-analytics.license_staging_cleaned.step_zero_make_location_id`'
        )
        query_job = client.query(QUERY) # API request. This line is BLOCKING. 
        # NOT fully asynchronous like the promise-based js client. Returns a query_job object.
        # Then you have to access query_job.result.
        rows = query_job.result() # Waits for query to finish
        df = query_job.to_dataframe()  # Converts rows to pandas DataFrame
        data = df.to_dict(orient='records')  # List of dicts
        return data
        '''
        ## Longer method:
        rowdict = []
        for row in rows:
             rowdict.append(dict(row))
        return rowdict
        ## Alternate pythonic oneliner:
        ## return [dict(row) for row in rows]
        '''

def process_license_data():
    data = fetch_license_data()
    print(data[0]['locationName']) # must access key with the exact type

    #print(rowdict)
    #Output to json file for local testing.
    filepath = os.path.join(project_root, './app/server/server_test_data')
    filename = 'testdata.json'
    write_to_file(filepath, filename, data) 

process_license_data()




