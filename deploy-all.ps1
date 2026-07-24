#!/usr/bin/env pwsh
# deploy-all.ps1 - PulseCity full rebuild and deploy
# Run from: c:\Users\user\Desktop\pulsecity

$ErrorActionPreference = "Stop"
$PROJECT = "c:\Users\user\Desktop\pulsecity"
Set-Location $PROJECT
$env:DOCKER_BUILDKIT = "1"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  PulseCity - Full Rebuild and Deploy" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

function Invoke-CheckedCommand {
    param(
        [string]$Command,
        [string[]]$Arguments
    )

    & $Command $Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed: $Command $($Arguments -join ' ')"
    }
}

Write-Host "`n[1/6] Building pulsecity-backend:v2 ..." -ForegroundColor Yellow
Invoke-CheckedCommand -Command "docker" -Arguments @("build", "--load", "-t", "pulsecity-backend:v2", "./backend-v2")
Write-Host "✅ Backend image built." -ForegroundColor Green

Write-Host "`n[2/6] Building pulsecity-frontend:v2 ..." -ForegroundColor Yellow
Invoke-CheckedCommand -Command "docker" -Arguments @("build", "--load", "-t", "pulsecity-frontend:v2", "./frontend")
Write-Host "✅ Frontend image built." -ForegroundColor Green

Write-Host "`n[3/6] Building pulsecity-sensor:v4 ..." -ForegroundColor Yellow
try {
    Invoke-CheckedCommand -Command "docker" -Arguments @("build", "--load", "-t", "pulsecity-sensor:v4", "./iot-simulator")
    Write-Host "✅ Simulator image built." -ForegroundColor Green
}
catch {
    Write-Host "WARN: Simulator build failed - skipping." -ForegroundColor DarkYellow
}

Write-Host "`n[4/6] Loading images into Kind cluster ..." -ForegroundColor Yellow
try {
    Invoke-CheckedCommand -Command "kind" -Arguments @("load", "docker-image", "pulsecity-backend:v2", "--name", "pulsecity")
    Invoke-CheckedCommand -Command "kind" -Arguments @("load", "docker-image", "pulsecity-frontend:v2", "--name", "pulsecity")
    Invoke-CheckedCommand -Command "kind" -Arguments @("load", "docker-image", "pulsecity-sensor:v4", "--name", "pulsecity")
    Write-Host "✅ Images loaded into Kind." -ForegroundColor Green
}
catch {
    Write-Host "WARN: Kind image load failed. Ensure the cluster exists and is named pulsecity." -ForegroundColor DarkYellow
}

Write-Host "`n[5/6] Updating deployments ..." -ForegroundColor Yellow
try {
    Invoke-CheckedCommand -Command "kubectl" -Arguments @("set", "image", "deployment/backend-v2", "backend-v2=pulsecity-backend:v2")
    Invoke-CheckedCommand -Command "kubectl" -Arguments @("rollout", "restart", "deployment/backend-v2")
    Write-Host "  → backend-v2 restarted"
}
catch {
    Write-Host "WARN: backend-v2 rollout update failed." -ForegroundColor DarkYellow
}

try {
    Invoke-CheckedCommand -Command "kubectl" -Arguments @("apply", "-f", "./frontend/deployment.yaml")
    Invoke-CheckedCommand -Command "kubectl" -Arguments @("set", "image", "deployment/pulsecity-frontend", "frontend=pulsecity-frontend:v2")
    Invoke-CheckedCommand -Command "kubectl" -Arguments @("rollout", "restart", "deployment/pulsecity-frontend")
    Write-Host "  → pulsecity-frontend restarted"
}
catch {
    Write-Host "WARN: frontend rollout update failed." -ForegroundColor DarkYellow
}

try {
    Invoke-CheckedCommand -Command "kubectl" -Arguments @("set", "image", "deployment/iot-simulator", "iot-simulator=pulsecity-sensor:v4")
    Invoke-CheckedCommand -Command "kubectl" -Arguments @("rollout", "restart", "deployment/iot-simulator")
    Write-Host "  → iot-simulator restarted"
}
catch {
    Write-Host "WARN: iot-simulator rollout update failed." -ForegroundColor DarkYellow
}

Write-Host "`n[6/6] Waiting for rollout to complete ..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
try {
    Invoke-CheckedCommand -Command "kubectl" -Arguments @("rollout", "status", "deployment/backend-v2", "--timeout=90s")
    Invoke-CheckedCommand -Command "kubectl" -Arguments @("rollout", "status", "deployment/pulsecity-frontend", "--timeout=60s")
}
catch {
    Write-Host "WARN: rollout status check timed out or failed." -ForegroundColor DarkYellow
}

Write-Host "`n✅ Current pods:" -ForegroundColor Green
kubectl get pods -o wide 2>$null

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  Deployment complete. Check the platform with:" -ForegroundColor Cyan
Write-Host "  kubectl get svc" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
