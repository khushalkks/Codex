import io

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool
from requests.exceptions import ConnectionError as RequestsConnectionError, ReadTimeout as RequestsReadTimeout

from summarizer_app.mindmap import generate_mindmap, generate_tree, json_to_mermaid

router = APIRouter(prefix="/mindmap", tags=["mindmap"])


class MindmapTopicRequest(BaseModel):
    topic: str


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="File ka name missing hai.")

    # Avoid reading twice: UploadFile.read() se better control ke liye underlying file read
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file empty hai.")

    bio = io.BytesIO(content)
    bio.filename = file.filename.lower()

    try:
        result = await run_in_threadpool(generate_mindmap, bio)
    except RequestsReadTimeout:
        raise HTTPException(
            status_code=504,
            detail="Groq API request timeout occurred. Please try again. (Keywords step timeout)",
        )
    except RequestsConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Could not connect to Groq API. Please check your internet connection or API status.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mindmap generate failed: {e}")

    return {
        "filename": file.filename,
        **result,
    }


@router.post("/topic")
async def generate_for_topic(req: MindmapTopicRequest) -> dict:
    topic = (req.topic or "").strip()
    if not topic:
        raise HTTPException(status_code=400, detail="`topic` required hai.")

    try:
        tree = await run_in_threadpool(generate_tree, topic)
        mermaid = json_to_mermaid(tree)
    except RequestsReadTimeout:
        raise HTTPException(
            status_code=504,
            detail="Groq API request timeout occurred. Please try again. (Tree step timeout)",
        )
    except RequestsConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Could not connect to Groq API. Please check your internet connection or API status.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mindmap topic generate failed: {e}")

    return {"topic": topic, "mermaid": mermaid, "tree": tree}
