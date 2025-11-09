# Serves data fetched from bigquery from transform_data.py

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from google.cloud import bigquery
from .transform_data import fetch_data

app = FastAPI()

@app.get("/")
def root():
    return {"message": "FastAPI is working."}

@app.get("/data")
def run_query():
    # Fetch data from transform_data.py
    rows = fetch_data()
    # Convert BigQuery Row objects to dictionaries
    output = [dict(row) for row in rows]
    # JSONResponse is a class provided by FastAPI, will return object "data" in the api response with the output.
    return JSONResponse(content={"data": output})
    '''
    # output is a list of dictionaries, e.g.:
    [
        {"name": "Alice", "location": "NY"},
        {"name": "Bob", "location": "CA"}
    ]
    '''

@app.get("/api/licenses")
def get_licenses():
    try:
        client = bigquery.Client()
        query = """
            SELECT
            DATE_TRUNC(startDate, MONTH) AS month,
            locationId,
            locationName,
            schoolId,
            schoolName,
            SUM(totalLicenseCount) AS totalLicenseCount,
            SUM(studentcount) AS totalStudents,
            SUM(teachercount) AS totalTeachers,
            SUM(licenseConsumeCount) AS totalConsumedLicenses,
            ARRAY_AGG(DISTINCT productTitles) AS products,
            SUM(rawConsumeUserCount) AS totalRawConsumeUsers,
            SUM(duplicateUserCount) AS totalDuplicateUsers,
            SUM(userCounts) AS totalUsers,
            ANY_VALUE(purchaseOrderNumber) AS purchaseOrderNumber,
            ANY_VALUE(expiryDate) AS expiryDate,
            ANY_VALUE(is_pilot) AS is_pilot
            FROM `klett-cx-analytics.license_staging_cleaned.step_zero_make_location_id`
            GROUP BY month, locationId, locationName, schoolId, schoolName
            ORDER BY month, locationId, schoolId
        """
        df = client.query(query).result()
        output = [dict(row) for row in df]
        return {"data": output}
    except Exception as e:
        return {"error": str(e)}

'''
Typical workflow:

Make changes to your code (e.g., server.py, transform_data.py).

Rebuild the image for the correct architecture (on M1/M2 Macs):

docker buildx build --platform linux/amd64 -t gcr.io/klett-cx-analytics/customer-dashboard --push .


Make sure the google cloud services is running with the correct
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


Or even without Docker for FastAPI routes:'''