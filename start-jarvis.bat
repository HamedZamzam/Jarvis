@echo off
title Jarvis - Voice to Tasks
echo.
echo  ========================================
echo   Jarvis - Voice to Tasks
echo  ========================================
echo.

:: Find Node.js
set "NODEPATH="
if exist "C:\Program Files\nodejs\node.exe" set "NODEPATH=C:\Program Files\nodejs"
if exist "C:\Program Files (x86)\nodejs\node.exe" set "NODEPATH=C:\Program Files (x86)\nodejs"

if "%NODEPATH%"=="" (
    echo  ERROR: Node.js not found!
    echo  Please install Node.js from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo  Found Node.js at: %NODEPATH%
set "PATH=%NODEPATH%;%PATH%"

:: Go to app directory
cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules" (
    echo.
    echo  Installing dependencies (first time only)...
    echo  This may take a few minutes...
    echo.
    call npm install
    if errorlevel 1 (
        echo  ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Check if .env.local exists
if not exist ".env.local" (
    echo.
    echo  ========================================
    echo   FIRST TIME SETUP
    echo  ========================================
    echo.
    echo  You need to create a .env.local file with your API keys.
    echo  I'll create one for you now. Please edit it with your keys.
    echo.
    copy ".env.local.example" ".env.local" >nul
    echo  Created .env.local - please edit it with your API keys!
    echo  File location: %CD%\.env.local
    echo.
    echo  Open it in Notepad and fill in your keys, then run this again.
    notepad ".env.local"
    pause
    exit /b 0
)

:: Build the app if not built yet
if not exist ".next" (
    echo.
    echo  Building the app (first time only)...
    echo.
    call npx next build
    if errorlevel 1 (
        echo  ERROR: Build failed
        pause
        exit /b 1
    )
)

echo.
echo  Starting Jarvis...
echo.
echo  ========================================
echo   Open your browser and go to:
echo   http://localhost:3000
echo  ========================================
echo.
echo  Press Ctrl+C to stop the server.
echo.

:: Start the server
call npx next start -p 3000
