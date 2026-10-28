@echo off
chcp 65001 > nul
title Bloons TD Battles — Web & Mobile Edition
echo ============================================================
echo   Bloons TD Battles — تشغيل السيرفر وفتح اللعبة في المتصفح
echo ============================================================
start "" "http://localhost:3000"
C:\Users\moham\development\nodejs\node.exe "%~dp0server.js"
pause
