import datetime

# Dictionnaire en mémoire : sensor_id -> dict (dernière valeur reçue)
# ex: {"tunis-centre-traffic-001": {"value": 45.0, "unit": "vehicles/min", "timestamp": "2026-07-08T12:00:00Z", "anomaly": False}}
latest_metrics = {}

# Historique en mémoire : sensor_id -> list of dicts
# ex: {"tunis-centre-traffic-001": [{"timestamp": datetime, "value": 45.0}]}
metrics_history = {}

def add_metric_to_history(sensor_id: str, value: float, timestamp_dt: datetime.datetime):
    if sensor_id not in metrics_history:
        metrics_history[sensor_id] = []
    
    # Ajouter le nouveau point
    metrics_history[sensor_id].append({
        "timestamp": timestamp_dt,
        "value": value
    })
    
    # Limiter à 24 heures d'historique
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(hours=24)
    metrics_history[sensor_id] = [
        pt for pt in metrics_history[sensor_id]
        if pt["timestamp"] >= cutoff
    ]
