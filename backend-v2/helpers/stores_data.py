"""
helpers/stores_data.py
Chargement et exposition des données magasins/grandes surfaces pour Pulse City.
"""
import json
import os
from datetime import datetime
from typing import List, Dict, Optional

_BASE = os.path.join(os.path.dirname(__file__), '..', 'data', 'stores')

# ── Chargement des fichiers JSON ──────────────────────────────────────────────

def _load(filename: str) -> list:
    path = os.path.join(_BASE, filename)
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"[stores_data] Warning: {filename} introuvable")
        return []
    except json.JSONDecodeError as e:
        print(f"[stores_data] JSON invalide dans {filename}: {e}")
        return []

# ── Cache mémoire ─────────────────────────────────────────────────────────────
_stores_cache: Optional[List[dict]]  = None
_chains_cache: Optional[List[dict]]  = None
_promos_cache: Optional[List[dict]]  = None

def get_all_stores() -> List[dict]:
    global _stores_cache
    if _stores_cache is None:
        _stores_cache = _load('stores.json')
    return _stores_cache

def get_chains() -> List[dict]:
    global _chains_cache
    if _chains_cache is None:
        _chains_cache = _load('store_chains.json')
    return _chains_cache

def get_promotions() -> List[dict]:
    global _promos_cache
    if _promos_cache is None:
        _promos_cache = _load('promotions.json')
    return _promos_cache

def get_chains_map() -> Dict[str, dict]:
    return {c['id']: c for c in get_chains()}

# ── Statut "ouvert maintenant" ────────────────────────────────────────────────

DAY_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

def _parse_hours(slot: str):
    """Retourne (open_h, open_m, close_h, close_m) ou None si fermé / invalide."""
    if not slot or slot.strip().lower() in ('fermé', 'closed', ''):
        return None
    parts = slot.strip().split('-')
    if len(parts) != 2:
        return None
    try:
        oh, om = map(int, parts[0].strip().split(':'))
        ch, cm = map(int, parts[1].strip().split(':'))
        return oh, om, ch, cm
    except Exception:
        return None

def is_open_now(store: dict) -> tuple:
    """
    Retourne (is_open: bool, closes_in_min: int | None).
    closes_in_min = None si fermé ou calcul impossible.
    """
    hours = store.get('opening_hours', {})
    now = datetime.now()
    day = DAY_NAMES[now.weekday()]
    slot = hours.get(day)
    parsed = _parse_hours(slot)
    if not parsed:
        return False, None
    oh, om, ch, cm = parsed
    open_min  = oh * 60 + om
    close_min = ch * 60 + cm
    now_min   = now.hour * 60 + now.minute
    if open_min <= now_min < close_min:
        return True, close_min - now_min
    return False, None

# ── Enrichissement d'un store ─────────────────────────────────────────────────

def enrich_store(store: dict, chains_map: Dict[str, dict],
                 promos: List[dict], lat=None, lng=None) -> dict:
    """Ajoute is_open_now, chain_color, distance, tags, promotions_count."""
    s = dict(store)
    chain_id = s.get('chain', '')
    chain    = chains_map.get(chain_id, {})

    s['chain_color']  = chain.get('color', '#888')
    s['chain_emoji']  = chain.get('emoji', '🏪')

    opened, closes_in = is_open_now(s)
    s['is_open_now']   = opened
    s['closes_in_min'] = closes_in

    # Distance
    if lat is not None and lng is not None:
        s['distance_km']    = _haversine(lat, lng, s.get('lat', 0), s.get('lng', 0))
        s['travel_time_min'] = max(1, int(s['distance_km'] / 0.5))
    else:
        s['distance_km']    = None
        s['travel_time_min'] = None

    # Promotions actives pour cette enseigne
    today = datetime.now().date().isoformat()
    s['active_promotions'] = [
        p for p in promos
        if p.get('store_chain') == chain_id and p.get('is_active')
        and p.get('start_date', '') <= today <= p.get('end_date', '')
    ]
    s['has_promotions'] = len(s['active_promotions']) > 0

    # Tags visuels
    tags = []
    fmt = s.get('format', '')
    if fmt == 'hypermarché':     tags.append('🏪 Hypermarché')
    elif fmt == 'supermarché':   tags.append('🛒 Supermarché')
    elif fmt == 'superette':     tags.append('🏠 Superette')
    elif fmt == 'hard_discount': tags.append('🏷️ Hard-discount')
    feats = s.get('features', {})
    if feats.get('parking_gratuit'): tags.append('🅿️ Parking gratuit')
    elif feats.get('parking'):       tags.append('🅿️ Parking')
    if feats.get('accessibilite_pmr'): tags.append('♿ PMR')
    if feats.get('rayon_bio'):         tags.append('🌱 Bio')
    if feats.get('livraison'):         tags.append('🚚 Livraison')
    if s.get('has_promotions'):        tags.append('🏷️ Promos')
    s['tags'] = tags

    return s

def _haversine(lat1, lng1, lat2, lng2) -> float:
    from math import radians, sin, cos, sqrt, atan2
    R = 6371
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2)**2
    return round(R * 2 * atan2(sqrt(a), sqrt(1 - a)), 2)
