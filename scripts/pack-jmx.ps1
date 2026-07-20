# Pack deployment bundle to Desktop\jmx
$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$BuildOut = "D:\shuchu"
$DesktopJmx = Join-Path $env:USERPROFILE "Desktop\jmx"
$DeployTemplate = Join-Path $PSScriptRoot "jmx-deploy"

Set-Location $ProjectRoot

Write-Host "========================================"
Write-Host "  Pack deploy bundle -> Desktop\jmx"
Write-Host "========================================"

Write-Host ""
Write-Host "[1/4] Building frontend..."
if (Test-Path $BuildOut) {
  Remove-Item $BuildOut -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $BuildOut -Force | Out-Null
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not (Test-Path (Join-Path $BuildOut "index.html"))) {
  throw "Build output missing: $BuildOut\index.html"
}

Write-Host ""
Write-Host "[2/4] Preparing $DesktopJmx ..."
if (Test-Path $DesktopJmx) {
  Remove-Item $DesktopJmx -Recurse -Force
}
New-Item -ItemType Directory -Path $DesktopJmx -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $DesktopJmx "web") -Force | Out-Null

Write-Host ""
Write-Host "[3/4] Copying static files and start scripts..."
$webDest = Join-Path $DesktopJmx "web"
Copy-Item (Join-Path $BuildOut "index.html") $webDest -Force
if (Test-Path (Join-Path $BuildOut "assets")) {
  Copy-Item (Join-Path $BuildOut "assets") $webDest -Recurse -Force
}
Get-ChildItem -Path $BuildOut -Filter "*.svg" -File | ForEach-Object {
  Copy-Item $_.FullName $webDest -Force
}

$deployFiles = @(
  "package.json",
  "start.ps1",
  "start.sh",
  "start-dev.ps1",
  "START.bat",
  "README.txt"
)
foreach ($file in $deployFiles) {
  $src = Join-Path $DeployTemplate $file
  if (Test-Path $src) {
    Copy-Item $src (Join-Path $DesktopJmx $file) -Force
  }
}

# Copy bat files with Chinese names separately
$batFiles = Get-ChildItem -Path $DeployTemplate -Filter "*.bat"
foreach ($bat in $batFiles) {
  Copy-Item $bat.FullName (Join-Path $DesktopJmx $bat.Name) -Force
}

$versionFile = Join-Path $ProjectRoot "VERSION"
if (Test-Path $versionFile) {
  Copy-Item $versionFile (Join-Path $DesktopJmx "VERSION") -Force
} else {
  Set-Content -Path (Join-Path $DesktopJmx "VERSION") -Value "0.2.0" -Encoding UTF8
}

Write-Host ""
Write-Host "[4/4] Installing serve in deploy bundle..."
Set-Location $DesktopJmx
npm install --no-fund --no-audit
if ($LASTEXITCODE -ne 0) {
  Write-Host "  npm install failed; target machine will install on first start."
}

$fileCount = (Get-ChildItem -Path $webDest -Recurse -File).Count
$webSizeMb = [math]::Round(((Get-ChildItem -Path $webDest -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB), 1)
$totalSizeMb = [math]::Round(((Get-ChildItem -Path $DesktopJmx -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB), 1)

Write-Host ""
Write-Host "========================================"
Write-Host "  Done!"
Write-Host "  Path: $DesktopJmx"
Write-Host "  Static files: $fileCount (web ~${webSizeMb} MB, total ~${totalSizeMb} MB)"
Write-Host "  Start: double-click START.bat or launch bat in jmx folder"
Write-Host "  URL:   http://localhost:4173/"
Write-Host "========================================"
Write-Host ""
