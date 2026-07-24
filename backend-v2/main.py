import asyncio
import threading
from typing import Optional, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
from config import settings
from models.database import Base, engine, SessionLocal
from models.city import City, Sensor, ThresholdRule
from models.user import User
from models.chat import ChatConversation, ChatMessage
from state import latest_metrics
from agents.weather_agent import weather_agent

# Import des routeurs
from routers import auth, cities, sensors, metrics, alerts, chat

# Initialisation de la base de données
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PulseCity V2 Backend",
    description="Microservice backend de gestion de ville intelligente et orchestration d'agents IA",
    version="2.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routeurs
app.include_router(auth.router)
app.include_router(cities.router)
app.include_router(sensors.router)
app.include_router(metrics.router)
app.include_router(alerts.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "pulsecity-backend-v2",
        "version": "2.0.0"
    }

# ── Endpoint interne pour le simulateur IoT (sans auth) ───────────────────────
@app.get("/internal/sensors", response_model=List[dict])
def get_all_active_sensors():
    """Endpoint public pour le simulateur IoT — retourne tous les capteurs actifs."""
    db = SessionLocal()
    try:
        active_sensors = db.query(Sensor).filter(Sensor.enabled == True).all()
        return [
            {
                "id": s.id,
                "type": s.type,
                "city_id": s.city_id,
                "unit": s.unit or "unit",
                "min_normal": s.min_normal or 0.0,
                "max_normal": s.max_normal or 100.0,
                "min_anomaly": s.min_anomaly or 150.0,
                "max_anomaly": s.max_anomaly or 300.0,
            }
            for s in active_sensors
        ]
    finally:
        db.close()

# ── Migration SQL pour nouvelles colonnes ─────────────────────────────────────
def migrate_database():
    """Ajoute les nouvelles colonnes si elles n'existent pas (migration manuelle SQLite)."""
    import sqlite3
    db_path = settings.DATABASE_URL.replace("sqlite:////", "/").replace("sqlite:///", "")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        # Vérifier et ajouter colonnes manquantes sur sensors
        cursor.execute("PRAGMA table_info(sensors)")
        existing_cols = {row[1] for row in cursor.fetchall()}
        new_sensor_cols = [
            ("unit", "TEXT DEFAULT 'unit'"),
            ("min_normal", "REAL DEFAULT 0.0"),
            ("max_normal", "REAL DEFAULT 100.0"),
            ("min_anomaly", "REAL DEFAULT 150.0"),
            ("max_anomaly", "REAL DEFAULT 300.0"),
            ("description", "TEXT DEFAULT ''"),
        ]
        for col_name, col_def in new_sensor_cols:
            if col_name not in existing_cols:
                cursor.execute(f"ALTER TABLE sensors ADD COLUMN {col_name} {col_def}")
                print(f"[Migration] ✅ Colonne ajoutée: sensors.{col_name}")
        # Vérifier et ajouter colonnes manquantes sur cities
        cursor.execute("PRAGMA table_info(cities)")
        existing_city_cols = {row[1] for row in cursor.fetchall()}
        new_city_cols = [
            ("description", "TEXT DEFAULT ''"),
            ("population", "INTEGER DEFAULT 0"),
        ]
        for col_name, col_def in new_city_cols:
            if col_name not in existing_city_cols:
                cursor.execute(f"ALTER TABLE cities ADD COLUMN {col_name} {col_def}")
                print(f"[Migration] ✅ Colonne ajoutée: cities.{col_name}")
        conn.commit()
        conn.close()
        print("[Migration] ✅ Migration terminée.")
    except Exception as e:
        print(f"[Migration] ⚠ Erreur migration: {e}")

# ── Seeding de la base de données au démarrage ────────────────────────────────
def seed_database():
    db = SessionLocal()
    try:
        # 1. Créer l'admin par défaut
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            from routers.auth import get_password_hash
            new_admin = User(
                username="admin",
                password_hash=get_password_hash("admin123"),
                role="admin",
                assigned_cities=""
            )
            db.add(new_admin)
            print("[Database Seed] ✅ Admin créé : admin / admin123")

        # 2. Toutes les villes tunisiennes
        ALL_CITY_IDS = [
            "tunis-centre","ariana","la-marsa","ben-arous","sfax","sousse",
            "gabes","bizerte","kairouan","monastir","nabeul","medenine",
            "jendouba","gafsa","mahdia","tozeur","beja","siliana",
        ]
        all_cities_str = ",".join(ALL_CITY_IDS)

        # 3. Créer le client par défaut
        client_user = db.query(User).filter(User.username == "client").first()
        if not client_user:
            from routers.auth import get_password_hash
            new_client = User(
                username="client",
                password_hash=get_password_hash("client123"),
                role="client",
                assigned_cities=all_cities_str
            )
            db.add(new_client)
            print("[Database Seed] ✅ Client créé : client / client123 (toutes les villes)")
        else:
            client_user.assigned_cities = all_cities_str
            print("[Database Seed] 🔄 Client mis à jour avec toutes les villes")

        # 4. Créer toutes les villes tunisiennes si vides
        default_cities = [
            {"id": "tunis-centre", "name": "Tunis Centre",  "lat": 36.8065, "lon": 10.1815, "pop": 650000,  "desc": "Capitale — zone dense et administrative"},
            {"id": "ariana",       "name": "Ariana",        "lat": 36.8665, "lon": 10.1930, "pop": 500000,  "desc": "Banlieue nord de Tunis, hub technologique"},
            {"id": "ben-arous",    "name": "Ben Arous",     "lat": 36.7531, "lon": 10.2222, "pop": 600000,  "desc": "Zone industrielle et résidentielle au sud"},
            {"id": "la-marsa",     "name": "La Marsa",      "lat": 36.8778, "lon": 10.3247, "pop": 90000,   "desc": "Ville côtière résidentielle et touristique"},
            {"id": "sfax",         "name": "Sfax",          "lat": 34.7406, "lon": 10.7603, "pop": 330000,  "desc": "2ème ville de Tunisie, centre industriel et portuaire"},
            {"id": "sousse",       "name": "Sousse",        "lat": 35.8256, "lon": 10.6369, "pop": 270000,  "desc": "Capitale du Sahel, pôle touristique et universitaire"},
            {"id": "gabes",        "name": "Gabès",         "lat": 33.8826, "lon": 10.0979, "pop": 140000,  "desc": "Oasis côtière, pôle chimique et industriel"},
            {"id": "bizerte",      "name": "Bizerte",       "lat": 37.2744, "lon": 9.8739,  "pop": 115000,  "desc": "Port stratégique au nord, zone industrielle"},
            {"id": "kairouan",     "name": "Kairouan",      "lat": 35.6781, "lon": 10.0964, "pop": 120000,  "desc": "Ville sainte, patrimoine UNESCO, artisanat"},
            {"id": "monastir",     "name": "Monastir",      "lat": 35.7693, "lon": 10.8113, "pop": 73000,   "desc": "Ville côtière, tourisme et aéroport international"},
            {"id": "nabeul",       "name": "Nabeul",        "lat": 36.4561, "lon": 10.7376, "pop": 80000,   "desc": "Cap Bon — céramique, agriculture et tourisme"},
            {"id": "medenine",     "name": "Médenine",      "lat": 33.3549, "lon": 10.5055, "pop": 70000,   "desc": "Gouvernorat du sud, gateway vers Djerba"},
            {"id": "jendouba",     "name": "Jendouba",      "lat": 36.5011, "lon": 8.7803,  "pop": 45000,   "desc": "Nord-ouest montagneux, agriculture et forêts"},
            {"id": "gafsa",        "name": "Gafsa",         "lat": 34.4250, "lon": 8.7842,  "pop": 85000,   "desc": "Bassin minier, phosphates — région industrielle"},
            {"id": "mahdia",       "name": "Mahdia",        "lat": 35.5047, "lon": 11.0622, "pop": 45000,   "desc": "Péninsule côtière, tourisme balnéaire"},
            {"id": "tozeur",       "name": "Tozeur",        "lat": 33.9197, "lon": 8.1335,  "pop": 40000,   "desc": "Oasis saharienne, écotourisme et dattes"},
            {"id": "beja",         "name": "Béja",          "lat": 36.7250, "lon": 9.1817,  "pop": 55000,   "desc": "Grenier à blé de la Tunisie, agriculture intensive"},
            {"id": "siliana",      "name": "Siliana",       "lat": 36.0844, "lon": 9.3706,  "pop": 25000,   "desc": "Région intérieure, agriculture de montagne"},
        ]

        # Default sensor specs
        default_sensors = [
            {"type": "traffic",     "unit": "vehicles/min", "min_n": 10,  "max_n": 120, "min_a": 200,  "max_a": 400,  "threshold": 120},
            {"type": "air_co2",     "unit": "ppm",          "min_n": 350, "max_n": 800, "min_a": 1200, "max_a": 2000, "threshold": 800},
            {"type": "noise",       "unit": "dB",           "min_n": 35,  "max_n": 75,  "min_a": 100,  "max_a": 130,  "threshold": 75},
            {"type": "energy",      "unit": "kWh",          "min_n": 50,  "max_n": 500, "min_a": 900,  "max_a": 1500, "threshold": 500},
        ]

        for item in default_cities:
            city_id = item["id"]
            db_city = db.query(City).filter(City.id == city_id).first()
            if not db_city:
                city = City(
                    id=city_id,
                    name=item["name"],
                    country="Tunisia",
                    latitude=item["lat"],
                    longitude=item["lon"],
                    status="Healthy",
                    description=item.get("desc", ""),
                    population=item.get("pop", 0),
                )
                db.add(city)

                for s in default_sensors:
                    sensor_id = f"{city_id}-{s['type']}-001"
                    sensor = Sensor(
                        id=sensor_id,
                        type=s["type"],
                        city_id=city_id,
                        enabled=True,
                        unit=s["unit"],
                        min_normal=s["min_n"],
                        max_normal=s["max_n"],
                        min_anomaly=s["min_a"],
                        max_anomaly=s["max_a"],
                    )
                    db.add(sensor)

                    rule = ThresholdRule(
                        city_id=city_id,
                        metric=s["type"],
                        operator=">",
                        value=s["threshold"],
                        level="red"
                    )
                    db.add(rule)

                print(f"[Database Seed] 🏙 Ville '{item['name']}' insérée.")
            else:
                # Update missing metadata on existing sensors
                for s in default_sensors:
                    sensor_id = f"{city_id}-{s['type']}-001"
                    existing_sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
                    if existing_sensor and existing_sensor.unit is None:
                        existing_sensor.unit = s["unit"]
                        existing_sensor.min_normal = s["min_n"]
                        existing_sensor.max_normal = s["max_n"]
                        existing_sensor.min_anomaly = s["min_a"]
                        existing_sensor.max_anomaly = s["max_a"]

        db.commit()
    except Exception as e:
        print(f"[Database Seed] ❌ Erreur d'initialisation : {e}")
        db.rollback()
    finally:
        db.close()

# ── Boucles d'arrière-plan ────────────────────────────────────────────────────
async def weather_agent_task():
    print("[WeatherAgent] ☀ Démarrage du cycle de l'agent météo d'arrière-plan…")
    while True:
        try:
            db = SessionLocal()
            weather_agent.run_cycle(db)
            db.close()
        except Exception as e:
            print(f"[WeatherAgent] ❌ Erreur de cycle météo : {e}")
        await asyncio.sleep(1800)

def start_kafka_consumer_thread():
    from kafka_consumer import run_consumer_loop
    consumer_thread = threading.Thread(target=run_consumer_loop, daemon=True)
    consumer_thread.start()
    print("[Kafka Consumer] 🔌 Thread consommateur démarré.")

@app.on_event("startup")
async def startup_event():
    migrate_database()
    seed_database()
    start_kafka_consumer_thread()
    asyncio.create_task(weather_agent_task())

# ── WebSocket temps réel ──────────────────────────────────────────────────────
@app.websocket("/ws/{city_id}")
async def websocket_endpoint(websocket: WebSocket, city_id: str, token: Optional[str] = None):
    await websocket.accept()
    city_id = city_id.lower().strip()

    if token:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            username = payload.get("sub")
            db = SessionLocal()
            user = db.query(User).filter(User.username == username).first()
            db.close()
            if not user or (user.role != "admin" and city_id not in user.get_city_ids()):
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
        except Exception:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

    try:
        print(f"[WebSocket] 🔌 Connexion acceptée pour la ville : {city_id}")
        while True:
            db = SessionLocal()
            city = db.query(City).filter(City.id == city_id).first()
            if not city:
                db.close()
                await websocket.send_json({"error": f"Ville '{city_id}' introuvable."})
                await asyncio.sleep(5)
                continue

            metrics_data = {}
            for sensor in city.sensors:
                if sensor.enabled:
                    metric = latest_metrics.get(sensor.id)
                    if metric:
                        metrics_data[sensor.type] = {**metric, "unit": sensor.unit or metric.get("unit", "unit")}
                    else:
                        metrics_data[sensor.type] = {
                            "value": None,
                            "unit": sensor.unit or "N/A",
                            "timestamp": None,
                            "anomaly": False
                        }

            status_val = city.status
            db.close()

            await websocket.send_json({
                "city_id": city_id,
                "status": status_val,
                "metrics": metrics_data
            })
            await asyncio.sleep(5)

    except WebSocketDisconnect:
        print(f"[WebSocket] 🔌 Déconnexion pour la ville : {city_id}")
    except Exception as e:
        print(f"[WebSocket] ❌ Erreur dans le flux WebSocket : {e}")
