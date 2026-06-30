$ErrorActionPreference = "Stop"
$ServerDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = Join-Path $ServerDir ".venv\Scripts\python.exe"

if (-not (Test-Path $Python)) {
    throw "Ambiente non installato. Esegui prima server\install.ps1"
}

Set-Location $ServerDir
& $Python -m uvicorn app:app --host 127.0.0.1 --port 8765

