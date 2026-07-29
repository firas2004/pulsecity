from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from datetime import datetime
from models.database import Base

class AlertSubscription(Base):
    __tablename__ = "alert_subscriptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    metric_type = Column(String, nullable=False)
    threshold_override = Column(Float, nullable=True)
    notification_channel = Column(String, default="in-app")
    created_at = Column(DateTime, default=datetime.utcnow)
