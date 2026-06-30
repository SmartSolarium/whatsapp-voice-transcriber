$ErrorActionPreference = "Stop"
$ServerDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$VenvDir = Join-Path $ServerDir ".venv"

if (-not (Test-Path $VenvDir)) {
    python -m venv $VenvDir
}

$Python = Join-Path $VenvDir "Scripts\python.exe"
& $Python -m pip install --upgrade pip
& $Python -m pip install -r (Join-Path $ServerDir "requirements.txt")

Write-Host "Installazione completata. Avvia con server\start-background.ps1" -ForegroundColor Green
