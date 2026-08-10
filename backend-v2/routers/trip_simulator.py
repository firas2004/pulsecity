from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from models.database import get_db
from models.city import City
from helpers.routing_engine import get_road_route
from helpers.fare_calculator import calculate_all_modes
from helpers.transport_data import get_nearby_stations

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
        route = {"distance_km": 0.0, "duration_min": 0, "geometry": [[origin_city.latitude, origin_city.longitude]], "source": "same_point"}
    else:
        route = get_road_route(
            origin_city.latitude, origin_city.longitude,
            dest_city.latitude, dest_city.longitude
        )

    distance_km = route["distance_km"]
    duration_min = route["duration_min"]
    geometry = route["geometry"]
    route_source = route["source"]

    modes = calculate_all_modes(orig_id, dest_id, distance_km)

    # Nearby stations for origin and destination (radius 10km)
    origin_nearby = get_nearby_stations(
        origin_city.latitude, origin_city.longitude,
        radius_km=10.0, max_results=5
    )
    dest_nearby = get_nearby_stations(
        dest_city.latitude, dest_city.longitude,
        radius_km=10.0, max_results=5
    )

    distance_note = (
        "Distance et durée calculées via OSRM (routage routier réel)"
        if route_source == "osrm"
        else "Estimation basée sur la distance à vol d'oiseau ×1.3 (approximation route) — non basé sur un routage réel"
    )

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
        "duration_min": duration_min,
        "route_geometry": geometry,
        "route_source": route_source,
        "distance_note": distance_note,
        "modes": modes,
        "stations_nearby": {
            "origin": origin_nearby,
            "destination": dest_nearby,
        }
    }


@router.get("/infrastructure")
def get_infrastructure():
    """Returns all transport infrastructure points for map rendering."""
    from helpers.transport_data import get_all_stations
    return {"stations": get_all_stations()}
