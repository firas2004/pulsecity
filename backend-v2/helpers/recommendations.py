from typing import Dict, Any, Optional

# Lookup dictionary mapping metric_type to operational recommendation message
RECOMMENDATIONS_LOOKUP: Dict[str, str] = {
    "traffic": "Activer la déviation de trafic vers les axes secondaires et informer les usagers.",
    "air_co2": "Alerte pollution : Recommander la réduction du trafic lourd et ventiler les espaces fermés.",
    "noise": "Contrôler les nuisances sonores urbaines et déployer la patrouille municipale.",
    "energy": "Pic de consommation : Déclencher le délestage partiel du réseau d'éclairage public.",
    "waste_fill": "Planifier une tournée de collecte prioritaire pour le conteneur saturé.",
    "water_quality": "Anomalie pH eau : Effectuer un prélèvement d'urgence et vérifier la station d'épuration.",
    "parking": "Parking saturé : Rediriger le flux automobile vers les parkings périphériques disponibles.",
    "wind_speed": "Vent violent : Fermer l'accès aux zones côtières et émettre un bulletin de sécurité.",
    "temperature": "Température extrême : Activer les îlots de fraîcheur urbains et la vigilance santé.",
    "humidity": "Humidité élevée : Surveiller les risques de visibilité réduite et brouillard.",
    "pedestrian": "Forte affluence piétonne : Sécuriser les passages piétons et réguler la circulation.",
    "foot_traffic": "Gare saturée : Déployer des agents de régulation de flux dans les hubs de transport.",
}

def enrich_alert_with_recommendation(alert_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Pure additive helper: takes an already-generated alert dict and attaches a 'suggested_action' field.
    Does NOT modify alert severity, alert creation logic, or threshold detection.
    """
    sensor_type = alert_dict.get("sensor_type") or alert_dict.get("metric_type")
    suggested_action = RECOMMENDATIONS_LOOKUP.get(sensor_type, None)
    
    # Return a copy with suggested_action added (null if no recommendation exists)
    return {**alert_dict, "suggested_action": suggested_action}
