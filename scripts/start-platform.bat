@echo off
chcp 65001 >nul
title 数智分析平台 - 一键启动
cd /d "%~dp0.."
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-platform.ps1"
if errorlevel 1 (
  echo.
  echo 启动失败，请检查 Node.js / Git / 网络。
  pause
)
