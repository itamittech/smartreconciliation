@echo off
set JAVA_HOME=C:\Users\test\.jdks\openjdk-24.0.1
set PATH=%JAVA_HOME%\bin;%PATH%

echo ============================================
echo  Smart Reconciliation - Backend
echo ============================================

echo.
echo [1/2] Compiling...
call mvnw.cmd compile
if errorlevel 1 (
    echo.
    echo [ERROR] Compilation failed. Fix errors before starting.
    pause
    exit /b 1
)

echo.
echo [2/2] Starting backend in a new window on http://localhost:8080 ...
echo       To stop the backend, press Ctrl+C in the new window.
echo.
start "Smart Reconciliation Backend" cmd /k "mvnw.cmd spring-boot:run"
