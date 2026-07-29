from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import requests
from config import settings
from models.database import get_db
from models.alert import Alert, AgentAdvice
from models.user import User
from routers.auth import get_current_user
from helpers.recommendations import enrich_alert_with_recommendation

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("", response_model=List[dict])
def get_all_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if current_user.role != "admin":
        user_cities = current_user.get_city_ids()
        if user_cities:
            query = query.filter(Alert.city_id.in_(user_cities))
    
    db_alerts = query.order_by(Alert.timestamp.desc()).all()
    results = []
    for a in db_alerts:
        sensor_type = a.sensor_id.split("-")[1] if a.sensor_id and "-" in a.sensor_id else "general"
        alert_dict = {
            "id": a.id,
            "city_id": a.city_id,
            "sensor_id": a.sensor_id,
            "sensor_type": sensor_type,
            "value": a.value,
            "level": a.level,
            "message": a.message,
            "timestamp": a.timestamp.isoformat() + "Z",
            "active": a.active
        }
        results.append(enrich_alert_with_recommendation(alert_dict))
    return results

@router.get("/{city_id}", response_model=dict)
def get_city_alerts_and_advice(
    city_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    city_id = city_id.lower().strip()
    
    # Vérification d'accès
    if current_user.role != "admin" and city_id not in current_user.get_city_ids():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas accès aux alertes de cette ville"
        )
        
    # 1. Récupérer les alertes depuis SQLite
    db_alerts = db.query(Alert).filter(Alert.city_id == city_id).order_by(Alert.timestamp.desc()).all()
    alerts_list = []
    for a in db_alerts:
        sensor_type = a.sensor_id.split("-")[1] if a.sensor_id and "-" in a.sensor_id else "general"
        alert_dict = {
            "id": a.id,
            "city_id": a.city_id,
            "sensor_id": a.sensor_id,
            "sensor_type": sensor_type,
            "value": a.value,
            "level": a.level,
            "message": a.message,
            "timestamp": a.timestamp.isoformat() + "Z",
            "active": a.active
        }
        alerts_list.append(enrich_alert_with_recommendation(alert_dict))
    
    # 2. Récupérer les conseils des agents depuis SQLite
    db_advices = db.query(AgentAdvice).filter(AgentAdvice.city_id == city_id).order_by(AgentAdvice.timestamp.desc()).all()
    advices_list = [
        {
            "id": adv.id,
            "agent_type": adv.agent_type,
            "advice": adv.advice,
            "timestamp": adv.timestamp.isoformat() + "Z"
        }
        for adv in db_advices
    ]
    
    # 3. Récupérer les anomalies depuis le microservice anomaly-detector via HTTP
    ml_anomalies = []
    try:
        response = requests.get(f"{settings.ANOMALY_DETECTOR_URL}/anomalies?limit=100", timeout=3)
        if response.status_code == 200:
            data = response.json()
            raw_anoms = data.get("anomalies", [])
            for anom in raw_anoms:
                zone = anom.get("zone", "")
                if zone.lower().replace(" ", "-") == city_id:
                    ml_anomalies.append(enrich_alert_with_recommendation(anom))
    except Exception as e:
        print(f"[Alerts API] Erreur lors de l'appel à anomaly-detector : {e}")
        
    return {
        "city_id": city_id,
        "db_alerts": alerts_list,
        "agent_advices": advices_list,
        "ml_anomalies": ml_anomalies
    }
