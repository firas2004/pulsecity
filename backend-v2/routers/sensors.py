from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from models.database import get_db
from models.city import City, Sensor, ThresholdRule
from models.user import User
from routers.auth import require_admin, get_current_user

router = APIRouter(prefix="/admin/cities/{city_id}/sensors", tags=["sensors"])

# ── Known sensor defaults ─────────────────────────────────────────────────────
SENSOR_DEFAULTS = {
    "traffic":     {"unit": "vehicles/min", "min_normal": 10,  "max_normal": 120, "min_anomaly": 200, "max_anomaly": 400,  "threshold": 120},
    "air_co2":     {"unit": "ppm",          "min_normal": 350, "max_normal": 800, "min_anomaly": 1200,"max_anomaly": 2000, "threshold": 800},
    "noise":       {"unit": "dB",           "min_normal": 35,  "max_normal": 75,  "min_anomaly": 100, "max_anomaly": 130,  "threshold": 75},
    "energy":      {"unit": "kWh",          "min_normal": 50,  "max_normal": 500, "min_anomaly": 900, "max_anomaly": 1500, "threshold": 500},
    "temperature": {"unit": "°C",           "min_normal": 10,  "max_normal": 40,  "min_anomaly": 50,  "max_anomaly": 70,   "threshold": 45},
    "humidity":    {"unit": "%",            "min_normal": 20,  "max_normal": 80,  "min_anomaly": 90,  "max_anomaly": 100,  "threshold": 90},
    "pressure":    {"unit": "hPa",          "min_normal": 990, "max_normal": 1020,"min_anomaly": 940, "max_anomaly": 980,  "threshold": 980},
    "wind":        {"unit": "km/h",         "min_normal": 0,   "max_normal": 40,  "min_anomaly": 80,  "max_anomaly": 150,  "threshold": 70},
    "radiation":   {"unit": "µSv/h",        "min_normal": 0.05,"max_normal": 0.3, "min_anomaly": 1.0, "max_anomaly": 5.0,  "threshold": 0.5},
    "water_flow":  {"unit": "L/s",          "min_normal": 5,   "max_normal": 100, "min_anomaly": 200, "max_anomaly": 500,  "threshold": 150},
}

class SensorCreate(BaseModel):
    type: str
    unit: Optional[str] = None
    min_normal: Optional[float] = None
    max_normal: Optional[float] = None
    min_anomaly: Optional[float] = None
    max_anomaly: Optional[float] = None
    description: Optional[str] = ""

class SensorUpdate(BaseModel):
    enabled: bool


def _sensor_to_dict(s: Sensor) -> dict:
    return {
        "id": s.id,
        "type": s.type,
        "city_id": s.city_id,
        "enabled": s.enabled,
        "unit": s.unit or "unit",
        "min_normal": s.min_normal or 0,
        "max_normal": s.max_normal or 100,
        "min_anomaly": s.min_anomaly or 150,
        "max_anomaly": s.max_anomaly or 300,
        "description": s.description or "",
    }


@router.get("", response_model=List[dict])
def list_sensors(
    city_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    city_id = city_id.lower()
    if current_user.role != "admin" and city_id not in current_user.get_city_ids():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès refusé")
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="Ville non trouvée")
    return [_sensor_to_dict(s) for s in city.sensors]


@router.post("", response_model=dict, dependencies=[Depends(require_admin)])
def create_sensor(city_id: str, sensor_in: SensorCreate, db: Session = Depends(get_db)):
    city_id = city_id.lower()
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="Ville non trouvée")

    # Build sensor_id
    sensor_type = sensor_in.type.lower().replace(" ", "_")
    existing = db.query(Sensor).filter(Sensor.city_id == city_id, Sensor.type == sensor_type).count()
    sensor_id = f"{city_id}-{sensor_type}-{existing + 1:03d}"

    # Fill defaults
    defaults = SENSOR_DEFAULTS.get(sensor_type, {})
    new_sensor = Sensor(
        id=sensor_id,
        type=sensor_type,
        city_id=city_id,
        enabled=True,
        unit=sensor_in.unit or defaults.get("unit", "unit"),
        min_normal=sensor_in.min_normal if sensor_in.min_normal is not None else defaults.get("min_normal", 0),
        max_normal=sensor_in.max_normal if sensor_in.max_normal is not None else defaults.get("max_normal", 100),
        min_anomaly=sensor_in.min_anomaly if sensor_in.min_anomaly is not None else defaults.get("min_anomaly", 150),
        max_anomaly=sensor_in.max_anomaly if sensor_in.max_anomaly is not None else defaults.get("max_anomaly", 300),
        description=sensor_in.description or "",
    )
    db.add(new_sensor)

    # Add threshold rule if known type
    threshold = defaults.get("threshold")
    if threshold:
        rule = ThresholdRule(city_id=city_id, metric=sensor_type, operator=">", value=threshold, level="red")
        db.add(rule)

    db.commit()
    db.refresh(new_sensor)
    return {"message": f"Capteur '{sensor_id}' créé avec succès.", "sensor": _sensor_to_dict(new_sensor)}


@router.put("/{sensor_id}", response_model=dict, dependencies=[Depends(require_admin)])
def update_sensor(city_id: str, sensor_id: str, sens_up: SensorUpdate, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id, Sensor.city_id == city_id.lower()).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Capteur non trouvé")
    sensor.enabled = sens_up.enabled
    db.commit()
    return {"message": f"Capteur '{sensor_id}' mis à jour (enabled={sensor.enabled})."}


@router.delete("/{sensor_id}", response_model=dict, dependencies=[Depends(require_admin)])
def delete_sensor(city_id: str, sensor_id: str, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id, Sensor.city_id == city_id.lower()).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Capteur non trouvé")
    db.delete(sensor)
    db.commit()
    return {"message": f"Capteur '{sensor_id}' supprimé."}
