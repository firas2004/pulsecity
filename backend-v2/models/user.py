from sqlalchemy import Column, String, Integer
from models.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="client")  # "admin" ou "client"
    
    # Stocké sous forme de chaîne séparée par des virgules pour SQLite, ex: "tunis-centre,sfax"
    assigned_cities = Column(String, default="")

    def get_city_ids(self):
        if not self.assigned_cities:
            return []
        return [cid.strip() for cid in self.assigned_cities.split(",") if cid.strip()]

    def set_city_ids(self, city_ids: list):
        self.assigned_cities = ",".join(city_ids)
