@echo off
title ProTest Stopper
color 0c
echo ========================================================
echo           ProTest Jarayonlarini To'xtatish
echo ========================================================
echo.

echo ProTest serverlari to'xtatilmoqda...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a 2>nul

echo ProTest serverlari muvaffaqiyatli to'xtatildi!
echo.
pause
