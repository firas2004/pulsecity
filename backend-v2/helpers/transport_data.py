"""
transport_data.py — Loads and exposes all transport infrastructure datasets.
Provides nearby station lookup using Haversine distance.
"""
import json
import os
import math
from typing import List, Dict, Any, Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def _load_json(filename: str) -> List[Dict]:
    path = os.path.join(DATA_DIR, filename)
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[transport_data] Warning: could not load {filename}: {e}")
        return []


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


# ── Cached datasets ──────────────────────────────────────────────────────────
_LOUAGES: List[Dict] = _load_json("louages_stations.json")
_AIRPORTS: List[Dict] = _load_json("airports.json")
_RFR: List[Dict] = _load_json("rfr_stations.json")
_TGM: List[Dict] = _load_json("tgm_stations.json")
_METRO_LINES: List[Dict] = _load_json("metro_lines.json")

# Flatten metro stations from all lines
_METRO_STATIONS: List[Dict] = []
for line in _METRO_LINES:
    for station in line.get("stations", []):
        _METRO_STATIONS.append({
            **station,
            "type": "metro",
            "line": line["line"],
            "line_color": line.get("color", "#0055A4"),
        })


def get_all_stations() -> List[Dict]:
    """Returns all transport infrastructure points."""
    result = []
    for s in _LOUAGES:
        result.append({**s, "type": "louage"})
    for s in _AIRPORTS:
        result.append({**s, "type": "airport"})
    for s in _RFR:
        result.append({**s, "type": "rfr"})
    for s in _TGM:
        result.append({**s, "type": "tgm"})
    for s in _METRO_STATIONS:
        result.append(s)
    return result


def get_nearby_stations(lat: float, lng: float, radius_km: float = 15.0, max_results: int = 5) -> List[Dict]:
    """Returns stations within radius_km, sorted by distance."""
    all_stations = get_all_stations()
    nearby = []
    for s in all_stations:
        dist = _haversine_km(lat, lng, s["lat"], s["lng"])
        if dist <= radius_km:
            walk_min = round(dist / 5.0 * 60)  # ~5 km/h walking
            nearby.append({
                "id": s.get("id"),
                "name": s.get("name"),
                "type": s.get("type"),
                "lat": s.get("lat"),
                "lng": s.get("lng"),
                "lines": s.get("lines", s.get("line", s.get("interchange", []))),
                "destinations": s.get("destinations", []),
                "distance_km": round(dist, 2),
                "walk_min": walk_min,
            })
    nearby.sort(key=lambda x: x["distance_km"])
    return nearby[:max_results]


def get_airport_for_city(city_id: str) -> Optional[Dict]:
    """Returns airport info if the city has one, else None."""
    for airport in _AIRPORTS:
        if airport.get("city_id") == city_id:
            return airport
    return None


def has_airport(city_id: str) -> bool:
    return get_airport_for_city(city_id) is not None


def get_rfr_cities() -> set:
    """Returns city_ids served by RFR (Manouba, Bardo area = tunis-centre, manouba)."""
    return {"tunis-centre", "manouba"}


def get_tgm_cities() -> set:
    """Returns city_ids served by TGM."""
    return {"tunis-centre", "la-marsa"}


def get_louage_station_for_trip(origin_id: str, dest_id: str) -> Optional[Dict]:
    """Returns the most relevant louage station for a given trip."""
    # Simplified: match destination city to station zones
    dest_region_map = {
        "bizerte": "bab-saadoun", "jendouba": "bab-saadoun", "beja": "bab-saadoun",
        "sousse": "moncef-bey", "monastir": "moncef-bey", "sfax": "moncef-bey",
        "gabes": "moncef-bey", "kairouan": "moncef-bey", "mahdia": "moncef-bey",
        "nabeul": "bab-alioua", "tozeur": "moncef-bey", "gafsa": "moncef-bey",
        "medenine": "moncef-bey", "siliana": "bab-saadoun",
    }
    station_id = dest_region_map.get(dest_id) or dest_region_map.get(origin_id)
    if station_id:
        for s in _LOUAGES:
            if s["id"] == station_id:
                return s
    # Default: Moncef Bey for southern, Bab Saadoun for northern
    for s in _LOUAGES:
        if s["id"] == "moncef-bey":
            return s
    return _LOUAGES[0] if _LOUAGES else None
