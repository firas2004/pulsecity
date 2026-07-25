"""
PulseCity IoT Simulator v4 — Capteurs Dynamiques
=================================================
- Lit les capteurs actifs depuis l'API backend toutes les 60s
- Génère des données réalistes basées sur min/max de la DB
- Fallback sur la configuration hardcodée si l'API est inaccessible
- Expose des métriques Prometheus sur le port 8001
"""

import json
import os
import random
import time
import datetime
import threading
import requests

from kafka import KafkaProducer
from kafka.errors import NoBrokersAvailable
from prometheus_client import Counter, Gauge, start_http_server

# ── Configuration via env vars ───────────────────────────────────────────────
KAFKA_BOOTSTRAP   = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka.kafka.svc.cluster.local:9092")
BACKEND_URL       = os.getenv("BACKEND_URL", "http://backend-v2.default.svc.cluster.local:8002")
SEND_INTERVAL     = int(os.getenv("SEND_INTERVAL_SECONDS", "5"))
ANOMALY_PROB      = float(os.getenv("ANOMALY_PROBABILITY", "0.10"))
METRICS_PORT      = int(os.getenv("METRICS_PORT", "8001"))
SENSOR_REFRESH_S  = int(os.getenv("SENSOR_REFRESH_SECONDS", "60"))

# ── Métriques Prometheus ─────────────────────────────────────────────────────
messages_sent_counter = Counter(
    "pulsecity_messages_sent_total",
    "Nombre total de messages envoyés dans Kafka",
    ["zone", "sensor_type"],
)
anomalies_simulated_counter = Counter(
    "pulsecity_anomalies_simulated_total",
    "Nombre total d'anomalies simulées",
    ["zone", "sensor_type"],
)
active_sensors_gauge = Gauge(
    "pulsecity_active_sensors_total",
    "Nombre de capteurs actifs surveillés",
)

# ── Configuration de fallback (si API indisponible) ──────────────────────────
FALLBACK_ZONES = ["Tunis-Centre", "Ariana", "Ben-Arous", "La-Marsa", "Sfax", "Sousse",
                  "Gabes", "Bizerte", "Kairouan", "Monastir", "Nabeul", "Medenine",
                  "Jendouba", "Gafsa", "Mahdia", "Tozeur", "Beja", "Siliana"]

FALLBACK_SENSORS = [
    # ── Original 4 ────────────────────────────────────────────────────────────
    {"type": "traffic",       "unit": "vehicles/min", "min_normal": 10,   "max_normal": 120,  "min_anomaly": 200,  "max_anomaly": 400},
    {"type": "air_co2",       "unit": "ppm",          "min_normal": 350,  "max_normal": 800,  "min_anomaly": 1200, "max_anomaly": 2000},
    {"type": "noise",         "unit": "dB",           "min_normal": 35,   "max_normal": 75,   "min_anomaly": 100,  "max_anomaly": 130},
    {"type": "energy",        "unit": "kWh",          "min_normal": 50,   "max_normal": 500,  "min_anomaly": 900,  "max_anomaly": 1500},
    # ── Session-2 batch: 5 env/urban sensors ────────────────────────────────────────
    {"type": "temperature",   "unit": "°C",           "min_normal": 12,   "max_normal": 38,   "min_anomaly": 45,   "max_anomaly": 55},
    {"type": "humidity",      "unit": "%",            "min_normal": 30,   "max_normal": 75,   "min_anomaly": 90,   "max_anomaly": 100},
    {"type": "wind_speed",    "unit": "km/h",         "min_normal": 5,    "max_normal": 40,   "min_anomaly": 80,   "max_anomaly": 130},
    {"type": "pedestrian",    "unit": "people/min",   "min_normal": 5,    "max_normal": 200,  "min_anomaly": 400,  "max_anomaly": 700},
    {"type": "waste_fill",    "unit": "%",            "min_normal": 0,    "max_normal": 70,   "min_anomaly": 85,   "max_anomaly": 100},
    # ── Session-3 batch: 3 city-service sensors ─────────────────────────────────────
    # pH 6.5–8.5 = normal drinking water; <5.5 or >9.5 = anomaly
    {"type": "water_quality",  "unit": "pH",           "min_normal": 6.5,  "max_normal": 8.5,  "min_anomaly": 9.5,  "max_anomaly": 11.0},
    # % free parking spots; <5% = lot full = anomaly
    {"type": "parking",        "unit": "%",            "min_normal": 20,   "max_normal": 95,   "min_anomaly": 0,    "max_anomaly": 5},
    # dedicated foot-traffic counter (station-level, vs pedestrian area sensor)
    {"type": "foot_traffic",   "unit": "people/min",   "min_normal": 10,   "max_normal": 250,  "min_anomaly": 450,  "max_anomaly": 700},
]

# Topic mapping
def sensor_type_to_topic(sensor_type: str) -> str:
    mapping = {
        # Original 4
        "traffic":       "traffic-data",
        "air_co2":       "air-quality",
        "noise":         "noise-level",
        "energy":        "energy-data",
        # Session-2: env/urban
        "temperature":   "temperature-data",
        "humidity":      "humidity-data",
        "wind_speed":    "wind-data",
        "pedestrian":    "pedestrian-data",
        "waste_fill":    "waste-data",
        # Session-3: city-service
        "water_quality": "water-quality",
        "parking":       "parking-data",
        "foot_traffic":  "foot-traffic",
    }
    return mapping.get(sensor_type, f"sensor-{sensor_type}")

# ── État global des capteurs (mis à jour dynamiquement) ──────────────────────
_sensors_lock = threading.Lock()
_active_sensors: list = []  # liste de dicts depuis /internal/sensors

def build_fallback_sensors() -> list:
    """Génère la liste de capteurs fallback à partir des zones et types hardcodés."""
    result = []
    for zone in FALLBACK_ZONES:
        zone_id = zone.lower().replace(" ", "-").replace("é", "e").replace("è", "e").replace("ê", "e")
        for s in FALLBACK_SENSORS:
            result.append({
                "id":          f"{zone_id}-{s['type']}-001",
                "type":        s["type"],
                "city_id":     zone_id,
                "unit":        s["unit"],
                "min_normal":  s["min_normal"],
                "max_normal":  s["max_normal"],
                "min_anomaly": s["min_anomaly"],
                "max_anomaly": s["max_anomaly"],
                "_zone_display": zone,
            })
    return result

def fetch_sensors_from_api() -> list:
    """Interroge le backend pour la liste des capteurs actifs."""
    try:
        resp = requests.get(f"{BACKEND_URL}/internal/sensors", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            # Add display zone name
            for s in data:
                city_id = s.get("city_id", "")
                s["_zone_display"] = city_id.replace("-", " ").title()
            return data
    except Exception as e:
        print(f"[Simulateur] ⚠ API inaccessible, fallback: {e}")
    return []

def sensor_refresh_loop():
    """Rafraîchit la liste des capteurs depuis l'API toutes les SENSOR_REFRESH_S secondes."""
    global _active_sensors
    while True:
        sensors = fetch_sensors_from_api()
        with _sensors_lock:
            if sensors:
                _active_sensors = sensors
                print(f"[Simulateur] 🔄 {len(sensors)} capteurs chargés depuis l'API backend.")
            elif not _active_sensors:
                _active_sensors = build_fallback_sensors()
                print(f"[Simulateur] ⚡ Fallback: {len(_active_sensors)} capteurs hardcodés.")
        active_sensors_gauge.set(len(_active_sensors))
        time.sleep(SENSOR_REFRESH_S)


def generate_reading(sensor: dict) -> dict:
    """Génère une lecture réaliste pour un capteur donné."""
    is_anomaly = random.random() < ANOMALY_PROB
    if is_anomaly:
        min_v = sensor.get("min_anomaly", 150.0)
        max_v = sensor.get("max_anomaly", 300.0)
    else:
        min_v = sensor.get("min_normal", 0.0)
        max_v = sensor.get("max_normal", 100.0)

    value = round(random.uniform(min_v, max_v), 2)
    zone  = sensor.get("_zone_display", sensor.get("city_id", "unknown"))

    return {
        "timestamp":   datetime.datetime.utcnow().isoformat() + "Z",
        "zone":        zone,
        "sensor_type": sensor["type"],
        "value":       value,
        "unit":        sensor.get("unit", "unit"),
        "anomaly":     is_anomaly,
        "sensor_id":   sensor["id"],
    }


# ── Producteur Kafka avec retry ──────────────────────────────────────────────
def create_producer(max_retries: int = 10, retry_delay: int = 6) -> KafkaProducer:
    for attempt in range(1, max_retries + 1):
        try:
            print(f"[Kafka] Connexion à {KAFKA_BOOTSTRAP} (tentative {attempt}/{max_retries})…")
            producer = KafkaProducer(
                bootstrap_servers=KAFKA_BOOTSTRAP,
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                acks="all",
                retries=3,
                request_timeout_ms=10_000,
                api_version_auto_timeout_ms=10_000,
            )
            print("[Kafka] ✅ Connecté")
            return producer
        except NoBrokersAvailable:
            print(f"[Kafka] ⏳ Attente {retry_delay}s…")
            time.sleep(retry_delay)
    raise RuntimeError("Impossible de joindre Kafka.")


def main():
    # 1. Démarrer le serveur HTTP Prometheus
    start_http_server(METRICS_PORT)
    print(f"[Prometheus] ✅ Serveur métriques démarré sur :{METRICS_PORT}/metrics")

    # 2. Charger les capteurs initiaux (fallback)
    global _active_sensors
    _active_sensors = build_fallback_sensors()

    # 3. Démarrer le thread de refresh des capteurs
    refresh_thread = threading.Thread(target=sensor_refresh_loop, daemon=True)
    refresh_thread.start()

    print("=" * 65)
    print("  PulseCity IoT Simulator v4 — Capteurs Dynamiques 🚀")
    print(f"  Kafka     : {KAFKA_BOOTSTRAP}")
    print(f"  Backend   : {BACKEND_URL}")
    print(f"  Métriques : http://0.0.0.0:{METRICS_PORT}/metrics")
    print(f"  Refresh   : tous les {SENSOR_REFRESH_S}s")
    print(f"  Intervalle: {SEND_INTERVAL}s | Anomalies: {int(ANOMALY_PROB*100)}%")
    print("=" * 65)

    producer = create_producer()
    cycle = 0

    try:
        while True:
            cycle += 1
            print(f"\n─── Cycle #{cycle} ───")

            with _sensors_lock:
                current_sensors = list(_active_sensors)

            sent = 0
            for sensor in current_sensors:
                reading = generate_reading(sensor)
                topic   = sensor_type_to_topic(sensor["type"])

                # Envoi Kafka principal
                producer.send(topic, value=reading)
                sent += 1

                if reading["anomaly"]:
                    alert_payload = {
                        **reading,
                        "alert_level": "HIGH",
                        "source": "simulated",
                        "message": (
                            f"Anomalie simulée sur {sensor['type']} "
                            f"à {reading['zone']} : {reading['value']} {reading['unit']}"
                        ),
                    }
                    producer.send("alerts", value=alert_payload)

                # Métriques Prometheus
                zone_label = reading["zone"]
                messages_sent_counter.labels(zone=zone_label, sensor_type=sensor["type"]).inc()
                if reading["anomaly"]:
                    anomalies_simulated_counter.labels(zone=zone_label, sensor_type=sensor["type"]).inc()

                tag = "⚠ ALERT" if reading["anomaly"] else "  OK   "
                print(f"{tag} | {reading['zone']:<16} | {sensor['type']:<12} | {reading['value']:>10} {reading['unit']}")

            producer.flush()
            print(f"[Kafka] ✅ {sent} messages envoyés. Prochain cycle dans {SEND_INTERVAL}s…")
            time.sleep(SEND_INTERVAL)

    except KeyboardInterrupt:
        print("\n[Simulateur] Arrêt.")
    finally:
        producer.flush()
        producer.close()


if __name__ == "__main__":
    main()
