# ── PulseCity — Anomaly Detector v1 ─────────────────────────────────────────
FROM python:3.11-slim

LABEL maintainer="PulseCity Team"
LABEL description="Microservice IA de détection d'anomalies (Isolation Forest + Kafka + FastAPI)"
LABEL version="1.0"

WORKDIR /app

# Installer les dépendances système nécessaires à scikit-learn
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copier les dépendances en premier (cache Docker optimisé)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY detector.py .

# Variables d'environnement avec valeurs par défaut
ENV KAFKA_BOOTSTRAP_SERVERS="kafka.kafka.svc.cluster.local:9092"
ENV WINDOW_SIZE="50"
ENV MIN_SAMPLES="15"
ENV ANOMALY_THRESHOLD="-0.05"
ENV API_PORT="8000"
ENV PYTHONUNBUFFERED="1"

# Exposer le port FastAPI
EXPOSE 8000

CMD ["python", "-u", "detector.py"]
