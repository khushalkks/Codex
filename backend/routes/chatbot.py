import io
import os
from typing import Optional
from groq import Groq
from dotenv import load_dotenv
from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool

from summarizer_app.mindmap import extract_text_from_file
import re
import numpy as np

load_dotenv()

router = APIRouter(tags=["chatbot"])

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = "No document context. Answer generally."

def _groq_generate(prompt: str, system: str = "") -> str:
    """Helper to generate response using Groq."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return "Error: GROQ_API_KEY missing."

    client = Groq(api_key=api_key)
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=1024,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"[Chatbot Error] {e}")
        return f"Sorry, AI process fail ho gaya: {e}"

@router.get("/chat/health")
async def chat_health() -> dict:
    return {
        "status": "ok",
        "engine": "Groq (Cloud)",
        "model": "llama-3.3-70b-versatile",
        "chat_ready": True,
    }

@router.post("/chat")
async def chat_with_context(request: ChatRequest) -> dict:
    if not (request.message or "").strip():
        raise HTTPException(status_code=400, detail="Message empty nahi hona chahiye.")

    system_prompt = """Tu ek helpful AI assistant hai jo document questions answer karta hai.
    Hinglish mein jawab do (Hindi + English mix) — friendly aur accurate tone.
    Context ke basis pe help karo. Agar context mein answer nahi hai toh general knowledge use karo par batao."""

    # RAG Retrieval: Extract document titles/filenames from the client-sent context
    titles = []
    if request.context:
        titles = re.findall(r"===\s*DOCUMENT CONTENT:\s*(.*?)\s*===", request.context)

    rag_contexts = []
    from services.rag_service import retrieve_relevant_chunks
    for title in titles:
        try:
            chunks = await retrieve_relevant_chunks(title, request.message, top_k=4)
            if chunks:
                rag_contexts.append(f"=== RETRIEVED CONTENT FROM DOCUMENT: {title} ===\n" + "\n\n".join(chunks))
        except Exception as e:
            print(f"[RAG] Retrieval failed for {title}: {e}")

    if rag_contexts:
        augmented_context = "\n\n".join(rag_contexts)
    else:
        augmented_context = request.context or "No document context. Answer generally."

    user_prompt = f"Context:\n{augmented_context}\n\nUser Question: {request.message}"
    
    reply = await run_in_threadpool(_groq_generate, user_prompt, system_prompt)
    return {"reply": reply, "model": "llama-3.3-70b-versatile"}

@router.post("/chat/context-upload")
async def upload_context_file(file: UploadFile = File(...)) -> dict:
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    bio = io.BytesIO(content)
    bio.filename = file.filename.lower()

    try:
        text = await run_in_threadpool(extract_text_from_file, bio)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File extraction failed: {e}")

    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Document text empty nikla.")

    # Chunk and save to MongoDB vector store
    from services.rag_service import save_document
    try:
        await save_document(file.filename, text)
    except Exception as e:
        print(f"[RAG] Failed to index document {file.filename}: {e}")

    return {
        "filename": file.filename,
        "title": file.filename.rsplit(".", 1)[0],
        "summary": text[:2000], # Pass text preview as context
        "chars_extracted": len(text),
    }

@router.post("/chat/upload")
async def chat_with_file(
    file: UploadFile = File(...),
    question: str = Query(..., description="File ke baare mein poochho"),
) -> dict:
    content = await file.read()
    bio = io.BytesIO(content)
    bio.filename = file.filename.lower()
    text = await run_in_threadpool(extract_text_from_file, bio)
    
    # Run immediate local retrieval on this single file
    from services.rag_service import chunk_text, RAGEngine
    chunks = chunk_text(text)
    engine = RAGEngine()
    
    top_chunks = []
    if chunks:
        similarities = engine.get_query_similarities_tfidf(question, chunks)
        if similarities:
            top_indices = np.argsort(similarities)[-4:][::-1]
            top_chunks = [chunks[idx] for idx in top_indices]
        else:
            top_chunks = chunks[:4]
            
    context = f"File: {file.filename}\nContent:\n" + "\n\n".join(top_chunks)
    reply = await run_in_threadpool(_groq_generate, f"Context:\n{context}\n\nQuestion: {question}", "Friendly Hinglish AI Assistant.")
    
    return {
        "filename": file.filename,
        "question": question,
        "reply": reply,
        "model": "llama-3.3-70b-versatile"
    }
