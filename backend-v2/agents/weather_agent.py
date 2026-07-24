import time
import requests
import datetime
from sqlalchemy.orm import Session
from config import settings
from models.city import City
from models.alert import AgentAdvice

class WeatherAgent:
    def fetch_weather(self, lat: float, lon: float) -> dict:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": settings.OPENWEATHERMAP_API_KEY,
            "units": "metric"
        }
        try:
            response = requests.get(url, params=params, timeout=5)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"[WeatherAgent] OpenWeatherMap returned code {response.status_code} : {response.text}")
        except Exception as e:
            print(f"[WeatherAgent] Error fetching weather: {e}")
        return {}

    def evaluate_city(self, db: Session, city: City):
        weather_data = self.fetch_weather(city.latitude, city.longitude)
        if not weather_data:
            return

        main_data = weather_data.get("main", {})
        temp = main_data.get("temp")
        humidity = main_data.get("humidity")

        if temp is None or humidity is None:
            return

        print(f"[WeatherAgent] Météo pour {city.name} : Temp={temp}°C, Humidité={humidity}%")

        advice_text = None
        if temp > 35.0:
            advice_text = f"Alerte Canicule ({temp}°C) ! Pensez à boire beaucoup d'eau, fermez les volets et limitez les activités extérieures physiques aux heures les plus chaudes."
        elif humidity > 85.0:
            advice_text = f"Humidité très élevée ({humidity}%) ! Risque d'inconfort thermique majeur. Aérez les espaces de vie et évitez les efforts prolongés."

        if advice_text:
            # Éviter d'insérer le même conseil s'il y en a déjà un de moins de 30 minutes
            cutoff = datetime.datetime.utcnow() - datetime.timedelta(minutes=30)
            existing = db.query(AgentAdvice).filter(
                AgentAdvice.city_id == city.id,
                AgentAdvice.agent_type == "weather",
                AgentAdvice.timestamp >= cutoff
            ).first()

            if not existing:
                new_advice = AgentAdvice(
                    city_id=city.id,
                    agent_type="weather",
                    advice=advice_text,
                    timestamp=datetime.datetime.utcnow()
                )
                db.add(new_advice)
                db.commit()
                print(f"[WeatherAgent] ☀ Nouveau conseil météo pour {city.name} : {advice_text}")

    def run_cycle(self, db: Session):
        cities = db.query(City).all()
        for city in cities:
            try:
                self.evaluate_city(db, city)
            except Exception as e:
                print(f"[WeatherAgent] Exception processing city {city.name}: {e}")

weather_agent = WeatherAgent()
