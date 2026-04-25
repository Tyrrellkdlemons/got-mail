@echo off
REM Start the local dev server. Created by Claude on 2026-04-24.
cd /d "%~dp0"
echo Starting Next.js dev server on http://localhost:3000 ...
echo (Ctrl+C in this window to stop.)
echo.
call npm run dev
pause
