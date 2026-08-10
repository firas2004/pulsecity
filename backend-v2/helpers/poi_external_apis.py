"""
helpers/poi_external_apis.py — Intégration Geoapify + Overpass API (fallback gratuit).
Stratégie : dataset embarqué → Geoapify → Overpass (backup).
"""
import os
import asyncio
import httpx
from typing import List, Dict, Any, Optional
from math import radians, sin, cos, sqrt, atan2

GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_API_KEY", "")
GEOAPIFY_BASE_URL = "https://api.geoapify.com/v2/places"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# ── Mapping Geoapify → catégories Pulse Local ────────────────────────────────
GEOAPIFY_CAT_MAP = {
    "catering.restaurant":      "restaurant",
    "catering.cafe":            "cafe",
    "catering.fast_food":       "fast_food",
    "catering.bar":             "bar",
    "catering.bakery":          "boulangerie",
    "catering.ice_cream":       "patisserie",
    "entertainment.cinema":     "cinema",
    "entertainment.museum":     "musee",
    "entertainment.theatre":    "theatre",
    "entertainment.art_gallery":"galerie_art",
    "leisure.park":             "parc",
    "leisure.beach":            "plage",
    "leisure.playground":       "parc",
    "leisure.fitness":          "salle_sport",
    "tourism.attraction":       "tourisme",
    "tourism.sights":           "tourisme",
    "accommodation.hotel":      "hotel",
    "commercial.shopping_mall": "centre_commercial",
    "commercial.marketplace":   "souk",
    "sport.sports_centre":      "salle_sport",
    "service.post_office":      "poste",
    "service.bank":             "banque",
    "service.atm":              "atm",
    "service.fuel":             "station_essence",
    "healthcare.pharmacy":      "pharmacie",
}

# ── Mapping Overpass amenity/leisure → catégories ────────────────────────────
OVERPASS_TAG_MAP = {
    "restaurant":     "restaurant",
    "cafe":           "cafe",
    "bar":            "bar",
    "fast_food":      "fast_food",
    "bakery":         "boulangerie",
    "cinema":         "cinema",
    "theatre":        "theatre",
    "museum":         "musee",
    "park":           "parc",
    "hotel":          "hotel",
    "marketplace":    "souk",
    "pharmacy":       "pharmacie",
    "bank":           "banque",
    "atm":            "atm",
    "fuel":           "station_essence",
    "sports_centre":  "salle_sport",
    "beach":          "plage",
    "library":        "bibliotheque",
    "place_of_worship": "mosquee",
    "art_gallery":    "galerie_art",
    "supermarket":    "centre_commercial",
}


def _haversine_km(lat1, lng1, lat2, lng2) -> float:
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def _normalize_geoapify(feature: dict, user_lat=None, user_lng=None) -> Dict:
    """Convertit un Feature GeoJSON Geoapify en POI Pulse Local."""
    props = feature.get("properties", {})
    geom  = feature.get("geometry", {})
    coords = geom.get("coordinates", [0, 0])

    lng = coords[0] if len(coords) > 1 else props.get("lon", 0)
    lat = coords[1] if len(coords) > 1 else props.get("lat", 0)

    # Catégorie
    cats_raw = props.get("categories", [])
    category = "tourisme"
    for c in cats_raw:
        if c in GEOAPIFY_CAT_MAP:
            category = GEOAPIFY_CAT_MAP[c]
            break
        # Prefix match
        for k, v in GEOAPIFY_CAT_MAP.items():
            if c.startswith(k):
                category = v
                break

    name = props.get("name") or props.get("formatted", "Lieu sans nom")
    address = props.get("formatted", props.get("address_line2", ""))

    dist = None
    if user_lat and user_lng:
        dist = round(_haversine_km(user_lat, user_lng, lat, lng), 2)

    photo_query = f"{name} tunisia"

    return {
        "id": f"geoapify-{props.get('place_id', abs(hash(name)))}",
        "name": name,
        "category": category,
        "category_label": category.replace("_", " ").title(),
        "address": address,
        "lat": lat, "lng": lng,
        "phone": props.get("datasource", {}).get("raw", {}).get("phone"),
        "website": props.get("datasource", {}).get("raw", {}).get("website"),
        "description": props.get("address_line2", ""),
        "rating": None,
        "reviews_count": 0,
        "photo_url": f"https://source.unsplash.com/800x600/?{photo_query.replace(' ', '+')}",
        "opening_hours": props.get("opening_hours"),
        "price_level": None,
        "price_label": None,
        "tags": [],
        "is_emblematic": False,
        "must_see": False,
        "features": {},
        "distance_km": dist,
        "walk_min": round(dist / 5 * 60) if dist else None,
        "car_min": round(dist / 40 * 60) if dist else None,
        "datasource": "geoapify",
        "osm_id": props.get("datasource", {}).get("raw", {}).get("osm_id"),
    }


def _normalize_overpass(element: dict, user_lat=None, user_lng=None) -> Optional[Dict]:
    """Convertit un élément Overpass en POI Pulse Local."""
    tags = element.get("tags", {})
    name = tags.get("name") or tags.get("name:fr") or tags.get("name:ar")
    if not name:
        return None

    # Coordonnées (node direct ou centre de way/relation)
    if element.get("type") == "node":
        lat = element.get("lat", 0)
        lng = element.get("lon", 0)
    else:
        center = element.get("center", {})
        lat = center.get("lat", 0)
        lng = center.get("lon", 0)

    if not lat or not lng:
        return None

    # Catégorie
    amenity = tags.get("amenity", "")
    leisure = tags.get("leisure", "")
    tourism = tags.get("tourism", "")
    shop    = tags.get("shop", "")
    raw_cat = amenity or leisure or tourism or shop or "tourisme"
    category = OVERPASS_TAG_MAP.get(raw_cat, "tourisme")

    address = ", ".join(filter(None, [
        tags.get("addr:housenumber"), tags.get("addr:street"),
        tags.get("addr:city"), tags.get("addr:country", "Tunisie")
    ])) or tags.get("addr:full", "")

    dist = None
    if user_lat and user_lng:
        dist = round(_haversine_km(user_lat, user_lng, lat, lng), 2)

    return {
        "id": f"osm-{element['type']}-{element['id']}",
        "name": name,
        "category": category,
        "category_label": category.replace("_", " ").title(),
        "address": address,
        "lat": lat, "lng": lng,
        "phone": tags.get("phone") or tags.get("contact:phone"),
        "website": tags.get("website") or tags.get("contact:website"),
        "description": tags.get("description", ""),
        "rating": None,
        "reviews_count": 0,
        "photo_url": f"https://source.unsplash.com/800x600/?{name.replace(' ', '+')}+tunisia",
        "opening_hours": tags.get("opening_hours"),
        "price_level": None,
        "price_label": None,
        "tags": [],
        "is_emblematic": False,
        "must_see": False,
        "features": {
            "wifi": tags.get("internet_access") == "wlan",
            "terrace": tags.get("outdoor_seating") == "yes",
            "parking": tags.get("parking") is not None,
            "halal": tags.get("diet:halal") == "yes",
            "vegetarian": tags.get("diet:vegetarian") in ("yes", "only"),
            "wheelchair": tags.get("wheelchair") in ("yes", "limited"),
        },
        "distance_km": dist,
        "walk_min": round(dist / 5 * 60) if dist else None,
        "car_min": round(dist / 40 * 60) if dist else None,
        "datasource": "openstreetmap",
        "osm_id": f"{element['type']}/{element['id']}",
    }


async def fetch_geoapify(
    lat: float, lng: float,
    radius_m: int = 5000,
    categories: List[str] = None,
    limit: int = 40,
) -> List[Dict]:
    """Appelle l'API Geoapify Places pour les POIs autour d'un point."""
    if not GEOAPIFY_API_KEY:
        return []

    # Mapping catégories Pulse → catégories Geoapify
    reverse_map = {v: k for k, v in GEOAPIFY_CAT_MAP.items()}
    geo_cats = []
    if categories:
        for cat in categories:
            if cat in reverse_map:
                geo_cats.append(reverse_map[cat])
    if not geo_cats:
        geo_cats = ["catering", "entertainment", "leisure", "tourism", "accommodation"]

    params = {
        "categories": ",".join(geo_cats),
        "filter": f"circle:{lng},{lat},{radius_m}",
        "limit": min(limit, 100),
        "apiKey": GEOAPIFY_API_KEY,
        "format": "geojson",
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(GEOAPIFY_BASE_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
            features = data.get("features", [])
            return [_normalize_geoapify(f, lat, lng) for f in features]
    except Exception as e:
        print(f"[Geoapify] Erreur : {e}")
        return []


async def fetch_overpass(
    lat: float, lng: float,
    radius_m: int = 5000,
    amenity_types: List[str] = None,
) -> List[Dict]:
    """Backup Overpass API pour les POIs OSM."""
    default_types = ["restaurant", "cafe", "bar", "museum", "cinema", "park", "hotel"]
    types = amenity_types or default_types

    amenity_filter = "".join(
        f'node[amenity="{t}"]({lat - 0.05},{lng - 0.07},{lat + 0.05},{lng + 0.07});'
        f'way[amenity="{t}"]({lat - 0.05},{lng - 0.07},{lat + 0.05},{lng + 0.07});'
        for t in types
    )
    query = f"[out:json][timeout:20];({amenity_filter});out center 50;"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(OVERPASS_URL, data={"data": query})
            resp.raise_for_status()
            elements = resp.json().get("elements", [])
            results = []
            for el in elements:
                poi = _normalize_overpass(el, lat, lng)
                if poi:
                    # Filtre par rayon
                    if poi["distance_km"] is not None and poi["distance_km"] * 1000 <= radius_m:
                        results.append(poi)
            return sorted(results, key=lambda x: x.get("distance_km") or 9999)
    except Exception as e:
        print(f"[Overpass] Erreur : {e}")
        return []


async def fetch_external_pois(
    lat: float, lng: float,
    radius_km: float = 5.0,
    categories: List[str] = None,
    limit: int = 40,
) -> List[Dict]:
    """Stratégie de fallback : Geoapify d'abord, Overpass si vide."""
    radius_m = int(radius_km * 1000)

    # 1. Geoapify (priorité)
    if GEOAPIFY_API_KEY:
        results = await fetch_geoapify(lat, lng, radius_m, categories, limit)
        if results:
            return results

    # 2. Overpass (backup gratuit)
    return await fetch_overpass(lat, lng, radius_m)
