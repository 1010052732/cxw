# Push project to GitHub
# Prerequisites:
# 1. Git installed (D:\git\Git)
# 2. GitHub CLI installed and logged in: gh auth login
# 3. Optional local identity:
#    git config user.name "Your Name"
#    git config user.email "your@email.com"

$ErrorActionPreference = "Stop"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Set-Location $PSScriptRoot\..

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "Git not found. Install Git or restart terminal after installation."
}

if (-not (Test-Path .git)) {
  git init
  git branch -M main
}

$status = git status --porcelain
if ($status) {
  git add .
  $name = git config user.name
  $email = git config user.email
  if ($name -and $email) {
    git commit -m "Update: digital trade intelligence platform"
  } else {
    git -c user.name="Digital Trade Platform" -c user.email="noreply@local" commit -m "Update: digital trade intelligence platform"
    Write-Host "Tip: set local identity with git config user.name / user.email"
  }
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "GitHub CLI (gh) not found. Install with: winget install GitHub.cli"
}

gh auth status
if ($LASTEXITCODE -ne 0) {
  Write-Host "Run: gh auth login"
  exit 1
}

$remote = git remote get-url origin 2>$null
if (-not $remote) {
  gh repo create digital-trade-intelligence-platform --public --source=. --remote=origin --push
} else {
  git push -u origin main
}

Write-Host "Done. Remote:" (git remote get-url origin)
