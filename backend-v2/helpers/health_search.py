"""
helpers/health_search.py — Moteur de recherche et filtrage pour les établissements de santé.
"""
from typing import List, Dict, Any, Optional
from helpers.health_data import load_all_establishments, _haversine_km


def _score_match(text: str, query: str) -> int:
    """Simple scoring: 2 pts if query matches start of word, 1 pt if anywhere."""
    q = query.lower().strip()
    t = text.lower()
    if not q:
        return 1
    if t.startswith(q):
        return 3
    if q in t:
        return 2
    # Check individual words
    for word in t.split():
        if word.startswith(q):
            return 2
    return 0


def search_establishments(
    q: Optional[str] = None,
    facility_type: Optional[str] = None,
    governorate: Optional[str] = None,
    specialty: Optional[str] = None,
    cnam: Optional[bool] = None,
    emergency: Optional[bool] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: float = 50.0,
    page: int = 1,
    limit: int = 20,
) -> Dict[str, Any]:
    """
    Full-featured search with text query, type, governorate, specialty, CNAM, emergency, and geo filters.
    Returns paginated response with filter aggregates.
    """
    all_data = load_all_establishments()
    results = []

    for entry in all_data:
        score = 1  # Base score

        # ── Text search ──────────────────────────────────────────────
        if q:
            name_score    = _score_match(entry.get("name", ""), q)
            spec_score    = max((_score_match(s, q) for s in entry.get("specialties", [])), default=0)
            type_score    = _score_match(entry.get("type_label", ""), q)
            city_score    = _score_match(entry.get("city", ""), q)
            address_score = _score_match(entry.get("address", ""), q)
            total = name_score + spec_score + type_score + city_score + address_score
            if total == 0:
                continue
            score = total

        # ── Filters ──────────────────────────────────────────────────
        if facility_type and entry.get("type") != facility_type:
            continue
        if governorate and entry.get("governorate", "").lower() != governorate.lower():
            continue
        if specialty:
            specs_lower = [s.lower() for s in entry.get("specialties", [])]
            if not any(specialty.lower() in s for s in specs_lower):
                continue
        if cnam is not None and entry.get("cnam_convention") != cnam:
            continue
        if emergency is not None and entry.get("has_emergency") != emergency:
            continue

        # ── Geo filter ───────────────────────────────────────────────
        if lat is not None and lng is not None:
            dist = _haversine_km(lat, lng, entry.get("lat", 0), entry.get("lng", 0))
            if dist > radius_km:
                continue
            entry = {**entry, "distance_km": round(dist, 2), "walk_min": round(dist / 5 * 60)}
        else:
            entry = {**entry, "distance_km": None, "walk_min": None}

        results.append((score, entry))

    # Sort: by score desc, then by distance if available
    results.sort(key=lambda x: (-x[0], x[1].get("distance_km") or 9999))

    # ── Aggregates for filters panel ─────────────────────────────────
    all_results = [r[1] for r in results]
    types_available       = sorted(set(e.get("type", "") for e in all_results if e.get("type")))
    govs_available        = sorted(set(e.get("governorate", "") for e in all_results if e.get("governorate")))
    specs_available       = sorted(set(s for e in all_results for s in e.get("specialties", [])))

    # Pagination
    total = len(all_results)
    offset = (page - 1) * limit
    page_results = all_results[offset:offset + limit]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, -(-total // limit)),
        "results": page_results,
        "filters": {
            "types_available": types_available,
            "governorates_available": govs_available,
            "specialties_available": specs_available[:40],
        },
    }
