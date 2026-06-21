# Trigger uvicorn auto-reload after installing missing packages
from fastapi import APIRouter, UploadFile, File, Request, HTTPException
from services.resume_service import analyze_resume
from utils.file_parser import extract_text_from_pdf
import os
import shutil
import uuid

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/analyze-resume")
async def analyze(file: UploadFile = File(...)):
    # Create unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save the file to uploads folder
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Seek back to 0 just in case the file object is reused anywhere
        await file.seek(0)
        
        # Extract text directly using the UploadFile (utils/file_parser.py currently expects SpooledTemporaryFile)
        text = extract_text_from_pdf(file)
        
        # Get AI analysis
        result = analyze_resume(text)
        return result
    except Exception as e:
        # FastAPI valid HTTP Exception
        raise HTTPException(status_code=500, detail=str(e))