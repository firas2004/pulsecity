# 📓 Journal de Bord — Projet PulseCity
> **Plateforme Cloud Native de Surveillance Urbaine Intelligente**
> IoT · Kafka · Kubernetes · IA · CI/CD

---

## 🎯 Présentation du Projet

**PulseCity** est une plateforme de stage conçue pour surveiller en temps réel les données
urbaines de villes tunisiennes. Elle repose sur une architecture **Cloud Native** moderne :

| Couche | Technologie |
|--------|-------------|
| Simulation IoT | Python (kafka-python) |
| Messagerie | Apache Kafka (KRaft, sans ZooKeeper) |
| Orchestration | Kubernetes (Kind – local) |
| Conteneurisation | Docker Desktop |
| OS de développement | Windows 11 |

**Zones couvertes :** Tunis-Centre, Ariana, Ben-Arous, La-Marsa, Sfax, Sousse

---

## 🗓️ Semaine 1 — Microservice IoT Simulator (v1)

### Objectif
Créer le premier microservice du projet : un **simulateur de capteurs urbains** capable
de générer des données réalistes en JSON, conteneurisé et déployé sur Kubernetes.

---

### 📁 Fichiers créés

#### `iot-simulator/sensor.py`
Script Python qui simule **4 types de capteurs** pour 6 zones tunisiennes :

| Capteur | Plage normale | Plage anomalie | Unité |
|---------|--------------|----------------|-------|
| `traffic` | 10 – 120 | 200 – 400 | vehicles/min |
| `air_co2` | 350 – 800 | 1 200 – 2 000 | ppm |
| `noise` | 35 – 75 | 100 – 130 | dB |
| `energy` | 50 – 500 | 900 – 1 500 | kWh |

**Comportement :**
- Génère **24 lectures** (6 zones × 4 capteurs) toutes les **5 secondes**
- **10 %** de chance d'anomalie par lecture (valeur hors-norme + flag `"anomaly": true`)
- Sortie en JSON structuré sur stdout

**Exemple de message JSON généré :**
```json
{
  "timestamp": "2026-07-04T07:03:49Z",
  "zone": "Sfax",
  "sensor_type": "air_co2",
  "value": 1487.14,
  "unit": "ppm",
  "anomaly": true,
  "sensor_id": "sfax-air_co2-001"
}
```

---

#### `iot-simulator/Dockerfile`
- Image de base : `python:3.11-slim`
- Installe les dépendances via `requirements.txt`
- Lance `sensor.py` au démarrage avec `python -u` (unbuffered pour logs temps réel)

#### `iot-simulator/requirements.txt`
- Version 1 : vide (uniquement stdlib Python)

#### `iot-simulator/deployment.yaml`
- **Kind** : `Deployment` Kubernetes
- **Namespace** : `default`
- **Replicas** : 1
- **Image** : `pulsecity-sensor:v1`
- **imagePullPolicy** : `Never` (image locale chargée dans Kind)
- **livenessProbe** : vérifie que `sensor.py` tourne (`pgrep -f sensor.py`)

---

### 🔨 Étapes d'exécution (Semaine 1)

```
1. docker build -t pulsecity-sensor:v1 .
2. kind load docker-image pulsecity-sensor:v1 --name pulsecity
3. kubectl apply -f deployment.yaml
4. kubectl get pods -l app=iot-simulator -w   → STATUS: Running ✅
5. kubectl logs -l app=iot-simulator -f        → données JSON en temps réel ✅
```

### ✅ Résultat
Pod `iot-simulator-*` en `Running 1/1`, logs affichant 24 mesures toutes les 5 secondes.

---

## 🗓️ Semaine 2 — Intégration Apache Kafka

### Objectif
Connecter le simulateur IoT à **Apache Kafka** pour que les données transitent
dans des **topics dédiés** plutôt que d'être seulement affichées dans les logs.

---

### 📋 Architecture des topics

```
sensor.py (v2)
├── traffic   ──────────────→ [traffic-data]
├── air_co2   ──────────────→ [air-quality]
├── noise     ──────────────→ [noise-level]
├── energy    ──────────────→ [energy-data]
└── anomalie  ─→ [topic principal]
              └→ [alerts]   ← en plus (doublon pour alertes)
```

---

### 📁 Fichiers créés / modifiés

#### `iot-simulator/kafka-k8s.yaml` _(nouveau)_
Déploiement Kafka **sans Helm**, avec l'image `confluentinc/cp-kafka:7.7.0` :
- **Mode KRaft** : pas de ZooKeeper, Kafka gère lui-même le consensus (Raft)
- **1 seul nœud** (controller + broker combinés)
- `enableServiceLinks: false` → évite le conflit avec les variables d'environnement
  injectées automatiquement par Kubernetes (`KAFKA_PORT`, `KAFKA_SERVICE_HOST`, etc.)
- **Service ClusterIP** `kafka.kafka.svc.cluster.local:9092` accessible depuis tout le cluster

#### `iot-simulator/sensor.py` _(mis à jour → v2)_
Ajout du **producteur Kafka** avec `kafka-python` :
- Connexion avec **retry automatique** (10 tentatives, délai 6 s) : le simulateur
  attend que Kafka soit prêt avant de démarrer
- Chaque lecture est publiée dans le **topic correspondant** à son type
- Si `anomaly: true` → publication supplémentaire dans le topic **`alerts`**
  avec les champs `alert_level: "HIGH"` et un message humain lisible
- Configuration via **variables d'environnement** :
  - `KAFKA_BOOTSTRAP_SERVERS` (défaut : `kafka.kafka.svc.cluster.local:9092`)
  - `SEND_INTERVAL_SECONDS` (défaut : `5`)
  - `ANOMALY_PROBABILITY` (défaut : `0.10`)

#### `iot-simulator/requirements.txt` _(mis à jour)_
```
kafka-python==2.0.2
```

#### `iot-simulator/Dockerfile` _(mis à jour → v2)_
- Label version `2.0`
- Variables d'environnement Kafka définies avec valeurs par défaut
- Toujours basé sur `python:3.11-slim`

#### `iot-simulator/deployment.yaml` _(mis à jour → v2)_
- Image : `pulsecity-sensor:v2`
- **initContainer** `wait-for-kafka` : utilise `busybox` pour faire un `nc -z`
  sur `kafka.kafka.svc.cluster.local:9092` avant de lancer le simulateur
- Variables d'environnement Kafka passées au conteneur
- Ressources ajustées (128 Mi request, 256 Mi limit)

---

### 🔧 Problèmes rencontrés & solutions

#### Problème 1 — `ImagePullBackOff` avec Bitnami Kafka
**Cause :** Le chart Helm Bitnami v32.4.3 utilise `bitnami/kafka:4.0.0-debian-12-r10`.
Cette image n'existe plus gratuitement sur Docker Hub (Bitnami a arrêté les images
gratuites pour les nouvelles versions après novembre 2023).

**Solution :** Abandon du chart Helm Bitnami. Passage à `confluentinc/cp-kafka:7.7.0`
(Confluent Platform, disponible gratuitement sur Docker Hub) avec un YAML Kubernetes
manuel.

---

#### Problème 2 — `kind load docker-image` échoue (multi-arch)
**Cause :** `confluentinc/cp-kafka:7.7.0` est une image multi-architecture (manifest list).
`kind load` ne sait pas gérer les manifest lists avec des blobs partiels.

**Erreur :**
```
ctr: content digest sha256:e773a52...f98: not found
```

**Solution tentée :** `docker save + kind load image-archive` → même erreur.

**Solution finale :** Utilisation de `imagePullPolicy: IfNotPresent` dans le YAML Kafka.
Les nœuds Kind ont accès à internet via Docker Bridge et peuvent tirer l'image
directement depuis Docker Hub.

---

#### Problème 3 — Pod Kafka en `CrashLoopBackOff`
**Cause :** Kubernetes injecte automatiquement des variables d'environnement pour chaque
Service du cluster. Comme notre Service s'appelle `kafka`, K8s injecte `KAFKA_PORT=tcp://10.x.x.x:9092`. Le script de démarrage de `cp-kafka` interprète
cette variable comme une configuration de port invalide → crash au démarrage.

**Log symptôme :**
```
Running in KRaft mode...
port is deprecated. Please use KAFKA_ADVERTISED_LISTENERS instead.
[exit code 1]
```

**Solution :** Ajout de `enableServiceLinks: false` dans le `spec` du Pod.
Ceci empêche Kubernetes d'injecter les variables d'environnement des Services.

Corrections complémentaires :
- `CLUSTER_ID` : correction du padding base64 (`MkU3OEVBNTcwNTJENDM2Qg==`)
- `KAFKA_CONTROLLER_QUORUM_VOTERS` : utilisation du FQDN K8s du pod
  (`1@kafka-0.kafka.kafka.svc.cluster.local:9093`)

---

### 🔨 Étapes d'exécution (Semaine 2)

```
# Nettoyage du Bitnami cassé
helm uninstall kafka -n kafka
kubectl delete pvc data-kafka-controller-0 -n kafka
kubectl delete namespace kafka

# Déploiement Kafka avec image Confluent
kubectl create namespace kafka
kubectl apply -f kafka-k8s.yaml
kubectl get pods -n kafka                          → kafka-0 Running 1/1 ✅

# Création des 5 topics
kubectl exec -n kafka kafka-0 -- kafka-topics \
  --bootstrap-server localhost:9092 --create \
  --topic traffic-data --partitions 1 --replication-factor 1
# (répété pour : air-quality, noise-level, energy-data, alerts)

# Build et déploiement du simulateur v2
docker build -t pulsecity-sensor:v2 .
kind load docker-image pulsecity-sensor:v2 --name pulsecity
kubectl delete deployment iot-simulator
kubectl apply -f deployment.yaml
kubectl get pods -l app=iot-simulator              → Running 1/1 ✅

# Vérification end-to-end
kubectl logs -l app=iot-simulator -f              → messages Kafka envoyés ✅
kubectl exec -n kafka kafka-0 -- kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic alerts --from-beginning --max-messages 5  → alertes JSON reçues ✅
```

### ✅ Résultat
- **24 messages** envoyés dans Kafka toutes les 5 secondes
- Les anomalies apparaissent dans le topic `alerts` avec `"alert_level": "HIGH"`
- Pipeline IoT → Kafka **100 % fonctionnel**

**Exemple d'alerte consommée depuis Kafka :**
```json
{
  "timestamp": "2026-07-04T07:29:40Z",
  "zone": "Ben-Arous",
  "sensor_type": "air_co2",
  "value": 1487.14,
  "unit": "ppm",
  "anomaly": true,
  "sensor_id": "ben-arous-air_co2-001",
  "alert_level": "HIGH",
  "message": "Anomalie détectée sur air_co2 à Ben-Arous : 1487.14 ppm"
}
```

---

## 📂 Arborescence actuelle du projet

```
pulsecity/
├── JOURNAL_DE_BORD.md          ← ce fichier
└── iot-simulator/
    ├── sensor.py               ← simulateur IoT v2 (avec Kafka)
    ├── Dockerfile              ← image Python 3.11-slim v2
    ├── requirements.txt        ← kafka-python==2.0.2
    ├── deployment.yaml         ← Deployment K8s v2 (initContainer + env vars)
    ├── kafka-k8s.yaml          ← StatefulSet + Service Kafka (cp-kafka:7.7.0)
    └── kafka-values.yaml       ← (conservé, valeurs Helm Bitnami – non utilisé)
```

---

## 🏗️ Architecture globale actuelle

```
┌─────────────────────────────────────────────────────┐
│              Cluster Kind "pulsecity"                │
│                                                     │
│  namespace: default                                 │
│  ┌──────────────────────────────┐                  │
│  │  Pod: iot-simulator (v2)     │                  │
│  │  image: pulsecity-sensor:v2  │                  │
│  │  sensor.py                   │                  │
│  │    ├── traffic  → ──────────────────────────┐   │
│  │    ├── air_co2  → ─────────────────────┐    │   │
│  │    ├── noise    → ──────────────────┐  │    │   │
│  │    ├── energy   → ─────────────┐    │  │    │   │
│  │    └── anomalie → ──────────┐  │    │  │    │   │
│  └──────────────────────────── │──│────│──│────│──┘│
│                                 │  │    │  │    │   │
│  namespace: kafka               ▼  ▼    ▼  ▼    ▼   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Pod: kafka-0 (KRaft, cp-kafka:7.7.0)        │   │
│  │  ├── topic: alerts                           │   │
│  │  ├── topic: traffic-data                     │   │
│  │  ├── topic: air-quality                      │   │
│  │  ├── topic: noise-level                      │   │
│  │  └── topic: energy-data                      │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 🗓️ Semaine 3 — Module IA & Détection d'Anomalies (v3)

### Objectif
Créer le microservice `anomaly-detector` en Python :
- Consomme les topics Kafka en temps réel (`traffic-data`, `air-quality`, `noise-level`, `energy-data`).
- Utilise un modèle de Machine Learning **Isolation Forest** (scikit-learn) pour détecter les anomalies de manière statistique et dynamique.
- Publie les anomalies détectées dans le topic `alerts`.
- Expose des API de santé (`/health`) et de consultation des anomalies (`/anomalies`) via **FastAPI**.

### 📁 Fichiers créés
- `anomaly-detector/detector.py` : logique d'inférence ML, écouteur Kafka, serveur FastAPI.
- `anomaly-detector/requirements.txt` : `fastapi`, `uvicorn`, `scikit-learn`, `kafka-python`, `prometheus-client`.
- `anomaly-detector/Dockerfile` : conteneurisation optimisée.
- `anomaly-detector/deployment.yaml` : déploiement K8s avec initContainer de dépendance Kafka.
- `anomaly-detector/service.yaml` : exposition du microservice dans le cluster.
- `anomaly-detector/tests/test_detector.py` : suite de tests unitaires et d'intégration HTTP.

---

## 🗓️ Semaine 4 — Surveillance & Monitoring (Prometheus + Grafana)

### Objectif
Mettre en place une pile de monitoring complète sur le cluster Kind pour collecter et visualiser les métriques métiers et infrastructures en temps réel.

### 📁 Fichiers créés / configurés
- `monitoring/prometheus-values.yaml` : configuration Helm de la pile `kube-prometheus-stack` (activation du scraping, alertmanager, Grafana).
- `monitoring/servicemonitor-iot.yaml` : définition du scraping Prometheus pour `iot-simulator` (port 8001).
- `monitoring/servicemonitor-anomaly.yaml` : définition du scraping pour `anomaly-detector` (port 8000).
- `monitoring/pulsecity-rules.yaml` : règles d'alertes Prometheus (ex: trafic anormalement élevé, CO2 critique).
- `monitoring/grafana-dashboard.yaml` : export JSON du tableau de bord PulseCity (visualisation du trafic moyen, des anomalies par zone, etc.).

---

## 🗓️ Semaine 5 — Automatisation CI/CD (GitHub Actions & ArgoCD)

### Objectif
Implémenter un pipeline de livraison continue (GitOps) complet :
1. **Intégration Continue (GitHub Actions)** : Déclenché à chaque push sur `main`, build les conteneurs, exécute les tests avec couverture de code, scanne avec Trivy, pousse sur GitHub Container Registry (GHCR) et met à jour automatiquement la version de l'image dans les fichiers de manifests YAML.
2. **Déploiement Continu (ArgoCD)** : Synchronise de manière déclarative l'état du cluster avec les manifests présents sur GitHub.

### 📁 Fichiers créés / configurés
- `.github/workflows/ci-iot-simulator.yml` : pipeline CI du simulateur.
- `.github/workflows/ci-anomaly-detector.yml` : pipeline CI du détecteur.
- `k8s/iot-simulator/` & `k8s/anomaly-detector/` : manifests Kubernetes de production pour ArgoCD.
- `argocd/applications.yaml` : spécification des applications ArgoCD pointant vers notre dépôt GitHub.

## 🗓️ Semaine 6 — Sécurité, Durcissement, Performance & Finalisation CI/CD

### Objectif
Sécuriser et durcir l'infrastructure, évaluer la performance sous charge et stabiliser le pipeline CI/CD pour la soutenance finale.

### 📁 Fichiers créés / configurés
- `k8s/network-policy.yaml` : politiques de réseau `default-deny-all` et autorisations restrictives entre microservices.
- `k8s/iot-simulator/deployment.yaml` & `k8s/anomaly-detector/deployment.yaml` : durcissement Pod Security (rootless, readOnlyRootFilesystem, drop ALL capabilities, liveness/readiness/startup probes).
- `load-testing/k6-loadtest.js` : script de test de charge d'API HTTP via k6 (50 VU).
- `load-testing/kafka-stress.py` : script de test de débit Kafka et monitoring du consumer lag.
- `demo.ps1` : script PowerShell automatisé pour orchestrer la démo de la soutenance.
- `anomaly-detector/detector.py` & `tests/test_detector.py` : migration vers `decision_function` d'Isolation Forest pour éliminer les faux positifs et stabiliser les assertions CI/CD.

### 🛡️ Résultats Majeurs
1. **Sécurité (Hardening)** : Zéro conteneur root, système de fichiers en lecture seule (sauf `/tmp` sur `emptyDir`), aucun privilège (capabilities drops), communication réseau segmentée.
2. **Vulnérabilités** : Résolution de la CVE-2026-24049 par la mise à jour de `wheel>=0.46.2`.
3. **Performance** : Test k6 validé avec un SLA P95 de 189ms (cible < 500ms) à 42 req/s. Test Kafka validé à 100% de succès à haut débit.
4. **Stabilité CI/CD** : Correction de `PYTHONPATH` et stabilisation du modèle IA. Les tests unitaires et builds d'images passent à 100% sur GitHub Actions.

---

## 🛠️ Environnement de développement (Mis à jour)

| Outil | Version | Rôle |
|-------|---------|------|
| Windows 11 | – | OS hôte |
| Docker Desktop | – | Moteur de conteneurs |
| Kind | – | Kubernetes local (in Docker) |
| kubectl | – | CLI Kubernetes |
| Helm | – | Gestionnaire de charts K8s |
| Python | 3.11 / 3.12 | Simulateur et Détecteur |
| scikit-learn | 1.4+ | Algorithme Isolation Forest |
| Apache Kafka | cp-kafka:7.7.0 | Broker de messages (KRaft) |
| Prometheus | v0.92.1 / Stack | Collecteur de métriques |
| Grafana | Stack | Visualisation des données |
| ArgoCD | v2.10+ | Outil GitOps de déploiement continu |
| k6 | v2.1.0 / v0.50+ | Test de charge d'API |
| Trivy | v0.72.0 | Scanner de vulnérabilités |

---

*Dernière mise à jour : 04 juillet 2026*

