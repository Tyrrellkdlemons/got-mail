# Got Mail - one-shot database seeder (Windows-friendly)
#
# Resilient install: tries cached, then clean, then minimal-deps-only.
# If a local install keeps failing (Windows Defender, OneDrive syncing, etc.),
# see SEED.md for the backup approach via the /api/admin/seed route.

$ErrorActionPreference = 'Continue'
$PSNativeCommandUseErrorActionPreference = $false

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

Write-Host ''
Write-Host '=======================================' -ForegroundColor Cyan
Write-Host '  Got Mail -> Seed Neon Database' -ForegroundColor Cyan
Write-Host '=======================================' -ForegroundColor Cyan
Write-Host ''

# --- 1. Ensure node + npm exist ---
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host 'ERROR: Node.js is not installed or not on PATH.' -ForegroundColor Red
  Write-Host 'Install from https://nodejs.org/' -ForegroundColor Yellow
  exit 1
}
Write-Host ('Node: ' + (& node --version))

# --- 2. Ensure .env exists ---
$envPath = Join-Path $here '.env'
if (-not (Test-Path $envPath)) {
  Write-Host ''
  Write-Host 'No .env file found. Creating one from .env.example...' -ForegroundColor Yellow
  Copy-Item (Join-Path $here '.env.example') $envPath
}

# --- 3. Ensure DATABASE_URL is a real Neon string ---
$envContent = Get-Content $envPath -Raw
$hasRealUrl = $envContent -match 'DATABASE_URL="postgres' -or $envContent -match 'DATABASE_URL=postgres'
if (-not $hasRealUrl) {
  Write-Host ''
  Write-Host 'DATABASE_URL in .env is still the SQLite placeholder.' -ForegroundColor Yellow
  Write-Host 'Grab your Neon connection string from:' -ForegroundColor Yellow
  Write-Host '  https://console.neon.tech/app/projects/steep-hall-70703569' -ForegroundColor Cyan
  Write-Host '  -> Connect button -> Copy snippet' -ForegroundColor Cyan
  Write-Host ''
  $url = Read-Host 'Paste your Neon DATABASE_URL (starts with postgresql://)'
  if ([string]::IsNullOrWhiteSpace($url)) {
    Write-Host 'Aborted: no URL given.' -ForegroundColor Red
    exit 1
  }
  if ($envContent -match 'DATABASE_URL=') {
    $envContent = [Regex]::Replace($envContent, 'DATABASE_URL=.*', ('DATABASE_URL="' + $url + '"'))
  } else {
    $envContent = $envContent + "`nDATABASE_URL=""$url""`n"
  }
  Set-Content -Path $envPath -Value $envContent -Encoding UTF8
  Write-Host 'Saved DATABASE_URL to .env' -ForegroundColor Green
}

# --- 4. Install with a fresh cache to sidestep Windows Defender / OneDrive locks ---
$freshCache = Join-Path $env:TEMP 'got-mail-npm-cache'
if (-not (Test-Path $freshCache)) { New-Item -ItemType Directory -Path $freshCache -Force | Out-Null }
$commonFlags = @(
  '--no-audit',
  '--no-fund',
  '--legacy-peer-deps',
  "--cache=$freshCache"
)

function Try-NpmInstall {
  param([string[]]$args)
  Write-Host ("  -> npm install " + ($args -join ' ')) -ForegroundColor DarkGray
  & npm install @args
  return $LASTEXITCODE
}

if (-not (Test-Path (Join-Path $here 'node_modules'))) {
  Write-Host ''
  Write-Host '=== Installing dependencies ===' -ForegroundColor Cyan
  Write-Host 'First try: full install into a fresh cache dir'

  $code = Try-NpmInstall $commonFlags
  if ($code -ne 0) {
    Write-Host ''
    Write-Host 'Full install failed. Trying minimal install (Prisma + tsx + nodemailer only).' -ForegroundColor Yellow
    Write-Host 'This skips dev-only deps like Playwright that can trip Windows Defender.' -ForegroundColor Yellow
    Write-Host ''
    # Clean any partial cache entry
    & npm cache clean --force 2>$null | Out-Null
    $minimal = @(
      '--no-save',
      '@prisma/client@5.22.0',
      'prisma@5.22.0',
      'tsx@4.19.2',
      'nodemailer@6.9.16',
      'zod@3.23.8',
      'next@14.2.15',
      'react@18.3.1',
      'react-dom@18.3.1'
    ) + $commonFlags
    $code = Try-NpmInstall $minimal
  }

  if ($code -ne 0) {
    Write-Host ''
    Write-Host '=============================================================' -ForegroundColor Red
    Write-Host ' npm install still failing with EPERM-style errors.' -ForegroundColor Red
    Write-Host ' Windows Defender or OneDrive is likely holding cache files.' -ForegroundColor Red
    Write-Host ''
    Write-Host ' Easiest workarounds:' -ForegroundColor Yellow
    Write-Host '  1. Right-click SEED_DATABASE.bat -> Run as administrator' -ForegroundColor Yellow
    Write-Host '  2. Pause Windows Defender real-time protection for 2 minutes,' -ForegroundColor Yellow
    Write-Host '     re-run, then turn it back on.' -ForegroundColor Yellow
    Write-Host '  3. Use the API route fallback:' -ForegroundColor Yellow
    Write-Host '     visit https://got-mail.netlify.app/api/admin/seed?token=gotmail-seed-2026' -ForegroundColor Cyan
    Write-Host '     (it runs the same seed directly from Netlify - no local install)' -ForegroundColor Cyan
    Write-Host '=============================================================' -ForegroundColor Red
    exit 1
  }
}

# --- 5. Prisma generate ---
Write-Host ''
Write-Host '=== Generating Prisma client ===' -ForegroundColor Cyan
& npx prisma generate
if ($LASTEXITCODE -ne 0) { exit 1 }

# --- 6. Push schema to Neon ---
Write-Host ''
Write-Host '=== Pushing schema to Neon ===' -ForegroundColor Cyan
& npx prisma db push --accept-data-loss --skip-generate
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Schema push failed. Check that DATABASE_URL reaches Neon.' -ForegroundColor Red
  exit 1
}

# --- 7. Seed ---
Write-Host ''
Write-Host '=== Seeding data ===' -ForegroundColor Cyan
& npx tsx prisma/seed.ts
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Seed script failed.' -ForegroundColor Red
  exit 1
}

Write-Host ''
Write-Host '=== DONE ===' -ForegroundColor Green
Write-Host 'Your Neon database is populated.'
Write-Host 'Reload https://got-mail.netlify.app'
