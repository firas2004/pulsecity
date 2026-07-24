import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    KAFKA_BROKER: str = "kafka.kafka.svc.cluster.local:9092"
    ANOMALY_DETECTOR_URL: str = "http://anomaly-detector:8000"
    OPENWEATHERMAP_API_KEY: str = os.getenv("OPENWEATHERMAP_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 heures

    # Par défaut, SQLite dans le répertoire de travail
    DATABASE_URL: str = "sqlite:///pulsecity.db"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
