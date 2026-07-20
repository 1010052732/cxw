# 数智分析平台 · 开发模式一键启动（含源码时使用）
$ErrorActionPreference = "Stop"

$DeployRoot = $PSScriptRoot
$SourceDir = Join-Path $DeployRoot "source"

if (-not (Test-Path (Join-Path $SourceDir "package.json"))) {
  Write-Error "未找到 source\package.json。开发模式需要将完整源码放入 jmx\source 目录。"
}

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  数智分析平台 · 开发模式启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "未找到 Node.js，请先安装 https://nodejs.org/"
}

Set-Location $SourceDir
Write-Host "Node $(node -v)" -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
  Write-Host "`n安装依赖..." -ForegroundColor Yellow
  npm install --no-fund --no-audit
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "`n启动开发服务（局域网）..." -ForegroundColor Yellow
Write-Host "  http://localhost:5173" -ForegroundColor Green
npm run dev:lan
