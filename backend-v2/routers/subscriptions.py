from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from models.database import get_db
from models.subscription import AlertSubscription
from models.user import User
from routers.auth import get_current_user

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

class SubscriptionCreate(BaseModel):
    city_id: str
    metric_type: str
    threshold_override: Optional[float] = None
    notification_channel: Optional[str] = "in-app"

@router.post("", status_code=status.HTTP_201_CREATED)
def create_subscription(
    sub_in: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if duplicate exists
    existing = db.query(AlertSubscription).filter(
        AlertSubscription.user_id == current_user.id,
        AlertSubscription.city_id == sub_in.city_id,
        AlertSubscription.metric_type == sub_in.metric_type
    ).first()

    if existing:
        existing.threshold_override = sub_in.threshold_override
        existing.notification_channel = sub_in.notification_channel or "in-app"
        db.commit()
        db.refresh(existing)
        return existing

    sub = AlertSubscription(
        user_id=current_user.id,
        city_id=sub_in.city_id,
        metric_type=sub_in.metric_type,
        threshold_override=sub_in.threshold_override,
        notification_channel=sub_in.notification_channel or "in-app",
        created_at=datetime.utcnow()
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.get("")
def list_subscriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(AlertSubscription).filter(AlertSubscription.user_id == current_user.id).all()

@router.delete("/{sub_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subscription(
    sub_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(AlertSubscription).filter(
        AlertSubscription.id == sub_id,
        AlertSubscription.user_id == current_user.id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Abonnement introuvable")
    db.delete(sub)
    db.commit()
    return None
