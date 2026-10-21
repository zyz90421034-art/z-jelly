$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $projectRoot
$logRoot = Join-Path $projectRoot '.model-data'
New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

# Inherit the user's configured proxy; do not change Windows network settings.
if (-not $env:HTTPS_PROXY) {
    $proxySettings = Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -ErrorAction SilentlyContinue
    if ($proxySettings.ProxyEnable -and $proxySettings.ProxyServer -and $proxySettings.ProxyServer -notmatch ';|=') {
        $env:HTTPS_PROXY = 'http://' + $proxySettings.ProxyServer
        $env:HTTP_PROXY = $env:HTTPS_PROXY
    }
}
function Test-ModelService([string]$address) {
    try { return (Invoke-RestMethod "$address/api/health" -TimeoutSec 8).ready -eq $true } catch { return $false }
}
function Read-SharedLog([string]$path) {
    $stream = $null
    $reader = $null
    try {
        $stream = [IO.File]::Open($path, [IO.FileMode]::Open, [IO.FileAccess]::Read, ([IO.FileShare]::ReadWrite -bor [IO.FileShare]::Delete))
        $reader = [IO.StreamReader]::new($stream)
        return $reader.ReadToEnd()
    } catch [IO.IOException] { return '' }
    finally {
        if ($reader) { $reader.Dispose() }
        elseif ($stream) { $stream.Dispose() }
    }
}
if (-not (Test-ModelService 'http://127.0.0.1:7861')) {
    $shellPath = (Get-Process -Id $PID).Path
    $scriptPath = Join-Path $PSScriptRoot 'start.ps1'
    Start-Process -FilePath $shellPath -ArgumentList @('-NoProfile','-File',('"' + $scriptPath + '"')) -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logRoot "backend-$stamp.log") -RedirectStandardError (Join-Path $logRoot "backend-$stamp-error.log") | Out-Null
    $deadline = (Get-Date).AddSeconds(60)
    while (-not (Test-ModelService 'http://127.0.0.1:7861')) {
        if ((Get-Date) -gt $deadline) { throw 'Backend did not start. Check .model-data/backend-*-error.log.' }
        Start-Sleep -Seconds 2
    }
}
$configPath = Join-Path $projectRoot 'public/model-service.json'
$configured = (Get-Content $configPath -Raw | ConvertFrom-Json).url
if ($configured -and (Test-ModelService $configured)) {
    Write-Host "Public model service is ready: $configured"
    exit 0
}
$tunnelPath = Join-Path $projectRoot '.tools/cloudflared.exe'
if (-not (Test-Path -LiteralPath $tunnelPath)) { throw 'Missing .tools/cloudflared.exe. Install cloudflared from its official source.' }
# Reuse the tunnel left running if a previous launcher stopped while reading its log.
$existing = Get-CimInstance Win32_Process -Filter "Name='cloudflared.exe'" | Where-Object {
    $_.ExecutablePath -eq $tunnelPath -and $_.CommandLine -match '--url\s+http://127\.0\.0\.1:7861(?:\s|$)'
}
if ($existing) {
    $earliest = ($existing.CreationDate | Sort-Object | Select-Object -First 1).AddSeconds(-5)
    $logs = Get-ChildItem -LiteralPath $logRoot -Filter 'tunnel-*-error.log' | Where-Object { $_.CreationTime -ge $earliest } | Sort-Object LastWriteTime -Descending
    foreach ($log in $logs) {
        $candidate = [regex]::Match((Read-SharedLog $log.FullName), 'https://[a-z0-9-]+\.trycloudflare\.com').Value
        if ($candidate -and (Test-ModelService $candidate)) {
            [IO.File]::WriteAllText($configPath, (@{url=$candidate} | ConvertTo-Json -Compress), [Text.UTF8Encoding]::new($false))
            Write-Host "Public model service is ready: $candidate"
            Write-Host 'Existing tunnel reused. Send this URL back to Codex to update GitHub Pages.'
            exit 0
        }
    }
    throw 'A tunnel is already running but not ready. Check its tunnel log before starting another.'
}
$tunnelLog = Join-Path $logRoot "tunnel-$stamp-error.log"
Start-Process -FilePath $tunnelPath -ArgumentList @('tunnel','--url','http://127.0.0.1:7861','--protocol','http2','--no-autoupdate') -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logRoot "tunnel-$stamp.log") -RedirectStandardError $tunnelLog | Out-Null
$deadline = (Get-Date).AddSeconds(90)
$publicAddress = $null
while (-not $publicAddress) {
    if (Test-Path $tunnelLog) {
        $match = [regex]::Match((Read-SharedLog $tunnelLog), 'https://[a-z0-9-]+\.trycloudflare\.com')
        if ($match.Success) { $publicAddress = $match.Value }
    }
    if ((Get-Date) -gt $deadline) { throw "Tunnel did not start. Check $tunnelLog" }
    if (-not $publicAddress) { Start-Sleep -Seconds 2 }
}
$deadline = (Get-Date).AddSeconds(60)
while (-not (Test-ModelService $publicAddress)) {
    if ((Get-Date) -gt $deadline) { throw "Tunnel address exists but cannot be reached: $publicAddress" }
    Start-Sleep -Seconds 3
}
[IO.File]::WriteAllText($configPath, (@{url=$publicAddress} | ConvertTo-Json -Compress), [Text.UTF8Encoding]::new($false))
Write-Host "Public model service is ready: $publicAddress"
Write-Host 'Send this URL back to Codex to update the GitHub Pages backend address.'
Write-Host 'Keep this computer, the backend and the tunnel running. Quick Tunnel URLs change on restart.'
