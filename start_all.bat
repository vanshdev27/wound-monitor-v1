@echo off
title Wound Monitor V1 (Review) Launcher
E:

echo Starting V1 ML Service (Python)...
REM We use "call" to ensure activate.bat finishes before running python
START "ML Service (V1)" /D "E:\wound-monitor\ml-service" cmd /k "call .\venv\Scripts\activate.bat && python app.py"

echo Starting V1 Backend (Node.js)...
START "Backend Server (V1)" /D "E:\wound-monitor\backend" cmd /k "node server.js"

echo Starting V1 Frontend (React)...
START "Frontend App (V1)" /D "E:\wound-monitor\frontend" cmd /k "npm start"

echo Launching V1 servers...
