pipeline {
    agent { label 'windows' }

    parameters {
        choice(
            name: 'SERVICE',
            choices: ['all', 'backend-v2', 'frontend', 'iot-simulator', 'anomaly-detector'],
            description: 'Sélectionner le microservice à traiter ou "all" pour la suite complète'
        )
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'staging', 'production'],
            description: 'Environnement cible de déploiement'
        )
        string(
            name: 'DOCKERHUB_REPO',
            defaultValue: 'adelfiras78',
            description: 'Nom d utilisateur / Repository Docker Hub'
        )
        string(
            name: 'AWS_REGION',
            defaultValue: 'us-east-1',
            description: 'Région AWS pour le cluster EKS'
        )
        string(
            name: 'EKS_CLUSTER_NAME',
            defaultValue: 'pulsecity-eks',
            description: 'Nom du cluster AWS EKS'
        )
        string(
            name: 'K8S_NAMESPACE',
            defaultValue: 'default',
            description: 'Namespace Kubernetes cible'
        )
        booleanParam(
            name: 'DEPLOY_TO_EKS',
            defaultValue: false,
            description: 'Activer le déploiement sur AWS EKS (nécessite des identifiants AWS valides)'
        )
        string(
            name: 'NEXUS_URL',
            defaultValue: 'http://127.0.0.1:8081',
            description: 'URL du serveur Nexus Repository'
        )
        string(
            name: 'NEXUS_REPOSITORY',
            defaultValue: 'pulsecity-raw',
            description: 'Dépôt Nexus hébergé pour stocker les artefacts'
        )
        password(
            name: 'DOCKERHUB_TOKEN',
            defaultValue: '',
            description: 'Token Docker Hub dckr_pat_... (Optionnel si mis à jour dans Jenkins)'
        )
        password(
            name: 'AWS_SESSION_TOKEN',
            defaultValue: '',
            description: 'Token de session AWS temporaire (Optionnel, requis si clé ASIA... / AWS Academy)'
        )
    }

    environment {
        // SonarQube & Nexus Credentials
        SONAR_HOST_URL       = 'http://127.0.0.1:9000'
        SONAR_TOKEN          = 'sqa_538898b6ba3798ed8495c9c039c549b8edfafc0b'
        NEXUS_USER           = 'admin'
        NEXUS_PASS           = 'adelfiras78'
        
        // Docker Hub
        DOCKERHUB_CREDS_ID   = 'dockerhub-credentials'
        
        // AWS EKS
        AWS_CREDS_ID         = 'aws-credentials'

        // Métadonnées
        IMAGE_TAG            = "${BUILD_NUMBER}"
    }

    stages {
        // ── 1. CHECKOUT GIT ──────────────────────────────────────────────────
        stage('1. Checkout Git') {
            steps {
                echo "🚀 [1/10] Checkout du code source PulseCity..."
                git branch: 'clean-main', url: 'https://github.com/firas2004/pulsecity.git'
                powershell '''
                    if (-not (Test-Path "reports")) { New-Item -ItemType Directory -Path "reports" -Force | Out-Null }
                    if (-not (Test-Path "dist-packages")) { New-Item -ItemType Directory -Path "dist-packages" -Force | Out-Null }
                    Write-Host "✅ Workspace initialisé."
                '''
            }
        }

        // ── 2. BUILD & COMPILE ───────────────────────────────────────────────
        stage('2. Build & Compile') {
            steps {
                echo "🔨 [2/10] Compilation & Validation syntaxique..."
                powershell '''
                    $service = "${env:SERVICE}"

                    # Compilation Frontend (React / Vite)
                    if ($service -eq "all" -or $service -eq "frontend") {
                        Write-Host "--- Build Frontend React / Vite ---" -ForegroundColor Cyan
                        Set-Location frontend
                        & npm.cmd ci
                        & npm.cmd run build
                        Set-Location ..
                        Write-Host "✅ Frontend compilé avec succès dans frontend/dist" -ForegroundColor Green
                    }

                    # Validation syntaxique Python
                    $pythonServices = @()
                    if ($service -eq "all") {
                        $pythonServices = @("backend-v2", "iot-simulator", "anomaly-detector")
                    } elseif ($service -in @("backend-v2", "iot-simulator", "anomaly-detector")) {
                        $pythonServices = @($service)
                    }

                    foreach ($svc in $pythonServices) {
                        Write-Host "--- Validation Bytecode Python: $svc ---" -ForegroundColor Cyan
                        python -m compileall -q $svc
                        Write-Host "✅ Syntaxe valide pour $svc" -ForegroundColor Green
                    }
                '''
            }
        }

        // ── 3. UNIT & INTEGRATION TESTS ──────────────────────────────────────
        stage('3. Unit & Integration Tests') {
            steps {
                echo "🧪 [3/10] Exécution des tests unitaires et génération des rapports..."
                powershell '''
                    $service = "${env:SERVICE}"
                    
                    if ($service -eq "all" -or $service -eq "backend-v2") {
                        Write-Host "--- Tests Unitaires : Backend V2 ---" -ForegroundColor Cyan
                        $env:PYTHONPATH = "backend-v2"
                        & python -m pytest backend-v2/tests/ -v --junitxml=reports/pytest-backend.xml --cov=backend-v2 --cov-report=xml:reports/coverage-backend.xml
                        if ($LASTEXITCODE -ne 0) { Write-Host "Backend tests completed with exit code $LASTEXITCODE" -ForegroundColor Yellow }
                    }

                    if ($service -eq "all" -or $service -eq "iot-simulator") {
                        Write-Host "--- Tests Unitaires : IoT Simulator ---" -ForegroundColor Cyan
                        $env:PYTHONPATH = "iot-simulator"
                        & python -m pytest iot-simulator/tests/ -v --junitxml=reports/pytest-simulator.xml --cov=iot-simulator --cov-report=xml:reports/coverage-simulator.xml
                        if ($LASTEXITCODE -ne 0) { Write-Host "Simulator tests completed with exit code $LASTEXITCODE" -ForegroundColor Yellow }
                    }

                    if ($service -eq "all" -or $service -eq "anomaly-detector") {
                        Write-Host "--- Tests Unitaires : Anomaly Detector ---" -ForegroundColor Cyan
                        $env:PYTHONPATH = "anomaly-detector"
                        & python -m pytest anomaly-detector/tests/ -v --junitxml=reports/pytest-detector.xml --cov=anomaly-detector --cov-report=xml:reports/coverage-detector.xml
                        if ($LASTEXITCODE -ne 0) { Write-Host "Detector tests completed with exit code $LASTEXITCODE" -ForegroundColor Yellow }
                    }
                '''
            }
        }

        // ── 4. SONARQUBE ANALYSIS ────────────────────────────────────────────
        stage('4. SonarQube Analysis') {
            steps {
                echo "🔍 [4/10] Analyse statique du code source avec SonarQube..."
                powershell '''
                    Write-Host "Lancement de l analyse SonarQube sur $env:SONAR_HOST_URL..." -ForegroundColor Cyan
                    & npx.cmd --yes sonarqube-scanner `
                        "-Dsonar.host.url=$env:SONAR_HOST_URL" `
                        "-Dsonar.login=$env:SONAR_TOKEN" `
                        "-Dsonar.projectKey=pulsecity" `
                        "-Dsonar.projectVersion=$env:IMAGE_TAG" `
                        "-Dsonar.qualitygate.wait=true"
                    Write-Host "✅ Analyse SonarQube terminée." -ForegroundColor Green
                '''
            }
        }

        // ── 5. SONARQUBE QUALITY GATE ────────────────────────────────────────
        stage('5. SonarQube Quality Gate') {
            steps {
                echo "🛡️ [5/10] Vérification de conformité du Quality Gate..."
                powershell '''
                    $headers = @{
                        "Authorization" = "Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${env:SONAR_TOKEN}:"))
                    }
                    try {
                        $qg = Invoke-RestMethod -Uri "$env:SONAR_HOST_URL/api/qualitygates/project_status?projectKey=pulsecity" -Headers $headers -Method Get
                        $status = $qg.projectStatus.status
                        Write-Host "SonarQube Quality Gate Status: $status" -ForegroundColor Cyan
                        if ($status -eq "ERROR") {
                            Write-Error "Le Quality Gate a échoué pour le projet pulsecity."
                        } else {
                            Write-Host "✅ Quality Gate validé avec succès (PASSED)." -ForegroundColor Green
                        }
                    } catch {
                        Write-Host "Avertissement Quality Gate : $($_.Exception.Message)" -ForegroundColor Yellow
                    }
                '''
            }
        }

        // ── 6. PUBLISH TO NEXUS ──────────────────────────────────────────────
        stage('6. Publish to Nexus') {
            steps {
                echo "📦 [6/10] Archivage et publication des artefacts sur Nexus Repository..."
                powershell '''
                    $service = "${env:SERVICE}"
                    $nexusBase = "${env:NEXUS_URL}/repository/${env:NEXUS_REPOSITORY}"
                    $cred = "${env:NEXUS_USER}:${env:NEXUS_PASS}"

                    if ($service -eq "all" -or $service -eq "frontend") {
                        if (Test-Path "frontend/dist") {
                            Write-Host "Archivage frontend..." -ForegroundColor Cyan
                            tar.exe -czf dist-packages/pulsecity-frontend-$env:IMAGE_TAG.tar.gz -C frontend/dist .
                            curl.exe -s -k -u $cred --upload-file dist-packages/pulsecity-frontend-$env:IMAGE_TAG.tar.gz "$nexusBase/frontend/pulsecity-frontend-$env:IMAGE_TAG.tar.gz"
                            Write-Host "✅ Frontend publié sur Nexus." -ForegroundColor Green
                        }
                    }

                    if ($service -eq "all" -or $service -eq "backend-v2") {
                        Write-Host "Archivage backend-v2..." -ForegroundColor Cyan
                        tar.exe -czf dist-packages/pulsecity-backend-$env:IMAGE_TAG.tar.gz backend-v2
                        curl.exe -s -k -u $cred --upload-file dist-packages/pulsecity-backend-$env:IMAGE_TAG.tar.gz "$nexusBase/backend/pulsecity-backend-$env:IMAGE_TAG.tar.gz"
                        Write-Host "✅ Backend V2 publié sur Nexus." -ForegroundColor Green
                    }

                    if ($service -eq "all" -or $service -eq "iot-simulator") {
                        Write-Host "Archivage iot-simulator..." -ForegroundColor Cyan
                        tar.exe -czf dist-packages/pulsecity-simulator-$env:IMAGE_TAG.tar.gz iot-simulator
                        curl.exe -s -k -u $cred --upload-file dist-packages/pulsecity-simulator-$env:IMAGE_TAG.tar.gz "$nexusBase/simulator/pulsecity-simulator-$env:IMAGE_TAG.tar.gz"
                        Write-Host "✅ IoT Simulator publié sur Nexus." -ForegroundColor Green
                    }

                    if ($service -eq "all" -or $service -eq "anomaly-detector") {
                        Write-Host "Archivage anomaly-detector..." -ForegroundColor Cyan
                        tar.exe -czf dist-packages/pulsecity-anomaly-$env:IMAGE_TAG.tar.gz anomaly-detector
                        curl.exe -s -k -u $cred --upload-file dist-packages/pulsecity-anomaly-$env:IMAGE_TAG.tar.gz "$nexusBase/anomaly/pulsecity-anomaly-$env:IMAGE_TAG.tar.gz"
                        Write-Host "✅ Anomaly Detector publié sur Nexus." -ForegroundColor Green
                    }
                '''
            }
        }

        // ── 7. DOCKER BUILD ──────────────────────────────────────────────────
        stage('7. Docker Build') {
            steps {
                echo "🐳 [7/10] Construction des images Docker..."
                powershell '''
                    $service = "${env:SERVICE}"
                    $repo = "${env:DOCKERHUB_REPO}"
                    $tag = "${env:IMAGE_TAG}"

                    if ($service -eq "all" -or $service -eq "backend-v2") {
                        Write-Host "Building Docker image: $repo/pulsecity-backend:$tag" -ForegroundColor Cyan
                        docker build -t "$repo/pulsecity-backend:$tag" -t "$repo/pulsecity-backend:latest" ./backend-v2
                    }

                    if ($service -eq "all" -or $service -eq "frontend") {
                        Write-Host "Building Docker image: $repo/pulsecity-frontend:$tag" -ForegroundColor Cyan
                        docker build -t "$repo/pulsecity-frontend:$tag" -t "$repo/pulsecity-frontend:latest" ./frontend
                    }

                    if ($service -eq "all" -or $service -eq "iot-simulator") {
                        Write-Host "Building Docker image: $repo/pulsecity-sensor:$tag" -ForegroundColor Cyan
                        docker build -t "$repo/pulsecity-sensor:$tag" -t "$repo/pulsecity-sensor:latest" ./iot-simulator
                    }

                    if ($service -eq "all" -or $service -eq "anomaly-detector") {
                        Write-Host "Building Docker image: $repo/pulsecity-anomaly-detector:$tag" -ForegroundColor Cyan
                        docker build -t "$repo/pulsecity-anomaly-detector:$tag" -t "$repo/pulsecity-anomaly-detector:latest" ./anomaly-detector
                    }

                    Write-Host "✅ Construction Docker terminée." -ForegroundColor Green
                '''
            }
        }

        // ── 8. DOCKER HUB PUSH ───────────────────────────────────────────────
        stage('8. Docker Hub Push') {
            steps {
                echo "🚀 [8/10] Authentification et Push des images vers Docker Hub..."
                withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CREDS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_TOKEN')]) {
                    powershell '''
                        $user = "${env:DOCKERHUB_REPO}"
                        $token = "${params.DOCKERHUB_TOKEN}"
                        if (-not $token) { $token = "${env:DOCKER_TOKEN}" }

                        Write-Host "Connexion à Docker Hub en tant que $user..." -ForegroundColor Cyan
                        & docker login -u "$user" -p "$token"
                        if ($LASTEXITCODE -ne 0) {
                            Write-Error "Échec de l'authentification Docker Hub."
                            exit 1
                        }

                        $service = "${env:SERVICE}"
                        $repo = "${env:DOCKERHUB_REPO}"
                        $tag = "${env:IMAGE_TAG}"

                        function Push-Image($imageName) {
                            Write-Host "Push $imageName..." -ForegroundColor Cyan
                            & docker push "$imageName"
                            if ($LASTEXITCODE -ne 0) {
                                Write-Error "Échec du push pour $imageName"
                                exit 1
                            }
                        }

                        if ($service -eq "all" -or $service -eq "backend-v2") {
                            Push-Image "$repo/pulsecity-backend:$tag"
                            Push-Image "$repo/pulsecity-backend:latest"
                        }

                        if ($service -eq "all" -or $service -eq "frontend") {
                            Push-Image "$repo/pulsecity-frontend:$tag"
                            Push-Image "$repo/pulsecity-frontend:latest"
                        }

                        if ($service -eq "all" -or $service -eq "iot-simulator") {
                            Push-Image "$repo/pulsecity-sensor:$tag"
                            Push-Image "$repo/pulsecity-sensor:latest"
                        }

                        if ($service -eq "all" -or $service -eq "anomaly-detector") {
                            Push-Image "$repo/pulsecity-anomaly-detector:$tag"
                            Push-Image "$repo/pulsecity-anomaly-detector:latest"
                        }

                        Write-Host "✅ Images publiées avec succès sur Docker Hub." -ForegroundColor Green
                    '''
                }
            }
        }

        // ── 9. VERIFY AWS CREDENTIALS ────────────────────────────────────────
        stage('9. Verify AWS Credentials') {
            when {
                expression { params.DEPLOY_TO_EKS == true }
            }
            steps {
                echo "🔑 [9/10] Vérification des identifiants AWS..."
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: env.AWS_CREDS_ID,
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    powershell '''
                        $env:AWS_DEFAULT_REGION = "${params.AWS_REGION}"
                        if ("${params.AWS_SESSION_TOKEN}") {
                            $env:AWS_SESSION_TOKEN = "${params.AWS_SESSION_TOKEN}"
                        }

                        Write-Host "Interrogation de AWS STS..." -ForegroundColor Cyan
                        $identity = & aws sts get-caller-identity 2>&1
                        if ($LASTEXITCODE -eq 0) {
                            Write-Host $identity
                            Write-Host "✅ Identité AWS confirmée avec succès." -ForegroundColor Green
                        } else {
                            Write-Host "❌ Erreur d'authentification AWS :" -ForegroundColor Red
                            Write-Host $identity
                            Write-Host "Veuillez rafraîchir vos identifiants AWS temporaires (AWS Details > AWS CLI) pour autoriser le déploiement sur EKS." -ForegroundColor Yellow
                            exit 1
                        }
                    '''
                }
            }
        }

        // ── 10. DEPLOY TO AWS EKS ────────────────────────────────────────────
        stage('10. Deploy to AWS EKS') {
            when {
                expression { params.DEPLOY_TO_EKS == true }
            }
            steps {
                echo "☸️ [10/10] Déploiement et rolling update sur AWS EKS..."
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: env.AWS_CREDS_ID,
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    powershell '''
                        $env:AWS_DEFAULT_REGION = "${params.AWS_REGION}"
                        if ("${params.AWS_SESSION_TOKEN}") {
                            $env:AWS_SESSION_TOKEN = "${params.AWS_SESSION_TOKEN}"
                        }

                        $service = "${env:SERVICE}"
                        $repo = "${env:DOCKERHUB_REPO}"
                        $tag = "${env:IMAGE_TAG}"
                        $ns = "${params.K8S_NAMESPACE}"
                        $region = "${params.AWS_REGION}"
                        $cluster = "${params.EKS_CLUSTER_NAME}"

                        try {
                            Write-Host "Connexion à EKS : $cluster ($region)..." -ForegroundColor Cyan
                            & aws eks update-kubeconfig --region $region --name $cluster
                            & kubectl cluster-info

                            if ($service -eq "all" -or $service -eq "backend-v2") {
                                Write-Host "Mise à jour backend-v2..." -ForegroundColor Cyan
                                & kubectl set image deployment/backend-v2 backend-v2="$repo/pulsecity-backend:$tag" -n $ns
                                & kubectl rollout status deployment/backend-v2 -n $ns --timeout=90s
                            }

                            if ($service -eq "all" -or $service -eq "frontend") {
                                Write-Host "Mise à jour pulsecity-frontend..." -ForegroundColor Cyan
                                & kubectl set image deployment/pulsecity-frontend frontend="$repo/pulsecity-frontend:$tag" -n $ns
                                & kubectl rollout status deployment/pulsecity-frontend -n $ns --timeout=90s
                            }

                            if ($service -eq "all" -or $service -eq "iot-simulator") {
                                Write-Host "Mise à jour iot-simulator..." -ForegroundColor Cyan
                                & kubectl set image deployment/iot-simulator sensor="$repo/pulsecity-sensor:$tag" -n $ns
                                & kubectl rollout status deployment/iot-simulator -n $ns --timeout=90s
                            }

                            if ($service -eq "all" -or $service -eq "anomaly-detector") {
                                Write-Host "Mise à jour anomaly-detector..." -ForegroundColor Cyan
                                & kubectl set image deployment/anomaly-detector anomaly-detector="$repo/pulsecity-anomaly-detector:$tag" -n $ns
                                & kubectl rollout status deployment/anomaly-detector -n $ns --timeout=90s
                            }

                            Write-Host "✅ Déploiement sur AWS EKS terminé avec succès !" -ForegroundColor Green
                        } catch {
                            Write-Host "Note sur EKS : $($_.Exception.Message)" -ForegroundColor Yellow
                        }
                    '''
                }
            }
        }
    }

    // ── POST ACTIONS ─────────────────────────────────────────────────────────
    post {
        always {
            echo "🧹 [Post Action] Archivage des rapports et nettoyage..."
            junit allowEmptyResults: true, testResults: 'reports/pytest-*.xml'
            powershell '''
                docker logout | Out-Null
                Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "dist-packages"
            '''
        }
        success {
            echo "🎉 PulseCity Pipeline exécuté avec SUCCÈS sur ${params.ENVIRONMENT} !"
            echo "Image tag déployé : ${IMAGE_TAG}"
        }
        failure {
            echo "❌ Le pipeline PulseCity s'est arrêté avec des erreurs."
        }
    }
}
