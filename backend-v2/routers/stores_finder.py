"""
routers/stores_finder.py
API Magasins & Grandes Surfaces — Pulse City
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from helpers.stores_data import get_all_stores, get_chains, get_promotions, get_chains_map, enrich_store
from helpers.stores_search import StoresSearchEngine
from datetime import datetime

router  = APIRouter(prefix="/stores-finder", tags=["Stores Finder"])
_engine = StoresSearchEngine()

# ── GET /stores-finder/search ─────────────────────────────────────────────────
@router.get("/search")
def search_stores(
    q: Optional[str]        = Query(None, description="Texte libre"),
    lat: Optional[float]    = Query(None),
    lng: Optional[float]    = Query(None),
    radius: float           = Query(50.0, description="Rayon en km"),
    chains: Optional[str]   = Query(None, description="ex: carrefour,mg"),
    formats: Optional[str]  = Query(None, description="ex: hypermarché,supermarché"),
    governorate: Optional[str] = Query(None),
    city: Optional[str]     = Query(None),
    services: Optional[str] = Query(None, description="ex: boulangerie,parking"),
    has_promotions: Optional[bool] = Query(None),
    is_open_now: Optional[bool]    = Query(None),
    sort_by: str            = Query("name", description="distance|rating|surface|name"),
    page: int               = Query(1, ge=1),
    limit: int              = Query(20, ge=1, le=100),
):
    chains_list   = [c.strip() for c in chains.split(',')] if chains else None
    formats_list  = [f.strip() for f in formats.split(',')] if formats else None
    services_list = [s.strip() for s in services.split(',')] if services else None

    return _engine.search(
        q=q, lat=lat, lng=lng, radius_km=radius,
        chains=chains_list, formats=formats_list,
        governorate=governorate, city=city,
        services=services_list,
        has_promotions=has_promotions,
        is_open_now=is_open_now,
        sort_by=sort_by,
        page=page, limit=limit,
    )

# ── GET /stores-finder/nearby ─────────────────────────────────────────────────
@router.get("/nearby")
def get_nearby(
    lat: float  = Query(...),
    lng: float  = Query(...),
    radius: float = Query(5.0),
    chains: Optional[str] = Query(None),
    limit: int  = Query(10, ge=1, le=50),
):
    chains_list = [c.strip() for c in chains.split(',')] if chains else None
    return {
        "results": _engine.nearby(lat=lat, lng=lng, radius_km=radius,
                                   chains=chains_list, limit=limit),
        "radius_km": radius,
        "center": {"lat": lat, "lng": lng},
    }

# ── GET /stores-finder/chains ─────────────────────────────────────────────────
@router.get("/chains")
def get_chains_route():
    chains     = get_chains()
    promos     = get_promotions()
    today      = datetime.now().date().isoformat()
    promos_map = {}
    for p in promos:
        if p.get('is_active') and p.get('start_date', '') <= today <= p.get('end_date', ''):
            cid = p.get('store_chain')
            promos_map.setdefault(cid, []).append(p)
    result = []
    for c in chains:
        c = dict(c)
        c['active_promotions'] = promos_map.get(c['id'], [])
        result.append(c)
    return {"chains": result, "total": len(result)}

# ── GET /stores-finder/promotions ─────────────────────────────────────────────
@router.get("/promotions")
def get_promotions_route(
    chain: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
):
    promos = get_promotions()
    today  = datetime.now().date().isoformat()
    if chain:
        promos = [p for p in promos if p.get('store_chain') == chain]
    if is_active is not None:
        if is_active:
            promos = [p for p in promos
                      if p.get('is_active') and
                         p.get('start_date', '') <= today <= p.get('end_date', '')]
        else:
            promos = [p for p in promos if not p.get('is_active')]
    return {"promotions": promos, "total": len(promos)}

# ── GET /stores-finder/detail/{store_id} ──────────────────────────────────────
@router.get("/detail/{store_id}")
def get_store_detail(store_id: str):
    store = _engine.get_detail(store_id)
    if not store:
        raise HTTPException(status_code=404, detail=f"Magasin '{store_id}' introuvable")
    # Enrichir avec la fiche enseigne complète
    chains_map = get_chains_map()
    store['chain_info'] = chains_map.get(store.get('chain'), {})
    return store

# ── GET /stores-finder/stats ──────────────────────────────────────────────────
@router.get("/stats")
def get_stats():
    stores     = get_all_stores()
    chains_map = get_chains_map()
    promos     = get_promotions()
    today      = datetime.now().date().isoformat()

    by_chain = {}
    by_gov   = {}
    by_fmt   = {}

    for s in stores:
        c = s.get('chain', 'autre')
        by_chain[c] = by_chain.get(c, 0) + 1
        g = s.get('governorate', '?')
        by_gov[g]   = by_gov.get(g, 0) + 1
        f = s.get('format', '?')
        by_fmt[f]   = by_fmt.get(f, 0) + 1

    active_promos = [p for p in promos
                     if p.get('is_active') and
                        p.get('start_date', '') <= today <= p.get('end_date', '')]

    return {
        "total_stores": len(stores),
        "total_chains": len(get_chains()),
        "active_promotions": len(active_promos),
        "by_chain": by_chain,
        "by_governorate": by_gov,
        "by_format": by_fmt,
    }
