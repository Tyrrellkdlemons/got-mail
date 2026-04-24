# Got Mail -> GitHub push script (first-time setup)
# Run via the PUSH_TO_GITHUB.bat wrapper, or directly:
#   powershell -ExecutionPolicy Bypass -File .\PUSH_TO_GITHUB.ps1

# Do NOT use 'Stop' — git writes info to stderr and PS7 would treat that as terminating.
$ErrorActionPreference = 'Continue'
$PSNativeCommandUseErrorActionPreference = $false

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

Write-Host ''
Write-Host '=======================================' -ForegroundColor Cyan
Write-Host '  Got Mail -> GitHub' -ForegroundColor Cyan
Write-Host '=======================================' -ForegroundColor Cyan
Write-Host ''

# --- Step 1: confirm git is installed ---
$gitCheck = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCheck) {
  Write-Host 'ERROR: git is not installed or not on PATH.' -ForegroundColor Red
  Write-Host 'Install Git for Windows: https://git-scm.com/download/win' -ForegroundColor Yellow
  exit 1
}
Write-Host ("Git found: " + $gitCheck.Source)

# --- Step 2: ensure this folder is a git repo ---
if (-not (Test-Path (Join-Path $here '.git'))) {
  Write-Host ''
  Write-Host 'No .git folder yet. Initializing...' -ForegroundColor Yellow
  & git init | Out-Null
  & git branch -M main
}

# --- Step 2b: ensure git identity exists (required to commit) ---
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

# --- Step 2c: make sure HEAD is on main (covers fresh `git init` edge cases) ---
$branch = (& git symbolic-ref --short HEAD) 2>$null
if (-not $branch -or $branch -ne 'main') {
  & git checkout -B main 2>$null | Out-Null
}

# --- Step 3: ensure remote origin is wired ---
# Default remote: the got-mail repo already created on GitHub.
$defaultRemote = 'https://github.com/Tyrrellkdlemons/got-mail.git'
$currentRemote = (& git remote get-url origin 2>$null)
if (-not $currentRemote) {
  Write-Host ''
  Write-Host "Wiring remote -> $defaultRemote" -ForegroundColor Yellow
  Write-Host '(Press Enter to accept, or type a different URL)'
  $input = Read-Host "Repo URL [$defaultRemote]"
  if ([string]::IsNullOrWhiteSpace($input)) { $input = $defaultRemote }
  & git remote add origin $input
}
Write-Host ''
Write-Host '=== Remote ===' -ForegroundColor Cyan
& git remote -v

# --- Step 4: ensure .gitignore exists (.env must never be committed) ---
if (-not (Test-Path (Join-Path $here '.gitignore'))) {
  Write-Host ''
  Write-Host 'Creating .gitignore...' -ForegroundColor Yellow
@"
node_modules
.next
out
.env
.env*.local
prisma/dev.db
prisma/dev.db-journal
.netlify
"@ | Set-Content -Encoding UTF8 (Join-Path $here '.gitignore')
}

# --- Step 5: stage + commit (allow empty for re-push) ---
Write-Host ''
Write-Host '=== Staging changes ===' -ForegroundColor Cyan
& git add -A
$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
& git commit -m "Got Mail initial push $stamp" --allow-empty | Out-Host

# --- Step 6: push (force-u main on first run, normal push after) ---
Write-Host ''
Write-Host '=== Pushing to main ===' -ForegroundColor Cyan
Write-Host 'If this is your first push, a Git Credential Manager window will pop up.'
& git push -u origin main
if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host 'First push failed. Retrying with --force (overwrites any placeholder commit on GitHub)...' -ForegroundColor Yellow
  & git push -u origin main --force
}

Write-Host ''
Write-Host '=== DONE ===' -ForegroundColor Green
Write-Host 'Netlify will auto-build if you have the repo connected.'
Write-Host 'If not, visit https://app.netlify.com/start to connect it.'
