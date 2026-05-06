# AI Student Companion - Run Script

Write-Host "🚀 Starting AI Student Companion..." -ForegroundColor Cyan

# 1. Start Backend (Python)
Write-Host "📂 Starting Backend (FastAPI) in a new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🐍 Python Backend Logs' -ForegroundColor Green; cd backend_python; python main.py"

# 2. Start Frontend (Vite)
Write-Host "💻 Starting Frontend (Vite) in a new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '⚛️ Frontend Logs' -ForegroundColor Yellow; cd frontend; npm run dev"

Write-Host "✅ Both services are starting!" -ForegroundColor Cyan
Write-Host "🔗 Backend: http://localhost:8000"
Write-Host "🔗 Frontend: http://localhost:5173"
