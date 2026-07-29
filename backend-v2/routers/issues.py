from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from models.database import get_db
from models.issue import IssueReport
from models.user import User
from routers.auth import get_current_user, require_admin

router = APIRouter(prefix="/issues", tags=["issues"])

class IssueCreate(BaseModel):
    city_id: str
    category: str
    description: str
    photo_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class IssueStatusUpdate(BaseModel):
    status: str  # submitted, in_review, resolved

@router.post("", status_code=status.HTTP_201_CREATED)
def create_issue(
    issue_in: IssueCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    issue = IssueReport(
        user_id=current_user.id,
        city_id=issue_in.city_id,
        category=issue_in.category,
        description=issue_in.description,
        photo_url=issue_in.photo_url,
        latitude=issue_in.latitude,
        longitude=issue_in.longitude,
        status="submitted",
        created_at=datetime.utcnow()
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue

@router.get("")
def list_issues(
    city_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(IssueReport)
    if current_user.role != "admin":
        query = query.filter(IssueReport.user_id == current_user.id)
    if city_id:
        query = query.filter(IssueReport.city_id == city_id)
    return query.order_by(IssueReport.created_at.desc()).all()

@router.patch("/{issue_id}")
def update_issue_status(
    issue_id: int,
    status_in: IssueStatusUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    issue = db.query(IssueReport).filter(IssueReport.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Signalement introuvable")
    
    if status_in.status not in ["submitted", "in_review", "resolved"]:
        raise HTTPException(status_code=400, detail="Statut invalide")

    issue.status = status_in.status
    if status_in.status == "resolved":
        issue.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(issue)
    return issue
