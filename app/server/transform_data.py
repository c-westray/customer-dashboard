# This backend file gets my data from BigQuery and transforms it.
# Then referenced and served on the API by the server.py file.

# To do later: add filtering logic, e.g. filtering on the backend for
# is_pilot or schools like this.
# Currently I just pull all data at build time and then 
# filter on the frontend for simplicity (reduces spending on the BigQuery API calls)
# however if server performance slows could consider redesign
'''
@app.route('/api/logins')
def get_logins():
    is_pilot = request.args.get('is_pilot')
    school_ids = request.args.get('schoolId')  # e.g. "123,456"
    
    query = """
        SELECT *
        FROM `klett-cx-analytics.logins_staging_cleaned.step_four_separate_grand_totals_table`
    """
    filters = []

    if is_pilot is not None:
        filters.append(f"is_pilot = {str(is_pilot).upper()}")

    if school_ids:
        ids = [f"'{s.strip()}'" for s in school_ids.split(',')]
        filters.append(f"schoolId IN ({', '.join(ids)})")

    if filters:
        query += " WHERE " + " AND ".join(filters)
    query += " ORDER BY locationId, created_month"

    df = client.query(query).to_dataframe()
    return jsonify(df.to_dict(orient='records'))
'''

# To do later as well: build in products analysis page (which books are getting used most. 
# Probably usage data will not be that different from sales data, but...I guess useful

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

def initialize_client():
    global client # client as global variable for all functions
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
    try:
        QUERY = (
             'SELECT *'
             'FROM `klett-cx-analytics.license_staging_cleaned.step_zero_make_location_id`'
        )
        query_job = client.query(QUERY) # API request. This line is BLOCKING. 
        # NOT fully asynchronous like the promise-based js client. Returns a query_job object.
        # Then you have to access query_job.result.
        # rows = query_job.result() # Waits for query to finish
        df = query_job.to_dataframe()  # Waits for query to finish. Converts rows to pandas DataFrame
        data = df.to_dict(orient='records')  # Use pandas to make list of row dictionaries
        # Probably not necessary to use pandas here, but it does help me handle date objects naturally
        return data
        '''
        ## Longer method (edit--I changed this 
        # b/c I actually want json and just used pandas dataframe, 
        # not just pushing a dict to rows)
        rowdict = []
        for row in rows:
             rowdict.append(dict(row))
        return rowdict
        ## Alternate pythonic oneliner:
        ## return [dict(row) for row in rows]
        '''
    except Exception as e:
        # returns a dictionary with syntax for dictionaries
        #  {"key": value} 
        return {"error": str(e)} 
    

# Table "step_three_aggregate_monthly" in BigQuery.
# Aggregates monthly 
# Breaks down by district and school
# breaks down by type (admin, teacher, student, parent.)
# Also provides "All districts" user type breakdown (e.g. admins for all districts; teachers for all districts; students for all districts; parents for all districts)
'''
SELECT * FROM `klett-cx-analytics.logins_staging_cleaned.step_three_aggregate_monthly`
  WHERE locationName IS NOT NULL and user_type_id IS NOT NULL
    -- filter out the null location names and null user_type_id;
      these are redundant since I pull these summaries with the summary data table five. For usability / clarity.
-- and LOWER(locationName) LIKE '%arlington%'
ORDER BY locationId, districtId, schoolId, user_type_id, created_month, is_pilot;
--Note about duplicate records here: that only hapeens when there are districts or schools that have changed names, e.g. "Upper Arlington City School District (OH)" is now "Upper Arlington City School District", but b/c the original query groups by districtName among other properties, a duplicate record is created for the two different district names
-- It also actually seems to happen when grouping by is_pilot (if there are two different records for is and isn't pilot?)
EDITED MY STEP THREE TABLE QUERY TO REMOVE THIS ISSUE.
'''

def fetch_logins_user_type_breakdown():
    try:
        QUERY = (
            'SELECT *'
            'FROM `klett-cx-analytics.logins_staging_cleaned.step_three_aggregate_monthly`'
        )
        query_job = client.query(QUERY) # API request
        #rows = query_job.result()
        df = query_job.to_dataframe()  # Waits for query to finish. Converts rows to pandas DataFrame
        data = df.to_dict(orient='records')  # Use pandas to make list of row dictionaries
        # Probably not necessary to use pandas here, but it does help me handle date objects naturally
        return data
    except Exception as e:
        return {"error": str(e)}
    
# Table "step_four_grand_totals" in BigQuery.
# Aggregates monthly 
# Breaks down by district and school. (For districts w/nested schools, schoolName = "All Schools", schoolId = null for the rollup column)
# sums up all user types grand totals
def fetch_login_data():
    try:
        QUERY = (
            'SELECT *'
            'FROM `klett-cx-analytics.logins_staging_cleaned.step_four_separate_grand_totals_table`'
        )
        query_job = client.query(QUERY) #API request
        #rows = query_job.result()
        df = query_job.to_dataframe() #Waits for query to finish then assigns to pandas dataframe
        data = df.to_dict(orient='records') # Returns row of dictionaries. Each row is own dictionary (records). 
        return data
    except Exception as e:
        return {"error": str(e)}
    
    '''
    # tests the fetch_login_data() function, but with a small subset of only a test district
    def test_single_district_logins():
    try:
        QUERY = (
            'SELECT * '
            'FROM `klett-cx-analytics.logins_staging_cleaned.step_four_separate_grand_totals_table`'
            'WHERE locationId = "55204"'
            'ORDER BY schoolId, created_month'
        )
        query_job = client.query(QUERY) #API request
        #rows = query_job.result()
        df = query_job.to_dataframe() #Waits for query to finish then assigns to pandas dataframe
        data = df.to_dict(orient='records') # Returns row of dictionaries. Each row is own dictionary (records). 
        return data
    except Exception as e:
        return {"error": str(e)}
    '''

#Provides high level summary of all districts, all time table.
# From `klett-cx-analytics.logins_staging_cleaned.step_five_all_districts_total`
# Provides summary of All Districts for that month
# Also provides summary of all 
# (some redundancy with user_type breakdown...)
# Important note: total_level is either "ALL_DISTRICTS" or "ALL_DISTRICTS_ALL_TIME"

def fetch_logins_summary():
    try:
        QUERY = (
            'SELECT * '
            'FROM `klett-cx-analytics.logins_staging_cleaned.step_five_all_districts_total`'
        )
        query_job = client.query(QUERY)
        df = query_job.to_dataframe()
        data = df.to_dict(orient='records')
        return data
    except Exception as e:
        return {"error": str(e)}

    
def fetch_assignment_data():
    try:
        QUERY = (
            'SELECT *'
            'FROM `klett-cx-analytics.assignments_staging_cleaned.step_three_aggregate_monthly`'
        )
        query_job = client.query(QUERY)
        #row = query_job.result()
        df = query_job.to_dataframe()
        data = df.to_dict(orient='records')
        return data
    except Exception as e:
        return {"error": str(e)}


def local_testing_save_data():
    datalist = []
    logins_summary_data = fetch_logins_summary()
    # login_data = fetch_login_data()
    # login_data = fetch_logins_user_type_breakdown()
    # assignment_data = fetch_assignment_data()
    #print(data[0]['locationName']) # must access key with the exact type, in this case string
    #Output to json file for local testing.
    filepath = os.path.join(project_root, './app/server/server_test_data/')
    filename = 'test_logins_summary_data.json'
    #Writing each to file:
    datalist.append(logins_summary_data)
    for item in datalist:
        write_to_file(filepath, filename, item)



#For local testing:
#local_testing_save_data()
#data = fetch_license_data()
#print(data)

# data = fetch_login_data()
# print(data)


