import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import POIMap from '../../components/POIMap';
import POICard from '../../components/POICard';
import POIDetailDrawer from '../../components/POIDetailDrawer';

const API = '/api/poi-finder';

const QUICK_CATS = [
  { id: 'all',             label: 'Tout',          emoji: '🗺️',  color: '#374151' },
  { id: 'restaurant',      label: 'Restaurants',   emoji: '🍽️', color: '#E65100' },
  { id: 'cafe',            label: 'Cafés',         emoji: '☕',  color: '#6D4C41' },
  { id: 'plage',           label: 'Plages',        emoji: '🏖️', color: '#0277BD' },
  { id: 'tourisme',        label: 'Tourisme',      emoji: '📸', color: '#6A1B9A' },
  { id: 'monument',        label: 'Monuments',     emoji: '🗿', color: '#6A1B9A' },
  { id: 'musee',           label: 'Musées',        emoji: '🏛️', color: '#5D4037' },
  { id: 'parc',            label: 'Parcs',         emoji: '🌳', color: '#2E7D32' },
  { id: 'coworking',       label: 'Coworking',     emoji: '💻', color: '#1565C0' },
  { id: 'souk',            label: 'Souks',         emoji: '🛍️', color: '#F9A825' },
  { id: 'cinema',          label: 'Cinémas',       emoji: '🎬', color: '#C62828' },
  { id: 'oasis',           label: 'Oasis',         emoji: '🌴', color: '#2E7D32' },
  { id: 'hotel',           label: 'Hôtels',        emoji: '🏨', color: '#00838F' },
  { id: 'spa',             label: 'Spas',          emoji: '🧖', color: '#00695C' },
  { id: 'patisserie',      label: 'Pâtisseries',   emoji: '🧁', color: '#C2185B' },
];

const GOVERNORATES = [
  'Tunis','Ariana','Ben Arous','La Manouba','Nabeul','Zaghouan','Bizerte','Béja',
  'Jendouba','Le Kef','Siliana','Kairouan','Kasserine','Sidi Bouzid','Sousse',
  'Monastir','Mahdia','Sfax','Gabès','Médenine','Tataouine','Gafsa','Tozeur','Kébili',
];

const RADIUS_OPTIONS = [1, 3, 5, 10, 20, 50];

function useDebounce(val, ms = 350) {
  const [d, setD] = useState(val);
  useEffect(() => { const t = setTimeout(() => setD(val), ms); return () => clearTimeout(t); }, [val, ms]);
  return d;
}

// ── Mode Découverte — itinéraires suggérés ─────────────────────────────────
const SUGGESTED_TRIPS = [
  { id: 't1', title: 'Journée à Sidi Bou Saïd', duration: '1 jour', emoji: '🏛️', color: '#6A1B9A', pois: ['poi-cafe-sidi-chabaane','poi-sidi-bou-said','poi-carthage','poi-musee-bardo'] },
  { id: 't2', title: 'Week-end à Djerba',         duration: '2 jours', emoji: '🏝️', color: '#0277BD', pois: ['poi-djerba-houmt-souk','poi-djerba-ghriba','poi-ksar-hadada'] },
  { id: 't3', title: 'Road trip du Sud',           duration: '4 jours', emoji: '🏜️', color: '#F57C00', pois: ['poi-matmata','poi-chenini-village','poi-douz-porte-desert','poi-tozeur-palmeraie','poi-chott-el-jerid'] },
  { id: 't4', title: 'Circuit UNESCO Tunisie',     duration: '3 jours', emoji: '🏅', color: '#FFD700', pois: ['poi-medina-tunis','poi-carthage','poi-kairouan-grande-mosquee','poi-el-jem','poi-sousse-medina'] },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════════
export default function POIFinder() {
  const navigate = useNavigate();

  // ── Modes ──────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState('map'); // 'map' | 'discover' | 'nearby'

  // ── État carte ──────────────────────────────────────────────────────────────
  const [query, setQuery]           = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedGov, setSelectedGov]       = useState('');
  const [results, setResults]               = useState([]);
  const [total, setTotal]                   = useState(0);
  const [loading, setLoading]               = useState(false);
  const [apiError, setApiError]             = useState(null);
  const [page, setPage]                     = useState(1);
  const [selectedPoi, setSelectedPoi]       = useState(null);
  const [showDrawer, setShowDrawer]         = useState(false);
  const [userPos, setUserPos]               = useState(null);
  const [radius, setRadius]                 = useState(50);
  const [favorites, setFavorites]           = useState(() => {
    try { return JSON.parse(localStorage.getItem('poi_favorites') || '[]'); } catch { return []; }
  });

  // ── Mode Découverte ─────────────────────────────────────────────────────────
  const [emblematic, setEmblematic]   = useState([]);
  const [embGov, setEmbGov]           = useState('');
  const [mustSee, setMustSee]         = useState([]);

  const debouncedQ = useDebounce(query, 350);

  // ── Recherche ────────────────────────────────────────────────────────────────
  const doSearch = useCallback(async (pg = 1) => {
    setLoading(true); setApiError(null);
    try {
      const params = new URLSearchParams({ page: pg, limit: 24 });
      if (debouncedQ)                     params.set('q', debouncedQ);
      if (activeCategory !== 'all')       params.set('categories', activeCategory);
      if (selectedGov)                    params.set('governorate', selectedGov);
      if (userPos && mode === 'nearby') {
        params.set('lat', userPos.lat);
        params.set('lng', userPos.lng);
        params.set('radius', radius);
      }
      const r = await fetch(`${API}/search?${params}`);
      if (!r.ok) throw new Error('API error');
      const d = await r.json();
      setResults(pg === 1 ? d.results : prev => [...prev, ...d.results]);
      setTotal(d.total || 0);
      setPage(pg);
    } catch (err) {
      setApiError('Impossible de joindre le backend. Vérifiez que le pod est démarré.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, activeCategory, selectedGov, userPos, radius, mode]);

  useEffect(() => { if (mode === 'map' || mode === 'nearby') doSearch(1); }, [debouncedQ, activeCategory, selectedGov, mode]);

  // ── Mode Découverte : POIs emblématiques ─────────────────────────────────────
  useEffect(() => {
    if (mode !== 'discover') return;
    const params = new URLSearchParams({ limit: 12 });
    if (embGov) params.set('governorate', embGov);
    fetch(`${API}/emblematic?${params}`)
      .then(r => r.json())
      .then(d => setEmblematic(d.results || []))
      .catch(() => {});
    fetch(`${API}/must-see`)
      .then(r => r.json())
      .then(d => setMustSee(d.results || []))
      .catch(() => {});
  }, [mode, embGov]);

  // ── Géolocalisation ──────────────────────────────────────────────────────────
  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setMode('nearby');
      },
      () => alert('Géolocalisation refusée ou indisponible.')
    );
  };

  // ── Favoris ──────────────────────────────────────────────────────────────────
  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('poi_favorites', JSON.stringify(next));
      return next;
    });
  };

  // ── Navigation simulateur ────────────────────────────────────────────────────
  const handleNavigate = (poi) => {
    navigate(`/client/trajet?to_lat=${poi.lat}&to_lng=${poi.lng}&to_name=${encodeURIComponent(poi.name)}`);
  };

  const S = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F2027 100%)',
      fontFamily: '"Inter","Segoe UI",sans-serif',
      display: 'flex', flexDirection: 'column',
    },
  };

  return (
    <div style={S.page}>
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #6A1B9A 0%, #4A148C 100%)',
        padding: '24px 28px 0',
        boxShadow: '0 4px 20px rgba(106,27,154,0.4)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Titre */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <div style={{
              width: 50, height: 50, background: 'rgba(255,255,255,0.2)',
              borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
            }}>
              🗺️
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: 0 }}>
                Pulse Local — Vie Locale & Découverte
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: 12 }}>
                {total > 0 ? `${total} lieux trouvés` : 'Découvrez la Tunisie autrement'}
              </p>
            </div>
            {/* Onglets */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 4, gap: 2 }}>
              {[
                { key: 'map',      label: '🗺️ Carte' },
                { key: 'nearby',   label: '📍 À proximité' },
                { key: 'discover', label: '✨ Découverte' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setMode(tab.key)} style={{
                  padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700,
                  background: mode === tab.key ? 'white' : 'transparent',
                  color: mode === tab.key ? '#6A1B9A' : 'rgba(255,255,255,0.8)',
                  transition: 'all 0.2s',
                }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Barre de recherche (modes carte & nearby) */}
          {(mode === 'map' || mode === 'nearby') && (
            <>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center',
                  background: 'rgba(255,255,255,0.12)', borderRadius: 14,
                  padding: '0 16px', border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', marginRight: 10 }}>🔍</span>
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Restaurants, cafés, musées, plages..."
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      color: 'white', fontSize: 14, padding: '13px 0',
                    }}
                  />
                  {query && <button onClick={() => setQuery('')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize: 16 }}>✕</button>}
                </div>

                <select
                  value={selectedGov}
                  onChange={e => setSelectedGov(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 14, color: 'white', padding: '0 16px', fontSize: 13, cursor: 'pointer',
                    minWidth: 160, outline: 'none',
                  }}
                >
                  <option value="" style={{ color: '#333' }}>📍 Tous gouvernorats</option>
                  {GOVERNORATES.map(g => <option key={g} value={g} style={{ color: '#333' }}>{g}</option>)}
                </select>

                <button onClick={handleGeolocate} style={{
                  background: userPos ? '#16A34A' : 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14,
                  color: 'white', padding: '0 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                  {userPos ? '📍 Localisé' : '📍 Ma position'}
                </button>
              </div>

              {/* Rayon slider (mode nearby) */}
              {mode === 'nearby' && userPos && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Rayon :</span>
                  {RADIUS_OPTIONS.map(r => (
                    <button key={r} onClick={() => { setRadius(r); doSearch(1); }} style={{
                      padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                      fontSize: 11, fontWeight: 700,
                      background: radius === r ? 'white' : 'rgba(255,255,255,0.12)',
                      color: radius === r ? '#6A1B9A' : 'rgba(255,255,255,0.7)',
                    }}>
                      {r} km
                    </button>
                  ))}
                </div>
              )}

              {/* Filtres rapides */}
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
                {QUICK_CATS.map(c => (
                  <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{
                    padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    whiteSpace: 'nowrap', fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
                    background: activeCategory === c.id ? 'white' : 'rgba(255,255,255,0.12)',
                    color: activeCategory === c.id ? c.color : 'rgba(255,255,255,0.8)',
                    boxShadow: activeCategory === c.id ? `0 2px 12px ${c.color}40` : 'none',
                  }}>
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Mode Découverte — filtre gouvernorat */}
          {mode === 'discover' && (
            <div style={{ display: 'flex', gap: 8, paddingBottom: 14, overflowX: 'auto', scrollbarWidth: 'none' }}>
              <button onClick={() => setEmbGov('')} style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: !embGov ? 'white' : 'rgba(255,255,255,0.12)',
                color: !embGov ? '#6A1B9A' : 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
              }}>
                🌍 Toute la Tunisie
              </button>
              {GOVERNORATES.map(g => (
                <button key={g} onClick={() => setEmbGov(g)} style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: embGov === g ? 'white' : 'rgba(255,255,255,0.12)',
                  color: embGov === g ? '#6A1B9A' : 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                }}>
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Corps ────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '20px 24px', maxWidth: 1400, width: '100%', margin: '0 auto', alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>

        {/* ── MODE CARTE / NEARBY ── */}
        {(mode === 'map' || mode === 'nearby') && (
          <div style={{ display: 'flex', gap: 18, flex: 1, minHeight: 0 }}>
            {/* Liste */}
            <div style={{ width: 380, minWidth: 300, maxWidth: 420, display: 'flex', flexDirection: 'column' }}>
              {apiError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14, padding: '12px 16px', marginBottom: 12, fontSize: 13, color: '#991B1B' }}>
                  ⚠️ {apiError}
                </div>
              )}
              {loading && (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', padding: 32, fontSize: 14 }}>⏳ Chargement...</div>
              )}
              {!loading && !apiError && results.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Aucun POI trouvé. Changez les filtres.</div>
                </div>
              )}
              <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
                {results.map(poi => (
                  <POICard
                    key={poi.id}
                    poi={poi}
                    isSelected={selectedPoi?.id === poi.id}
                    onClick={() => { setSelectedPoi(poi); setShowDrawer(true); }}
                    onNavigate={handleNavigate}
                    isFavorite={favorites.includes(poi.id)}
                    onFavorite={toggleFavorite}
                  />
                ))}
                {results.length < total && !loading && (
                  <button onClick={() => doSearch(page + 1)} style={{
                    width: '100%', padding: 12, marginTop: 8,
                    background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>
                    Voir plus ({total - results.length} restants)
                  </button>
                )}
              </div>
            </div>

            {/* Carte */}
            <div style={{ flex: 1, borderRadius: 20, overflow: 'hidden', minHeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
              <POIMap
                pois={results}
                selectedId={selectedPoi?.id}
                onSelect={p => { setSelectedPoi(p); setShowDrawer(true); }}
                onNavigate={handleNavigate}
                userPosition={userPos}
                radius={mode === 'nearby' ? radius : null}
                filterCategory={activeCategory !== 'all' ? activeCategory : null}
              />
            </div>
          </div>
        )}

        {/* ── MODE DÉCOUVERTE ── */}
        {mode === 'discover' && (
          <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
            {/* Itinéraires suggérés */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 800, marginBottom: 14 }}>
                ✈️ Itinéraires suggérés
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
                {SUGGESTED_TRIPS.map(trip => (
                  <div key={trip.id} style={{
                    background: `linear-gradient(135deg, ${trip.color} 0%, ${trip.color}CC 100%)`,
                    borderRadius: 18, padding: '20px 20px', color: 'white', cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: `0 4px 20px ${trip.color}40`,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${trip.color}60`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 4px 20px ${trip.color}40`; }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{trip.emoji}</div>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{trip.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>⏱️ {trip.duration} — {trip.pois.length} étapes</div>
                  </div>
                ))}
              </div>
            </div>

            {/* POIs incontournables */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
                🏆 Incontournables {embGov ? `— ${embGov}` : 'de Tunisie'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 14 }}>
                Sites UNESCO, monuments emblématiques, merveilles naturelles
              </p>
              {mustSee.length === 0 && emblematic.length === 0 && (
                <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: 40 }}>
                  ⏳ Chargement des POIs emblématiques...
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
                {(embGov ? emblematic : mustSee).map(poi => (
                  <div key={poi.id}
                    onClick={() => { setSelectedPoi(poi); setShowDrawer(true); }}
                    style={{
                      background: 'white', borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'; }}
                  >
                    <div style={{ height: 140, background: `url("${poi.photo_url}") center/cover`, position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7))' }} />
                      <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
                        <span style={{ background: '#FFD700', color: '#333', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20 }}>
                          ⭐ Must See
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#1A1A2E', marginBottom: 4 }}>{poi.name}</div>
                      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>📍 {poi.city || poi.governorate}</div>
                      {poi.rating && (
                        <div style={{ fontSize: 12, color: '#F59E0B' }}>
                          {'★'.repeat(Math.round(poi.rating))} <span style={{ color: '#6B7280' }}>{poi.rating}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                        <button onClick={e => { e.stopPropagation(); handleNavigate(poi); }} style={{
                          flex: 1, padding: '7px', fontSize: 11, fontWeight: 700,
                          background: '#6A1B9A', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer',
                        }}>
                          🗺️ Y aller
                        </button>
                        <button onClick={e => { e.stopPropagation(); toggleFavorite(poi.id); }} style={{
                          width: 34, fontSize: 14,
                          background: favorites.includes(poi.id) ? '#FEF2F2' : '#F9FAFB',
                          color: favorites.includes(poi.id) ? '#EF4444' : '#9CA3AF',
                          border: `1px solid ${favorites.includes(poi.id) ? '#FECACA' : '#E5E7EB'}`,
                          borderRadius: 10, cursor: 'pointer',
                        }}>
                          {favorites.includes(poi.id) ? '❤️' : '🤍'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Drawer détail ──────────────────────────────────────────────────────── */}
      {showDrawer && selectedPoi && (
        <>
          <div onClick={() => setShowDrawer(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 999, backdropFilter: 'blur(3px)',
          }} />
          <POIDetailDrawer
            poi={selectedPoi}
            onClose={() => setShowDrawer(false)}
            onNavigate={handleNavigate}
            isFavorite={favorites.includes(selectedPoi.id)}
            onFavorite={toggleFavorite}
          />
        </>
      )}
    </div>
  );
}
