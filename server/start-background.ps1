$ErrorActionPreference = "Stop"

$ServerDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ServerDir
$Python = Join-Path $ServerDir ".venv\Scripts\python.exe"
$LogDir = Join-Path $ProjectDir "logs"
$OutLog = Join-Path $LogDir "whisper-server.out.log"
$ErrLog = Join-Path $LogDir "whisper-server.err.log"
$HealthUrl = "http://127.0.0.1:8765/health"

if (-not (Test-Path $Python)) {
    throw "Ambiente non installato. Esegui prima server\install.ps1"
}

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

try {
    $health = Invoke-RestMethod -Uri $HealthUrl -TimeoutSec 3
    Write-Host "Servizio Whisper gia' attivo: $($health.model), loaded=$($health.loaded)"
    exit 0
} catch {
    # Non e' ancora attivo: lo avviamo sotto.
}

$process = Start-Process `
    -FilePath $Python `
    -ArgumentList @("-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8765") `
    -WorkingDirectory $ServerDir `
    -WindowStyle Hidden `
    -RedirectStandardOutput $OutLog `
    -RedirectStandardError $ErrLog `
    -PassThru

for ($attempt = 1; $attempt -le 20; $attempt++) {
    Start-Sleep -Milliseconds 500
    try {
        $health = Invoke-RestMethod -Uri $HealthUrl -TimeoutSec 2
        Write-Host "Servizio Whisper avviato. PID=$($process.Id), model=$($health.model), loaded=$($health.loaded)"
        Write-Host "Log: $OutLog"
        exit 0
    } catch {
        if ($process.HasExited) {
            break
        }
    }
}

Write-Host "Servizio Whisper non raggiungibile dopo l'avvio."
Write-Host "Log errore: $ErrLog"
if (Test-Path $ErrLog) {
    Get-Content -Path $ErrLog -Tail 80
}
exit 1
