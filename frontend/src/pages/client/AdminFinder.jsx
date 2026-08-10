import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminMap from '../../components/AdminMap';
import AdminCard from '../../components/AdminCard';
import AdminDetailDrawer from '../../components/AdminDetailDrawer';

const API = '/api/admin-finder';

const GOVERNORATES = [
  'Tunis','Ariana','Ben Arous','La Manouba','Nabeul','Zaghouan',
  'Bizerte','Béja','Jendouba','Le Kef','Siliana','Kairouan',
  'Kasserine','Sidi Bouzid','Sousse','Monastir','Mahdia','Sfax',
  'Gabès','Médenine','Tataouine','Gafsa','Tozeur','Kébili',
];

const QUICK_FILTERS = [
  { key: 'all',          label: 'Tout',           emoji: '🗺️',  color: '#374151' },
  { key: 'municipalite', label: 'Municipalités',  emoji: '🏛️', color: '#1565C0' },
  { key: 'delegation',   label: 'Délégations',    emoji: '🏢', color: '#1976D2' },
  { key: 'gouvernorat',  label: 'Gouvernorats',   emoji: '🏰', color: '#0D47A1' },
  { key: 'poste',        label: 'Postes',          emoji: '📮', color: '#E65100' },
  { key: 'cnss',         label: 'CNSS',           emoji: '🛡️', color: '#388E3C' },
  { key: 'cnam',         label: 'CNAM',           emoji: '💳', color: '#2E7D32' },
  { key: 'police',       label: 'Police',          emoji: '👮', color: '#C62828' },
  { key: 'tribunal',     label: 'Tribunaux',       emoji: '⚖️', color: '#455A64' },
  { key: 'ministere',    label: 'Ministères',      emoji: '🏛️', color: '#6A1B9A' },
];

const PROC_CATEGORIES = [
  { id: 'etat_civil', label: "État Civil",          emoji: '📋', color: '#1565C0' },
  { id: 'interieur',  label: "Intérieur",            emoji: '🪪',  color: '#C62828' },
  { id: 'finances',   label: "Finances",             emoji: '💰', color: '#F57C00' },
  { id: 'social',     label: "Protection Sociale",   emoji: '🛡️', color: '#388E3C' },
  { id: 'urbanisme',  label: "Urbanisme",            emoji: '🏗️', color: '#5D4037' },
  { id: 'economie',   label: "Économie",             emoji: '🏪', color: '#6A1B9A' },
  { id: 'transport',  label: "Transport",            emoji: '🚗', color: '#0277BD' },
  { id: 'numerique',  label: "Numérique",            emoji: '💻', color: '#00838F' },
];

const EMERGENCY_NUMBERS = [
  { num: '190',      label: 'SAMU',           emoji: '🚑', color: '#C62828' },
  { num: '197',      label: 'Police',         emoji: '👮', color: '#1565C0' },
  { num: '198',      label: 'Protection Civ.', emoji: '🚒', color: '#D97706' },
  { num: '193',      label: 'Garde Nat.',      emoji: '🛡️', color: '#388E3C' },
  { num: '1828',     label: 'La Poste',        emoji: '📮', color: '#E65100' },
  { num: '80100295', label: 'CNAM',            emoji: '💳', color: '#2E7D32' },
];

function useDebounce(val, ms = 350) {
  const [debouncedVal, setDebouncedVal] = useState(val);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedVal(val), ms);
    return () => clearTimeout(timer);
  }, [val, ms]);
  return debouncedVal;
}

// ── Carte de démarche ─────────────────────────────────────────────────────────
function ProcedureCard({ proc, onFindAdmin }) {
  const [expanded, setExpanded] = useState(false);
  const cat = PROC_CATEGORIES.find(c => c.id === proc.category) || {};
  return (
    <div style={{
      background: 'white', borderRadius: 16,
      border: `1px solid ${cat.color || '#E5E7EB'}22`,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      overflow: 'hidden', marginBottom: 12,
      transition: 'box-shadow 0.2s',
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: '14px 16px', cursor: 'pointer',
          display: 'flex', alignItems: 'flex-start', gap: 12,
          background: expanded ? `${cat.color}08` : 'white',
        }}
      >
        <div style={{
          width: 44, height: 44, minWidth: 44,
          background: `${cat.color}18`, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>
          {cat.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{
              background: `${cat.color}18`, color: cat.color,
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
            }}>
              {cat.emoji} {cat.label}
            </span>
            {proc.online && (
              <span style={{
                background: '#ECFDF5', color: '#16A34A',
                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
              }}>
                💻 En ligne
              </span>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A2E', lineHeight: 1.3 }}>
            {proc.title}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3, lineHeight: 1.4 }}>
            {proc.description}
          </div>
        </div>
        <div style={{ fontSize: 16, color: '#9CA3AF', marginTop: 2, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>
          ▾
        </div>
      </div>

      {/* Détail accordion */}
      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${cat.color}18` }}>
          {/* Méta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, marginBottom: 14 }}>
            <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '8px 12px' }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>⏱️ Délai</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{proc.delay}</div>
            </div>
            <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '8px 12px' }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>💵 Coût</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{proc.cost}</div>
            </div>
          </div>

          {/* Documents (checkboxes) */}
          {proc.required_documents?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                📂 Documents à préparer
              </div>
              {proc.required_documents.map((doc, i) => (
                <DocCheckbox key={i} label={doc} />
              ))}
            </div>
          )}

          {/* Étapes */}
          {proc.steps?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                📍 Étapes
              </div>
              {proc.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 22, height: 22, minWidth: 22,
                    background: cat.color, color: 'white',
                    borderRadius: '50%', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{step}</span>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {proc.notes && (
            <div style={{
              background: '#FFFBEB', border: '1px solid #FDE68A',
              borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: 12, color: '#92400E',
            }}>
              💡 {proc.notes}
            </div>
          )}

          {/* Boutons d'action */}
          <div style={{ display: 'flex', gap: 8 }}>
            {proc.online && proc.online_url && (
              <a href={proc.online_url} target="_blank" rel="noopener noreferrer" style={{
                flex: 1, textAlign: 'center', padding: '9px',
                background: '#ECFDF5', color: '#16A34A',
                borderRadius: 10, fontSize: 12, fontWeight: 700,
                textDecoration: 'none', border: '1px solid #BBF7D0',
              }}>
                💻 Faire en ligne
              </a>
            )}
            <button
              onClick={() => onFindAdmin && onFindAdmin(proc)}
              style={{
                flex: 1, padding: '9px',
                background: cat.color, color: 'white',
                borderRadius: 10, fontSize: 12, fontWeight: 700,
                border: 'none', cursor: 'pointer',
              }}
            >
              🗺️ Trouver l'administration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DocCheckbox({ label }) {
  const [checked, setChecked] = useState(false);
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 6 }}>
      <input type="checkbox" checked={checked} onChange={() => setChecked(c => !c)}
        style={{ accentColor: '#1565C0', width: 15, height: 15 }} />
      <span style={{
        fontSize: 13, color: checked ? '#9CA3AF' : '#374151',
        textDecoration: checked ? 'line-through' : 'none',
        transition: 'all 0.2s',
      }}>
        {label}
      </span>
    </label>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminFinder() {
  const navigate = useNavigate();

  // ── Modes ──
  const [mode, setMode] = useState('map'); // 'map' | 'procedures'

  // ── État carte ──
  const [query, setQuery]           = useState('');
  const [activeType, setActiveType] = useState('all');
  const [selectedGov, setSelectedGov] = useState('');
  const [results, setResults]       = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(false);
  const [apiError, setApiError]     = useState(null);
  const [page, setPage]             = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [userPos, setUserPos]       = useState(null);
  const [radius, setRadius]         = useState(50);

  // ── État procédures ──
  const [procedures, setProcedures] = useState([]);
  const [procQuery, setProcQuery]   = useState('');
  const [procCat, setProcCat]       = useState('');

  const debouncedQ   = useDebounce(query, 350);
  const debouncedPQ  = useDebounce(procQuery, 350);

  // ── Chargement procédures ─────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'procedures') return;
    const params = new URLSearchParams();
    if (debouncedPQ) params.set('q', debouncedPQ);
    if (procCat)     params.set('category', procCat);
    fetch(`${API}/procedures?${params}`)
      .then(r => r.json())
      .then(d => setProcedures(d.procedures || []))
      .catch(() => {});
  }, [mode, debouncedPQ, procCat]);

  // ── Recherche administrations ─────────────────────────────────────────────
  const doSearch = useCallback(async (pg = 1) => {
    setLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams({ page: pg, limit: 20 });
      if (debouncedQ)   params.set('q', debouncedQ);
      if (activeType !== 'all') params.set('type', activeType);
      if (selectedGov)  params.set('governorate', selectedGov);
      if (userPos)      { params.set('lat', userPos.lat); params.set('lng', userPos.lng); params.set('radius', radius); }

      const r = await fetch(`${API}/search?${params}`);
      if (!r.ok) throw new Error('API error');
      const d = await r.json();
      setResults(pg === 1 ? d.results : prev => [...prev, ...d.results]);
      setTotal(d.total || 0);
      setPage(pg);
    } catch (err) {
      setApiError('Impossible de joindre le serveur. Vérifiez que le backend tourne.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, activeType, selectedGov, userPos, radius]);

  useEffect(() => {
    if (mode === 'map') doSearch(1);
  }, [debouncedQ, activeType, selectedGov, mode]);

  // ── Géolocalisation ───────────────────────────────────────────────────────
  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setActiveType('all');
      },
      () => alert('Géolocalisation refusée ou indisponible.')
    );
  };

  // ── Navigation vers simulateur ────────────────────────────────────────────
  const handleNavigate = (e) => {
    navigate(`/client/trajet?to_lat=${e.lat}&to_lng=${e.lng}&to_name=${encodeURIComponent(e.name)}`);
  };

  // ── Depuis fiche pratique → trouver l'admin ───────────────────────────────
  const handleFindAdminForProc = (proc) => {
    setMode('map');
    const typeMap = { etat_civil: 'municipalite', interieur: 'police', social: 'cnss', justice: 'tribunal' };
    const t = typeMap[proc.category] || 'all';
    setActiveType(t);
    setTimeout(() => doSearch(1), 100);
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const S = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F2027 100%)',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      display: 'flex', flexDirection: 'column',
    },
    header: {
      background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
      padding: '28px 32px 0',
      boxShadow: '0 4px 20px rgba(21,101,192,0.4)',
    },
    content: { flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  };

  const visibleTypes = activeType === 'all' ? null : new Set([activeType]);

  return (
    <div style={S.page}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={S.header}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Titre */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 52, height: 52, background: 'rgba(255,255,255,0.2)',
              borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}>
              🏛️
            </div>
            <div>
              <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800, margin: 0 }}>
                Administrations & Guichet Unique
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: 13 }}>
                {total > 0 ? `${total} établissements trouvés` : 'Trouvez toutes les administrations tunisiennes'}
              </p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 4 }}>
                {[
                  { key: 'map',        label: '🗺️ Carte',    },
                  { key: 'procedures', label: '📋 Démarches', },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setMode(tab.key)} style={{
                    padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 700,
                    background: mode === tab.key ? 'white' : 'transparent',
                    color: mode === tab.key ? '#1565C0' : 'rgba(255,255,255,0.8)',
                    transition: 'all 0.2s',
                  }}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recherche + Filtres (visible en mode carte) */}
          {mode === 'map' && (
            <>
              {/* Barre de recherche */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center',
                  background: 'rgba(255,255,255,0.12)', borderRadius: 14,
                  padding: '0 16px', border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, marginRight: 10 }}>🔍</span>
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Rechercher une administration, un service..."
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      color: 'white', fontSize: 14, padding: '13px 0',
                    }}
                  />
                  {query && (
                    <button onClick={() => setQuery('')} style={{
                      background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                      cursor: 'pointer', fontSize: 16,
                    }}>✕</button>
                  )}
                </div>

                <select
                  value={selectedGov}
                  onChange={e => setSelectedGov(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 14, color: 'white', padding: '0 16px',
                    fontSize: 13, cursor: 'pointer', minWidth: 160, outline: 'none',
                  }}
                >
                  <option value="" style={{ color: '#333' }}>📍 Tous gouvernorats</option>
                  {GOVERNORATES.map(g => (
                    <option key={g} value={g} style={{ color: '#333' }}>{g}</option>
                  ))}
                </select>

                <button onClick={handleGeolocate} style={{
                  background: userPos ? '#16A34A' : 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 14, color: 'white', padding: '0 20px',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                  {userPos ? '📍 Localisé' : '📍 Ma position'}
                </button>
              </div>

              {/* Filtres rapides */}
              <div style={{
                display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12,
                scrollbarWidth: 'none',
              }}>
                {QUICK_FILTERS.map(f => (
                  <button key={f.key} onClick={() => setActiveType(f.key)} style={{
                    padding: '7px 14px', borderRadius: 20, border: 'none',
                    cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 12, fontWeight: 700,
                    transition: 'all 0.2s',
                    background: activeType === f.key ? 'white' : 'rgba(255,255,255,0.12)',
                    color: activeType === f.key ? f.color : 'rgba(255,255,255,0.8)',
                    boxShadow: activeType === f.key ? `0 2px 12px ${f.color}40` : 'none',
                  }}>
                    {f.emoji} {f.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Filtres procédures */}
          {mode === 'procedures' && (
            <div style={{ paddingBottom: 14 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center',
                  background: 'rgba(255,255,255,0.12)', borderRadius: 14,
                  padding: '0 16px', border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', marginRight: 10 }}>🔍</span>
                  <input
                    value={procQuery}
                    onChange={e => setProcQuery(e.target.value)}
                    placeholder="Ex: renouveler ma CIN, créer une entreprise..."
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      color: 'white', fontSize: 14, padding: '13px 0',
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
                <button onClick={() => setProcCat('')} style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: !procCat ? 'white' : 'rgba(255,255,255,0.12)',
                  color: !procCat ? '#1565C0' : 'rgba(255,255,255,0.8)',
                  fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                }}>
                  🗂️ Toutes
                </button>
                {PROC_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setProcCat(cat.id === procCat ? '' : cat.id)} style={{
                    padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    background: procCat === cat.id ? 'white' : 'rgba(255,255,255,0.12)',
                    color: procCat === cat.id ? cat.color : 'rgba(255,255,255,0.8)',
                    fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                  }}>
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Corps principal ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '20px 24px', maxWidth: 1400, width: '100%', margin: '0 auto', alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* ── MODE CARTE ── */}
        {mode === 'map' && (
          <div style={{ display: 'flex', gap: 18, flex: 1, minHeight: 0 }}>

            {/* Liste */}
            <div style={{
              width: 380, minWidth: 320, maxWidth: 420, flexShrink: 0,
              display: 'flex', flexDirection: 'column', gap: 0,
            }}>
              {/* Erreur */}
              {apiError && (
                <div style={{
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  borderRadius: 14, padding: '12px 16px', marginBottom: 12, fontSize: 13, color: '#991B1B',
                }}>
                  ⚠️ {apiError}
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', padding: 32, fontSize: 14 }}>
                  ⏳ Chargement...
                </div>
              )}

              {/* Résultats */}
              {!loading && !apiError && results.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🏛️</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                    Aucun résultat. Essayez un autre filtre.
                  </div>
                </div>
              )}

              <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
                {results.map(e => (
                  <AdminCard
                    key={e.id}
                    establishment={e}
                    isSelected={selectedItem?.id === e.id}
                    onClick={() => { setSelectedItem(e); setShowDrawer(true); }}
                    onNavigate={handleNavigate}
                  />
                ))}

                {/* Load more */}
                {results.length < total && !loading && (
                  <button onClick={() => doSearch(page + 1)} style={{
                    width: '100%', padding: '12px', marginTop: 8,
                    background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>
                    Voir plus ({total - results.length} restants)
                  </button>
                )}
              </div>
            </div>

            {/* Carte */}
            <div style={{ flex: 1, borderRadius: 20, overflow: 'hidden', minHeight: 500, position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
              <AdminMap
                establishments={results}
                selectedId={selectedItem?.id}
                onSelect={e => { setSelectedItem(e); setShowDrawer(true); }}
                onNavigate={handleNavigate}
                visibleTypes={visibleTypes}
              />
            </div>
          </div>
        )}

        {/* ── MODE PROCÉDURES ── */}
        {mode === 'procedures' && (
          <div style={{ maxWidth: 820, margin: '0 auto', width: '100%', paddingTop: 4 }}>
            {procedures.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.6)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 15 }}>Aucune démarche trouvée.</div>
              </div>
            ) : (
              procedures.map(proc => (
                <ProcedureCard
                  key={proc.id}
                  proc={proc}
                  onFindAdmin={handleFindAdminForProc}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Numéros utiles (footer permanent) ────────────────────────────────── */}
      <div style={{
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '12px 24px',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>
            Urgences :
          </span>
          {EMERGENCY_NUMBERS.map(({ num, label, emoji, color }) => (
            <a key={num} href={`tel:${num}`} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: `${color}22`, border: `1px solid ${color}44`,
              borderRadius: 20, padding: '4px 12px',
              textDecoration: 'none', color: 'white', fontSize: 12, fontWeight: 600,
              transition: 'all 0.2s',
            }}>
              <span>{emoji}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{label}</span>
              <strong style={{ color, fontSize: 13 }}>{num}</strong>
            </a>
          ))}
        </div>
      </div>

      {/* ── Drawer détail ──────────────────────────────────────────────────── */}
      {showDrawer && selectedItem && (
        <>
          <div onClick={() => setShowDrawer(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 999, backdropFilter: 'blur(2px)',
          }} />
          <AdminDetailDrawer
            establishment={selectedItem}
            onClose={() => setShowDrawer(false)}
            onNavigate={handleNavigate}
          />
        </>
      )}
    </div>
  );
}
