import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from models.database import get_db
from models.city import City
from models.alert import Alert, AgentAdvice
from models.user import User
from models.chat import ChatConversation, ChatMessage
from routers.auth import get_current_user
from agents.chat_agent import chat_agent
from helpers.ai_context_builder import build_pulse_brain_prompt, build_pulse_guide_prompt
from state import latest_metrics

router = APIRouter(prefix="/ai-chat", tags=["ai-chat"])

class MessageItem(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class PulseBrainRequest(BaseModel):
    message: str
    city_id: Optional[str] = "tunis"
    history: Optional[List[MessageItem]] = []
    conversation_id: Optional[str] = None
    api_key: Optional[str] = None

class PulseGuideRequest(BaseModel):
    message: str
    page: Optional[str] = "/"
    user_type: Optional[str] = "anonymous"
    history: Optional[List[MessageItem]] = []
    conversation_id: Optional[str] = None
    api_key: Optional[str] = None

@router.post("/pulse-brain", response_model=dict)
def chat_pulse_brain(
    req: PulseBrainRequest,
    db: Session = Depends(get_db)
):
    city_id = (req.city_id or "tunis").lower().strip()
    city = db.query(City).filter(City.id == city_id).first()
    city_name = city.name if city else city_id.capitalize()

    # 1. Obtenir les métriques en direct
    metrics_summary = []
    if city and city.sensors:
        for sensor in city.sensors:
            if sensor.enabled:
                metric_data = latest_metrics.get(sensor.id)
                if metric_data:
                    metrics_summary.append(
                        f"- {sensor.type} : {metric_data.get('value')} {metric_data.get('unit')} "
                        f"(anomalie: {metric_data.get('anomaly')})"
                    )
                else:
                    metrics_summary.append(f"- {sensor.type} : Pas de donnée")
    sensors_str = "\n".join(metrics_summary) if metrics_summary else "Aucune donnée de capteur."

    # 2. Alertes actives
    db_alerts = db.query(Alert).filter(Alert.city_id == city_id, Alert.active == True).all() if city else []
    alerts_str = ", ".join([f"[{a.sensor_id}] {a.message}" for a in db_alerts]) if db_alerts else "Aucune alerte active."

    # 3. Conseils récents
    db_advices = db.query(AgentAdvice).filter(AgentAdvice.city_id == city_id).order_by(AgentAdvice.timestamp.desc()).limit(5).all() if city else []
    advices_str = "\n".join([f"- [{adv.agent_type}] {adv.advice}" for adv in db_advices]) if db_advices else "Aucun conseil d'agent."

    # 4. Construire le prompt système
    system_prompt = build_pulse_brain_prompt(
        city_name=city_name,
        sensors_str=sensors_str,
        alerts_str=alerts_str,
        advices_str=advices_str
    )

    # Convertir l'historique en liste de dicts
    hist_list = [{"role": m.role, "content": m.content} for m in req.history] if req.history else []

    # 5. Appeler l'agent Groq
    res = chat_agent.ask_chat(system_prompt, hist_list, req.message, api_key=req.api_key)

    # 6. Suggérer des actions par défaut si l'IA n'en a pas retourné
    suggested_actions = res.get("suggested_actions", [])
    if not suggested_actions:
        suggested_actions = [
            {"label": "🚗 Trajets & Transport", "link": "/client/trip-simulator"},
            {"label": "🏥 Santé & Établissements", "link": "/client/sante"},
            {"label": "📊 Éco Pulse", "link": "/client/eco"}
        ]

    return {
        "conversation_id": req.conversation_id or f"brain_{int(datetime.datetime.now().timestamp())}",
        "message": res.get("content", ""),
        "suggested_actions": suggested_actions,
        "timestamp": datetime.datetime.now().isoformat()
    }


@router.post("/pulse-guide", response_model=dict)
def chat_pulse_guide(
    req: PulseGuideRequest
):
    system_prompt = build_pulse_guide_prompt(
        page=req.page or "/",
        user_type=req.user_type or "anonymous"
    )

    hist_list = [{"role": m.role, "content": m.content} for m in req.history] if req.history else []

    res = chat_agent.ask_chat(system_prompt, hist_list, req.message, api_key=req.api_key)

    suggested_actions = res.get("suggested_actions", [])
    if not suggested_actions:
        suggested_actions = [
            {"label": "🏙️ Explorer les villes", "link": "/client"},
            {"label": "🗺️ Simulateur de trajet", "link": "/client/trip-simulator"},
            {"label": "🛒 Magasins & Promos", "link": "/client/magasins"}
        ]

    return {
        "conversation_id": req.conversation_id or f"guide_{int(datetime.datetime.now().timestamp())}",
        "message": res.get("content", ""),
        "suggested_actions": suggested_actions,
        "timestamp": datetime.datetime.now().isoformat()
    }
