import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import database, models, schemas
from dotenv import load_dotenv

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "secret_key_student_companion_123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(db: Session = Depends(database.get_db)):
    # Always return the first user for a seamless demo
    user = db.query(models.User).first()
    if user is None:
        # Create a default user if none exists
        hashed_password = pwd_context.hash("admin123")
        user = models.User(name="Demo Student", email="demo@example.com", hashed_password=hashed_password)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
