# 数智分析平台 · 一键启动（生产静态服务，支持局域网访问）
$ErrorActionPreference = "Stop"

$DeployRoot = Split-Path $PSScriptRoot -Parent
if ((Split-Path $DeployRoot -Leaf) -eq "scripts") {
  $DeployRoot = Split-Path $DeployRoot -Parent
}
if (Test-Path (Join-Path $PSScriptRoot "web\index.html")) {
  $DeployRoot = $PSScriptRoot
}

$WebDir = Join-Path $DeployRoot "web"
$Port = if ($env:DTIP_PORT) { [int]$env:DTIP_PORT } else { 4173 }

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

function Write-Title($text) {
  Write-Host "========================================" -ForegroundColor Cyan
  Write-Host "  $text" -ForegroundColor Cyan
  Write-Host "========================================" -ForegroundColor Cyan
}

function Get-LanIp {
  try {
    return (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
      Where-Object { $_.IPAddress -notlike "127.*" -and $_.PrefixOrigin -ne "WellKnown" } |
      Select-Object -First 1 -ExpandProperty IPAddress)
  } catch {
    return $null
  }
}

Write-Title "数智分析平台 · 一键启动"
Write-Host "部署目录: $DeployRoot" -ForegroundColor Gray

if (-not (Test-Path (Join-Path $WebDir "index.html"))) {
  Write-Error "未找到 web\index.html，请确认部署包完整（需包含 web 目录）。"
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "未找到 Node.js，请先安装 LTS 版本：https://nodejs.org/"
}

Set-Location $DeployRoot
Write-Host "`nNode 版本: $(node -v)" -ForegroundColor Yellow

if (-not (Test-Path (Join-Path $DeployRoot "node_modules\serve"))) {
  Write-Host "`n[1/2] 首次运行，安装静态服务依赖..." -ForegroundColor Yellow
  npm install --no-fund --no-audit
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
  Write-Host "`n[1/2] 依赖已就绪" -ForegroundColor Green
}

Write-Host "`n[2/2] 启动 Web 服务（局域网可访问）..." -ForegroundColor Yellow
$lanIp = Get-LanIp
Write-Host "  本机访问: http://localhost:$Port/" -ForegroundColor Green
if ($lanIp) {
  Write-Host "  局域网访问: http://${lanIp}:$Port/" -ForegroundColor Green
}
Write-Host "  按 Ctrl+C 停止服务`n" -ForegroundColor Gray

Start-Sleep -Seconds 1
try { Start-Process "http://localhost:$Port/" } catch { }

npm run start:lan
