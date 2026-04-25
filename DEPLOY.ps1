# Got Mail -> Netlify auto-deploy via GitHub
# Commits whatever's currently in this folder and pushes to origin/main.
# Netlify is linked to the repo and auto-builds on every push.
#
# Robustness fixes (2026-04-24):
#   - Clears stale .git/index.lock if present
#   - Pushes even when working tree is clean if there are unpushed commits
#   - Falls back to --force-with-lease on non-fast-forward
#   - Always reports final status, never silently exits

$ErrorActionPreference = 'Continue'
$PSNativeCommandUseErrorActionPreference = $false

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

Write-Host ''
Write-Host '=======================================' -ForegroundColor Cyan
Write-Host '  Got Mail -> Netlify (via GitHub)' -ForegroundColor Cyan
Write-Host '=======================================' -ForegroundColor Cyan
Write-Host ''

# --- 0. Clean up stale git locks (a previous interrupted git command can leave one) ---
$lock = Join-Path $here '.git\index.lock'
if (Test-Path $lock) {
  Write-Host 'Found stale .git/index.lock - removing it.' -ForegroundColor Yellow
  Remove-Item $lock -Force -ErrorAction SilentlyContinue
}

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

# --- 2. Ensure git identity exists ---
$gitName  = (& git config --get user.name)  2>$null
$gitEmail = (& git config --get user.email) 2>$null
if (-not $gitName -or -not $gitEmail) {
  Write-Host 'Setting git identity (one-time)...' -ForegroundColor Yellow
  if (-not $gitName)  { & git config --global user.name  'TKDL' }
  if (-not $gitEmail) { & git config --global user.email 'tyrrellkdlemons@gmail.com' }
}

# --- 3. Ensure branch is main ---
$branch = (& git symbolic-ref --short HEAD) 2>$null
if (-not $branch) {
  & git checkout -b main 2>$null
} elseif ($branch -ne 'main') {
  & git branch -M main
}

# --- 4. Ensure origin remote ---
$currentRemote = (& git remote get-url origin 2>$null)
if (-not $currentRemote) {
  Write-Host 'Adding origin remote...' -ForegroundColor Yellow
  & git remote add origin 'https://github.com/Tyrrellkdlemons/got-mail.git'
}

# --- 5. Show current status ---
Write-Host '=== Current status ===' -ForegroundColor Cyan
& git status --short
Write-Host ''

# --- 6. Stage everything ---
Write-Host '=== Staging ===' -ForegroundColor Cyan
& git add -A

# --- 7. Determine what we need to do ---
$stagedFiles = (& git diff --cached --name-only) | Where-Object { $_ }
$hasStaged = $stagedFiles.Count -gt 0

# Check whether we have local commits not yet on origin/main.
# Try to fetch first so the count is accurate. Failure is OK - we'll still try.
& git fetch origin main 2>$null | Out-Null
$ahead = 0
try {
  $aheadRaw = (& git rev-list --count 'origin/main..HEAD' 2>$null)
  if ($aheadRaw) { $ahead = [int]$aheadRaw }
} catch { $ahead = 0 }

Write-Host ''
Write-Host ("Working tree changes staged: " + $stagedFiles.Count) -ForegroundColor Cyan
Write-Host ("Local commits ahead of origin/main: " + $ahead) -ForegroundColor Cyan
Write-Host ''

# --- 8. Commit if there are staged changes ---
if ($hasStaged) {
  Write-Host '=== Committing staged changes ===' -ForegroundColor Cyan
  $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
  & git commit -m "Got Mail deploy $stamp"
  if ($LASTEXITCODE -ne 0) {
    Write-Host 'Commit failed.' -ForegroundColor Red
    exit 1
  }
  $ahead = $ahead + 1
} else {
  Write-Host 'No working-tree changes to commit.' -ForegroundColor Yellow
}

# --- 9. Push if there's anything to push, OR if user explicitly wants to verify sync ---
if ($ahead -gt 0) {
  Write-Host ''
  Write-Host ("=== Pushing $ahead commit(s) to origin/main ===") -ForegroundColor Cyan
  Write-Host '(If Git Credential Manager pops up, sign into GitHub in that window.)'
  & git push -u origin main
  if ($LASTEXITCODE -ne 0) {
    Write-Host ''
    Write-Host 'Normal push failed. Trying --force-with-lease (safe force; only overwrites if remote matches our last fetch)...' -ForegroundColor Yellow
    & git push -u origin main --force-with-lease
    if ($LASTEXITCODE -ne 0) {
      Write-Host ''
      Write-Host 'Push still failed. Possible causes:' -ForegroundColor Red
      Write-Host '  - GitHub auth window was dismissed - re-run this script.' -ForegroundColor Red
      Write-Host '  - No internet / GitHub down.' -ForegroundColor Red
      Write-Host '  - Branch protection on origin/main blocks force-push.' -ForegroundColor Red
      exit 1
    }
  }
  Write-Host ''
  Write-Host '=== DONE ===' -ForegroundColor Green
  Write-Host 'Watch the Netlify build: https://app.netlify.com/projects/got-mail/deploys'
} else {
  Write-Host '=== Nothing to push - origin/main is already up to date. ===' -ForegroundColor Green
  Write-Host 'If you expected changes to deploy:' -ForegroundColor Yellow
  Write-Host '  - Make sure you edited files INSIDE this folder.' -ForegroundColor Yellow
  Write-Host '  - Check `git log --oneline -5` to see what was last committed.' -ForegroundColor Yellow
}
