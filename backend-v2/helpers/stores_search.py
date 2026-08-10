"""
helpers/stores_search.py
Moteur de recherche et filtrage pour les magasins/grandes surfaces.
"""
from typing import List, Optional, Dict
from .stores_data import get_all_stores, get_chains_map, get_promotions, enrich_store, _haversine


class StoresSearchEngine:

    def search(
        self,
        q: Optional[str] = None,
        lat: Optional[float] = None,
        lng: Optional[float] = None,
        radius_km: float = 50.0,
        chains: Optional[List[str]] = None,
        formats: Optional[List[str]] = None,
        governorate: Optional[str] = None,
        city: Optional[str] = None,
        services: Optional[List[str]] = None,
        has_promotions: Optional[bool] = None,
        is_open_now: Optional[bool] = None,
        sort_by: str = 'distance',
        page: int = 1,
        limit: int = 20,
    ) -> dict:
        all_stores  = get_all_stores()
        chains_map  = get_chains_map()
        promos      = get_promotions()

        results = [enrich_store(s, chains_map, promos, lat, lng) for s in all_stores]

        # ── Filtres ──────────────────────────────────────────────────────────
        if q:
            q_lower = q.lower()
            results = [s for s in results if (
                q_lower in s.get('name', '').lower() or
                q_lower in s.get('city', '').lower() or
                q_lower in s.get('address', '').lower() or
                q_lower in s.get('chain_label', '').lower()
            )]

        if chains:
            results = [s for s in results if s.get('chain') in chains]

        if formats:
            results = [s for s in results if s.get('format') in formats]

        if governorate:
            gov_lower = governorate.lower()
            results = [s for s in results if gov_lower in s.get('governorate', '').lower()]

        if city:
            city_lower = city.lower()
            results = [s for s in results if city_lower in s.get('city', '').lower()]

        if services:
            results = [s for s in results if all(
                svc in s.get('services', []) for svc in services
            )]

        if has_promotions is not None:
            results = [s for s in results if s.get('has_promotions') == has_promotions]

        if is_open_now is not None:
            results = [s for s in results if s.get('is_open_now') == is_open_now]

        if lat is not None and lng is not None:
            results = [s for s in results if (s.get('distance_km') or 0) <= radius_km]

        # ── Tri ──────────────────────────────────────────────────────────────
        if sort_by == 'distance' and lat is not None:
            results.sort(key=lambda s: s.get('distance_km') or 999)
        elif sort_by == 'rating':
            results.sort(key=lambda s: s.get('rating') or 0, reverse=True)
        elif sort_by == 'surface':
            results.sort(key=lambda s: s.get('surface_m2') or 0, reverse=True)
        else:
            results.sort(key=lambda s: s.get('name', ''))

        # ── Pagination ────────────────────────────────────────────────────────
        total   = len(results)
        start   = (page - 1) * limit
        page_r  = results[start:start + limit]

        # ── Filtres disponibles (pour le frontend) ────────────────────────────
        all_govs    = sorted({s.get('governorate', '') for s in results if s.get('governorate')})
        all_chains  = sorted({s.get('chain', '') for s in results if s.get('chain')})
        all_formats = sorted({s.get('format', '') for s in results if s.get('format')})

        return {
            'total': total,
            'page': page,
            'limit': limit,
            'results': page_r,
            'filters': {
                'governorates_available': all_govs,
                'chains_available': all_chains,
                'formats_available': all_formats,
            },
        }

    def nearby(
        self,
        lat: float,
        lng: float,
        radius_km: float = 5.0,
        chains: Optional[List[str]] = None,
        limit: int = 10,
    ) -> List[dict]:
        res = self.search(lat=lat, lng=lng, radius_km=radius_km, chains=chains,
                          sort_by='distance', limit=limit)
        return res['results']

    def get_detail(self, store_id: str) -> Optional[dict]:
        chains_map = get_chains_map()
        promos     = get_promotions()
        for s in get_all_stores():
            if s.get('id') == store_id:
                return enrich_store(s, chains_map, promos)
        return None
