from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    notes = relationship("Note", back_populates="owner")
    chat_sessions = relationship("ChatSession", back_populates="owner")
    focus_reports = relationship("FocusReport", back_populates="owner")

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(Text)
    key_concepts = Column(JSON) # List of strings
    important_questions = Column(JSON) # List of strings
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="notes")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    messages = Column(JSON) # List of dicts {role, content, tone, tip, timestamp}
    last_tone = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="chat_sessions")

class FocusReport(Base):
    __tablename__ = "focus_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    duration = Column(Integer) # Seconds
    distractions = Column(Integer, default=0)
    focus_score = Column(Float)
    analysis = Column(Text)
    tips = Column(JSON) # List of strings
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="focus_reports")
