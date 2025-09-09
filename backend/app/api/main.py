from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from app.api.routes.websocket import router as websocket_router
from app.services.auth_services import router as auth_router

app = FastAPI()

print(os.getenv("FRONTEND_URL"))
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["GET, POST, PUT, DELETE, OPTIONS"],
    allow_headers=["*"],
)

app.include_router(websocket_router)
app.include_router(auth_router)

@app.get("/")
def home():
    return {
        "status": "success",
        "message": "Fitness Tracker Backend is Running",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)