import os
import shutil
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import json

import models, schemas, auth, ai_logic, database
from database import engine, get_db

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Student Companion API")

# Robust CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# --- AUTH ROUTES ---

@app.post("/api/auth/signup", response_model=schemas.Token)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user_in.password)
    new_user = models.User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = auth.create_access_token(data={"id": new_user.id})
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

@app.post("/api/auth/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not auth.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"id": user.id})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

# --- PROTECTED FEATURE ROUTES ---

@app.post("/api/chat")
async def ai_chat(
    chat_req: schemas.ChatRequest, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        ai_res = await ai_logic.get_ai_chat_response(chat_req.message, chat_req.history)
        
        # Save session to DB
        session = db.query(models.ChatSession).filter(models.ChatSession.user_id == current_user.id).order_by(models.ChatSession.created_at.desc()).first()
        
        if not session or len(session.messages or []) > 50:
            session = models.ChatSession(user_id=current_user.id, messages=[])
            db.add(session)
            db.commit()
            db.refresh(session)
            
        messages = session.messages or []
        messages.append({"role": "user", "content": chat_req.message})
        messages.append({
            "role": "assistant", 
            "content": ai_res["response"],
            "tone": ai_res["detectedTone"],
            "tip": ai_res["empathyTip"]
        })
        session.messages = messages
        session.last_tone = ai_res["detectedTone"]
        db.commit()
        
        return ai_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-notes")
async def generate_notes(
    text: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    audio: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        audio_path = None
        if audio:
            os.makedirs("uploads", exist_ok=True)
            audio_path = f"uploads/{audio.filename}"
            with open(audio_path, "wb") as buffer:
                shutil.copyfileobj(audio.file, buffer)
        
        ai_res = await ai_logic.generate_structured_notes(text=text, audio_file_path=audio_path)
        
        # Clean up audio file
        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)
            
        # Save to DB
        new_note = models.Note(
            user_id=current_user.id,
            title=title or "Untitled Note",
            content=ai_res["structuredNotes"],
            summary=ai_res["summary"],
            key_concepts=ai_res["keyConcepts"],
            important_questions=ai_res["importantQuestions"]
        )
        db.add(new_note)
        db.commit()
        
        return ai_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    import tempfile
    import traceback
    
    try:
        # Use tempfile to guarantee a writable location on any OS
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            shutil.copyfileobj(audio.file, tmp)
            temp_path = tmp.name
        
        try:
            # Check file size
            if os.path.getsize(temp_path) < 100:
                 return {"text": ""}
                 
            text = await ai_logic.transcribe_audio(temp_path)
            return {"text": text}
        finally:
            # Always clean up
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        err_msg = f"TRANSCRIPTION_FATAL: {str(e)}\n{traceback.format_exc()}"
        with open("error_log.txt", "a") as f:
            f.write(err_msg + "\n")
        # Return the error in JSON so the frontend can display it
        return {"error": str(e), "details": "Check server logs"}

@app.post("/api/analyze-health")
async def analyze_health(
    wellbeing_data: dict, # Basic dict for now
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        ai_res = await ai_logic.analyze_wellbeing(
            sleep=wellbeing_data.get("sleep", 7),
            diet=wellbeing_data.get("diet", ""),
            activity=wellbeing_data.get("activity", "")
        )
        return ai_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/focus-report")
async def focus_report(
    req: schemas.FocusReportRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        ai_res = await ai_logic.generate_focus_report_ai(
            duration=req.sessionData.duration,
            distractions=req.sessionData.distractions
        )
        
        # Save to DB
        report = models.FocusReport(
            user_id=current_user.id,
            duration=req.sessionData.duration,
            distractions=req.sessionData.distractions,
            focus_score=ai_res["focusScore"],
            analysis=ai_res["efficiencyAnalysis"],
            tips=ai_res["tips"]
        )
        db.add(report)
        db.commit()
        
        return ai_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        notes = db.query(models.Note).filter(models.Note.user_id == current_user.id).order_by(models.Note.created_at.desc()).limit(5).all()
        last_chat = db.query(models.ChatSession).filter(models.ChatSession.user_id == current_user.id).order_by(models.ChatSession.created_at.desc()).first()
        focus_reports = db.query(models.FocusReport).filter(models.FocusReport.user_id == current_user.id).order_by(models.FocusReport.created_at.desc()).limit(5).all()
        
        total_duration = db.query(models.FocusReport).filter(models.FocusReport.user_id == current_user.id).with_entities(models.FocusReport.duration).all()
        total_seconds = sum([r[0] for r in total_duration]) if total_duration else 0

        return {
            "recentNotes": notes,
            "lastChat": last_chat,
            "focusStats": {
                "totalSeconds": total_seconds,
                "recentScore": focus_reports[0].focus_score if focus_reports else 0,
                "history": focus_reports
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
