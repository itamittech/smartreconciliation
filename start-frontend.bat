@echo off
cd frontend

echo ============================================
echo  Smart Reconciliation - Frontend
echo ============================================

echo.
echo [1/3] Installing dependencies...
npm install
if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)

echo.
echo [2/3] Type-checking...
node_modules\.bin\tsc --noEmit
if errorlevel 1 (
    echo.
    echo [ERROR] TypeScript errors found. Fix errors before starting.
    pause
    exit /b 1
)

echo.
echo [3/3] Starting frontend on http://localhost:5173 ...
echo       Press Ctrl+C to stop.
echo.
npm run dev
if errorlevel 1 (
    echo.
    echo [ERROR] Frontend exited with an error.
    pause
    exit /b 1
)

pause
