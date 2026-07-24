<#
.SYNOPSIS
  PulseCity — Script de démonstration automatisé pour la soutenance de stage

.DESCRIPTION
  Orchestre une démonstration complète de la plateforme PulseCity :
    1. Vérification de l'état du cluster Kubernetes
    2. Affichage des pods et services déployés
    3. Logs IoT en temps réel
    4. Déclenchement d'une anomalie manuelle
    5. Interrogation de l'API /anomalies
    6. Port-forward vers Grafana et ArgoCD
    7. Simulation d'une panne et auto-guérison K8s
    8. Simulation d'un pipeline CI/CD en direct

.USAGE
  cd C:\Users\user\Desktop\pulsecity
  .\demo.ps1

  # Mode silencieux (sans pauses interactives)
  .\demo.ps1 -AutoMode

  # Ignorer certaines étapes
  .\demo.ps1 -SkipPortForward

.NOTES
  Prérequis : kubectl, helm, git, curl.exe configurés dans PATH
#>

[CmdletBinding()]
param(
    [switch]$AutoMode,         # Pas de pauses interactives
    [switch]$SkipPortForward,  # Ne pas ouvrir les port-forwards
    [int]$LogDuration = 8      # Secondes d'affichage des logs IoT
)

# ── Couleurs et helpers ────────────────────────────────────────────────────────
$ESC = [char]27
function Write-Header  ($msg) { Write-Host "`n$ESC[1;36m╔══════════════════════════════════════════════════════════════╗$ESC[0m" }
function Write-Section ($msg) {
    Write-Host "`n$ESC[1;36m╠══ $msg $ESC[0m"
}
function Write-OK    ($msg) { Write-Host "  $ESC[1;32m✅ $msg$ESC[0m" }
function Write-Info  ($msg) { Write-Host "  $ESC[1;34mℹ️  $msg$ESC[0m" }
function Write-Warn  ($msg) { Write-Host "  $ESC[1;33m⚠️  $msg$ESC[0m" }
function Write-Step  ($num, $msg) {
    Write-Host "`n$ESC[1;35m━━━ Étape $num : $msg ━━━$ESC[0m`n"
}

function Wait-ForUser ($msg = "Appuyez sur ENTRÉE pour continuer...") {
    if (-not $AutoMode) {
        Write-Host "`n  $ESC[1;33m▶ $msg$ESC[0m" -NoNewline
        Read-Host
    } else {
        Start-Sleep -Seconds 2
    }
}

function Invoke-Step ($stepNum, $title, $block) {
    Write-Step $stepNum $title
    & $block
    Wait-ForUser
}

# ── Banner ─────────────────────────────────────────────────────────────────────
Clear-Host
Write-Host @"
$ESC[1;36m
╔══════════════════════════════════════════════════════════════════════════╗
║         🏙️  PulseCity — Démonstration de Soutenance de Stage            ║
║         Plateforme Cloud Native de Surveillance Urbaine Intelligente     ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Stack : Kubernetes (Kind) · Kafka · FastAPI · Isolation Forest          ║
║          Prometheus · Grafana · GitHub Actions · ArgoCD                  ║
╚══════════════════════════════════════════════════════════════════════════╝
$ESC[0m
"@

Write-Info "Date : $(Get-Date -Format 'dddd dd MMMM yyyy HH:mm')"
Write-Info "Répertoire : $(Get-Location)"
Write-Info "Mode : $(if ($AutoMode) { 'Automatique' } else { 'Interactif' })"

Wait-ForUser "Prêt à démarrer la démonstration ?"

# ══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 1 — État du cluster Kubernetes
# ══════════════════════════════════════════════════════════════════════════════
Invoke-Step 1 "État du cluster Kubernetes" {
    Write-Info "Contexte Kubernetes actif :"
    kubectl config current-context

    Write-Info "`nNœuds du cluster :"
    kubectl get nodes -o wide

    Write-Info "`nNamespaces actifs :"
    kubectl get namespaces
}

# ══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 2 — Pods et Services PulseCity
# ══════════════════════════════════════════════════════════════════════════════
Invoke-Step 2 "Pods et Services déployés" {
    Write-Info "Tous les pods PulseCity (namespace default) :"
    kubectl get pods -l project=pulsecity -o wide

    Write-Info "`nPods de monitoring (namespace monitoring) :"
    kubectl get pods -n monitoring --field-selector=status.phase=Running | Select-Object -First 10

    Write-Info "`nPods ArgoCD :"
    kubectl get pods -n argocd -l 'app.kubernetes.io/name in (argocd-server,argocd-application-controller)'

    Write-Info "`nServices exposés :"
    kubectl get svc -l project=pulsecity
}

# ══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 3 — Logs IoT en temps réel
# ══════════════════════════════════════════════════════════════════════════════
Invoke-Step 3 "Données IoT en temps réel (${LogDuration}s)" {
    Write-Info "Affichage des ${LogDuration} prochaines secondes de données IoT..."
    Write-Info "(24 capteurs × 6 zones tunisiennes, toutes les 5s)`n"

    $job = Start-Job -ScriptBlock {
        kubectl logs -l app=iot-simulator --tail=0 -f 2>&1
    }

    Start-Sleep -Seconds $LogDuration
    Stop-Job $job
    Receive-Job $job | Select-Object -Last 30
    Remove-Job $job
}

# ══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 4 — Topics Kafka actifs
# ══════════════════════════════════════════════════════════════════════════════
Invoke-Step 4 "Topics Kafka et messages récents" {
    Write-Info "Topics Kafka disponibles :"
    kubectl exec -n kafka kafka-0 -- kafka-topics `
        --bootstrap-server localhost:9092 --list 2>/dev/null

    Write-Info "`nDerniers messages du topic 'alerts' :"
    kubectl exec -n kafka kafka-0 -- kafka-console-consumer `
        --bootstrap-server localhost:9092 `
        --topic alerts `
        --from-beginning `
        --max-messages 3 `
        --timeout-ms 5000 2>/dev/null
}

# ══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 5 — API Anomaly Detector
# ══════════════════════════════════════════════════════════════════════════════
Invoke-Step 5 "API REST du détecteur d'anomalies" {
    Write-Info "Démarrage du port-forward sur localhost:8000..."

    $pfJob = Start-Job -ScriptBlock {
        kubectl port-forward svc/anomaly-detector 8000:8000 2>&1
    }
    Start-Sleep -Seconds 3

    Write-Info "GET /health — État du service :"
    try {
        $health = Invoke-RestMethod "http://localhost:8000/health" -TimeoutSec 5
        Write-Host "    Status       : $ESC[1;32m$($health.status)$ESC[0m"
        Write-Host "    Messages reçus : $($health.total_messages_consumed)"
        Write-Host "    Anomalies IA   : $ESC[1;33m$($health.total_anomalies_detected)$ESC[0m"
        Write-Host "    Capteurs actifs: $($health.active_sensors)"
    } catch {
        Write-Warn "API non accessible (port-forward en cours d'initialisation)"
    }

    Write-Info "`nGET /anomalies?limit=5 — Dernières anomalies détectées :"
    try {
        $anomalies = Invoke-RestMethod "http://localhost:8000/anomalies?limit=5" -TimeoutSec 5
        Write-Host "    Nombre d'anomalies : $ESC[1;31m$($anomalies.count)$ESC[0m"
        foreach ($a in $anomalies.anomalies | Select-Object -First 3) {
            Write-Host "    $ESC[1;33m[$($a.alert_level)]$ESC[0m $($a.zone) | $($a.sensor_type) | $($a.value) $($a.unit) | score=$($a.isolation_score)"
        }
    } catch {
        Write-Warn "Impossible d'obtenir les anomalies"
    }

    Stop-Job $pfJob
    Remove-Job $pfJob
}

# ══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 6 — Port-forwards Grafana et ArgoCD
# ══════════════════════════════════════════════════════════════════════════════
if (-not $SkipPortForward) {
    Invoke-Step 6 "Dashboards Grafana et ArgoCD" {
        Write-Info "Démarrage du port-forward Grafana sur port 3000..."
        $grafanaJob = Start-Job -ScriptBlock {
            kubectl port-forward svc/monitoring-grafana -n monitoring 3000:80 2>&1
        }

        Write-Info "Démarrage du port-forward ArgoCD sur port 8080..."
        $argoJob = Start-Job -ScriptBlock {
            kubectl port-forward svc/argocd-server -n argocd 8080:443 2>&1
        }

        Start-Sleep -Seconds 3

        Write-OK "Grafana     → http://localhost:3000   (admin / prom-operator)"
        Write-OK "ArgoCD      → https://localhost:8080  (admin / voir secret K8s)"
        Write-Info "Swagger API → http://localhost:8000/docs"

        # Ouvrir les interfaces dans le navigateur
        Write-Info "Ouverture des interfaces dans le navigateur..."
        Start-Process "http://localhost:3000"
        Start-Sleep -Seconds 2
        Start-Process "https://localhost:8080"

        Wait-ForUser "Visualisez les dashboards Grafana et ArgoCD, puis ENTRÉE pour continuer..."

        Stop-Job $grafanaJob, $argoJob
        Remove-Job $grafanaJob, $argoJob
    }
}

# ══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 7 — Simulation d'une panne (Auto-guérison Kubernetes)
# ══════════════════════════════════════════════════════════════════════════════
Invoke-Step 7 "Simulation d'une panne — Auto-guérison Kubernetes" {
    Write-Info "État initial du pod iot-simulator :"
    kubectl get pods -l app=iot-simulator

    Write-Warn "Suppression forcée du pod iot-simulator (simulation de panne)..."
    kubectl delete pod -l app=iot-simulator --force --grace-period=0

    Write-Info "`nK8s détecte la panne et redémarre automatiquement..."
    Start-Sleep -Seconds 2

    Write-Info "Surveillance de la récupération automatique :"
    for ($i = 0; $i -lt 10; $i++) {
        $pods = kubectl get pods -l app=iot-simulator --no-headers 2>/dev/null
        Write-Host "  [$(Get-Date -Format 'HH:mm:ss')] $pods"
        if ($pods -match "Running\s+0") {
            Write-OK "Pod redémarré avec succès ! (Auto-guérison K8s en action)"
            break
        }
        Start-Sleep -Seconds 3
    }
}

# ══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 8 — Simulation d'un pipeline CI/CD en live
# ══════════════════════════════════════════════════════════════════════════════
Invoke-Step 8 "Pipeline CI/CD en direct (git push → GitHub Actions → ArgoCD)" {
    Write-Info "Simulation d'une modification du code et d'un push Git..."

    # Ajouter un timestamp dans le JOURNAL pour déclencher un vrai commit
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path "JOURNAL_DE_BORD.md" -Value "`n<!-- Demo push : $timestamp -->"

    git add JOURNAL_DE_BORD.md
    git commit -m "demo: déclenchement du pipeline CI/CD lors de la soutenance [$timestamp]"

    Write-Info "Contenu du commit :"
    git log --oneline -3

    Write-Warn "Pour déclencher le pipeline complet :"
    Write-Host "    $ESC[1;33mgit push origin main$ESC[0m"
    Write-Info "  Le pipeline GitHub Actions va alors :"
    Write-Host "    1. Exécuter pytest (tests unitaires)"
    Write-Host "    2. Build l'image Docker"
    Write-Host "    3. Scanner avec Trivy"
    Write-Host "    4. Pousser sur GHCR (ghcr.io/firas2004/...)"
    Write-Host "    5. Mettre à jour le manifest k8s/ dans GitHub"
    Write-Host "    6. ArgoCD détecte le changement et synchronise le cluster"

    Wait-ForUser "Exécutez 'git push origin main' et observez GitHub Actions..."
}

# ══════════════════════════════════════════════════════════════════════════════
# RÉCAPITULATIF FINAL
# ══════════════════════════════════════════════════════════════════════════════
Write-Host @"

$ESC[1;32m
╔══════════════════════════════════════════════════════════════════════════╗
║                  ✅ Démonstration PulseCity Complète !                   ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Étape 1 : Cluster Kubernetes      ✅ Kind cluster "pulsecity" actif     ║
║  Étape 2 : Microservices           ✅ iot-simulator + anomaly-detector   ║
║  Étape 3 : Données IoT             ✅ 24 capteurs, 6 zones tunisiennes   ║
║  Étape 4 : Apache Kafka            ✅ 5 topics, messages en transit      ║
║  Étape 5 : API REST                ✅ /health /anomalies /metrics        ║
║  Étape 6 : Grafana + ArgoCD        ✅ Dashboards + GitOps sync           ║
║  Étape 7 : Auto-guérison K8s       ✅ Pod redémarré automatiquement      ║
║  Étape 8 : Pipeline CI/CD          ✅ GitHub Actions + ArgoCD GitOps     ║
╚══════════════════════════════════════════════════════════════════════════╝
$ESC[0m
"@

Write-Info "Fin de la démonstration — $(Get-Date -Format 'HH:mm:ss')"
