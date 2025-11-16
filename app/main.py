import json
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from transform_data import (
    initialize_client,
    fetch_login_data,
    fetch_logins_user_type_breakdown,
    fetch_logins_summary,
    fetch_license_data,
    fetch_assignment_data,
    default_serializer
)

# Initialize client at import time
client = initialize_client()

app = FastAPI()

def serialize_for_jsonresponse(data):
    return json.loads(json.dumps(data, default=default_serializer))


@app.get("/")
def root():
    return {"message": "FastAPI is working."}


@app.get("/api/logins")
def logins():
    return JSONResponse(content=serialize_for_jsonresponse(fetch_login_data()))


@app.get("/api/logins/usertypes")
def logins_usertypes():
    return JSONResponse(content=serialize_for_jsonresponse(fetch_logins_user_type_breakdown()))


@app.get("/api/logins/summary")
def logins_summary():
    return JSONResponse(content=serialize_for_jsonresponse(fetch_logins_summary()))


@app.get("/api/assignments")
def assignments():
    return JSONResponse(content=serialize_for_jsonresponse(fetch_assignment_data()))


@app.get("/api/licenses")
def licenses():
    return JSONResponse(content=serialize_for_jsonresponse(fetch_license_data()))
