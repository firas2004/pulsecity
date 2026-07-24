import time
import json
import datetime
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
from config import settings
from models.database import SessionLocal
from models.city import City
from models.alert import Alert
from state import latest_metrics, add_metric_to_history
from agents.threshold_agent import threshold_agent
from agents.traffic_agent import traffic_agent

TOPICS = ["traffic-data", "air-quality", "noise-level", "energy-data", "alerts"]

def create_kafka_consumer(max_retries: int = 15, delay_seconds: int = 6) -> KafkaConsumer:
    for attempt in range(1, max_retries + 1):
        try:
            print(f"[Kafka Consumer] Connexion à {settings.KAFKA_BROKER} (tentative {attempt}/{max_retries})…")
            consumer = KafkaConsumer(
                *TOPICS,
                bootstrap_servers=settings.KAFKA_BROKER,
                value_deserializer=lambda v: json.loads(v.decode("utf-8")),
                auto_offset_reset="latest",
                enable_auto_commit=True,
                group_id="pulsecity-backend-v2",
                consumer_timeout_ms=1000,
                api_version_auto_timeout_ms=10_000
            )
            print(f"[Kafka Consumer] ✅ Connecté aux topics : {TOPICS}")
            return consumer
        except NoBrokersAvailable:
            print(f"[Kafka Consumer] ⏳ Kafka pas encore disponible, attente {delay_seconds}s…")
            time.sleep(delay_seconds)
    raise RuntimeError("Impossible de se connecter à Kafka.")

def run_consumer_loop():
    try:
        consumer = create_kafka_consumer()
    except Exception as e:
        print(f"[Kafka Consumer] ❌ Erreur critique lors de l'initialisation : {e}")
        return

    print("[Kafka Consumer] 🔍 Démarrage de la boucle de consommation…")
    
    while True:
        try:
            # Lire les messages du consumer
            messages = consumer.poll(timeout_ms=1000)
            if not messages:
                continue

            for topic_partition, partition_messages in messages.items():
                for message in partition_messages:
                    payload = message.value
                    if not payload:
                        continue
                    
                    topic_name = topic_partition.topic
                    
                    # Traiter le message
                    process_message(topic_name, payload)

        except Exception as e:
            print(f"[Kafka Consumer] Erreur dans la boucle principale : {e}")
            time.sleep(2)

def process_message(topic: str, payload: dict):
    # Extraire les métadonnées de base
    sensor_id = payload.get("sensor_id", "unknown")
    sensor_type = payload.get("sensor_type", "unknown")
    zone = payload.get("zone", "unknown")
    value = payload.get("value")
    unit = payload.get("unit", "")
    timestamp_str = payload.get("timestamp", datetime.datetime.utcnow().isoformat() + "Z")
    
    # Formater le city_id
    city_id = zone.lower().replace(" ", "-").strip()
    if not city_id or city_id == "unknown":
        # Essayer d'extraire depuis le sensor_id
        if "-" in sensor_id:
            city_id = sensor_id.split("-")[0]
            
    # Convertir le timestamp en datetime
    try:
        if timestamp_str.endswith("Z"):
            timestamp_str = timestamp_str[:-1]
        dt = datetime.datetime.fromisoformat(timestamp_str)
    except Exception:
        dt = datetime.datetime.utcnow()

    db = SessionLocal()
    try:
        # Vérifier si la ville existe en base
        city = db.query(City).filter(City.id == city_id).first()
        if not city:
            # Si elle n'existe pas, on l'ignore ou on la crée à la volée. 
            # Créons-la à la volée pour faciliter les démos sans configuration préalable !
            city = City(
                id=city_id,
                name=zone,
                country="Tunisia",
                latitude=36.8,  # lat de base
                longitude=10.2, # lon de base
                status="Healthy"
            )
            db.add(city)
            db.commit()
            db.refresh(city)
            print(f"[Kafka Consumer] 🏙 Ville '{zone}' créée dynamiquement en DB.")

        if topic == "alerts":
            # C'est une alerte (soit du simulateur, soit du détecteur d'anomalies ML)
            level = payload.get("alert_level", "yellow")
            message_text = payload.get("message", "Alerte de capteur détectée")
            
            # Sauvegarder l'alerte en DB
            new_alert = Alert(
                city_id=city_id,
                sensor_id=sensor_id,
                value=float(value) if value is not None else 0.0,
                level=level,
                message=message_text,
                timestamp=dt,
                active=True
            )
            db.add(new_alert)
            
            # Mettre à jour le statut de la ville
            if level.upper() == "HIGH" or level.lower() == "red":
                city.status = "Critical"
            elif city.status != "Critical":
                city.status = "Warning"
                
            db.commit()
            print(f"[Kafka Consumer] ⚠ Alerte reçue et enregistrée en DB pour {city_id} : {message_text}")
            
            # Si c'est une alerte de type anomaly du ML, mettre à jour latest_metrics avec l'état d'anomalie
            if payload.get("anomaly") and value is not None:
                latest_metrics[sensor_id] = {
                    "value": float(value),
                    "unit": unit,
                    "timestamp": dt.isoformat() + "Z",
                    "anomaly": True
                }
                
        else:
            # C'est une métrique standard
            if value is not None:
                val = float(value)
                
                # 1. Mettre à jour l'état en mémoire
                latest_metrics[sensor_id] = {
                    "value": val,
                    "unit": unit,
                    "timestamp": dt.isoformat() + "Z",
                    "anomaly": payload.get("anomaly", False)
                }
                
                # 2. Ajouter à l'historique en mémoire
                add_metric_to_history(sensor_id, val, dt)
                
                # 3. Évaluer les seuils via les agents de règle et de trafic
                threshold_agent.evaluate(db, sensor_id, sensor_type, city_id, val)
                
                if sensor_type == "traffic":
                    traffic_agent.evaluate(db, city_id, val)
                    
    except Exception as e:
        print(f"[Kafka Consumer] Erreur lors du traitement du message : {e}")
        db.rollback()
    finally:
        db.close()
