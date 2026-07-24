from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import requests
from config import settings
from models.database import get_db
from models.alert import Alert, AgentAdvice
from models.user import User
from routers.auth import get_current_user

router = APIRouter(prefix="/alerts", tags=["alerts"])

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
    alerts_list = [
        {
            "id": a.id,
            "sensor_id": a.sensor_id,
            "value": a.value,
            "level": a.level,
            "message": a.message,
            "timestamp": a.timestamp.isoformat() + "Z",
            "active": a.active
        }
        for a in db_alerts
    ]
    
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
            # Filtrer les anomalies qui concernent notre ville
            # Les anomalies de anomaly-detector ont un champ 'zone' qui correspond au nom de la ville (ex: "Tunis-Centre")
            # Nous comparons avec le nom formaté ou l'ID
            raw_anoms = data.get("anomalies", [])
            for anom in raw_anoms:
                zone = anom.get("zone", "")
                # ex: zone="Tunis-Centre" -> "tunis-centre" == city_id
                if zone.lower().replace(" ", "-") == city_id:
                    ml_anomalies.append(anom)
    except Exception as e:
        # En cas d'erreur de communication, nous n'échouons pas la requête mais consignons l'erreur
        print(f"[Alerts API] Erreur lors de l'appel à anomaly-detector : {e}")
        
    return {
        "city_id": city_id,
        "db_alerts": alerts_list,
        "agent_advices": advices_list,
        "ml_anomalies": ml_anomalies
    }
