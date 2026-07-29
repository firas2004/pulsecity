from sqlalchemy import Column, String, Integer, ForeignKey
from models.database import Base

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    home_city_id = Column(String, ForeignKey("cities.id"), nullable=False)
