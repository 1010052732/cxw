@echo off
chcp 65001 >nul
title 数智分析平台 - 一键启动
cd /d "%~dp0"

echo.
echo  数智分析平台 · 生产环境一键启动
echo  部署目录: %CD%
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [错误] 未找到 Node.js，请先安装: https://nodejs.org/
  echo.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
if errorlevel 1 (
  echo.
  echo 启动失败，请查看上方错误信息。
  pause
  exit /b 1
)

pause
