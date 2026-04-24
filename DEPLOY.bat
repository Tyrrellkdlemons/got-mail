@echo off
REM Double-click this to deploy the current contents of the Got Mail folder
REM to Netlify (via GitHub auto-build).
REM No sign-in needed after the first push - Git Credential Manager caches it.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0DEPLOY.ps1"

echo.
echo ==========================================
echo Press any key to close this window.
echo ==========================================
pause >nul
