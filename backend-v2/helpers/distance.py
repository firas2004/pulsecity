import math

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on Earth in kilometers.
    """
    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def estimated_road_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Returns estimated road distance by multiplying straight-line (haversine) distance
    by a factor of 1.3 (road correction factor for Tunisia's road network).
    """
    return round(haversine_km(lat1, lon1, lat2, lon2) * 1.3, 2)
