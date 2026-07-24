import datetime
from sqlalchemy import Column, String, Float, ForeignKey, Integer, Boolean, DateTime
from models.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    sensor_id = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    level = Column(String, default="yellow")  # "yellow" ou "red"
    message = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    active = Column(Boolean, default=True)

class AgentAdvice(Base):
    __tablename__ = "agent_advices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    agent_type = Column(String, nullable=False)  # "traffic", "weather", "threshold"
    advice = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
