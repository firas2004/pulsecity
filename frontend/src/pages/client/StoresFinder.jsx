import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

const API = '/api/stores-finder';

// ── Couleurs & icônes par enseigne ────────────────────────────────────────────
const CHAIN_META = {
  carrefour: { color: '#E3000F', emoji: '🛒', bg: '#FFF0F0' },
  monoprix:  { color: '#C41E3A', emoji: '🛍️', bg: '#FFF0F2' },
  geant:     { color: '#0055A4', emoji: '🏪', bg: '#F0F4FF' },
  mg:        { color: '#00A651', emoji: '🏬', bg: '#F0FFF6' },
  aziza:     { color: '#F7941D', emoji: '🏷️', bg: '#FFF8F0' },
  batam:     { color: '#334155', emoji: '📺', bg: '#F4F6F8' },
};
const FORMAT_LABELS = {
  'hypermarché':    '🏪 Hypermarché',
  'supermarché':    '🛒 Supermarché',
  'superette':      '🏠 Superette',
  'hard_discount':  '🏷️ Hard-discount',
  'magasin_spécialisé': '🔧 Spécialisé',
};
const GOVS = [
  'Tunis','Ariana','Ben Arous','Manouba','Nabeul','Zaghouan','Bizerte',
  'Béja','Jendouba','Kef','Siliana','Kairouan','Kasserine','Sidi Bouzid',
  'Sousse','Monastir','Mahdia','Sfax','Gafsa','Tozeur','Kébili',
  'Gabès','Médenine','Tataouine',
];

// ── Marqueur Leaflet custom ───────────────────────────────────────────────────
function makeIcon(chain, format) {
  const m = CHAIN_META[chain] || { color: '#888', emoji: '🏪' };
  const size = format === 'hypermarché' ? 42 : format === 'hard_discount' ? 28 : 34;
  const svg = `
    <div style="width:${size}px;height:${size}px;border-radius:50%;
         background:${m.color};display:flex;align-items:center;
         justify-content:center;font-size:${size * 0.5}px;
         box-shadow:0 2px 8px ${m.color}66;border:3px solid white;">
      ${m.emoji}
    </div>`;
  return L.divIcon({
    html: svg, className: '', iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ── Recentrer la carte ────────────────────────────────────────────────────────
function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 1 });
  }, [center, map]);
  return null;
}

// ── Badge horaire ─────────────────────────────────────────────────────────────
function OpenBadge({ isOpen, closesIn }) {
  if (isOpen) {
    const h = closesIn ? Math.floor(closesIn / 60) : null;
    const m = closesIn ? closesIn % 60 : null;
    return (
      <span style={{ background: '#D1FAE5', color: '#065F46', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
        🟢 Ouvert {closesIn ? `· Ferme dans ${h > 0 ? `${h}h` : ''}${m}min` : ''}
      </span>
    );
  }
  return (
    <span style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
      🔴 Fermé
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STORE CARD
// ══════════════════════════════════════════════════════════════════════════════
function StoreCard({ store, onSelect, selected, onNavigate }) {
  const m = CHAIN_META[store.chain] || { color: '#888', emoji: '🏪', bg: 'var(--surface-2)' };
  return (
    <div
      onClick={() => onSelect(store)}
      style={{
        background: selected ? `${m.color}12` : 'var(--card-bg)',
        border: `1.5px solid ${selected ? m.color : 'var(--border-color)'}`,
        borderRadius: 16, padding: '14px 16px', marginBottom: 10,
        cursor: 'pointer', transition: 'all 0.2s',
        transform: selected ? 'translateX(4px)' : 'none',
        boxShadow: selected ? `0 0 0 2px ${m.color}44` : 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, background: m.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0, boxShadow: `0 2px 8px ${m.color}44`,
        }}>{m.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {store.name}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 3 }}>
            <span style={{ fontSize: 10, background: `${m.color}22`, color: m.color, borderRadius: 10, padding: '1px 8px', fontWeight: 700 }}>
              {FORMAT_LABELS[store.format] || store.format}
            </span>
            {store.surface_m2 && store.surface_m2 >= 5000 && (
              <span style={{ fontSize: 10, background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 10, padding: '1px 8px' }}>
                {store.surface_m2.toLocaleString()} m²
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Adresse + distance */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
        <span>📍</span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.city}, {store.governorate}</span>
        {store.distance_km != null && (
          <span style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '1px 8px', fontWeight: 700, color: 'var(--text-soft)', flexShrink: 0, fontSize: 10 }}>
            {store.distance_km < 1 ? `${Math.round(store.distance_km * 1000)}m` : `${store.distance_km}km`}
          </span>
        )}
      </div>

      {/* Horaires */}
      <div style={{ marginBottom: 8 }}>
        <OpenBadge isOpen={store.is_open_now} closesIn={store.closes_in_min} />
      </div>

      {/* Services */}
      {store.services?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {store.services.slice(0, 4).map(s => (
            <span key={s} style={{ fontSize: 9, background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 8, padding: '2px 7px' }}>
              {s}
            </span>
          ))}
          {store.services.length > 4 && (
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>+{store.services.length - 4}</span>
          )}
        </div>
      )}

      {/* Promotions */}
      {store.has_promotions && (
        <div style={{ fontSize: 10, background: '#FEF3C7', color: '#92400E', borderRadius: 8, padding: '3px 10px', marginBottom: 8, fontWeight: 700 }}>
          🏷️ Promotion en cours !
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        {store.phone && (
          <a href={`tel:${store.phone}`} onClick={e => e.stopPropagation()} style={{
            flex: 1, padding: '6px', textAlign: 'center', borderRadius: 8,
            background: 'var(--surface-2)', color: 'var(--text-soft)',
            textDecoration: 'none', fontSize: 11, fontWeight: 600,
          }}>📞 Appeler</a>
        )}
        <button onClick={e => { e.stopPropagation(); onNavigate(store); }} style={{
          flex: 1, padding: '6px', border: 'none', borderRadius: 8, cursor: 'pointer',
          background: m.color, color: 'white', fontSize: 11, fontWeight: 700,
        }}>🗺️ Itinéraire</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STORE DETAIL DRAWER
// ══════════════════════════════════════════════════════════════════════════════
function StoreDetailDrawer({ store, onClose, onNavigate }) {
  if (!store) return null;
  const m = CHAIN_META[store.chain] || { color: '#888', emoji: '🏪' };
  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const dayLabels = { monday:'Lun', tuesday:'Mar', wednesday:'Mer', thursday:'Jeu', friday:'Ven', saturday:'Sam', sunday:'Dim' };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, zIndex: 2000,
      background: 'var(--surface)', borderLeft: '1px solid var(--border-color)',
      boxShadow: '-8px 0 32px rgba(0,0,0,0.3)', overflowY: 'auto',
      display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)',
    }}>
      {/* Header */}
      <div style={{ background: m.color, padding: '20px 20px 16px', flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', marginBottom: 12 }}>✕ Fermer</button>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: 36 }}>{m.emoji}</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>{store.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{FORMAT_LABELS[store.format] || store.format}</div>
            <div style={{ marginTop: 6 }}>
              <OpenBadge isOpen={store.is_open_now} closesIn={store.closes_in_min} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 20, flex: 1 }}>
        {/* Infos */}
        <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 700 }}>📍 COORDONNÉES</div>
          <div style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 4 }}>{store.address}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{store.city}, {store.governorate}</div>
          {store.phone && <div style={{ fontSize: 12, color: 'var(--primary)' }}>📞 {store.phone}</div>}
          {store.website && <a href={store.website} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--primary)', display: 'block', marginTop: 2 }}>🌐 Site web</a>}
          {store.surface_m2 && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>📐 {store.surface_m2.toLocaleString()} m²</div>}
        </div>

        {/* Horaires */}
        <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700 }}>🕐 HORAIRES</div>
          {days.map(d => {
            const slot = store.opening_hours?.[d] || '—';
            const isClosed = slot === 'Fermé' || slot === '—';
            return (
              <div key={d} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-color)', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)', width: 35 }}>{dayLabels[d]}</span>
                <span style={{ color: isClosed ? 'var(--danger)' : 'var(--text-main)', fontWeight: isClosed ? 600 : 400 }}>{slot}</span>
              </div>
            );
          })}
        </div>

        {/* Services */}
        {store.services?.length > 0 && (
          <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700 }}>🛎️ SERVICES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {store.services.map(s => (
                <span key={s} style={{ fontSize: 11, background: `${m.color}18`, color: m.color, borderRadius: 10, padding: '3px 10px', fontWeight: 600 }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {store.features && (
          <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700 }}>✅ ÉQUIPEMENTS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {Object.entries(store.features).map(([k, v]) => {
                const labels = { parking: '🅿️ Parking', parking_gratuit: '🅿️ Parking gratuit', wifi: '📶 WiFi', air_conditioning: '❄️ Clim', accessibilite_pmr: '♿ PMR', rayon_bio: '🌱 Bio', rayon_halal: '☪️ Halal', livraison: '🚚 Livraison', drive: '🚗 Drive', prix_bas: '💰 Prix bas', produits_locaux: '🇹🇳 Local' };
                if (!labels[k]) return null;
                return (
                  <div key={k} style={{ fontSize: 11, color: v ? 'var(--text-main)' : 'var(--text-muted)', opacity: v ? 1 : 0.4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {v ? '✅' : '❌'} {labels[k]}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Promotions */}
        {store.active_promotions?.length > 0 && (
          <div style={{ background: '#FEF3C7', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#92400E', fontWeight: 700, marginBottom: 6 }}>🏷️ PROMOTIONS EN COURS</div>
            {store.active_promotions.map(p => (
              <div key={p.id} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>{p.title}</div>
                <div style={{ fontSize: 11, color: '#78350F' }}>{p.description}</div>
                <div style={{ fontSize: 10, color: '#92400E' }}>Jusqu'au {p.end_date}</div>
              </div>
            ))}
          </div>
        )}

        {/* Action Itinéraire */}
        <button onClick={() => onNavigate(store)} style={{
          width: '100%', padding: '14px', background: m.color, color: 'white',
          border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer',
          boxShadow: `0 4px 16px ${m.color}44`, marginTop: 4,
        }}>🗺️ Calculer un itinéraire</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CHAINS VIEW
// ══════════════════════════════════════════════════════════════════════════════
function ChainsView({ chains, onSelectChain }) {
  const COMPARE = [
    { key: 'store_count', label: 'Magasins', fmt: v => v },
    { key: 'coverage', label: 'Couverture', fmt: v => v },
    { key: 'positioning', label: 'Positionnement', fmt: v => v },
    { key: 'fidelity_card', label: 'Carte fidélité', fmt: v => v || '—' },
  ];
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16, marginBottom: 28 }}>
        {chains.map(c => {
          const m = CHAIN_META[c.id] || { color: '#888', emoji: '🏪' };
          return (
            <div key={c.id} onClick={() => onSelectChain(c.id)} style={{
              background: 'var(--card-bg)', border: `1.5px solid ${m.color}30`,
              borderRadius: 18, padding: 20, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: `0 4px 20px ${m.color}18`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                  {m.emoji}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.positioning}</div>
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: m.color }}>{c.store_count.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>magasins · {c.coverage}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                {c.strengths?.slice(0, 3).map(s => (
                  <span key={s} style={{ fontSize: 10, background: `${m.color}18`, color: m.color, borderRadius: 10, padding: '2px 8px', fontWeight: 600 }}>{s}</span>
                ))}
              </div>
              {c.active_promotions?.length > 0 && (
                <div style={{ fontSize: 10, background: '#FEF3C7', color: '#92400E', borderRadius: 8, padding: '3px 10px', fontWeight: 700 }}>
                  🏷️ {c.active_promotions.length} promotion(s) active(s)
                </div>
              )}
              <button style={{
                width: '100%', padding: '9px', background: m.color, color: 'white',
                border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', marginTop: 10,
              }}>Voir les magasins →</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════════
export default function StoresFinder() {
  const navigate = useNavigate();
  const mapRef   = useRef(null);

  const [stores, setStores]   = useState([]);
  const [chains, setChains]   = useState([]);
  const [stats, setStats]     = useState(null);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const [selectedStore, setSelectedStore] = useState(null);
  const [mapCenter, setMapCenter]         = useState(null);
  const [view, setView]                   = useState('list'); // 'list' | 'chains'

  // Filtres
  const [q, setQ]                 = useState('');
  const [selChains, setSelChains] = useState([]);
  const [selFormat, setSelFormat] = useState('');
  const [selGov, setSelGov]       = useState('');
  const [openOnly, setOpenOnly]   = useState(false);
  const [promoOnly, setPromoOnly] = useState(false);
  const [sortBy, setSortBy]       = useState('name');
  const [userPos, setUserPos]     = useState(null);

  const CHAIN_IDS  = ['carrefour','monoprix','geant','mg','aziza','batam'];
  const FORMAT_IDS = ['hypermarché','supermarché','superette','hard_discount','magasin_spécialisé'];

  const fetchStores = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (selChains.length) params.set('chains', selChains.join(','));
      if (selFormat) params.set('formats', selFormat);
      if (selGov) params.set('governorate', selGov);
      if (openOnly) params.set('is_open_now', 'true');
      if (promoOnly) params.set('has_promotions', 'true');
      if (userPos) { params.set('lat', userPos.lat); params.set('lng', userPos.lng); params.set('radius', '50'); }
      params.set('sort_by', userPos && sortBy === 'name' ? 'distance' : sortBy);
      params.set('limit', '100');
      const r = await fetch(`${API}/search?${params}`);
      if (!r.ok) throw new Error(r.status);
      const d = await r.json();
      setStores(d.results || []);
      setTotal(d.total || 0);
    } catch (e) {
      setError(`Erreur chargement (${e.message})`);
    } finally { setLoading(false); }
  }, [q, selChains, selFormat, selGov, openOnly, promoOnly, sortBy, userPos]);

  const fetchChains = useCallback(async () => {
    try {
      const r = await fetch(`${API}/chains`);
      const d = await r.json();
      setChains(d.chains || []);
    } catch { }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch(`${API}/stats`);
      setStats(await r.json());
    } catch { }
  }, []);

  useEffect(() => { fetchStores(); }, [fetchStores]);
  useEffect(() => { fetchChains(); fetchStats(); }, []);

  const toggleChain = (id) => setSelChains(prev =>
    prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
  );

  const handleSelect = (store) => {
    setSelectedStore(store);
    setMapCenter([store.lat, store.lng]);
  };

  const handleNavigate = (store) => {
    navigate(`/client/trip-simulator?to=${encodeURIComponent(store.name)}&toLat=${store.lat}&toLng=${store.lng}`);
  };

  const geolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => alert('Géolocalisation refusée.')
      );
    }
  };

  const inputStyle = {
    background: 'var(--surface-2)', border: '1px solid var(--border-color)',
    color: 'var(--text-main)', borderRadius: 10, padding: '8px 12px', fontSize: 13,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-color)', fontFamily: 'var(--font-body)', overflow: 'hidden' }}>

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#1A237E 0%,#283593 100%)', padding: '16px 24px', flexShrink: 0, boxShadow: '0 4px 24px rgba(26,35,126,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.12)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '1px solid rgba(255,255,255,0.2)' }}>🛒</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: 'white', fontSize: 20, fontWeight: 900, margin: 0 }}>Magasins & Grandes Surfaces</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: 12 }}>
              Carrefour · Monoprix · Géant · MG · Aziza · BATAM
              {stats && ` · ${stats.total_stores} magasins · ${stats.active_promotions} promos actives`}
            </p>
          </div>
          {/* Onglets */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 4, gap: 4 }}>
            {[['list','🗂️ Liste'], ['chains','🏪 Enseignes']].map(([k, l]) => (
              <button key={k} onClick={() => setView(k)} style={{
                padding: '6px 16px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                background: view === k ? 'white' : 'transparent',
                color: view === k ? '#1A237E' : 'rgba(255,255,255,0.8)',
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Recherche + filtres */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 Rechercher un magasin..." style={{ ...inputStyle, minWidth: 220, flex: 1 }} />
          <select value={selGov} onChange={e => setSelGov(e.target.value)} style={{ ...inputStyle, minWidth: 150 }}>
            <option value="">Tous les gouvernorats</option>
            {GOVS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={selFormat} onChange={e => setSelFormat(e.target.value)} style={{ ...inputStyle }}>
            <option value="">Tous les formats</option>
            {FORMAT_IDS.map(f => <option key={f} value={f}>{FORMAT_LABELS[f] || f}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inputStyle }}>
            <option value="name">Trier: A-Z</option>
            <option value="distance">Trier: Distance</option>
            <option value="rating">Trier: Note</option>
            <option value="surface">Trier: Surface</option>
          </select>
          <button onClick={geolocate} style={{ padding: '8px 14px', background: userPos ? '#10B981' : 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            📍 {userPos ? 'Localisé' : 'Autour de moi'}
          </button>
        </div>

        {/* Filtres enseignes */}
        <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {CHAIN_IDS.map(id => {
            const m = CHAIN_META[id]; const active = selChains.includes(id);
            return (
              <button key={id} onClick={() => toggleChain(id)} style={{
                padding: '4px 14px', border: `1.5px solid ${active ? m.color : 'rgba(255,255,255,0.3)'}`,
                borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 700, flexShrink: 0,
                background: active ? m.color : 'rgba(255,255,255,0.08)',
                color: active ? 'white' : 'rgba(255,255,255,0.8)',
                transition: 'all 0.2s',
              }}>{m.emoji} {id.charAt(0).toUpperCase() + id.slice(1)}</button>
            );
          })}
          <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.8)', cursor: 'pointer', flexShrink: 0, padding: '0 8px' }}>
            <input type="checkbox" checked={openOnly} onChange={e => setOpenOnly(e.target.checked)} style={{ accentColor: '#10B981' }} /> Ouvert
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.8)', cursor: 'pointer', flexShrink: 0, padding: '0 8px' }}>
            <input type="checkbox" checked={promoOnly} onChange={e => setPromoOnly(e.target.checked)} style={{ accentColor: '#F59E0B' }} /> Promos
          </label>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      {view === 'chains' ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <ChainsView chains={chains} onSelectChain={id => { toggleChain(id); setView('list'); }} />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Liste */}
          <div style={{ width: 400, minWidth: 360, overflowY: 'auto', padding: '12px 16px', borderRight: '1px solid var(--border-color)', flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span>{loading ? '⏳ Chargement…' : `${total} magasin${total !== 1 ? 's' : ''}`}</span>
              {error && <span style={{ color: 'var(--danger)' }}>⚠️ {error}</span>}
            </div>
            {stores.map(s => (
              <StoreCard key={s.id} store={s}
                selected={selectedStore?.id === s.id}
                onSelect={handleSelect}
                onNavigate={handleNavigate}
              />
            ))}
            {!loading && stores.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
                <div>Aucun magasin trouvé avec ces filtres.</div>
              </div>
            )}
          </div>

          {/* Carte */}
          <div style={{ flex: 1, position: 'relative' }}>
            <MapContainer
              center={[34.0, 9.5]} zoom={6}
              style={{ width: '100%', height: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapCenter && <FlyTo center={mapCenter} />}
              {stores.map(store => (
                <Marker
                  key={store.id}
                  position={[store.lat, store.lng]}
                  icon={makeIcon(store.chain, store.format)}
                  eventHandlers={{ click: () => handleSelect(store) }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'system-ui', minWidth: 180 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{CHAIN_META[store.chain]?.emoji} {store.name}</div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{store.city} · {store.governorate}</div>
                      <OpenBadge isOpen={store.is_open_now} closesIn={store.closes_in_min} />
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        <button onClick={() => handleSelect(store)} style={{ flex: 1, padding: '5px', background: CHAIN_META[store.chain]?.color || '#888', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Détails</button>
                        <button onClick={() => handleNavigate(store)} style={{ flex: 1, padding: '5px', background: '#1A237E', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>🗺️ Go</button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {userPos && (
                <Marker position={[userPos.lat, userPos.lng]} icon={L.divIcon({ html: '<div style="width:16px;height:16px;background:#3B82F6;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>', className: '' })}>
                  <Popup>📍 Votre position</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Drawer détail */}
      {selectedStore && (
        <StoreDetailDrawer
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
