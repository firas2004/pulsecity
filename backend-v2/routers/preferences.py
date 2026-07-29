from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from models.database import get_db
from models.preference import UserPreference
from models.user import User
from routers.auth import get_current_user

router = APIRouter(prefix="/preferences", tags=["preferences"])

class PreferenceSet(BaseModel):
    home_city_id: str

@router.get("/me")
def get_my_preference(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        return {"home_city_id": None}
    return pref

@router.post("/me")
def set_my_preference(
    pref_in: PreferenceSet,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if pref:
        pref.home_city_id = pref_in.home_city_id
    else:
        pref = UserPreference(user_id=current_user.id, home_city_id=pref_in.home_city_id)
        db.add(pref)
    db.commit()
    db.refresh(pref)
    return pref
