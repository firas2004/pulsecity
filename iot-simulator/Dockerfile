# ── PulseCity IoT Simulator v2 ───────────────────────────────────────────────
FROM python:3.11-slim

LABEL maintainer="PulseCity Team"
LABEL description="IoT Sensor Simulator v2 – avec producteur Kafka"
LABEL version="2.0"

WORKDIR /app

# Copier les dépendances en premier (cache Docker optimisé)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le script simulateur
COPY sensor.py .

# Variables d'environnement avec valeurs par défaut
ENV KAFKA_BOOTSTRAP_SERVERS="kafka.kafka.svc.cluster.local:9092"
ENV SEND_INTERVAL_SECONDS="5"
ENV ANOMALY_PROBABILITY="0.10"
ENV PYTHONUNBUFFERED="1"

CMD ["python", "-u", "sensor.py"]
