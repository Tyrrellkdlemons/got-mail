@echo off
REM Double-click this file to push your Got Mail code to GitHub.
REM It runs PUSH_TO_GITHUB.ps1 with the execution policy bypassed so
REM Windows doesn't block the PowerShell script on first run.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0PUSH_TO_GITHUB.ps1"

echo.
echo ==========================================
echo The window will stay open. Press any key to close.
echo ==========================================
pause >nul
