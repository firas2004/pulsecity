from sqlalchemy.orm import Session
from models.city import ThresholdRule
from models.alert import Alert

class ThresholdAgent:
    def evaluate(self, db: Session, sensor_id: str, sensor_type: str, city_id: str, value: float):
        # Récupérer les règles configurées pour cette ville et ce type de capteur
        rules = db.query(ThresholdRule).filter(
            ThresholdRule.city_id == city_id,
            ThresholdRule.metric == sensor_type
        ).all()

        for rule in rules:
            triggered = False
            val = float(value)
            
            if rule.operator == ">" and val > rule.value:
                triggered = True
            elif rule.operator == "<" and val < rule.value:
                triggered = True
            elif rule.operator == ">=" and val >= rule.value:
                triggered = True
            elif rule.operator == "<=" and val <= rule.value:
                triggered = True
            elif rule.operator == "=" and val == rule.value:
                triggered = True

            if triggered:
                # message d'alerte descriptif
                msg = f"Seuil franchi pour {sensor_type} : {val} {rule.operator} {rule.value} (Niveau: {rule.level.upper()})"
                
                # Éviter de dupliquer les alertes actives pour le même capteur/niveau
                existing = db.query(Alert).filter(
                    Alert.city_id == city_id,
                    Alert.sensor_id == sensor_id,
                    Alert.level == rule.level,
                    Alert.active == True
                ).first()
                
                if not existing:
                    new_alert = Alert(
                        city_id=city_id,
                        sensor_id=sensor_id,
                        value=val,
                        level=rule.level,
                        message=msg,
                        active=True
                    )
                    db.add(new_alert)
                    db.commit()
                    print(f"[ThresholdAgent] ⚠ Alerte activée pour {city_id} ({sensor_type}) : {msg}")
            else:
                # Si le seuil n'est plus franchi, on désactive l'alerte active s'il y en avait une
                existing_active = db.query(Alert).filter(
                    Alert.city_id == city_id,
                    Alert.sensor_id == sensor_id,
                    Alert.level == rule.level,
                    Alert.active == True
                ).first()
                if existing_active:
                    existing_active.active = False
                    db.commit()
                    print(f"[ThresholdAgent] ✅ Alerte désactivée pour {city_id} ({sensor_type})")

threshold_agent = ThresholdAgent()
