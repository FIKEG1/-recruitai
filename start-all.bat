@echo off
title RecruitAI Platform Launcher
color 0A

echo.
echo ========================================
echo   🤖 RecruitAI Platform Launcher
echo ========================================
echo.

echo [1/4] Starting MongoDB...
start "MongoDB" /min mongod --dbpath C:\data\db
timeout /t 3 /nobreak >nul

echo [2/4] Starting Backend...
start "Backend" /min cmd /k "cd /d C:\Users\Fikadu\Documents\recruitment-platform\backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/4] Starting AI Chat Service...
start "AI Chat" /min cmd /k "cd /d C:\Users\Fikadu\Documents\recruitment-platform\python-ai-service && venv\Scripts\activate && python chat_service.py"
timeout /t 5 /nobreak >nul

echo [4/4] Starting Frontend...
start "Frontend" /min cmd /k "cd /d C:\Users\Fikadu\Documents\recruitment-platform\frontend && npm start"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   ✅ All services started!
echo   📱 Open: http://localhost:3000
echo   🤖 AI Chat: http://localhost:5002
echo ========================================
timeout /t 3 /nobreak >nul