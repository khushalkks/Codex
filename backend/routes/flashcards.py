import io

from fastapi import APIRouter, File, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

from summarizer_app.flashcard import generate_flashcards
from summarizer_app.mindmap import extract_text_from_file

router = APIRouter(tags=["flashcards"])


@router.post("/flashcards/generate")
async def flashcards_from_file(file: UploadFile = File(...)) -> dict:
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

    # Index doc in RAG
    try:
        from services.rag_service import save_document
        await save_document(file.filename, text)
    except Exception as e:
        print(f"[RAG] Failed to index document during flashcards generation: {e}")

    try:
        cards = await run_in_threadpool(generate_flashcards, text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flashcards generate failed: {e}")

    if isinstance(cards, dict) and cards.get("error"):
        raise HTTPException(status_code=502, detail=f"Groq flashcards error: {cards['error']}")

    if not isinstance(cards, list) or not cards:
        raise HTTPException(status_code=502, detail="Flashcards parse nahi hue. Groq output check karo.")

    normalized = []
    for c in cards:
        if not isinstance(c, dict):
            continue
        q = str(c.get("question", "")).strip()
        a = str(c.get("answer", "")).strip()
        if q and a:
            normalized.append({"question": q, "answer": a})

    if not normalized:
        raise HTTPException(status_code=502, detail="Flashcards empty aaye. Different doc try karo.")

    return {"filename": file.filename, "flashcards": normalized}
