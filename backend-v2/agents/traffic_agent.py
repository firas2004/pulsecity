from sqlalchemy.orm import Session
from models.city import ThresholdRule
from models.alert import AgentAdvice
import datetime

# Dictionnaire de suggestions intelligentes par ville/zone
TRAFFIC_SUGGESTIONS = {
    "tunis-centre": "Embouteillage Avenue Bourguiba → Suggéré : Avenue de France via Rue de Hollande (+4 min)",
    "ariana": "Fort trafic sur l'Avenue Hédi Nouira → Suggéré : Rue El Moez (+3 min)",
    "ben-arous": "Ralentissement Zone Industrielle → Suggéré : R22 via GP1 (+6 min)",
    "la-marsa": "Saturation GP9 vers Marsa Plage → Suggéré : Route du Relais (+5 min)",
    "sfax": "Congestion Route de Téniour → Suggéré : Route de Gremda (+7 min)",
    "sousse": "Embouteillage Boulevard du 14 Janvier → Suggéré : Avenue Léopold Senghor (+5 min)",
}

class TrafficAgent:
    def evaluate(self, db: Session, city_id: str, value: float):
        # Récupérer le seuil de trafic défini par l'admin pour cette ville
        traffic_rule = db.query(ThresholdRule).filter(
            ThresholdRule.city_id == city_id,
            ThresholdRule.metric == "traffic"
        ).first()

        threshold = traffic_rule.value if traffic_rule else 120.0  # valeur par défaut

        if value > threshold:
            # Récupérer la recommandation pour cette ville
            advice_text = TRAFFIC_SUGGESTIONS.get(
                city_id, 
                "Trafic dense détecté → Suggéré : Utiliser les boulevards extérieurs (+5 min)"
            )
            
            # Éviter d'insérer un conseil doublon si un conseil similaire de moins de 5 minutes existe déjà
            cutoff = datetime.datetime.utcnow() - datetime.timedelta(minutes=5)
            existing = db.query(AgentAdvice).filter(
                AgentAdvice.city_id == city_id,
                AgentAdvice.agent_type == "traffic",
                AgentAdvice.timestamp >= cutoff
            ).first()
            
            if not existing:
                new_advice = AgentAdvice(
                    city_id=city_id,
                    agent_type="traffic",
                    advice=advice_text,
                    timestamp=datetime.datetime.utcnow()
                )
                db.add(new_advice)
                db.commit()
                print(f"[TrafficAgent] 🚗 Nouveau conseil de trafic pour {city_id} : {advice_text}")

traffic_agent = TrafficAgent()
