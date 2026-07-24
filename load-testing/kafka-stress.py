"""
PulseCity — Test de débit Kafka
================================
Envoie 1000 messages/seconde dans les topics PulseCity et mesure
le Consumer Lag du détecteur d'anomalies.

Usage :
  python load-testing/kafka-stress.py

  # Avec options personnalisées :
  python load-testing/kafka-stress.py --rate 1000 --duration 60 --broker kafka.kafka.svc.cluster.local:9092
"""

import argparse
import json
import random
import time
import datetime
import threading
from collections import defaultdict

try:
    from kafka import KafkaProducer, KafkaAdminClient, KafkaConsumer
    from kafka.admin import NewTopic
    from kafka.errors import NoBrokersAvailable, UnknownTopicOrPartitionError
except ImportError:
    print("ERROR : 'kafka-python' non installé. Exécutez : pip install kafka-python")
    raise SystemExit(1)

# ── Configuration ─────────────────────────────────────────────────────────────
TOPICS = ["traffic-data", "air-quality", "noise-level", "energy-data"]
ZONES  = ["Tunis-Centre", "Ariana", "Ben-Arous", "La-Marsa", "Sfax", "Sousse"]
SENSOR_TYPES = ["traffic", "air_co2", "noise", "energy"]
CONSUMER_GROUP = "pulsecity-anomaly-detector-v2"

# ── Générateur de payload ──────────────────────────────────────────────────────
def make_payload(topic: str) -> dict:
    zone = random.choice(ZONES)
    sensor = random.choice(SENSOR_TYPES)
    return {
        "timestamp":   datetime.datetime.utcnow().isoformat() + "Z",
        "zone":        zone,
        "sensor_type": sensor,
        "value":       round(random.uniform(10, 500), 2),
        "unit":        "units",
        "anomaly":     False,
        "sensor_id":   f"{zone.lower()}-{sensor}-stress",
    }

# ── Statistiques temps réel ────────────────────────────────────────────────────
class StressStats:
    def __init__(self):
        self._lock = threading.Lock()
        self.sent     = 0
        self.errors   = 0
        self.start_ts = time.monotonic()
        self.batches  = []  # (timestamp, batch_size)

    def add_batch(self, n: int):
        with self._lock:
            self.sent += n
            self.batches.append((time.monotonic(), n))

    def add_error(self, n: int = 1):
        with self._lock:
            self.errors += n

    def throughput(self) -> float:
        elapsed = time.monotonic() - self.start_ts
        return self.sent / elapsed if elapsed > 0 else 0.0

    def print_report(self):
        elapsed = time.monotonic() - self.start_ts
        print("\n" + "=" * 65)
        print("  PulseCity — Rapport de Test de Débit Kafka")
        print("=" * 65)
        print(f"  Durée           : {elapsed:.1f}s")
        print(f"  Messages envoyés: {self.sent:,}")
        print(f"  Erreurs         : {self.errors:,}")
        print(f"  Débit réel      : {self.throughput():.1f} msg/s")
        print(f"  Taux de succès  : {((self.sent - self.errors) / max(self.sent, 1) * 100):.2f}%")
        print("=" * 65)

# ── Producer Thread ────────────────────────────────────────────────────────────
def producer_thread(broker: str, target_rate: int, duration: int, stats: StressStats):
    try:
        producer = KafkaProducer(
            bootstrap_servers=broker,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            acks=1,          # acks=1 pour maximiser le débit (pas all)
            linger_ms=10,    # Micro-batch de 10ms
            batch_size=65536,
            buffer_memory=67_108_864,  # 64 MB buffer
            compression_type="gzip",
        )
    except NoBrokersAvailable as e:
        print(f"ERREUR : Impossible de se connecter à Kafka ({broker}) : {e}")
        return

    batch_size = max(1, target_rate // 100)  # Envoi par batches de 10ms
    interval   = batch_size / target_rate    # Intervalle entre batches

    end_time = time.monotonic() + duration
    print(f"[Stress] 🚀 Démarrage : {target_rate:,} msg/s pendant {duration}s…")
    print(f"[Stress]    Batch size : {batch_size} | Intervalle : {interval*1000:.1f}ms")

    while time.monotonic() < end_time:
        batch_start = time.monotonic()
        errors = 0

        for _ in range(batch_size):
            topic = random.choice(TOPICS)
            payload = make_payload(topic)
            try:
                producer.send(topic, value=payload)
            except Exception:
                errors += 1

        producer.flush(timeout=5)
        stats.add_batch(batch_size)
        if errors:
            stats.add_error(errors)

        # Régulation du débit
        elapsed = time.monotonic() - batch_start
        sleep_time = max(0, interval - elapsed)
        if sleep_time > 0:
            time.sleep(sleep_time)

    producer.flush()
    producer.close()
    print("[Stress] ✅ Producteur terminé.")

# ── Consumer Lag Monitor ───────────────────────────────────────────────────────
def monitor_consumer_lag(broker: str, group_id: str, interval: int = 5):
    """Mesure périodiquement le consumer lag du groupe."""
    try:
        admin = KafkaAdminClient(bootstrap_servers=broker)
    except Exception as e:
        print(f"[Monitor] ⚠ Impossible de créer AdminClient : {e}")
        return

    print(f"\n[Monitor] 📊 Surveillance du consumer lag (groupe: {group_id})")

    while True:
        try:
            offsets = admin.list_consumer_group_offsets(group_id)
            if offsets:
                total_lag = 0
                lag_by_topic = defaultdict(int)
                for (topic, partition), offset_info in offsets.items():
                    lag = max(0, offset_info.offset)
                    lag_by_topic[topic] += lag
                    total_lag += lag

                ts = datetime.datetime.now().strftime("%H:%M:%S")
                print(f"\n[Monitor] [{ts}] Consumer Lag total : {total_lag:,}")
                for topic, lag in sorted(lag_by_topic.items()):
                    print(f"           {topic:<20} : {lag:,} messages en retard")
            else:
                print(f"[Monitor] ℹ️  Aucun offset enregistré pour le groupe '{group_id}'")
        except Exception as e:
            print(f"[Monitor] ⚠ Erreur lag : {e}")

        time.sleep(interval)

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="PulseCity Kafka Stress Test")
    parser.add_argument("--broker",   default="localhost:9092",
                        help="Adresse du broker Kafka (défaut: localhost:9092)")
    parser.add_argument("--rate",     type=int, default=1000,
                        help="Débit cible en messages/seconde (défaut: 1000)")
    parser.add_argument("--duration", type=int, default=60,
                        help="Durée du test en secondes (défaut: 60)")
    parser.add_argument("--no-monitor", action="store_true",
                        help="Désactiver le monitoring du consumer lag")
    args = parser.parse_args()

    print("=" * 65)
    print("  PulseCity — Kafka Stress Test")
    print("=" * 65)
    print(f"  Broker   : {args.broker}")
    print(f"  Débit    : {args.rate:,} msg/s")
    print(f"  Durée    : {args.duration}s")
    print(f"  Topics   : {', '.join(TOPICS)}")
    print("=" * 65 + "\n")

    stats = StressStats()

    # Thread moniteur de consumer lag
    if not args.no_monitor:
        monitor_t = threading.Thread(
            target=monitor_consumer_lag,
            args=(args.broker, CONSUMER_GROUP),
            daemon=True,
            name="lag-monitor",
        )
        monitor_t.start()

    # Thread producteur
    prod_t = threading.Thread(
        target=producer_thread,
        args=(args.broker, args.rate, args.duration, stats),
        name="stress-producer",
    )
    prod_t.start()

    # Affichage temps réel du débit
    try:
        while prod_t.is_alive():
            time.sleep(5)
            print(f"[Stats] Envoyés: {stats.sent:,} | Débit réel: {stats.throughput():.0f} msg/s | "
                  f"Erreurs: {stats.errors}")
    except KeyboardInterrupt:
        print("\n[Stress] ⚠ Interruption manuelle.")

    prod_t.join()
    stats.print_report()


if __name__ == "__main__":
    main()
