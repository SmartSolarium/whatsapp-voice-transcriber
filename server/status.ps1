$ErrorActionPreference = "Stop"

$HealthUrl = "http://127.0.0.1:8765/health"

try {
    $health = Invoke-RestMethod -Uri $HealthUrl -TimeoutSec 3
    Write-Host "OK - Servizio Whisper raggiungibile"
    $health | ConvertTo-Json -Compress
} catch {
    Write-Host "NON RAGGIUNGIBILE - avvia con .\server\start-background.ps1"
    exit 1
}
