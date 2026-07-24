import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from models.database import get_db
from models.city import City, Sensor
from models.user import User
from routers.auth import get_current_user
from state import latest_metrics, metrics_history

router = APIRouter(prefix="/metrics", tags=["metrics"])

@router.get("/{city_id}", response_model=dict)
def get_latest_metrics(city_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    city_id = city_id.lower().strip()
    
    # Vérification d'accès
    if current_user.role != "admin" and city_id not in current_user.get_city_ids():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas accès aux données de cette ville"
        )
        
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="Ville non trouvée")
        
    result = {}
    for sensor in city.sensors:
        if sensor.enabled:
            # Récupérer la dernière valeur en mémoire
            metric_data = latest_metrics.get(sensor.id)
            if metric_data:
                result[sensor.type] = metric_data
            else:
                result[sensor.type] = {
                    "value": None,
                    "unit": "N/A",
                    "timestamp": None,
                    "anomaly": False
                }
                
    return {
        "city_id": city_id,
        "name": city.name,
        "metrics": result
    }

@router.get("/{city_id}/history", response_model=List[dict])
def get_sensor_history(
    city_id: str,
    sensor: str = Query(..., description="Type de capteur (traffic, air_co2, noise, energy)"),
    hours: int = Query(6, description="Nombre d'heures d'historique"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    city_id = city_id.lower().strip()
    sensor = sensor.lower().strip()
    
    # Vérification d'accès
    if current_user.role != "admin" and city_id not in current_user.get_city_ids():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas accès aux données de cette ville"
        )
        
    # Reconstituer l'ID du capteur
    sensor_id = f"{city_id}-{sensor}-001"
    
    # Vérifier l'existence du capteur
    db_sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not db_sensor:
        raise HTTPException(status_code=404, detail="Capteur non trouvé pour cette ville")
        
    history = metrics_history.get(sensor_id, [])
    
    # Filtrer par durée
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(hours=hours)
    
    filtered_history = [
        {
            "timestamp": pt["timestamp"].isoformat() + "Z",
            "value": pt["value"]
        }
        for pt in history
        if pt["timestamp"] >= cutoff
    ]
    
    return filtered_history
