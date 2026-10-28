@echo off
chcp 65001 > nul
title Bloons TD Battles — Multiplayer & Web Server
echo ============================================================
echo   Bloons TD Battles — تشغيل سيرفر اللعب الجماعي والويب
echo ============================================================
C:\Users\moham\development\nodejs\node.exe "%~dp0server.js"
pause
