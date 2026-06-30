@echo off
setlocal
cd /d "%~dp0"

echo.
echo ===============================================
echo  WhatsApp Voice Transcriber - Installazione
echo ===============================================
echo.
echo Questo script installa il servizio locale Whisper e lo avvia.
echo Se Windows chiede conferme di sicurezza, accettare solo se il file
echo arriva dal repository SmartSolarium/whatsapp-voice-transcriber.
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0server\install.ps1"
if errorlevel 1 (
  echo.
  echo ERRORE: installazione non riuscita.
  echo Verifica che Python 3.10+ sia installato.
  echo.
  pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0server\start-background.ps1"
if errorlevel 1 (
  echo.
  echo ERRORE: servizio Whisper non avviato.
  echo.
  pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0server\status.ps1"

echo.
echo Installazione completata.
echo Ora apri Chrome, vai su chrome://extensions, attiva Modalita sviluppatore
echo e carica la cartella "extension" con "Carica estensione non pacchettizzata".
echo.
pause
