"""
routing_engine.py — Road routing using OSRM public API with Haversine fallback.
Returns distance_km, duration_min, and route geometry (list of [lat, lng] points).
"""
import math
import urllib.request
import urllib.error
import json
from typing import Dict, Any, List, Optional, Tuple


OSRM_BASE = "http://router.project-osrm.org/route/v1/driving"
TIMEOUT_SECONDS = 4


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))


def _fallback(lat1: float, lng1: float, lat2: float, lng2: float) -> Dict[str, Any]:
    """Haversine × 1.3 fallback when OSRM is unavailable."""
    straight = _haversine_km(lat1, lng1, lat2, lng2)
    road_km = round(straight * 1.3, 2)
    # Estimate ~80 km/h average speed for road
    duration_min = round(road_km / 80 * 60)
    # Simple 5-point geometry: straight line
    mid_lat = (lat1 + lat2) / 2
    mid_lng = (lng1 + lng2) / 2
    return {
        "distance_km": road_km,
        "duration_min": duration_min,
        "geometry": [[lat1, lng1], [mid_lat, mid_lng], [lat2, lng2]],
        "source": "haversine_fallback",
    }


def get_road_route(lat1: float, lng1: float, lat2: float, lng2: float) -> Dict[str, Any]:
    """
    Gets road route between two points.
    Tries OSRM first, falls back to Haversine × 1.3 if unavailable.
    Returns: {distance_km, duration_min, geometry: [[lat,lng],...], source}
    """
    if lat1 == lat2 and lng1 == lng2:
        return {"distance_km": 0.0, "duration_min": 0, "geometry": [[lat1, lng1]], "source": "same_point"}

    try:
        url = f"{OSRM_BASE}/{lng1},{lat1};{lng2},{lat2}?overview=simplified&geometries=geojson"
        req = urllib.request.Request(url, headers={"User-Agent": "PulseCity/1.0"})
        with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        if data.get("code") != "Ok" or not data.get("routes"):
            return _fallback(lat1, lng1, lat2, lng2)

        route = data["routes"][0]
        distance_m = route["distance"]
        duration_s = route["duration"]

        # Convert geometry from GeoJSON [lng, lat] → [[lat, lng]]
        coords = route["geometry"]["coordinates"]
        geometry = [[c[1], c[0]] for c in coords]

        return {
            "distance_km": round(distance_m / 1000, 2),
            "duration_min": round(duration_s / 60),
            "geometry": geometry,
            "source": "osrm",
        }

    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, KeyError, Exception):
        return _fallback(lat1, lng1, lat2, lng2)
