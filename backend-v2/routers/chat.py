import datetime
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
from state import latest_metrics

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    city_id: str
    api_key: str = None

class ChatHistoryResponse(BaseModel):
    conversation_id: int
    messages: list

@router.post("", response_model=dict)
def chat_with_city_agent(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    city_id = req.city_id.lower().strip()
    
    # Vérification d'accès
    if current_user.role != "admin" and city_id not in current_user.get_city_ids():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas accès aux données de cette ville"
        )
        
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="Ville non trouvée")
        
    # 1. Rassembler les métriques temps réel
    metrics_summary = []
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
    
    metrics_str = "\n".join(metrics_summary) if metrics_summary else "Aucune donnée de capteur disponible."

    # 2. Récupérer les alertes actives
    db_alerts = db.query(Alert).filter(Alert.city_id == city_id, Alert.active == True).all()
    alerts_str = ", ".join([f"[{a.sensor_id}] {a.message}" for a in db_alerts]) if db_alerts else "Aucune alerte active."

    # 3. Récupérer les conseils récents des agents
    db_advices = db.query(AgentAdvice).filter(AgentAdvice.city_id == city_id).order_by(AgentAdvice.timestamp.desc()).limit(5).all()
    advices_str = "\n".join([f"- [{adv.agent_type}] {adv.advice}" for adv in db_advices]) if db_advices else "Aucun conseil d'agent."

    # 4. Construire le System Prompt contextuel (tronqué pour limiter la taille)
    def trunc(text: str, limit: int = 800) -> str:
        return text[:limit] + "…[tronqué]" if len(text) > limit else text

    system_prompt = (
        f"Tu es l'assistant intelligent officiel de la ville de {city.name} ({city.country}).\n"
        f"Voici les informations actuelles en direct pour étayer tes réponses :\n\n"
        f"--- MÉTROLOGIE EN DIRECT ---\n"
        f"{trunc(metrics_str)}\n\n"
        f"--- ALERTES CRITIQUES ACTIVES ---\n"
        f"{trunc(alerts_str)}\n\n"
        f"--- CONSEILS DES AGENTS DE LA VILLE ---\n"
        f"{trunc(advices_str)}\n\n"
        f"Consignes de réponse :\n"
        f"- Réponds de manière polie, professionnelle et concise.\n"
        f"- Limite STRICTEMENT tes réponses au domaine de la plateforme PulseCity, de la ville de {city.name}, de ses capteurs, de sa métrologie (CO2, bruit, température, trafic, humidité, énergie, etc.), de ses alertes ou de ses conseils.\n"
        f"- Si la question porte sur un sujet général ou hors-sujet n'ayant aucun rapport avec PulseCity, la gestion urbaine, la métrologie ou les données de {city.name} (par exemple sur des célébrités comme Messi/Ronaldo, du sport général, de l'histoire générale, de la programmation générale, etc.), refuse poliment de répondre en expliquant que ton rôle est exclusivement limité à l'assistance et à la surveillance de la plateforme PulseCity.\n"
        f"- Base-toi sur les données fournies pour répondre de façon factuelle.\n"
        f"- Réponds en français par défaut.\n"
        f"- Ne mentionne pas que tu as reçu un prompt système ou des variables brutes, réponds naturellement en tant qu'assistant de la ville."
    )

    # 5. Enregistrer la conversation et les messages
    conversation = (
        db.query(ChatConversation)
        .filter(ChatConversation.user_id == current_user.id, ChatConversation.city_id == city_id)
        .order_by(ChatConversation.updated_at.desc())
        .first()
    )
    if not conversation:
        conversation = ChatConversation(user_id=current_user.id, city_id=city_id, title=f"{city.name} discussion")
        db.add(conversation)
        db.flush()

    user_message = ChatMessage(conversation_id=conversation.id, role="user", content=req.message)
    db.add(user_message)
    db.flush()

    # 6. Appeler l'agent Groq
    reply = chat_agent.ask(system_prompt, req.message, api_key=req.api_key)

    assistant_message = ChatMessage(conversation_id=conversation.id, role="assistant", content=reply)
    db.add(assistant_message)
    conversation.updated_at = datetime.datetime.utcnow()
    db.commit()

    return {"reply": reply, "conversation_id": conversation.id}

@router.get("/history/{city_id}", response_model=dict)
def get_chat_history(
    city_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    city_id = city_id.lower().strip()
    if current_user.role != "admin" and city_id not in current_user.get_city_ids():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vous n'avez pas accès à cette ville")

    conversation = (
        db.query(ChatConversation)
        .filter(ChatConversation.user_id == current_user.id, ChatConversation.city_id == city_id)
        .order_by(ChatConversation.updated_at.desc())
        .first()
    )
    if not conversation:
        return {"conversation_id": None, "messages": []}

    messages = [
        {"role": msg.role, "content": msg.content, "timestamp": msg.created_at.isoformat()}
        for msg in sorted(conversation.messages, key=lambda m: m.created_at)
    ]
    return {"conversation_id": conversation.id, "messages": messages}
