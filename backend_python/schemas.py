from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

# Auth Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        fields = {
            'id': '_id',
            'created_at': 'createdAt'
        }

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Note Schemas
class NoteBase(BaseModel):
    title: str
    content: str
    summary: Optional[str] = None
    key_concepts: Optional[List[str]] = []
    important_questions: Optional[List[str]] = []

class NoteCreate(NoteBase):
    pass

class NoteResponse(NoteBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        fields = {
            'id': '_id',
            'user_id': 'userId',
            'created_at': 'createdAt',
            'key_concepts': 'keyConcepts',
            'important_questions': 'importantQuestions'
        }

# Chat Schemas
class ChatMessage(BaseModel):
    role: str
    content: str
    tone: Optional[str] = None
    tip: Optional[str] = None
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    message: str
    history: List[dict]

class ChatResponse(BaseModel):
    response: str
    detectedTone: str
    empathyTip: str

# Focus Schemas
class FocusSessionData(BaseModel):
    duration: int
    distractions: int

class FocusReportRequest(BaseModel):
    sessionData: FocusSessionData

class FocusReportResponse(BaseModel):
    focusScore: float
    efficiencyAnalysis: str
    tips: List[str]

# Dashboard Schema
class DashboardResponse(BaseModel):
    recentNotes: List[NoteResponse]
    lastChat: Optional[Any] = None
    focusStats: dict
