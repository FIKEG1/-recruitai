@echo off
title KETARI Platform Launcher
color 0A

echo.
echo ========================================
echo   KETARI Platform Launcher
echo ========================================
echo.

echo [1/3] Starting AI Service...
start "AI Service" cmd /k "cd /d "%~dp0python-ai-service" && .\venv\Scripts\python.exe app.py"
ping 127.0.0.1 -n 4 >nul

echo [2/3] Starting Backend...
start "Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
ping 127.0.0.1 -n 6 >nul

echo [3/3] Starting Frontend...
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"
ping 127.0.0.1 -n 6 >nul

echo.
echo ========================================
echo   All services started!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000/api
echo   AI Svc:   http://localhost:5001/api
echo ========================================
echo.
pause