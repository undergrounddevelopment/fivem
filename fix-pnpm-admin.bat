@echo off
echo Checking admin rights...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as admin - fixing pnpm...
    cd /d "%~dp0"
    pnpm store prune
    if exist node_modules rmdir /s /q node_modules
    if exist pnpm-lock.yaml del pnpm-lock.yaml
    pnpm install
    echo Fixed! Run: pnpm dev
) else (
    echo Need admin rights - restarting as admin...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
)
pause