@echo off
title GitHub-ga Yuklash
color 0a
echo ========================================================
echo       ProTest Loyihasini GitHub-ga Yuklash
echo       Repozitoriy: https://github.com/math1341/math
echo ========================================================
echo.

set "PATH=%LOCALAPPDATA%\Programs\git\cmd;%PATH%"

echo Fayllar GitHub-ga yuklanmoqda...
git push -u origin main --force

echo.
echo ========================================================
echo   Agar yuqorida muvaffaqiyatli deb chiqqan bo'lsa,
echo   saytingizni tekshiring: https://github.com/math1341/math
echo ========================================================
echo.
pause
