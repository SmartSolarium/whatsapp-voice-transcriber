@echo off
setlocal
cd /d "%~dp0"

echo Avvio servizio Whisper locale...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0server\start-background.ps1"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0server\status.ps1"

echo.
echo Se lo stato e OK, puoi usare WhatsApp Web.
echo.
pause
