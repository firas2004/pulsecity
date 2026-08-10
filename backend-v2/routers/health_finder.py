from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from helpers.health_data import load_all_establishments, get_nearby_health, _haversine_km
from helpers.health_search import search_establishments

router = APIRouter(prefix="/health-finder", tags=["health-finder"])

GOVERNORATES = [
    "Tunis", "Ariana", "Ben Arous", "La Manouba", "Nabeul", "Zaghouan",
    "Bizerte", "Béja", "Jendouba", "Le Kef", "Siliana", "Kairouan",
    "Sousse", "Monastir", "Mahdia", "Sfax", "Gabès", "Médenine",
    "Tataouine", "Gafsa", "Tozeur", "Kasserine", "Sidi Bouzid", "Kébili",
]


@router.get("/search")
def search(
    q: Optional[str]    = Query(None, description="Recherche par nom ou spécialité"),
    type: Optional[str] = Query(None, description="Type d'établissement"),
    governorate: Optional[str] = Query(None),
    specialty: Optional[str]   = Query(None),
    cnam: Optional[bool]       = Query(None),
    emergency: Optional[bool]  = Query(None),
    lat: Optional[float]       = Query(None),
    lng: Optional[float]       = Query(None),
    radius: float              = Query(50.0, ge=1, le=200),
    page: int                  = Query(1, ge=1),
    limit: int                 = Query(20, ge=1, le=100),
):
    """Recherche d'établissements de santé avec filtres avancés."""
    return search_establishments(
        q=q,
        facility_type=type,
        governorate=governorate,
        specialty=specialty,
        cnam=cnam,
        emergency=emergency,
        lat=lat,
        lng=lng,
        radius_km=radius,
        page=page,
        limit=limit,
    )


@router.get("/nearby")
def nearby(
    lat: float          = Query(..., description="Latitude"),
    lng: float          = Query(..., description="Longitude"),
    radius: float       = Query(10.0, ge=1, le=100),
    type: Optional[str] = Query(None),
    limit: int          = Query(15, ge=1, le=50),
):
    """Établissements les plus proches d'un point GPS."""
    return {
        "lat": lat,
        "lng": lng,
        "radius_km": radius,
        "results": get_nearby_health(lat, lng, radius_km=radius, facility_type=type, limit=limit),
    }


@router.get("/detail/{establishment_id}")
def detail(establishment_id: str):
    """Fiche complète d'un établissement."""
    all_data = load_all_establishments()
    entry = next((e for e in all_data if e["id"] == establishment_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail=f"Établissement '{establishment_id}' introuvable.")
    return entry


@router.get("/governorates")
def governorates():
    """Liste des gouvernorats avec comptage par type d'établissement."""
    all_data = load_all_establishments()
    stats: dict = {}
    for gov in GOVERNORATES:
        govEntries = [e for e in all_data if e.get("governorate", "").lower() == gov.lower()]
        types: dict = {}
        for e in govEntries:
            t = e.get("type", "autre")
            types[t] = types.get(t, 0) + 1
        stats[gov] = {
            "total": len(govEntries),
            "by_type": types,
            "has_emergency": any(e.get("has_emergency") for e in govEntries),
        }
    return {"governorates": stats, "total_governorates": len(GOVERNORATES)}


@router.get("/all")
def all_establishments():
    """Retourne tous les établissements (pour le rendu carte)."""
    return {"establishments": load_all_establishments(), "total": len(load_all_establishments())}


@router.get("/{establishment_id}/directions")
def directions(
    establishment_id: str,
    from_lat: float = Query(...),
    from_lng: float = Query(...),
):
    """Calcule l'itinéraire depuis un point vers l'établissement (réutilise routing_engine)."""
    all_data = load_all_establishments()
    entry = next((e for e in all_data if e["id"] == establishment_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail=f"Établissement '{establishment_id}' introuvable.")

    to_lat = entry["lat"]
    to_lng = entry["lng"]

    try:
        from helpers.routing_engine import get_road_route
        route = get_road_route(from_lat, from_lng, to_lat, to_lng)
    except Exception:
        dist = _haversine_km(from_lat, from_lng, to_lat, to_lng) * 1.3
        route = {
            "distance_km": round(dist, 2),
            "duration_min": round(dist / 50 * 60),
            "geometry": [[from_lat, from_lng], [to_lat, to_lng]],
            "source": "haversine",
        }

    return {
        "establishment": {"id": entry["id"], "name": entry["name"], "lat": to_lat, "lng": to_lng},
        "from": {"lat": from_lat, "lng": from_lng},
        "route": route,
    }
