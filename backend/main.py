import sys
import os

# Force virtual environment site-packages to be loaded first (fixes subprocess spawning issues)
venv_site_packages = os.path.join(os.path.dirname(__file__), "venv", "Lib", "site-packages")
if os.path.exists(venv_site_packages) and venv_site_packages not in sys.path:
    sys.path.insert(0, venv_site_packages)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import socketio as _sio_lib
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path, override=True)

from routes import resume
from summarizer_app.interview_routes import router as interview_router
from routes.community import router as community_router
from routes.coding import router as coding_router
from routes.summary import router as summary_router
from routes.mindmap import router as mindmap_router
from routes.quiz import router as quiz_router
from routes.flashcards import router as flashcards_router
from routes.chatbot import router as chatbot_router
from config.db import connect_to_mongo, close_mongo_connection
from socket_coding import sio          # Socket.IO AsyncServer instance
from routes.whiteboard import router as whiteboard_router
from routes.auth import router as auth_router
from summarizer_app.study_plan import router as study_plan_router


# ── Proper lifespan ──────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


# ── Create FastAPI App ───────────────────────────────────────────────────────
fastapi_app = FastAPI(
    title="AI Notebook Backend",
    description="Full AI System 🚀",
    version="1.0",
    lifespan=lifespan,
)

# ── CORS Configuration (Fixed) ────────────────────────────────────────────────
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files ──────────────────────────────────────────────────────────────
if not os.path.exists("uploads"):
    os.makedirs("uploads")
fastapi_app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── REST Routers ──────────────────────────────────────────────────────────────
fastapi_app.include_router(interview_router)
fastapi_app.include_router(resume.router,       prefix="/api")
fastapi_app.include_router(community_router,    prefix="/api")
fastapi_app.include_router(coding_router,       prefix="/api")
fastapi_app.include_router(summary_router,      prefix="/api")
fastapi_app.include_router(mindmap_router,      prefix="/api")
fastapi_app.include_router(quiz_router,         prefix="/api")
fastapi_app.include_router(flashcards_router,   prefix="/api")
fastapi_app.include_router(chatbot_router,      prefix="/api")
fastapi_app.include_router(study_plan_router,   prefix="/api")
fastapi_app.include_router(whiteboard_router,   prefix="/api")
fastapi_app.include_router(auth_router,         prefix="/api")


@fastapi_app.get("/")
def root():
    return {"message": "AI Notebook API running"}


# ── Wrap with Socket.IO ───────────────────────────────────────────────────────
# Renaming the combined app to 'app' so 'uvicorn main:app' works perfectly
app = _sio_lib.ASGIApp(sio, other_asgi_app=fastapi_app)