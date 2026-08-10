"""
routers/poi_finder.py — Endpoints pour le module Pulse Local (POIs / Vie Locale).
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
import asyncio

from helpers.poi_data import (
    load_all_pois, get_nearby_pois, get_emblematic_pois,
    get_must_see_pois, CATEGORIES, POIS, _haversine_km, _enrich,
)
from helpers.poi_external_apis import fetch_external_pois

router = APIRouter(prefix="/poi-finder", tags=["poi-finder"])

PRICE_LABELS = {0: "Gratuit", 1: "€  (0–10 TND)", 2: "€€  (10–30 TND)", 3: "€€€  (30+ TND)"}

GOVERNORATES = [
    "Tunis", "Ariana", "Ben Arous", "La Manouba", "Nabeul", "Zaghouan",
    "Bizerte", "Béja", "Jendouba", "Le Kef", "Siliana", "Kairouan",
    "Kasserine", "Sidi Bouzid", "Sousse", "Monastir", "Mahdia", "Sfax",
    "Gabès", "Médenine", "Tataouine", "Gafsa", "Tozeur", "Kébili",
]


# ── 1. Recherche principale ──────────────────────────────────────────────────
@router.get("/search")
async def search(
    q: Optional[str]          = Query(None, description="Texte libre"),
    lat: Optional[float]      = Query(None),
    lng: Optional[float]      = Query(None),
    radius: float             = Query(50.0, ge=0.5, le=200, description="Rayon km"),
    categories: Optional[str] = Query(None, description="Catégories séparées par virgule"),
    governorate: Optional[str]= Query(None),
    city: Optional[str]       = Query(None),
    price_level: Optional[int]= Query(None, ge=0, le=3),
    min_rating: Optional[float]= Query(None, ge=0, le=5),
    must_see: Optional[bool]  = Query(None),
    wifi: Optional[bool]      = Query(None),
    terrace: Optional[bool]   = Query(None),
    halal: Optional[bool]     = Query(None),
    parking: Optional[bool]   = Query(None),
    outdoor_seating: Optional[bool] = Query(None),
    reservation: Optional[bool]= Query(None),
    sort_by: str              = Query("distance", description="distance | rating | price_asc | price_desc"),
    use_external: bool        = Query(False, description="Inclure résultats Geoapify/OSM"),
    page: int                 = Query(1, ge=1),
    limit: int                = Query(20, ge=1, le=100),
):
    """Recherche de POIs avec filtres avancés. Combine le dataset embarqué + APIs externes."""
    cat_list = [c.strip() for c in categories.split(",")] if categories else []

    # ── Dataset embarqué ──
    local_results = []
    for poi in POIS:
        # Texte
        if q:
            q_l = q.lower()
            searchable = (
                poi.get("name", "") + " " +
                poi.get("description", "") + " " +
                poi.get("city", "") + " " +
                " ".join(poi.get("tags", []))
            ).lower()
            if q_l not in searchable:
                continue

        # Catégorie
        if cat_list and poi.get("category") not in cat_list:
            continue

        # Gouvernorat / ville
        if governorate and poi.get("governorate", "").lower() != governorate.lower():
            continue
        if city and poi.get("city", "").lower() != city.lower():
            continue

        # Méta
        if price_level is not None and poi.get("price_level") != price_level:
            continue
        if min_rating and (poi.get("rating") or 0) < min_rating:
            continue
        if must_see is not None and poi.get("must_see") != must_see:
            continue

        # Features
        feats = poi.get("features", {})
        if wifi is not None and feats.get("wifi") != wifi:
            continue
        if terrace is not None and feats.get("terrace") != terrace:
            continue
        if halal is not None and feats.get("halal") != halal:
            continue
        if parking is not None and feats.get("parking") != parking:
            continue
        if outdoor_seating is not None and feats.get("outdoor_seating") != outdoor_seating:
            continue
        if reservation is not None and feats.get("reservation") != reservation:
            continue

        enriched = _enrich(poi, lat, lng)

        # Filtre géo
        if lat is not None and lng is not None:
            if (enriched.get("distance_km") or 9999) > radius:
                continue

        local_results.append(enriched)

    # ── APIs externes (si demandé et position fournie) ──
    external_results = []
    if use_external and lat is not None and lng is not None:
        try:
            external_results = await fetch_external_pois(lat, lng, min(radius, 20), cat_list, 30)
            # Dédupliquer par nom approx
            local_names = {r["name"].lower() for r in local_results}
            external_results = [r for r in external_results if r["name"].lower() not in local_names]
        except Exception as e:
            print(f"[POI] Erreur APIs externes : {e}")

    all_results = local_results + external_results

    # ── Tri ──
    def sort_key(r):
        d = r.get("distance_km") or 9999
        rating = -(r.get("rating") or 0)
        price = r.get("price_level") or 0
        if sort_by == "rating":
            return (rating, d)
        elif sort_by == "price_asc":
            return (price, d)
        elif sort_by == "price_desc":
            return (-price, d)
        else:  # distance
            return (d, rating)

    all_results.sort(key=sort_key)

    # ── Agrégation filtres disponibles ──
    categories_avail = sorted(set(r["category"] for r in all_results if r.get("category")))
    govs_avail       = sorted(set(r["governorate"] for r in all_results if r.get("governorate")))
    prices_avail     = sorted(set(r["price_level"] for r in all_results if r.get("price_level") is not None))

    total  = len(all_results)
    offset = (page - 1) * limit

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, -(-total // limit)),
        "results": all_results[offset:offset + limit],
        "filters": {
            "categories_available": categories_avail,
            "governorates_available": govs_avail,
            "price_levels_available": prices_avail,
        },
    }


# ── 2. POIs proches (GPS) ─────────────────────────────────────────────────────
@router.get("/nearby")
async def nearby(
    lat: float          = Query(...),
    lng: float          = Query(...),
    radius: float       = Query(5.0, ge=0.5, le=50),
    category: Optional[str] = Query(None),
    use_external: bool  = Query(False),
    limit: int          = Query(20, ge=1, le=50),
):
    """POIs les plus proches d'un point GPS."""
    local = get_nearby_pois(lat, lng, radius, category, limit)
    external = []
    if use_external:
        try:
            external = await fetch_external_pois(lat, lng, radius, [category] if category else None, limit)
            local_names = {r["name"].lower() for r in local}
            external = [r for r in external if r["name"].lower() not in local_names]
        except Exception:
            pass

    combined = sorted(local + external, key=lambda x: x.get("distance_km") or 9999)
    return {"lat": lat, "lng": lng, "radius_km": radius, "results": combined[:limit]}


# ── 3. POIs emblématiques ─────────────────────────────────────────────────────
@router.get("/emblematic")
def emblematic(
    governorate: Optional[str] = Query(None),
    limit: int                 = Query(12, ge=1, le=50),
):
    """Incontournables par gouvernorat."""
    return {
        "governorate": governorate or "all",
        "results": get_emblematic_pois(governorate, limit),
    }


# ── 4. Must-see — pour le mode Découverte ─────────────────────────────────────
@router.get("/must-see")
def must_see():
    """Liste de tous les POIs 'must see' de Tunisie."""
    return {"results": get_must_see_pois()}


# ── 5. Toutes les catégories ──────────────────────────────────────────────────
@router.get("/categories")
def categories():
    """Taxonomie complète des catégories."""
    return {
        "categories": [
            {"id": k, "name": v["name"], "emoji": v["emoji"], "color": v["color"]}
            for k, v in CATEGORIES.items()
        ]
    }


# ── 6. Tous les POIs (pour la carte) ─────────────────────────────────────────
@router.get("/all")
def all_pois(
    category: Optional[str]     = Query(None),
    governorate: Optional[str]  = Query(None),
    emblematic_only: bool       = Query(False),
):
    """Tous les POIs pour initialiser la carte."""
    data = POIS
    if category:
        data = [p for p in data if p.get("category") == category]
    if governorate:
        data = [p for p in data if p.get("governorate", "").lower() == governorate.lower()]
    if emblematic_only:
        data = [p for p in data if p.get("is_emblematic")]
    return {"pois": [_enrich(p) for p in data], "total": len(data)}


# ── 7. Fiche complète ─────────────────────────────────────────────────────────
@router.get("/detail/{poi_id}")
async def detail(poi_id: str):
    """Fiche complète d'un POI + POIs similaires."""
    poi = next((p for p in POIS if p["id"] == poi_id), None)
    if not poi:
        raise HTTPException(status_code=404, detail=f"POI '{poi_id}' introuvable.")

    enriched = _enrich(poi)

    # POIs similaires (même catégorie, même gouvernorat)
    similar = [
        _enrich(p) for p in POIS
        if p["id"] != poi_id
        and (p.get("category") == poi.get("category") or p.get("governorate") == poi.get("governorate"))
    ][:4]

    return {**enriched, "similar_pois": similar}


# ── 8. Statistiques par gouvernorat ──────────────────────────────────────────
@router.get("/stats/governorates")
def stats_governorates():
    """Nombre de POIs par gouvernorat et par catégorie."""
    stats = {}
    for gov in GOVERNORATES:
        gov_pois = [p for p in POIS if p.get("governorate", "").lower() == gov.lower()]
        by_cat: dict = {}
        for p in gov_pois:
            cat = p.get("category", "autre")
            by_cat[cat] = by_cat.get(cat, 0) + 1
        top = sorted(gov_pois, key=lambda x: -(x.get("rating") or 0))[:3]
        stats[gov] = {
            "total": len(gov_pois),
            "must_see": sum(1 for p in gov_pois if p.get("must_see")),
            "by_category": by_cat,
            "top_pois": [{"id": p["id"], "name": p["name"], "rating": p.get("rating")} for p in top],
        }
    return {"governorates": stats}


# ── 9. Itinéraire vers un POI ─────────────────────────────────────────────────
@router.get("/{poi_id}/directions")
def directions(
    poi_id: str,
    from_lat: float = Query(...),
    from_lng: float = Query(...),
):
    """Calcule l'itinéraire vers un POI."""
    poi = next((p for p in POIS if p["id"] == poi_id), None)
    if not poi:
        raise HTTPException(status_code=404, detail=f"POI '{poi_id}' introuvable.")

    to_lat, to_lng = poi["lat"], poi["lng"]
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
        "poi": {"id": poi["id"], "name": poi["name"], "lat": to_lat, "lng": to_lng},
        "from": {"lat": from_lat, "lng": from_lng},
        "route": route,
    }
