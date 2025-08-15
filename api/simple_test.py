"""
Simple test API for Lambda deployment
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from datetime import datetime

app = FastAPI(title="Ocha Test API", version="1.0.0")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    message: str
    timestamp: str

@app.get("/")
def root():
    return {"message": "Ocha Test API", "version": "1.0.0"}

@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="healthy",
        message="API is working correctly",
        timestamp=datetime.utcnow().isoformat()
    )

@app.post("/test")
def test_endpoint(data: dict = None):
    return {
        "message": "Test endpoint working",
        "received_data": data,
        "timestamp": datetime.utcnow().isoformat()
    }

# For Lambda
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)