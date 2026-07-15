# 数智分析平台 · 本地一键启动（拉取更新 + 安装依赖 + 启动开发服务）
$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$GitExe = "D:\git\Git\cmd\git.exe"
if (-not (Test-Path $GitExe)) { $GitExe = "git" }

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Set-Location $ProjectRoot
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  数智分析平台 · 本地一键启动" -ForegroundColor Cyan
Write-Host "  项目: $ProjectRoot" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[1/4] 拉取最新代码..." -ForegroundColor Yellow
if (Test-Path (Join-Path $ProjectRoot ".git")) {
  & $GitExe -C $ProjectRoot pull origin main 2>&1 | ForEach-Object { Write-Host $_ }
} else {
  Write-Host "  跳过：非 Git 仓库" -ForegroundColor Gray
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "未找到 Node.js，请先安装 https://nodejs.org/"
}
Write-Host "`n[2/4] Node $(node -v)" -ForegroundColor Yellow

Write-Host "`n[3/4] 安装依赖..." -ForegroundColor Yellow
npm install --no-fund --no-audit
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n[4/4] 启动开发服务（新窗口）..." -ForegroundColor Yellow
Write-Host "  前端: http://localhost:5173" -ForegroundColor Green
Write-Host "  数据: 内置 Mock（.env 已含高德 Key）" -ForegroundColor Green
Write-Host "  关闭「Vite 开发服务」窗口即可停止`n" -ForegroundColor Gray

$devCmd = "Set-Location '$ProjectRoot'; Write-Host 'Vite 开发服务运行中...' -ForegroundColor Green; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-NoProfile", "-Command", $devCmd -WindowStyle Normal

Start-Sleep -Seconds 4
foreach ($port in @(5173, 5174, 5175)) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:$port/" -UseBasicParsing -TimeoutSec 2
    if ($r.StatusCode -eq 200) {
      Start-Process "http://localhost:$port/"
      Write-Host "已打开浏览器: http://localhost:$port/" -ForegroundColor Green
      break
    }
  } catch { }
}

Write-Host "`n启动完成。本窗口可关闭。" -ForegroundColor Cyan
Start-Sleep -Seconds 2
