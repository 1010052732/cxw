@echo off
chcp 65001 >nul
title 数智分析平台 - 开发模式
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-dev.ps1"
pause
