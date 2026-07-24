# 🤖 Anomaly Detector — PulseCity

Microservice Python qui consomme les données Kafka des capteurs IoT et détecte les anomalies en temps réel grâce à l'algorithme **Isolation Forest** de scikit-learn.

---

## Rôle & Algorithme

L'algorithme **Isolation Forest** fonctionne en isolant les observations anormales via des arbres de décision aléatoires. Une observation facilement isolable (peu de coupures nécessaires) est considérée comme une anomalie.

- **Score d'anomalie** : entre -1 (anomalie certaine) et +1 (normal)
- **Seuil configurable** : `-0.05` par défaut (`ANOMALY_THRESHOLD`)
- **Fenêtre glissante** : 50 valeurs par capteur (`WINDOW_SIZE`)
- **Minimum de données** : 15 valeurs avant de démarrer l'inférence (`MIN_SAMPLES`)

---

## Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/health` | État du service, statistiques globales |
| `GET` | `/anomalies?limit=20` | Dernières anomalies détectées (max 100) |
| `GET` | `/metrics` | Métriques Prometheus (scrapé toutes les 15s) |
| `GET` | `/docs` | Documentation Swagger interactive |

---

## Variables d'environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `KAFKA_BOOTSTRAP_SERVERS` | `kafka.kafka.svc.cluster.local:9092` | Adresse du broker Kafka |
| `WINDOW_SIZE` | `50` | Taille de la fenêtre glissante par capteur |
| `MIN_SAMPLES` | `15` | Nombre minimum de valeurs avant inférence |
| `ANOMALY_THRESHOLD` | `-0.05` | Seuil de score pour déclarer une anomalie |
| `API_PORT` | `8000` | Port du serveur FastAPI |
| `PYTHONUNBUFFERED` | `1` | Logs non-bufferisés |

---

## Métriques Prometheus exposées (port 8000, endpoint `/metrics`)

| Métrique | Type | Labels | Description |
|----------|------|--------|-------------|
| `pulsecity_anomalies_total` | Counter | `zone`, `sensor_type`, `alert_level` | Anomalies détectées par l'IA |
| `pulsecity_messages_consumed_total` | Counter | `sensor_type` | Messages Kafka traités |
| `pulsecity_processing_latency_seconds` | Histogram | — | Latence de l'inférence Isolation Forest |
| `pulsecity_active_sensors` | Gauge | — | Capteurs avec données dans la fenêtre |

---

## Exemples de réponses

### `GET /health`

```json
{
  "status": "ok",
  "service": "pulsecity-anomaly-detector",
  "version": "2.0.0",
  "kafka_bootstrap": "kafka.kafka.svc.cluster.local:9092",
  "window_size": 50,
  "min_samples": 15,
  "anomaly_threshold": -0.05,
  "total_messages_consumed": 1247,
  "total_anomalies_detected": 89,
  "active_sensors": 24,
  "started_at": "2026-07-04T08:00:00Z"
}
```

### `GET /anomalies?limit=2`

```json
{
  "count": 2,
  "anomalies": [
    {
      "timestamp": "2026-07-04T09:00:05Z",
      "detected_at": "2026-07-04T09:00:06Z",
      "sensor_id": "sfax-energy-001",
      "sensor_type": "energy",
      "zone": "Sfax",
      "value": 1342.0,
      "unit": "kWh",
      "isolation_score": -0.2891,
      "confidence": 0.578,
      "anomaly": true,
      "alert_level": "MEDIUM",
      "source": "isolation-forest-v2",
      "message": "[IA] Anomalie sur energy à Sfax : 1342.0 kWh (score=-0.2891, conf=58%)"
    }
  ]
}
```

---

## Commandes utiles

```powershell
# Voir les détections en temps réel
kubectl logs -l app=anomaly-detector -f

# Appeler l'API localement
kubectl port-forward svc/anomaly-detector 8000:8000

# Dans un autre terminal :
Invoke-RestMethod http://localhost:8000/health | ConvertTo-Json
Invoke-RestMethod "http://localhost:8000/anomalies?limit=5" | ConvertTo-Json

# Ouvrir Swagger UI
Start-Process "http://localhost:8000/docs"

# Vérifier les alertes dans Kafka
kubectl exec -n kafka kafka-0 -- kafka-console-consumer `
    --bootstrap-server localhost:9092 `
    --topic alerts --from-beginning --max-messages 3
```

---

## Build local

```powershell
cd anomaly-detector
docker build -t pulsecity-anomaly-detector:v1 .
kind load docker-image pulsecity-anomaly-detector:v1 --name pulsecity
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```
