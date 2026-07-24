from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from models.database import get_db
from models.city import City, Sensor, ThresholdRule
from models.user import User
from routers.auth import require_admin, get_current_user

router = APIRouter(prefix="/admin/cities", tags=["cities"])

class RuleSchema(BaseModel):
    metric: str
    operator: str
    value: float
    level: str

class CityCreate(BaseModel):
    id: Optional[str] = None
    city_id: Optional[str] = None
    name: str
    country: Optional[str] = "Tunisia"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    description: Optional[str] = None
    population: Optional[int] = None
    sensors: List[str] = ["traffic", "air_co2", "noise", "energy"]
    rules: Optional[List[RuleSchema]] = []

class CityUpdate(BaseModel):
    name: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None
    rules: Optional[List[RuleSchema]] = None

class AssignClient(BaseModel):
    client_username: str

@router.post("", response_model=dict, dependencies=[Depends(require_admin)])
def create_city(city_in: CityCreate, db: Session = Depends(get_db)):
    raw_city_id = (city_in.city_id or city_in.id or city_in.name or "").strip().lower()
    city_id = raw_city_id.replace(" ", "-").replace("_", "-")
    if not city_id:
        raise HTTPException(status_code=400, detail="Un identifiant de ville est requis")
    db_city = db.query(City).filter(City.id == city_id).first()
    if db_city:
        raise HTTPException(status_code=400, detail="Cette ville existe déjà")

    latitude = city_in.latitude if city_in.latitude is not None else city_in.lat
    longitude = city_in.longitude if city_in.longitude is not None else city_in.lon
    if latitude is None or longitude is None:
        latitude = 36.8065
        longitude = 10.1815

    new_city = City(
        id=city_id,
        name=city_in.name,
        country=city_in.country or "Tunisia",
        latitude=latitude,
        longitude=longitude,
        status="Healthy",
        description=city_in.description or "",
        population=city_in.population
    )
    db.add(new_city)

    # Création automatique des capteurs
    for stype in city_in.sensors:
        sensor_id = f"{city_id}-{stype}-001"
        new_sensor = Sensor(
            id=sensor_id,
            type=stype,
            city_id=city_id,
            enabled=True
        )
        db.add(new_sensor)

    # Ajout des règles par défaut ou passées en paramètre
    rules_to_add = city_in.rules if city_in.rules else [
        RuleSchema(metric="traffic", operator=">", value=120.0, level="red"),
        RuleSchema(metric="air_co2", operator=">", value=800.0, level="red"),
        RuleSchema(metric="noise", operator=">", value=75.0, level="red"),
        RuleSchema(metric="energy", operator=">", value=500.0, level="red")
    ]

    for rule in rules_to_add:
        new_rule = ThresholdRule(
            city_id=city_id,
            metric=rule.metric,
            operator=rule.operator,
            value=rule.value,
            level=rule.level
        )
        db.add(new_rule)

    db.commit()
    db.refresh(new_city)
    return {
        "message": f"Ville '{city_in.name}' créée avec succès.",
        "city": {
            "id": new_city.id,
            "name": new_city.name,
            "country": new_city.country,
            "latitude": new_city.latitude,
            "longitude": new_city.longitude,
            "description": new_city.description,
            "population": new_city.population,
        },
    }

@router.get("", response_model=List[dict])
def list_cities(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Si c'est un admin, il voit tout
    if current_user.role == "admin":
        cities = db.query(City).all()
    else:
        # Si c'est un client, il ne voit que ses villes assignées
        allowed_ids = current_user.get_city_ids()
        cities = db.query(City).filter(City.id.in_(allowed_ids)).all()

    result = []
    for city in cities:
        rules_list = [{"metric": r.metric, "operator": r.operator, "value": r.value, "level": r.level} for r in city.rules]
        sensors_list = [{"id": s.id, "type": s.type, "enabled": s.enabled} for s in city.sensors]
        result.append({
            "id": city.id,
            "name": city.name,
            "country": city.country,
            "latitude": city.latitude,
            "longitude": city.longitude,
            "status": city.status,
            "sensors": sensors_list,
            "rules": rules_list
        })
    return result

@router.get("/{city_id}", response_model=dict, dependencies=[Depends(require_admin)])
def get_city(city_id: str, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id == city_id.lower()).first()
    if not city:
        raise HTTPException(status_code=404, detail="Ville non trouvée")

    return {
        "id": city.id,
        "name": city.name,
        "country": city.country,
        "latitude": city.latitude,
        "longitude": city.longitude,
        "status": city.status,
        "description": city.description,
        "population": city.population,
        "sensors": [{"id": s.id, "type": s.type, "enabled": s.enabled} for s in city.sensors],
        "rules": [{"metric": r.metric, "operator": r.operator, "value": r.value, "level": r.level} for r in city.rules],
    }

@router.put("/{city_id}", response_model=dict, dependencies=[Depends(require_admin)])
def update_city_rules(city_id: str, city_up: CityUpdate, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id == city_id.lower()).first()
    if not city:
        raise HTTPException(status_code=404, detail="Ville non trouvée")

    if city_up.name is not None:
        city.name = city_up.name
    if city_up.country is not None:
        city.country = city_up.country
    if city_up.latitude is not None:
        city.latitude = city_up.latitude
    if city_up.longitude is not None:
        city.longitude = city_up.longitude
    if city_up.status is not None:
        city.status = city_up.status

    if city_up.rules is not None:
        # Supprime les anciennes règles
        db.query(ThresholdRule).filter(ThresholdRule.city_id == city_id).delete()
        # Ajoute les nouvelles
        for rule in city_up.rules:
            new_rule = ThresholdRule(
                city_id=city_id,
                metric=rule.metric,
                operator=rule.operator,
                value=rule.value,
                level=rule.level
            )
            db.add(new_rule)

    db.commit()
    return {"message": f"Configuration de la ville '{city_id}' mise à jour."}

@router.put("/{city_id}/thresholds", response_model=dict, dependencies=[Depends(require_admin)])
def update_city_thresholds(city_id: str, thresholds: dict, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id == city_id.lower()).first()
    if not city:
        raise HTTPException(status_code=404, detail="Ville non trouvée")

    for metric, value in thresholds.items():
        rule = db.query(ThresholdRule).filter(ThresholdRule.city_id == city_id.lower(), ThresholdRule.metric == metric).first()
        if rule:
            rule.value = float(value)
        else:
            db.add(ThresholdRule(city_id=city_id.lower(), metric=metric, operator=">", value=float(value), level="red"))

    db.commit()
    return {"message": f"Seuils de la ville '{city_id}' mis à jour."}

@router.delete("/{city_id}", response_model=dict, dependencies=[Depends(require_admin)])
def delete_city(city_id: str, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id == city_id.lower()).first()
    if not city:
        raise HTTPException(status_code=404, detail="Ville non trouvée")

    db.delete(city)
    db.commit()
    return {"message": f"Ville '{city_id}' supprimée."}

@router.post("/{city_id}/clients", response_model=dict, dependencies=[Depends(require_admin)])
def assign_client_to_city(city_id: str, assign: AssignClient, db: Session = Depends(get_db)):
    city_id = city_id.lower().strip()
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="Ville non trouvée")

    client = db.query(User).filter(User.username == assign.client_username, User.role == "client").first()
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé ou n'est pas un utilisateur avec le rôle client")

    current_cities = client.get_city_ids()
    if city_id not in current_cities:
        current_cities.append(city_id)
        client.set_city_ids(current_cities)
        db.commit()

    return {"message": f"Client '{assign.client_username}' assigné à la ville '{city_id}' avec succès."}
