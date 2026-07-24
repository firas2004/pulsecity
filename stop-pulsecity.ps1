# Stops the local PulseCity frontend port-forward.

$ErrorActionPreference = 'Stop'

Write-Host "Stopping PulseCity frontend port-forward..." -ForegroundColor Cyan

Get-Process kubectl -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Job -Name '*' -ErrorAction SilentlyContinue | Remove-Job -Force -ErrorAction SilentlyContinue

Write-Host "PulseCity port-forward stopped." -ForegroundColor Green
