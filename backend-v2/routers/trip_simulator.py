from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from models.database import get_db
from models.city import City
from helpers.distance import haversine_km, estimated_road_distance_km
from helpers.fare_calculator import calculate_all_modes

router = APIRouter(prefix="/trip-simulator", tags=["trip-simulator"])

@router.get("/calculate")
def calculate_trip(
    origin_city_id: str = Query(..., description="ID de la ville de départ"),
    destination_city_id: str = Query(..., description="ID de la ville d'arrivée"),
    db: Session = Depends(get_db)
):
    orig_id = origin_city_id.lower().strip()
    dest_id = destination_city_id.lower().strip()

    origin_city = db.query(City).filter(City.id == orig_id).first()
    dest_city = db.query(City).filter(City.id == dest_id).first()

    if not origin_city:
        raise HTTPException(status_code=404, detail=f"Ville de départ non trouvée: {orig_id}")
    if not dest_city:
        raise HTTPException(status_code=404, detail=f"Ville d'arrivée non trouvée: {dest_id}")

    if orig_id == dest_id:
        distance_km = 0.0
    else:
        distance_km = estimated_road_distance_km(
            origin_city.latitude, origin_city.longitude,
            dest_city.latitude, dest_city.longitude
        )

    modes = calculate_all_modes(orig_id, dest_id, distance_km)

    return {
        "origin": {
            "id": origin_city.id,
            "name": origin_city.name,
            "latitude": origin_city.latitude,
            "longitude": origin_city.longitude
        },
        "destination": {
            "id": dest_city.id,
            "name": dest_city.name,
            "latitude": dest_city.latitude,
            "longitude": dest_city.longitude
        },
        "distance_km": distance_km,
        "distance_note": "Estimation basée sur la distance à vol d'oiseau x1.3 (approximation route) — non basé sur un routage réel",
        "modes": modes
    }
