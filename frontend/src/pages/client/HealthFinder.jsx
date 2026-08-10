import React, { useState, useEffect, useCallback, useRef } from 'react';
import HealthMap, { TYPE_CONFIG } from '../../components/HealthMap';
import HealthCard from '../../components/HealthCard';
import HealthDetailDrawer from '../../components/HealthDetailDrawer';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const GOVERNORATES = [
  'Tunis','Ariana','Ben Arous','La Manouba','Nabeul','Zaghouan',
  'Bizerte','Béja','Jendouba','Le Kef','Siliana','Kairouan',
  'Sousse','Monastir','Mahdia','Sfax','Gabès','Médenine',
  'Tataouine','Gafsa','Tozeur','Kasserine','Sidi Bouzid','Kébili',
];

const QUICK_FILTERS = [
  { key: 'emergency', label: '🚨 Urgences 24h',   field: 'emergency', value: true },
  { key: 'cnam',      label: '✅ CNAM',            field: 'cnam',      value: true },
  { key: 'chu',       label: '🎓 CHU',             field: 'type',      value: 'chu' },
  { key: 'clinique',  label: '🏥 Cliniques',        field: 'type',      value: 'clinique' },
  { key: 'csb',       label: '🩺 CSB',             field: 'type',      value: 'centre_sante' },
  { key: 'pharmacie', label: '💊 Pharmacies',       field: 'type',      value: 'pharmacie' },
  { key: 'labo',      label: '🧪 Laboratoires',     field: 'type',      value: 'laboratoire' },
  { key: 'dialyse',   label: '🩸 Dialyse',          field: 'type',      value: 'centre_dialyse' },
];

const RADIUS_OPTIONS = [1, 3, 5, 10, 20, 50];

const URGENCY_NUMBERS = [
  { number: '190', label: 'SAMU',             color: '#D32F2F', emoji: '🚑' },
  { number: '198', label: 'Protect. Civile',  color: '#F57C00', emoji: '🚒' },
  { number: '193', label: 'Police',           color: '#1565C0', emoji: '👮' },
  { number: '197', label: 'Garde Nationale',  color: '#2E7D32', emoji: '⚔️' },
];

async function fetchEstablishments(params) {
  const url = new URL(`${API_BASE}/health-finder/search`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

const HealthFinder = () => {
  const navigate = useNavigate();

  // Search state
  const [query, setQuery] = useState('');
  const [activeQuickFilters, setActiveQuickFilters] = useState({});
  const [governorate, setGovernorate] = useState('');
  const [specialty, setSpecialty] = useState('');

  // Results
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableSpecialties, setAvailableSpecialties] = useState([]);

  // Map / UI
  const [selectedEstablishment, setSelectedEstablishment] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Geolocation
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [geoLoading, setGeoLoading] = useState(false);

  const listRef = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const doSearch = useCallback(async (pg = 1, emergency = false, overrideFilters = null) => {
    setLoading(true);
    setApiError(null);
    try {
      const params = {
        q: query || undefined,
        governorate: governorate || undefined,
        specialty: specialty || undefined,
        page: pg,
        limit: 20,
      };

      // Quick filters
      const qf = emergency ? { emergency: { field: 'emergency', value: true } } : (overrideFilters || activeQuickFilters);
      Object.values(qf).forEach(f => {
        if (f.field === 'type')      params.type      = f.value;
        if (f.field === 'cnam')      params.cnam      = f.value;
        if (f.field === 'emergency') params.emergency = f.value;
      });

      // Geo
      if (userLocation) {
        params.lat    = userLocation.lat;
        params.lng    = userLocation.lng;
        params.radius = searchRadius;
      }

      const data = await fetchEstablishments(params);
      setResults(data.results || []);
      setTotal(data.total || 0);
      setTotalPages(data.pages || 1);
      setPage(pg);
      if (data.filters?.specialties_available) {
        setAvailableSpecialties(data.filters.specialties_available);
      }
    } catch (e) {
      console.error(e);
      setApiError('Impossible de joindre le backend. Vérifiez que le port-forward est actif : kubectl port-forward svc/backend-v2 8000:8002 -n default');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, governorate, specialty, activeQuickFilters, userLocation, searchRadius]);

  // ── Auto-search on filter/geo change ─────────────────────────────────────
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      doSearch(1);
      return;
    }
    doSearch(1);
  }, [activeQuickFilters, userLocation, searchRadius]);

  const handleSearch = () => { doSearch(1); if (listRef.current) listRef.current.scrollTop = 0; };

  const handleKeyDown = (ev) => { if (ev.key === 'Enter') handleSearch(); };

  const toggleQuickFilter = (f) => {
    setActiveQuickFilters(prev => {
      const next = { ...prev };
      if (next[f.key]) {
        delete next[f.key];
      } else {
        next[f.key] = { field: f.field, value: f.value };
      }
      return next;  // useEffect above will trigger doSearch automatically
    });
  };

  const handleEmergency = () => {
    setEmergencyMode(true);
    setActiveQuickFilters({});
    doSearch(1, true);
  };

  const exitEmergency = () => {
    setEmergencyMode(false);
    doSearch(1, false);
  };

  // ── Geolocation ────────────────────────────────────────────────────────────
  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
      },
      () => { setGeoLoading(false); alert("Impossible d'obtenir votre position."); }
    );
  };

  useEffect(() => { if (userLocation) doSearch(1); }, [userLocation, searchRadius]);

  // ── Select establishment ────────────────────────────────────────────────────
  const handleSelect = (e) => {
    setSelectedEstablishment(e);
    setDrawerOpen(true);
  };

  const handleNavigate = (e) => {
    navigate(`/client/trip-simulator?to_lat=${e.lat}&to_lng=${e.lng}&to_name=${encodeURIComponent(e.name)}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: 'var(--bg-color)', overflow: 'hidden' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#D32F2F,#7B1FA2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 12px rgba(211,47,47,0.3)', flexShrink: 0 }}>
            🏥
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>Santé — Établissements de Soins</h1>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
              {total > 0 ? `${total} établissements trouvés` : 'Hôpitaux · Cliniques · CSB · Pharmacies · Laboratoires'}
              {userLocation && ' · 📍 Position activée'}
            </p>
          </div>
          {/* Emergency numbers strip */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px' }}>
            {URGENCY_NUMBERS.map(u => (
              <a key={u.number} href={`tel:${u.number}`}
                title={u.label}
                style={{ padding: '5px 9px', borderRadius: '8px', background: `${u.color}18`, border: `1px solid ${u.color}33`, color: u.color, fontSize: '12px', fontWeight: '800', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {u.emoji} {u.number}
              </a>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Rechercher par nom, spécialité, ville…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                border: '1px solid var(--border-color)', background: 'var(--surface-2)',
                color: 'var(--text-main)', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <select
            value={governorate}
            onChange={e => setGovernorate(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)', fontSize: '13px', minWidth: '160px' }}>
            <option value="">Tous les gouvernorats</option>
            {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <button
            onClick={handleGeolocate}
            disabled={geoLoading}
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.3)', background: userLocation ? 'rgba(59,130,246,0.15)' : 'var(--surface-2)', color: userLocation ? '#3B82F6' : 'var(--text-muted)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {geoLoading ? '⌛' : '📍'} {userLocation ? 'Localisé' : 'Ma position'}
          </button>

          {userLocation && (
            <select
              value={searchRadius}
              onChange={e => setSearchRadius(Number(e.target.value))}
              style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.08)', color: '#3B82F6', fontSize: '13px', fontWeight: '700' }}>
              {RADIUS_OPTIONS.map(r => <option key={r} value={r}>{r} km</option>)}
            </select>
          )}

          <button
            onClick={handleSearch}
            style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#D32F2F,#7B1FA2)', color: '#FFF', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(211,47,47,0.3)', whiteSpace: 'nowrap' }}>
            Rechercher
          </button>
        </div>

        {/* Quick filters */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {emergencyMode ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#D32F2F', color: '#FFF', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '700' }}>
                🚨 Mode Urgence actif
              </span>
              <button onClick={exitEmergency} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}>
                Annuler
              </button>
            </div>
          ) : (
            QUICK_FILTERS.map(f => {
              const active = !!activeQuickFilters[f.key];
              return (
                <button
                  key={f.key}
                  onClick={() => { toggleQuickFilter(f); }}
                  style={{
                    padding: '5px 11px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                    background: active ? 'linear-gradient(135deg,#D32F2F,#7B1FA2)' : 'var(--surface-2)',
                    color: active ? '#FFF' : 'var(--text-muted)',
                    fontSize: '11px', fontWeight: '700', transition: 'all 0.2s',
                  }}>
                  {f.label}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Main split: List + Map ───────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '380px 1fr', minHeight: 0, overflow: 'hidden' }}>

        {/* Left — Results list */}
        <div ref={listRef} style={{ overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', borderRight: '1px solid var(--border-color)' }}>

          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: '140px', borderRadius: '14px', background: 'var(--surface-2)', animation: 'pulse 1.5s ease infinite', animationDelay: `${i * 0.1}s` }} />
            ))
          ) : apiError ? (
            <div style={{ padding: '20px 16px', borderRadius: '14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <div style={{ fontWeight: '700', color: '#EF4444', fontSize: '13px', marginBottom: '8px' }}>❌ Erreur API</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{apiError}</div>
              <button onClick={() => doSearch(1)} style={{ marginTop: '10px', padding: '7px 14px', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#FFF', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>🔄 Réessayer</button>
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>Aucun résultat</div>
              <div style={{ fontSize: '12px' }}>Modifiez vos critères ou élargissez le rayon de recherche.</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', padding: '0 4px' }}>
                {total} établissement{total > 1 ? 's' : ''} · Page {page}/{totalPages}
              </div>

              {results.map(e => (
                <HealthCard
                  key={e.id}
                  establishment={e}
                  isSelected={selectedEstablishment?.id === e.id}
                  onClick={() => handleSelect(e)}
                  onNavigate={handleNavigate}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', padding: '8px 0' }}>
                  {page > 1 && (
                    <button onClick={() => doSearch(page - 1)}
                      style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                      ← Précédent
                    </button>
                  )}
                  {page < totalPages && (
                    <button onClick={() => doSearch(page + 1)}
                      style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#D32F2F,#7B1FA2)', color: '#FFF', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                      Suivant →
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right — Map */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <HealthMap
            establishments={results}
            selectedId={selectedEstablishment?.id}
            onSelect={handleSelect}
            userLocation={userLocation}
            searchRadius={userLocation ? searchRadius : 0}
          />
        </div>
      </div>

      {/* ── Floating Emergency Button ─────────────────────────────────── */}
      {!emergencyMode && (
        <button
          onClick={handleEmergency}
          style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 1500,
            padding: '14px 20px', borderRadius: '50px', border: 'none',
            background: 'linear-gradient(135deg,#D32F2F,#B71C1C)',
            color: '#FFF', fontSize: '14px', fontWeight: '800', cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(211,47,47,0.5)',
            display: 'flex', alignItems: 'center', gap: '8px',
            animation: 'emergencyPulse 2s ease infinite',
          }}>
          🚨 URGENCE
        </button>
      )}

      {/* ── Detail Drawer ─────────────────────────────────────────────── */}
      {drawerOpen && selectedEstablishment && (
        <HealthDetailDrawer
          establishment={selectedEstablishment}
          onClose={() => setDrawerOpen(false)}
          onNavigate={handleNavigate}
        />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes emergencyPulse { 0%,100%{box-shadow:0 6px 24px rgba(211,47,47,0.5)} 50%{box-shadow:0 6px 32px rgba(211,47,47,0.85)} }
      `}</style>
    </div>
  );
};

export default HealthFinder;
