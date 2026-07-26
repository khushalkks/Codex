import io
import re

from fastapi import APIRouter, File, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

from summarizer_app.mindmap import extract_text_from_file
from summarizer_app.summarizer import summarize_text

router = APIRouter(tags=["summary"])


def _fallback_summary(text: str, max_sentences: int = 5, max_chars: int = 800) -> str:
    """
    Transformer model fail ho jaye tab ka lightweight fallback.
    """
    cleaned = (text or "").strip()
    if not cleaned:
        return ""

    sentences = re.split(r"(?<=[.!?])\s+", cleaned)
    picked = "\n".join(s.strip() for s in sentences if s.strip())[:max_chars]
    return picked if picked else cleaned[:max_chars]


@router.post("/summarize")
async def summarize_document(file: UploadFile = File(...)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="File ka name missing hai.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file empty hai.")

    bio = io.BytesIO(content)
    bio.filename = file.filename.lower()

    try:
        text = await run_in_threadpool(extract_text_from_file, bio)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File extraction failed: {e}")

    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Document text empty nikla.")

    # Save to MongoDB vector store for RAG
    from services.rag_service import save_document
    try:
        await save_document(file.filename, text)
    except Exception as e:
        print(f"[RAG] Failed to index document during summarization: {e}")

    try:
        summary = await run_in_threadpool(summarize_text, text)
        if not summary or not summary.strip():
            summary = _fallback_summary(text)
    except Exception:
        summary = _fallback_summary(text)

    return {"summary": summary}
