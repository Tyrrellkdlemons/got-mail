# Got Mail -> GitHub push script (first-time setup OR re-push)
# Run via the PUSH_TO_GITHUB.bat wrapper, or directly:
#   powershell -ExecutionPolicy Bypass -File .\PUSH_TO_GITHUB.ps1
#
# Robustness fixes (2026-04-24):
#   - Clears stale .git/index.lock
#   - Pushes when local has unpushed commits even if working tree is clean
#   - Uses --force-with-lease on conflict (safer than --force)

$ErrorActionPreference = 'Continue'
$PSNativeCommandUseErrorActionPreference = $false

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

Write-Host ''
Write-Host '=======================================' -ForegroundColor Cyan
Write-Host '  Got Mail -> GitHub' -ForegroundColor Cyan
Write-Host '=======================================' -ForegroundColor Cyan
Write-Host ''

# --- 0. Clean up stale git locks ---
$lock = Join-Path $here '.git\index.lock'
if (Test-Path $lock) {
  Write-Host 'Found stale .git/index.lock - removing it.' -ForegroundColor Yellow
  Remove-Item $lock -Force -ErrorAction SilentlyContinue
}

# --- 1. confirm git is installed ---
$gitCheck = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCheck) {
  Write-Host 'ERROR: git is not installed or not on PATH.' -ForegroundColor Red
  Write-Host 'Install Git for Windows: https://git-scm.com/download/win' -ForegroundColor Yellow
  exit 1
}
Write-Host ("Git found: " + $gitCheck.Source)

# --- 2. ensure this folder is a git repo ---
if (-not (Test-Path (Join-Path $here '.git'))) {
  Write-Host 'No .git folder yet. Initializing...' -ForegroundColor Yellow
  & git init | Out-Null
  & git branch -M main
}

# --- 3. ensure git identity ---
$gitName  = (& git config --get user.name)  2>$null
$gitEmail = (& git config --get user.email) 2>$null
if (-not $gitName -or -not $gitEmail) {
  Write-Host 'Setting git identity (one-time)...' -ForegroundColor Yellow
  if (-not $gitName)  { & git config --global user.name  'TKDL' }
  if (-not $gitEmail) { & git config --global user.email 'tyrrellkdlemons@gmail.com' }
}

# --- 4. ensure branch is main ---
$branch = (& git symbolic-ref --short HEAD) 2>$null
if (-not $branch -or $branch -ne 'main') {
  & git checkout -B main 2>$null | Out-Null
}

# --- 5. ensure remote origin ---
$defaultRemote = 'https://github.com/Tyrrellkdlemons/got-mail.git'
$currentRemote = (& git remote get-url origin 2>$null)
if (-not $currentRemote) {
  Write-Host "Wiring remote -> $defaultRemote" -ForegroundColor Yellow
  & git remote add origin $defaultRemote
}
Write-Host '=== Remote ===' -ForegroundColor Cyan
& git remote -v
Write-Host ''

# --- 6. ensure .gitignore ---
if (-not (Test-Path (Join-Path $here '.gitignore'))) {
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

# --- 7. stage + commit (allow empty for first run) ---
Write-Host '=== Staging ===' -ForegroundColor Cyan
& git add -A
$stagedFiles = (& git diff --cached --name-only) | Where-Object { $_ }
$hasStaged = $stagedFiles.Count -gt 0

& git fetch origin main 2>$null | Out-Null
$ahead = 0
try {
  $aheadRaw = (& git rev-list --count 'origin/main..HEAD' 2>$null)
  if ($aheadRaw) { $ahead = [int]$aheadRaw }
} catch { $ahead = 0 }

Write-Host ("Staged files: " + $stagedFiles.Count + " | Local commits ahead: " + $ahead) -ForegroundColor Cyan

if ($hasStaged) {
  Write-Host '=== Committing ===' -ForegroundColor Cyan
  $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
  & git commit -m "Got Mail push $stamp"
  $ahead = $ahead + 1
} elseif ($ahead -eq 0) {
  Write-Host 'Nothing to commit and nothing to push - creating an empty commit so first push lands.' -ForegroundColor Yellow
  $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
  & git commit --allow-empty -m "Got Mail push $stamp"
  $ahead = $ahead + 1
}

# --- 8. push ---
Write-Host ''
Write-Host ("=== Pushing $ahead commit(s) to main ===") -ForegroundColor Cyan
Write-Host 'If this is your first push, a Git Credential Manager window will pop up.'
& git push -u origin main
if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host 'First push failed. Retrying with --force-with-lease (overwrites only if remote matches what we last fetched)...' -ForegroundColor Yellow
  & git push -u origin main --force-with-lease
  if ($LASTEXITCODE -ne 0) {
    Write-Host 'Force-with-lease failed too. Falling back to --force (last resort)...' -ForegroundColor Yellow
    & git push -u origin main --force
    if ($LASTEXITCODE -ne 0) {
      Write-Host 'Push still failed. Re-run this script after signing into GitHub in the popup.' -ForegroundColor Red
      exit 1
    }
  }
}

Write-Host ''
Write-Host '=== DONE ===' -ForegroundColor Green
Write-Host 'Netlify will auto-build if the repo is connected.'
Write-Host 'Watch: https://app.netlify.com/projects/got-mail/deploys'
