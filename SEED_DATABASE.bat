@echo off
REM Double-click to populate your Neon Postgres database with the
REM full Got Mail catalog (80+ providers, OSS tools, DNS tools,
REM spam checkers, templates, free-domains, infrastructure) PLUS
REM a sample workspace with contacts, segments, a template, and a
REM draft campaign.
REM
REM Safe to run multiple times (upserts).

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0SEED_DATABASE.ps1"

echo.
echo ==========================================
echo Press any key to close this window.
echo ==========================================
pause >nul
