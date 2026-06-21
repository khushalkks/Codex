import os
import datetime
import bcrypt
import jwt
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from config.db import get_database

router = APIRouter(prefix="/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET", "cortexcraft_jwt_secret_key_998877")
JWT_ALGORITHM = "HS256"

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(req: RegisterRequest):
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection is not active."
        )
    
    email = req.email.strip().lower()
    name = req.name.strip()
    password = req.password
    
    if not name or not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All fields (name, email, password) are required."
        )
        
    if len(password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    # Check if user already exists
    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered."
        )

    # Hash the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

    # Generate a random avatar seeds using Dicebear
    avatar_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={name.replace(' ', '')}"

    new_user = {
        "name": name,
        "email": email,
        "password": hashed_password.decode('utf-8'),
        "avatar": avatar_url,
        "createdAt": datetime.datetime.utcnow()
    }

    try:
        await db.users.insert_one(new_user)
        return {"status": "success", "message": "User registered successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register user: {str(e)}"
        )

@router.post("/login")
async def login(req: LoginRequest):
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection is not active."
        )

    email = req.email.strip().lower()
    password = req.password

    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Verify password
    hashed_db_password = user["password"].encode('utf-8')
    if not bcrypt.checkpw(password.encode('utf-8'), hashed_db_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Create JWT Token
    payload = {
        "userId": str(user["_id"]),
        "email": user["email"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return {
        "token": token,
        "user": {
            "name": user["name"],
            "email": user["email"],
            "avatar": user["avatar"]
        }
    }
