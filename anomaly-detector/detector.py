"""
PulseCity — Anomaly Detector v2
================================
v2 : ajout des métriques Prometheus exposées sur GET /metrics

Métriques exposées :
  pulsecity_anomalies_total          (counter, labels: zone, sensor_type, alert_level)
  pulsecity_messages_consumed_total  (counter, labels: sensor_type)
  pulsecity_processing_latency_seconds (histogram)
  pulsecity_active_sensors           (gauge)
"""

import json
import os
import threading
import time
import datetime
from collections import deque
from typing import List, Dict, Any, Optional

import numpy as np
import uvicorn
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import NoBrokersAvailable
from prometheus_client import (
    Counter, Histogram, Gauge,
    CONTENT_TYPE_LATEST, generate_latest, REGISTRY
)
from sklearn.ensemble import IsolationForest

# ── Configuration ────────────────────────────────────────────────────────────
KAFKA_BOOTSTRAP    = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka.kafka.svc.cluster.local:9092")
WINDOW_SIZE        = int(os.getenv("WINDOW_SIZE", "50"))
MIN_SAMPLES        = int(os.getenv("MIN_SAMPLES", "15"))
ANOMALY_THRESHOLD  = float(os.getenv("ANOMALY_THRESHOLD", "-0.05"))
API_PORT           = int(os.getenv("API_PORT", "8000"))

TOPICS_TO_CONSUME  = ["traffic-data", "air-quality", "noise-level", "energy-data"]
ALERTS_TOPIC       = "alerts"

# ── Métriques Prometheus ─────────────────────────────────────────────────────
anomalies_counter = Counter(
    "pulsecity_anomalies_total",
    "Nombre total d'anomalies détectées par Isolation Forest",
    ["zone", "sensor_type", "alert_level"],
)
messages_counter = Counter(
    "pulsecity_messages_consumed_total",
    "Nombre total de messages Kafka consommés",
    ["sensor_type"],
)
processing_latency = Histogram(
    "pulsecity_processing_latency_seconds",
    "Latence de traitement par message (Isolation Forest)",
    buckets=[0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0],
)
active_sensors_gauge = Gauge(
    "pulsecity_active_sensors",
    "Nombre de capteurs ayant des données dans la fenêtre glissante",
)


# ── État global partagé ──────────────────────────────────────────────────────
class AnomalyStore:
    def __init__(self):
        self.windows: Dict[str, deque] = {}
        self.models: Dict[str, Optional[IsolationForest]] = {}
        self.anomalies: deque = deque(maxlen=200)
        self.total_messages = 0
        self.total_anomalies = 0
        self.started_at = datetime.datetime.utcnow().isoformat() + "Z"
        self._lock = threading.Lock()

    def add_reading(self, sensor_id: str, value: float) -> float:
        with self._lock:
            if sensor_id not in self.windows:
                self.windows[sensor_id] = deque(maxlen=WINDOW_SIZE)
                self.models[sensor_id] = None

            self.windows[sensor_id].append(value)
            window = list(self.windows[sensor_id])
            active_sensors_gauge.set(len(self.windows))

            if len(window) < MIN_SAMPLES:
                return 0.0

            model = IsolationForest(n_estimators=50, contamination=0.1, random_state=42)
            X = np.array(window).reshape(-1, 1)
            model.fit(X)
            self.models[sensor_id] = model
            return float(model.decision_function([[value]])[0])

    def record_anomaly(self, payload: dict):
        with self._lock:
            self.anomalies.appendleft(payload)
            self.total_anomalies += 1

    def increment_messages(self):
        with self._lock:
            self.total_messages += 1

    def get_recent_anomalies(self, n: int = 20) -> List[dict]:
        with self._lock:
            return list(self.anomalies)[:n]

    def get_stats(self) -> dict:
        with self._lock:
            return {
                "total_messages_consumed": self.total_messages,
                "total_anomalies_detected": self.total_anomalies,
                "active_sensors": len(self.windows),
                "started_at": self.started_at,
            }


store = AnomalyStore()

# ── FastAPI ──────────────────────────────────────────────────────────────────
app = FastAPI(
    title="PulseCity Anomaly Detector",
    description="Détection d'anomalies IoT via Isolation Forest",
    version="2.0.0",
)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "pulsecity-anomaly-detector",
        "version": "2.0.0",
        "kafka_bootstrap": KAFKA_BOOTSTRAP,
        "window_size": WINDOW_SIZE,
        "min_samples": MIN_SAMPLES,
        "anomaly_threshold": ANOMALY_THRESHOLD,
        **store.get_stats(),
    }


@app.get("/anomalies")
def get_anomalies(limit: int = 20):
    anomalies = store.get_recent_anomalies(n=min(limit, 100))
    return {"count": len(anomalies), "anomalies": anomalies}


@app.get("/metrics")
def metrics():
    """Endpoint Prometheus — scrapé par le ServiceMonitor toutes les 15s."""
    return Response(generate_latest(REGISTRY), media_type=CONTENT_TYPE_LATEST)


# ── Kafka helpers ────────────────────────────────────────────────────────────
def create_kafka_consumer(max_retries: int = 15, delay: int = 6) -> KafkaConsumer:
    for attempt in range(1, max_retries + 1):
        try:
            print(f"[Kafka Consumer] Connexion (tentative {attempt}/{max_retries})…")
            consumer = KafkaConsumer(
                *TOPICS_TO_CONSUME,
                bootstrap_servers=KAFKA_BOOTSTRAP,
                value_deserializer=lambda v: json.loads(v.decode("utf-8")),
                auto_offset_reset="latest",
                enable_auto_commit=True,
                group_id="pulsecity-anomaly-detector-v2",
                consumer_timeout_ms=1000,
                api_version_auto_timeout_ms=10_000,
            )
            print(f"[Kafka Consumer] ✅ Connecté — topics : {TOPICS_TO_CONSUME}")
            return consumer
        except NoBrokersAvailable:
            print(f"[Kafka Consumer] ⏳ Kafka pas prêt, attente {delay}s…")
            time.sleep(delay)
    raise RuntimeError("Impossible de joindre Kafka (consumer).")


def create_kafka_producer(max_retries: int = 15, delay: int = 6) -> KafkaProducer:
    for attempt in range(1, max_retries + 1):
        try:
            producer = KafkaProducer(
                bootstrap_servers=KAFKA_BOOTSTRAP,
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                acks="all",
                api_version_auto_timeout_ms=10_000,
            )
            print("[Kafka Producer] ✅ Connecté")
            return producer
        except NoBrokersAvailable:
            time.sleep(delay)
    raise RuntimeError("Impossible de joindre Kafka (producer).")


# ── Boucle de détection ──────────────────────────────────────────────────────
def detection_loop():
    consumer = create_kafka_consumer()
    producer = create_kafka_producer()
    print("[Detector] 🔍 Boucle de détection démarrée…")

    while True:
        try:
            for message in consumer:
                payload: dict = message.value
                store.increment_messages()

                sensor_id   = payload.get("sensor_id", "unknown")
                sensor_type = payload.get("sensor_type", "unknown")
                zone        = payload.get("zone", "unknown")
                value       = float(payload.get("value", 0.0))
                unit        = payload.get("unit", "")
                timestamp   = payload.get("timestamp", datetime.datetime.utcnow().isoformat() + "Z")

                # Incrémenter le compteur de messages par type de capteur
                messages_counter.labels(sensor_type=sensor_type).inc()

                # Mesurer la latence de traitement Isolation Forest
                with processing_latency.time():
                    score = store.add_reading(sensor_id, value)

                if score == 0.0:
                    continue   # pas encore assez de données

                is_anomaly = score < ANOMALY_THRESHOLD

                if is_anomaly:
                    confidence = min(1.0, round(abs(score) / 0.5, 3))
                    alert_level = "HIGH" if confidence > 0.6 else "MEDIUM"

                    alert = {
                        "timestamp":       timestamp,
                        "detected_at":     datetime.datetime.utcnow().isoformat() + "Z",
                        "sensor_id":       sensor_id,
                        "sensor_type":     sensor_type,
                        "zone":            zone,
                        "value":           value,
                        "unit":            unit,
                        "isolation_score": round(score, 4),
                        "confidence":      confidence,
                        "anomaly":         True,
                        "alert_level":     alert_level,
                        "source":          "isolation-forest-v2",
                        "message": (
                            f"[IA] Anomalie sur {sensor_type} à {zone} : "
                            f"{value} {unit} (score={score:.4f}, conf={confidence:.0%})"
                        ),
                    }

                    # Métriques Prometheus
                    anomalies_counter.labels(
                        zone=zone,
                        sensor_type=sensor_type,
                        alert_level=alert_level,
                    ).inc()

                    producer.send(ALERTS_TOPIC, value=alert)
                    producer.flush()
                    store.record_anomaly(alert)

                    print(
                        f"⚠ IA | {zone:<14} | {sensor_type:<8} | "
                        f"{value:>10} {unit:<14} | score={score:.4f} | {alert_level}"
                    )
                else:
                    print(
                        f"  OK | {zone:<14} | {sensor_type:<8} | "
                        f"{value:>10} {unit:<14} | score={score:.4f}"
                    )

        except StopIteration:
            pass
        except Exception as exc:
            print(f"[Detector] ⚠ Erreur : {exc}")
            time.sleep(2)


# ── Point d'entrée ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 65)
    print("  PulseCity — Anomaly Detector v2 (avec métriques Prometheus)")
    print(f"  Kafka  : {KAFKA_BOOTSTRAP}")
    print(f"  Topics : {TOPICS_TO_CONSUME}")
    print(f"  API    : http://0.0.0.0:{API_PORT}  (/health /anomalies /metrics)")
    print("=" * 65)

    thread = threading.Thread(target=detection_loop, daemon=True, name="kafka-detector")
    thread.start()

    uvicorn.run(app, host="0.0.0.0", port=API_PORT, log_level="warning")
