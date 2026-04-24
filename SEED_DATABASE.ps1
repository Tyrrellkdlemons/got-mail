# Got Mail - one-shot database seeder
# 1. Makes sure dependencies are installed
# 2. Reads DATABASE_URL from .env (creates .env if missing)
# 3. Pushes the Prisma schema to Neon (prisma db push)
# 4. Runs the seed script (80+ sources + sample workspace)

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

# --- 3. Ensure DATABASE_URL is set to a real Neon string (not the SQLite default) ---
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
  # Replace or append DATABASE_URL line
  if ($envContent -match 'DATABASE_URL=') {
    $envContent = [Regex]::Replace($envContent, 'DATABASE_URL=.*', ('DATABASE_URL="' + $url + '"'))
  } else {
    $envContent = $envContent + "`nDATABASE_URL=""$url""`n"
  }
  Set-Content -Path $envPath -Value $envContent -Encoding UTF8
  Write-Host 'Saved DATABASE_URL to .env' -ForegroundColor Green
}

# --- 4. Install deps if needed ---
if (-not (Test-Path (Join-Path $here 'node_modules'))) {
  Write-Host ''
  Write-Host 'Installing dependencies (one-time, ~1 minute)...' -ForegroundColor Yellow
  & npm install --legacy-peer-deps
  if ($LASTEXITCODE -ne 0) { Write-Host 'npm install failed.' -ForegroundColor Red; exit 1 }
}

# --- 5. Generate Prisma client ---
Write-Host ''
Write-Host '=== Generating Prisma client ===' -ForegroundColor Cyan
& npx prisma generate
if ($LASTEXITCODE -ne 0) { exit 1 }

# --- 6. Push schema to Neon (creates tables) ---
Write-Host ''
Write-Host '=== Pushing schema to Neon ===' -ForegroundColor Cyan
Write-Host '(This creates all tables. Safe to re-run.)'
& npx prisma db push --accept-data-loss --skip-generate
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Schema push failed. Check that DATABASE_URL points to a reachable Neon database.' -ForegroundColor Red
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
Write-Host 'Your Neon database is now populated.'
Write-Host 'Reload https://got-mail.netlify.app and every page should have data.'
