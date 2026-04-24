# Got Mail -> Netlify auto-deploy via GitHub
# Commits whatever's currently in this folder and pushes to origin/main.
# Netlify is linked to the repo and auto-builds on every push.
#
# Double-click DEPLOY.bat (preferred) OR run this from PowerShell:
#   powershell -ExecutionPolicy Bypass -File .\DEPLOY.ps1

$ErrorActionPreference = 'Continue'
$PSNativeCommandUseErrorActionPreference = $false

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

Write-Host ''
Write-Host '=======================================' -ForegroundColor Cyan
Write-Host '  Got Mail -> Netlify (via GitHub)' -ForegroundColor Cyan
Write-Host '=======================================' -ForegroundColor Cyan
Write-Host ''

# --- 1. Sanity checks ---
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host 'ERROR: git is not installed or not on PATH.' -ForegroundColor Red
  Write-Host 'Install from https://git-scm.com/download/win' -ForegroundColor Yellow
  exit 1
}

if (-not (Test-Path (Join-Path $here '.git'))) {
  Write-Host 'ERROR: no .git folder here.' -ForegroundColor Red
  Write-Host 'Run PUSH_TO_GITHUB.bat first to initialize the repo.' -ForegroundColor Yellow
  exit 1
}

# --- Ensure git identity exists (required to commit) ---
$gitName  = (& git config --get user.name)  2>$null
$gitEmail = (& git config --get user.email) 2>$null
if (-not $gitName -or -not $gitEmail) {
  Write-Host ''
  Write-Host 'Setting git identity (one-time setup)...' -ForegroundColor Yellow
  if (-not $gitName)  { & git config --global user.name  'TKDL' }
  if (-not $gitEmail) { & git config --global user.email 'tyrrellkdlemons@gmail.com' }
  Write-Host ("  user.name  = " + (& git config --get user.name))
  Write-Host ("  user.email = " + (& git config --get user.email))
}

# --- Ensure we're on a branch called main ---
$branch = (& git symbolic-ref --short HEAD) 2>$null
if (-not $branch) {
  Write-Host 'Creating main branch...' -ForegroundColor Yellow
  & git checkout -b main 2>$null
} elseif ($branch -ne 'main') {
  Write-Host "Renaming '$branch' -> main..." -ForegroundColor Yellow
  & git branch -M main
}

# --- Ensure origin remote exists ---
$currentRemote = (& git remote get-url origin 2>$null)
if (-not $currentRemote) {
  Write-Host 'Adding origin remote...' -ForegroundColor Yellow
  & git remote add origin 'https://github.com/Tyrrellkdlemons/got-mail.git'
}

# --- 2. Show status ---
Write-Host '=== Current status ===' -ForegroundColor Cyan
& git status --short

# --- 3. Stage everything ---
Write-Host ''
Write-Host '=== Staging ===' -ForegroundColor Cyan
& git add -A

$staged = & git diff --cached --name-only
if (-not $staged) {
  Write-Host ''
  Write-Host 'No changes to deploy.' -ForegroundColor Yellow
  Write-Host 'If you expected changes, make sure you edited files INSIDE this folder.'
  exit 0
}

# --- 4. Commit ---
Write-Host ''
Write-Host '=== Committing ===' -ForegroundColor Cyan
$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
$msg = "Got Mail deploy $stamp"
& git commit -m $msg

# --- 5. Push (triggers Netlify auto-build) ---
Write-Host ''
Write-Host '=== Pushing to GitHub (Netlify will auto-build) ===' -ForegroundColor Cyan
Write-Host '(If Git Credential Manager pops up, sign into GitHub in that window.)'
& git push -u origin main
if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host 'Normal push failed (probably because GitHub has the placeholder README commit).' -ForegroundColor Yellow
  Write-Host 'Retrying with --force to overwrite it...' -ForegroundColor Yellow
  & git push -u origin main --force
  if ($LASTEXITCODE -ne 0) {
    Write-Host ''
    Write-Host 'Push still failed. Check network / GitHub credentials.' -ForegroundColor Red
    exit 1
  }
}

Write-Host ''
Write-Host '=== DONE ===' -ForegroundColor Green
Write-Host 'Watch the build at: https://app.netlify.com/'
