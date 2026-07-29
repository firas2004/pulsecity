from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status, Query
from sqlalchemy.orm import Session
from models.database import get_db
from models.city import City
from models.alert import Alert
from models.user import User
from config import settings
from jose import JWTError, jwt

router = APIRouter(prefix="/reports", tags=["reports"])

def _get_user_from_token(token: str, db: Session) -> User:
    """Resolve a JWT token string to a User. Used for browser-downloadable report links."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Token invalide")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
    return user

@router.get("/{city_id}")
def generate_report(
    city_id: str,
    format: Optional[str] = "csv",
    range: Optional[str] = "7d",
    token: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    current_user = _get_user_from_token(token, db) if token else None
    if not current_user:
        raise HTTPException(status_code=401, detail="Token requis pour l'export de rapport")

    city_id = city_id.lower().strip()
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="Ville non trouvée")

    alerts = db.query(Alert).filter(Alert.city_id == city_id).order_by(Alert.timestamp.desc()).all()

    if format == "pdf":
        html_content = f"""
        <html>
        <head>
          <title>Rapport PulseCity - {city.name}</title>
          <style>
            body {{ font-family: 'Segoe UI', sans-serif; padding: 30px; background: #0f172a; color: #e2e8f0; }}
            h1 {{ color: #3B82F6; }} h2 {{ color: #93C5FD; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            th {{ background: #1e293b; color: #94a3b8; padding: 10px; text-align: left; font-size: 12px; }}
            td {{ padding: 10px; border-bottom: 1px solid #1e293b; font-size: 13px; }}
            .critical {{ color: #EF4444; font-weight: bold; }}
            .warning {{ color: #F59E0B; font-weight: bold; }}
          </style>
        </head>
        <body>
            <h1>🏙️ PulseCity — Rapport Municipal</h1>
            <h2>Ville : {city.name} &nbsp;|&nbsp; Période : {range.upper()}</h2>
            <p>Exporté par : <strong>{current_user.username}</strong></p>
            <hr/>
            <h3>Alertes &amp; Télémétrie ({len(alerts)} événements enregistrés)</h3>
            <table>
                <tr><th>ID</th><th>Capteur</th><th>Valeur</th><th>Niveau</th><th>Message</th><th>Date</th></tr>
                {"".join([f'<tr><td>{a.id}</td><td>{a.sensor_id}</td><td>{a.value}</td><td class="{(a.level or "").lower()}">{a.level}</td><td>{a.message or "-"}</td><td>{a.timestamp}</td></tr>' for a in alerts[:50]])}
            </table>
        </body>
        </html>
        """
        return Response(content=html_content, media_type="text/html",
                        headers={"Content-Disposition": f"inline; filename=report-{city_id}-{range}.html"})

    # Default CSV export
    csv_lines = ["ID,City,SensorID,Value,Level,Message,Timestamp"]
    for a in alerts:
        msg = (a.message or "").replace(",", ";")
        csv_lines.append(f"{a.id},{a.city_id},{a.sensor_id},{a.value},{a.level},{msg},{a.timestamp}")

    csv_data = "\n".join(csv_lines)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=report-{city_id}-{range}.csv"}
    )
