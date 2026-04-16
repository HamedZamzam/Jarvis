@echo off
chcp 65001 >nul 2>&1
title Jarvis - Voice to Tasks

echo.
echo  ========================================
echo   Jarvis - Voice to Tasks
echo  ========================================
echo.

REM Add Node.js to PATH
set "PATH=C:\Program Files\nodejs;%PATH%"

REM Verify node works
node --version >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Node.js is not installed!
    echo  Download it from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo  Node.js found.

REM Go to the folder where this bat file lives
cd /d "%~dp0"

REM Install dependencies if needed
if not exist "node_modules\next" (
    echo.
    echo  Installing dependencies... please wait a few minutes...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  ERROR: npm install failed.
        pause
        exit /b 1
    )
    echo.
    echo  Dependencies installed!
    echo.
)

REM Create .env.local if missing
if not exist ".env.local" (
    echo.
    echo  ================================================
    echo   FIRST TIME SETUP - API Keys Required
    echo  ================================================
    echo.
    echo  A config file will open in Notepad.
    echo  Replace the placeholder values with your real keys.
    echo  Then SAVE the file and run this script again.
    echo.
    copy ".env.local.example" ".env.local" >nul
    start /wait notepad "%~dp0.env.local"
    echo.
    echo  Config saved. Run this file again to start Jarvis.
    pause
    exit /b 0
)

REM Clean build
if not exist ".next\BUILD_ID" (
    echo.
    echo  Building the app... this takes about 1-2 minutes...
    echo.
    call npx next build
    if errorlevel 1 (
        echo.
        echo  ERROR: Build failed. Check your .env.local file.
        pause
        exit /b 1
    )
    echo.
    echo  Build complete!
)

REM Kill anything on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo  ========================================
echo   Jarvis is starting...
echo   Open: http://localhost:3000
echo  ========================================
echo.

REM Open browser after 3 seconds
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

REM Start the server
call npx next start -p 3000
pause
