"""
routers/admin_finder.py — Endpoints pour le module Administrations & Guichet Unique.
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from helpers.admin_data import load_all_admin, get_nearby_admin, _haversine_km, TYPE_CONFIG
from helpers.procedure_guides import (
    get_all_procedures, get_procedure_by_id, search_procedures, CATEGORIES
)

router = APIRouter(prefix="/admin-finder", tags=["admin-finder"])

GOVERNORATES = [
    "Tunis", "Ariana", "Ben Arous", "La Manouba", "Nabeul", "Zaghouan",
    "Bizerte", "Béja", "Jendouba", "Le Kef", "Siliana", "Kairouan",
    "Kasserine", "Sidi Bouzid", "Sousse", "Monastir", "Mahdia", "Sfax",
    "Gabès", "Médenine", "Tataouine", "Gafsa", "Tozeur", "Kébili",
]


# ── 1. Recherche principale ──────────────────────────────────────────────────
@router.get("/search")
def search(
    q: Optional[str]           = Query(None, description="Recherche par nom, adresse ou service"),
    type: Optional[str]        = Query(None, description="Type d'administration"),
    governorate: Optional[str] = Query(None, description="Gouvernorat"),
    service: Optional[str]     = Query(None, description="Service proposé"),
    emergency: Optional[bool]  = Query(None, description="Ouvert 24/7"),
    has_etat_civil: Optional[bool] = Query(None),
    lat: Optional[float]       = Query(None),
    lng: Optional[float]       = Query(None),
    radius: float              = Query(50.0, ge=1, le=200),
    page: int                  = Query(1, ge=1),
    limit: int                 = Query(20, ge=1, le=100),
):
    """Recherche d'établissements administratifs avec filtres avancés."""
    all_data = load_all_admin()
    results = []

    for entry in all_data:
        score = 1

        # Texte
        if q:
            q_l = q.lower()
            searchable = (
                entry.get("name", "") + " " +
                entry.get("address", "") + " " +
                entry.get("city", "") + " " +
                " ".join(entry.get("services", []))
            ).lower()
            if q_l not in searchable:
                continue
            score = 2 if entry.get("name", "").lower().startswith(q_l) else 1

        # Filtres
        if type and entry.get("type") != type:
            continue
        if governorate and entry.get("governorate", "").lower() != governorate.lower():
            continue
        if service and service not in entry.get("services", []):
            continue
        if emergency is not None and entry.get("emergency") != emergency:
            continue
        if has_etat_civil is not None and entry.get("has_etat_civil") != has_etat_civil:
            continue

        # Géo
        if lat is not None and lng is not None:
            dist = _haversine_km(lat, lng, entry.get("lat", 0), entry.get("lng", 0))
            if dist > radius:
                continue
            entry = {**entry, "distance_km": round(dist, 2), "walk_min": round(dist / 5 * 60)}
        else:
            entry = {**entry, "distance_km": None, "walk_min": None}

        results.append((score, entry))

    results.sort(key=lambda x: (-x[0], x[1].get("distance_km") or 9999))
    all_results = [r[1] for r in results]

    types_available = sorted(set(e.get("type", "") for e in all_results if e.get("type")))
    govs_available  = sorted(set(e.get("governorate", "") for e in all_results if e.get("governorate")))
    svcs_available  = sorted(set(s for e in all_results for s in e.get("services", [])))

    total  = len(all_results)
    offset = (page - 1) * limit

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, -(-total // limit)),
        "results": all_results[offset:offset + limit],
        "filters": {
            "types_available": types_available,
            "governorates_available": govs_available,
            "services_available": svcs_available[:40],
        },
    }


# ── 2. Proximité GPS ─────────────────────────────────────────────────────────
@router.get("/nearby")
def nearby(
    lat: float          = Query(..., description="Latitude"),
    lng: float          = Query(..., description="Longitude"),
    radius: float       = Query(5.0, ge=0.5, le=100),
    type: Optional[str] = Query(None),
    limit: int          = Query(15, ge=1, le=50),
):
    """Établissements administratifs les plus proches d'un point GPS."""
    return {
        "lat": lat,
        "lng": lng,
        "radius_km": radius,
        "results": get_nearby_admin(lat, lng, radius_km=radius, admin_type=type, limit=limit),
    }


# ── 3. Fiche complète ────────────────────────────────────────────────────────
@router.get("/detail/{establishment_id}")
def detail(establishment_id: str):
    """Fiche complète d'un établissement administratif."""
    all_data = load_all_admin()
    entry = next((e for e in all_data if e["id"] == establishment_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail=f"Établissement '{establishment_id}' introuvable.")
    return entry


# ── 4. Tous les établissements (pour la carte) ───────────────────────────────
@router.get("/all")
def all_establishments(type: Optional[str] = Query(None)):
    """Retourne tous les établissements (filtré optionnellement par type)."""
    data = load_all_admin()
    if type:
        data = [e for e in data if e.get("type") == type]
    return {"establishments": data, "total": len(data)}


# ── 5. Statistiques par gouvernorat ─────────────────────────────────────────
@router.get("/governorates")
def governorates():
    """Stats des établissements administratifs par gouvernorat."""
    all_data = load_all_admin()
    stats = {}
    for gov in GOVERNORATES:
        govEntries = [e for e in all_data if e.get("governorate", "").lower() == gov.lower()]
        types: dict = {}
        for e in govEntries:
            t = e.get("type", "autre")
            types[t] = types.get(t, 0) + 1
        stats[gov] = {
            "total": len(govEntries),
            "by_type": types,
            "has_police": any(e["type"] == "police" for e in govEntries),
            "has_tribunal": any(e["type"] == "tribunal" for e in govEntries),
            "has_poste": any(e["type"] == "poste" for e in govEntries),
        }
    return {"governorates": stats, "total_governorates": len(GOVERNORATES)}


# ── 6. Liste des types d'administrations ────────────────────────────────────
@router.get("/types")
def types():
    """Retourne les types d'administrations avec labels et couleurs."""
    return {
        "types": [
            {"id": k, **v} for k, v in TYPE_CONFIG.items()
        ]
    }


# ── 7. Démarches administratives ─────────────────────────────────────────────
@router.get("/procedures")
def procedures(
    q: Optional[str]        = Query(None, description="Recherche dans les démarches"),
    category: Optional[str] = Query(None, description="Catégorie de démarche"),
):
    """Liste des fiches pratiques de démarches administratives."""
    results = search_procedures(q=q or "", category=category or "")
    return {
        "total": len(results),
        "procedures": results,
        "categories": [
            {"id": k, **v} for k, v in CATEGORIES.items()
        ],
    }


# ── 8. Fiche démarche complète ───────────────────────────────────────────────
@router.get("/procedure/{procedure_id}")
def procedure_detail(procedure_id: str):
    """Fiche complète d'une démarche administrative avec liens vers les administrations."""
    proc = get_procedure_by_id(procedure_id)
    if not proc:
        raise HTTPException(status_code=404, detail=f"Démarche '{procedure_id}' introuvable.")

    # Ajouter les administrations correspondantes
    all_data = load_all_admin()
    related_admins = []
    for admin_type in proc.get("admin_types", []):
        admins_of_type = [e for e in all_data if e.get("type") == admin_type][:3]
        related_admins.extend(admins_of_type)

    return {**proc, "related_establishments": related_admins[:6]}


# ── 9. Itinéraire vers un établissement ─────────────────────────────────────
@router.get("/{establishment_id}/directions")
def directions(
    establishment_id: str,
    from_lat: float = Query(...),
    from_lng: float = Query(...),
):
    """Calcule l'itinéraire vers un établissement administratif."""
    all_data = load_all_admin()
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
            "duration_min": round(dist / 40 * 60),
            "geometry": [[from_lat, from_lng], [to_lat, to_lng]],
            "source": "haversine",
        }

    return {
        "establishment": {
            "id": entry["id"],
            "name": entry["name"],
            "lat": to_lat,
            "lng": to_lng,
            "type": entry["type"],
            "address": entry.get("address", ""),
        },
        "from": {"lat": from_lat, "lng": from_lng},
        "route": route,
    }
