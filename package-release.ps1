$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ManifestPath = Join-Path $ProjectDir "extension\manifest.json"
$Version = (Get-Content $ManifestPath -Raw | ConvertFrom-Json).version
$ReleaseDir = Join-Path $ProjectDir "release"
$StagingDir = Join-Path $ReleaseDir "whatsapp-voice-transcriber-$Version"
$ZipPath = Join-Path $ReleaseDir "whatsapp-voice-transcriber-$Version-office.zip"
$ExtensionZipPath = Join-Path $ReleaseDir "whatsapp-voice-transcriber-$Version-extension-only.zip"

New-Item -ItemType Directory -Force -Path $ReleaseDir | Out-Null

if (Test-Path $StagingDir) {
    Remove-Item -LiteralPath $StagingDir -Recurse -Force
}
if (Test-Path $ZipPath) {
    Remove-Item -LiteralPath $ZipPath -Force
}
if (Test-Path $ExtensionZipPath) {
    Remove-Item -LiteralPath $ExtensionZipPath -Force
}

New-Item -ItemType Directory -Force -Path $StagingDir | Out-Null

Copy-Item -Path (Join-Path $ProjectDir "extension") -Destination (Join-Path $StagingDir "extension") -Recurse
Copy-Item -Path (Join-Path $ProjectDir "server") -Destination (Join-Path $StagingDir "server") -Recurse -Exclude ".venv", "__pycache__"
Copy-Item -Path (Join-Path $ProjectDir "README.md") -Destination $StagingDir
Copy-Item -Path (Join-Path $ProjectDir "INSTALLA_COLLEGHE.md") -Destination $StagingDir
Copy-Item -Path (Join-Path $ProjectDir "ISTRUZIONI_RAPIDE_COLLEGHE.md") -Destination $StagingDir
Copy-Item -Path (Join-Path $ProjectDir "INSTALLA.bat") -Destination $StagingDir
Copy-Item -Path (Join-Path $ProjectDir "AVVIA_WHISPER.bat") -Destination $StagingDir

$VenvInStaging = Join-Path $StagingDir "server\.venv"
if (Test-Path $VenvInStaging) {
    Remove-Item -LiteralPath $VenvInStaging -Recurse -Force
}
$PycacheInStaging = Join-Path $StagingDir "server\__pycache__"
if (Test-Path $PycacheInStaging) {
    Remove-Item -LiteralPath $PycacheInStaging -Recurse -Force
}

Compress-Archive -Path (Join-Path $StagingDir "*") -DestinationPath $ZipPath -Force
Compress-Archive -Path (Join-Path $ProjectDir "extension\*") -DestinationPath $ExtensionZipPath -Force

Write-Host "Creato pacchetto: $ZipPath" -ForegroundColor Green
Write-Host "Creato pacchetto estensione: $ExtensionZipPath" -ForegroundColor Green
