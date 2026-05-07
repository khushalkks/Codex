from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import datetime
from config.db import get_database

router = APIRouter()

class WhiteboardElement(BaseModel):
    id: str
    tool: str
    points: List[dict]
    color: str
    width: float
    text: Optional[str] = None

class SaveBoardRequest(BaseModel):
    roomId: str
    elements: List[dict]
    userName: str

@router.post("/whiteboard/save")
async def save_whiteboard(req: SaveBoardRequest):
    """Save the current state of a whiteboard to MongoDB."""
    db = get_database()
    try:
        await db.whiteboards.update_one(
            {"roomId": req.roomId.upper()},
            {
                "$set": {
                    "elements": req.elements,
                    "lastSavedBy": req.userName,
                    "updatedAt": datetime.datetime.utcnow()
                }
            },
            upsert=True
        )
        return {"status": "success", "message": f"Board {req.roomId} saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/whiteboard/load/{room_id}")
async def load_whiteboard(room_id: str):
    """Load a whiteboard state from MongoDB."""
    db = get_database()
    try:
        board = await db.whiteboards.find_one({"roomId": room_id.upper()})
        if not board:
            return {"elements": [], "message": "New room created"}
        return {
            "elements": board.get("elements", []),
            "updatedAt": board.get("updatedAt"),
            "lastSavedBy": board.get("lastSavedBy")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/whiteboard/list")
async def list_whiteboards():
    """List all saved whiteboards (metadata only)."""
    db = get_database()
    try:
        cursor = db.whiteboards.find({}, {"elements": 0})
        boards = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            boards.append(doc)
        return boards
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
