@echo off
REM Regenerate Prisma client against the (postgres) schema and start the dev server.
REM Created by Claude on 2026-04-24 to finalize the database fix.

cd /d "%~dp0"

echo ==========================================
echo Step 1/3: Stopping any dev server on port 3000...
echo ==========================================
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Killing PID %%P
    taskkill /F /PID %%P 2>nul
)

echo.
echo ==========================================
echo Step 2/3: Regenerating Prisma client (postgres)...
echo ==========================================
call npx prisma generate
if errorlevel 1 (
    echo.
    echo ERROR: prisma generate failed. Press any key to close.
    pause >nul
    exit /b 1
)

echo.
echo ==========================================
echo Step 3/3: Starting dev server on http://localhost:3000
echo (Ctrl+C in this window to stop)
echo ==========================================
echo.
call npm run dev
pause
