# 🛰 IoT Simulator — PulseCity

Microservice Python qui **simule 24 capteurs urbains** dans 6 zones tunisiennes et publie les données dans Apache Kafka toutes les 5 secondes.

---

## Rôle

| Capteur | Topic Kafka | Unité | Plage normale | Plage anomalie |
|---------|-------------|-------|---------------|----------------|
| `traffic` | `traffic-data` | vehicles/min | 10 – 120 | 200 – 400 |
| `air_co2` | `air-quality` | ppm | 350 – 800 | 1200 – 2000 |
| `noise` | `noise-level` | dB | 35 – 75 | 100 – 130 |
| `energy` | `energy-data` | kWh | 50 – 500 | 900 – 1500 |

Toutes les anomalies simulées (10% de probabilité par défaut) sont également publiées dans le topic `alerts`.

---

## Variables d'environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `KAFKA_BOOTSTRAP_SERVERS` | `kafka.kafka.svc.cluster.local:9092` | Adresse du broker Kafka |
| `SEND_INTERVAL_SECONDS` | `5` | Intervalle d'envoi en secondes |
| `ANOMALY_PROBABILITY` | `0.10` | Probabilité d'anomalie simulée (0-1) |
| `METRICS_PORT` | `8001` | Port du serveur Prometheus |
| `PYTHONUNBUFFERED` | `1` | Logs non-bufferisés (recommandé) |

---

## Métriques Prometheus exposées (port 8001)

| Métrique | Type | Labels | Description |
|----------|------|--------|-------------|
| `pulsecity_messages_sent_total` | Counter | `zone`, `sensor_type` | Messages publiés dans Kafka |
| `pulsecity_anomalies_simulated_total` | Counter | `zone`, `sensor_type` | Anomalies aléatoires simulées |

---

## Exemple de message JSON

```json
{
  "timestamp": "2026-07-04T09:00:00Z",
  "zone": "Tunis-Centre",
  "sensor_type": "air_co2",
  "value": 1487.14,
  "unit": "ppm",
  "anomaly": true,
  "sensor_id": "tunis-centre-air_co2-001"
}
```

---

## Commandes utiles

```powershell
# Voir les logs en temps réel
kubectl logs -l app=iot-simulator -f

# Vérifier les métriques Prometheus
kubectl port-forward svc/iot-simulator-metrics 8001:8001
# → http://localhost:8001/metrics

# Consommer les messages depuis Kafka
kubectl exec -n kafka kafka-0 -- kafka-console-consumer `
    --bootstrap-server localhost:9092 `
    --topic traffic-data --from-beginning --max-messages 5
```

---

## Build local

```powershell
cd iot-simulator
docker build -t pulsecity-sensor:v3 .
kind load docker-image pulsecity-sensor:v3 --name pulsecity
kubectl apply -f deployment.yaml
```
