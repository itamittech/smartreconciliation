@echo off
cd frontend

echo ============================================
echo  Smart Reconciliation - Frontend
echo ============================================

echo.
echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)

echo.
echo [2/3] Type-checking...
call node_modules\.bin\tsc --noEmit
if errorlevel 1 (
    echo.
    echo [ERROR] TypeScript errors found. Fix errors before starting.
    pause
    exit /b 1
)

echo.
echo [3/3] Starting frontend in a new window on http://localhost:5173 ...
echo       To stop the frontend, press Ctrl+C in the new window.
echo.
start "Smart Reconciliation Frontend" cmd /k "npm run dev"
