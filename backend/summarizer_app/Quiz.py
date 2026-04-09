"""
quiz.py — FastAPI backend for AI Quiz Generator
Run: uvicorn quiz:app --reload --port 8001
Requires: pip install fastapi uvicorn python-multipart PyPDF2 python-docx ollama
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json, re, uuid, tempfile, os
from typing import Optional

# ── PDF / DOCX text extraction ─────────────────────────────────────────────────
def extract_text(file: UploadFile) -> str:
    suffix = os.path.splitext(file.filename)[1].lower()
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(file.file.read())
        tmp_path = tmp.name

    try:
        if suffix == ".pdf":
            import PyPDF2
            reader = PyPDF2.PdfReader(tmp_path)
            return "\n".join(p.extract_text() or "" for p in reader.pages)

        elif suffix == ".docx":
            from docx import Document
            doc = Document(tmp_path)
            return "\n".join(p.text for p in doc.paragraphs)

        elif suffix == ".txt":
            with open(tmp_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {suffix}")
    finally:
        os.unlink(tmp_path)


# ── Ollama call ────────────────────────────────────────────────────────────────
def call_ollama(prompt: str, model: str = "llama3") -> str:
    try:
        import ollama
        response = ollama.chat(
            model=model,
            messages=[{"role": "user", "content": prompt}]
        )
        return response["message"]["content"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")


# ── Quiz generation prompt ─────────────────────────────────────────────────────
QUIZ_PROMPT = """
You are a quiz master. Based on the document text below, generate exactly {n} multiple-choice quiz questions.

Rules:
- Each question must have exactly 4 options (A, B, C, D)
- Only one option is correct
- Questions should test understanding, not just memory
- Vary difficulty: easy, medium, hard
- Return ONLY valid JSON, no markdown, no explanation

Format:
[
  {{
    "id": "q1",
    "question": "...",
    "options": [
      {{"id": "A", "text": "..."}},
      {{"id": "B", "text": "..."}},
      {{"id": "C", "text": "..."}},
      {{"id": "D", "text": "..."}}
    ],
    "correct": "A",
    "explanation": "Brief explanation of why this is correct"
  }}
]

Document:
{text}
"""


def parse_questions(raw: str) -> list:
    """Robustly extract JSON array from Ollama response."""
    # Try direct parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Try extracting JSON array from response
    match = re.search(r"\[.*\]", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    raise HTTPException(status_code=500, detail="Could not parse quiz questions from Ollama response.")


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(title="Quiz Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ─────────────────────────────────────────────────────────────────────
class QuizSession(BaseModel):
    session_id: str
    filename: str
    questions: list
    total: int


# ── Routes ────────────────────────────────────────────────────────────────────

@app.post("/quiz/upload", response_model=QuizSession)
async def upload_and_generate(
    file: UploadFile = File(...),
    num_questions: int = 10,
    model: str = "llama3",
):
    """Upload a PDF/DOCX/TXT and get quiz questions back."""

    if num_questions < 3 or num_questions > 20:
        raise HTTPException(status_code=400, detail="num_questions must be between 3 and 20")

    # Extract text
    text = extract_text(file)
    if not text.strip():
        raise HTTPException(status_code=400, detail="No readable text found in document")

    # Truncate to ~4000 words to stay within context
    words = text.split()
    if len(words) > 4000:
        text = " ".join(words[:4000]) + "\n[Document truncated for context limit]"

    # Call Ollama
    prompt = QUIZ_PROMPT.format(n=num_questions, text=text)
    raw = call_ollama(prompt, model=model)

    # Parse questions
    questions = parse_questions(raw)

    # Validate & sanitize
    valid = []
    for i, q in enumerate(questions):
        if all(k in q for k in ("question", "options", "correct")):
            q["id"] = q.get("id", f"q{i+1}")
            q["explanation"] = q.get("explanation", "")
            valid.append(q)

    if not valid:
        raise HTTPException(status_code=500, detail="No valid questions were generated")

    return QuizSession(
        session_id=str(uuid.uuid4()),
        filename=file.filename,
        questions=valid,
        total=len(valid),
    )


@app.get("/health")
def health():
    return {"status": "ok", "service": "Quiz Generator"}