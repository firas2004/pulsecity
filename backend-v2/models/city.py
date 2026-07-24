from sqlalchemy import Column, String, Float, ForeignKey, Integer, Boolean
from sqlalchemy.orm import relationship
from models.database import Base

class City(Base):
    __tablename__ = "cities"

    id = Column(String, primary_key=True)  # ex: "tunis-centre"
    name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String, default="Healthy")  # "Healthy", "Warning", "Critical"
    description = Column(String, nullable=True)
    population = Column(Integer, nullable=True)

    sensors = relationship("Sensor", back_populates="city", cascade="all, delete-orphan")
    rules = relationship("ThresholdRule", back_populates="city", cascade="all, delete-orphan")

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(String, primary_key=True)  # ex: "tunis-centre-traffic-001"
    type = Column(String, nullable=False)  # "traffic", "air_co2", "noise", "energy", "temperature", "humidity", ...
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    enabled = Column(Boolean, default=True)
    # Metadata for dynamic simulation
    unit = Column(String, nullable=True, default="unit")          # ex: "vehicles/min", "ppm", "dB", "°C", "%"
    min_normal = Column(Float, nullable=True, default=0.0)        # normal lower bound
    max_normal = Column(Float, nullable=True, default=100.0)      # normal upper bound
    min_anomaly = Column(Float, nullable=True, default=150.0)     # anomaly lower bound
    max_anomaly = Column(Float, nullable=True, default=300.0)     # anomaly upper bound
    description = Column(String, nullable=True, default="")

    city = relationship("City", back_populates="sensors")

class ThresholdRule(Base):
    __tablename__ = "threshold_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    metric = Column(String, nullable=False)  # "traffic", "air_co2", "noise", "energy"
    operator = Column(String, nullable=False)  # ">", "<", ">=", "<="
    value = Column(Float, nullable=False)
    level = Column(String, default="yellow")  # "yellow", "red"

    city = relationship("City", back_populates="rules")
