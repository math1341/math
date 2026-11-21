@echo off
title ProTest Launcher
color 0b
echo ========================================================
echo           ProTest Platformasini Ishga Tushirish
echo ========================================================
echo.

set "PATH=%LOCALAPPDATA%\Programs\nodejs;%LOCALAPPDATA%\Programs\git\cmd;%PATH%"
set "ROLLUP_FORCE_WASM=true"

echo [1/3] Backend API tekshirilmoqda...
start "ProTest Backend API (Port 4000)" cmd /k "cd /d %~dp0backend && set PATH=%LOCALAPPDATA%\Programs\nodejs;%LOCALAPPDATA%\Programs\git\cmd;%PATH% && node dist/src/main"

timeout /t 3 /nobreak >nul

echo [2/3] Web Frontend ishga tushirilmoqda...
start "ProTest Web Frontend (Port 3000)" cmd /k "cd /d %~dp0web && set PATH=%LOCALAPPDATA%\Programs\nodejs;%LOCALAPPDATA%\Programs\git\cmd;%PATH% && set ROLLUP_FORCE_WASM=true && npx vite --port 3000 --host"

timeout /t 2 /nobreak >nul

echo [3/3] Brauzer ochilmoqda: http://localhost:3000
start http://localhost:3000

echo.
echo ========================================================
echo   ProTest muvaffaqiyatli ishga tushirildi!
echo   Web-sayt: http://localhost:3000
echo   API Hujjati: http://localhost:4000/api/docs
echo ========================================================
echo.
pause
