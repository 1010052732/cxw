@echo off
chcp 65001 >nul
title 打包部署包到桌面 jmx
cd /d "%~dp0.."
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0pack-jmx.ps1"
echo.
pause
