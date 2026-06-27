@echo off
echo ========================================================
echo Starting React Vite Frontend
echo ========================================================
cd frontend
echo Installing Node modules (if any are missing)...
call npm install
echo Starting Vite Dev Server...
call npm run dev
pause
