# ── PulseCity — Backend V2 Dockerfile ────────────────────────────────────────
FROM python:3.11-slim

LABEL maintainer="PulseCity Team"
LABEL description="Backend V2 - FastAPI API, WebSockets & Kafka Consumer"
LABEL version="2.0"

WORKDIR /app

# Copier les dépendances en premier (cache Docker optimisé)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Variables d'environnement avec valeurs par défaut
ENV DATABASE_URL="sqlite:////app/data/pulsecity.db"
ENV JWT_SECRET="pulsecity-v2-super-secret-key-123456789-abcdef"
ENV KAFKA_BROKER="kafka.kafka.svc.cluster.local:9092"
ENV ANOMALY_DETECTOR_URL="http://anomaly-detector.default.svc.cluster.local:8000"
ENV PYTHONUNBUFFERED="1"

EXPOSE 8002

# Lancement avec uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
