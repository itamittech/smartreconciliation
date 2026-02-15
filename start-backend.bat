@echo off
set JAVA_HOME=C:\Users\test\.jdks\openjdk-24.0.1
set PATH=%JAVA_HOME%\bin;%PATH%

echo ============================================
echo  Smart Reconciliation - Backend
echo ============================================

echo.
echo [1/2] Compiling...
mvnw.cmd compile
if errorlevel 1 (
    echo.
    echo [ERROR] Compilation failed. Fix errors before starting.
    pause
    exit /b 1
)

echo.
echo [2/2] Starting backend on http://localhost:8080 ...
echo       Press Ctrl+C to stop.
echo.
mvnw.cmd spring-boot:run
if errorlevel 1 (
    echo.
    echo [ERROR] Backend exited with an error.
    pause
    exit /b 1
)

pause
