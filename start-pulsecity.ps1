# Requires PowerShell 5.1+
# Starts the local PulseCity frontend port-forward so the app is reachable at http://127.0.0.1:30080

$ErrorActionPreference = 'Stop'

$port = 30080
$service = 'svc/pulsecity-frontend'
$target = '80'

Write-Host "Starting PulseCity frontend port-forward on http://127.0.0.1:$port" -ForegroundColor Cyan

$existing = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existing) {
    Write-Host "Port $port is already in use. Assuming the app is already running." -ForegroundColor Yellow
    Start-Process "http://127.0.0.1:$port"
    return
}

$job = Start-Job -ScriptBlock {
    param($svc, $port, $target)
    kubectl port-forward $svc "${port}:$target"
} -ArgumentList $service, $port, $target

Start-Sleep -Seconds 3

try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$port" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "PulseCity is reachable at http://127.0.0.1:$port" -ForegroundColor Green
    Start-Process "http://127.0.0.1:$port"
}
catch {
    Write-Host "The frontend may still be starting. Check the job output or wait a few seconds." -ForegroundColor Yellow
}

Write-Host "Port-forward job ID: $($job.Id)" -ForegroundColor DarkGray
Write-Host "Press Ctrl+C in the job terminal or run stop-pulsecity.ps1 to stop it." -ForegroundColor DarkGray
