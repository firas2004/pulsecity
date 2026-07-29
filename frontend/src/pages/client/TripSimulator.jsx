import React, { useState, useCallback } from 'react';
import TripPlannerMap, { CITIES } from '../../components/TripPlannerMap';

// ─── Tunisian transport mode metadata ────────────────────────────────────────
const MODE_META = {
  taxi:    { emoji: '🚕', color: '#F59E0B', label: 'Taxi',          gradient: 'linear-gradient(135deg,#F59E0B,#D97706)' },
  louage:  { emoji: '🚐', color: '#8B5CF6', label: 'Louage',        gradient: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' },
  bus:     { emoji: '🚌', color: '#10B981', label: 'Bus / Métro',   gradient: 'linear-gradient(135deg,#10B981,#059669)' },
  train:   { emoji: '🚂', color: '#3B82F6', label: 'Train SNCFT',  gradient: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' },
};

// ─── API call ─────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchTripData(originId, destId) {
  const url = `${API_BASE}/trip-simulator/calculate?origin_city_id=${originId}&destination_city_id=${destId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ─── Mode Card ───────────────────────────────────────────────────────────────
const ModeCard = ({ mode, data, rank, sortByCo2 }) => {
  const meta = MODE_META[mode] || { emoji: '🚗', color: '#64748B', label: mode, gradient: 'linear-gradient(135deg,#64748B,#475569)' };

  const fareDisplay = data.fare_tnd === null
    ? <span style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '13px' }}>{data.fare_note}</span>
    : (
      <span style={{ fontSize: '22px', fontWeight: '800', color: '#F1F5F9' }}>
        {typeof data.fare_tnd === 'object'
          ? `${data.fare_tnd.min?.toFixed(2)} – ${data.fare_tnd.max?.toFixed(2)} TND`
          : `${Number(data.fare_tnd).toFixed(2)} TND`
        }
      </span>
    );

  const co2Display = data.co2_kg !== null && data.co2_kg !== undefined
    ? `${Number(data.co2_kg).toFixed(3)} kg CO₂`
    : '—';

  const isEco = rank === 0 && sortByCo2;
  const isCheap = rank === 0 && !sortByCo2;

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${isCheap || isEco ? meta.color + '55' : 'var(--border-color)'}`,
      borderRadius: '16px',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: isCheap || isEco ? `0 8px 24px ${meta.color}22` : '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      flex: '1 1 220px',
      minWidth: '220px',
      maxWidth: '320px',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 32px ${meta.color}30`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isCheap || isEco ? `0 8px 24px ${meta.color}22` : '0 2px 8px rgba(0,0,0,0.08)'; }}
    >
      {/* Top accent bar */}
      <div style={{ height: '4px', background: meta.gradient }} />

      {/* Best tag */}
      {(isCheap || isEco) && (
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: meta.gradient, color: '#FFF',
          borderRadius: '20px', padding: '2px 8px',
          fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px',
        }}>
          {isEco ? '🌱 PLUS ÉCOLOGIQUE' : '💰 MOINS CHER'}
        </div>
      )}

      <div style={{ padding: '16px 18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: meta.gradient, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            flexShrink: 0,
          }}>
            {meta.emoji}
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>{meta.label}</div>
            <div style={{ fontSize: '11px', color: meta.color, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Disponible
            </div>
          </div>
        </div>

        {/* Fare */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '4px' }}>
            Tarif estimé
          </div>
          {fareDisplay}
        </div>

        {/* CO2 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(16,185,129,0.08)', borderRadius: '8px',
          padding: '8px 10px', marginBottom: '10px',
        }}>
          <span style={{ fontSize: '14px' }}>🌱</span>
          <div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '700' }}>Empreinte CO₂</div>
            <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>{co2Display}</div>
          </div>
        </div>

        {/* Formula note */}
        <div style={{
          fontSize: '11px', color: 'var(--text-muted)',
          lineHeight: '1.5',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '10px',
        }}>
          📐 {data.fare_note || 'Tarif calculé selon formule distance-basée'}
        </div>

        {data.co2_note && (
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
            {data.co2_note}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── City Select Dropdown ─────────────────────────────────────────────────────
const CitySelect = ({ label, value, onChange, exclude, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px' }}>
    <label style={{
      fontSize: '12px', fontWeight: '700', color,
      textTransform: 'uppercase', letterSpacing: '0.6px',
    }}>
      {label}
    </label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '12px 14px',
        borderRadius: '12px',
        border: `2px solid ${color}44`,
        background: 'var(--surface)',
        color: 'var(--text-main)',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        outline: 'none',
        transition: 'border-color 0.2s',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: '40px',
      }}
      onFocus={e => (e.target.style.borderColor = color)}
      onBlur={e => (e.target.style.borderColor = `${color}44`)}
    >
      <option value="">— Choisir une ville —</option>
      {CITIES.filter(c => c.id !== exclude).map(city => (
        <option key={city.id} value={city.id}>{city.name}</option>
      ))}
    </select>
  </div>
);

// ─── Main TripSimulator Page ──────────────────────────────────────────────────
const TripSimulator = () => {
  const [originId, setOriginId] = useState('tunis-centre');
  const [destinationId, setDestinationId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortByCo2, setSortByCo2] = useState(false);

  // Map click: second click selects destination, third resets
  const handleMapCitySelect = useCallback((cityId, asOrigin = false) => {
    if (asOrigin) {
      setOriginId(cityId);
    } else if (!destinationId && cityId !== originId) {
      setDestinationId(cityId);
    } else if (cityId !== originId) {
      setDestinationId(cityId);
    }
  }, [originId, destinationId]);

  const handleSwap = () => {
    setOriginId(destinationId);
    setDestinationId(originId);
    setResult(null);
    setError(null);
  };

  const handleCalculate = async () => {
    if (!originId || !destinationId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetchTripData(originId, destinationId);
      setResult(data);
    } catch (e) {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  // Sorted available modes
  const sortedModes = result
    ? Object.entries(result.modes)
        .filter(([, v]) => v.available)
        .sort((a, b) => {
          if (sortByCo2) {
            const aCo2 = a[1].co2_kg ?? Infinity;
            const bCo2 = b[1].co2_kg ?? Infinity;
            return aCo2 - bCo2;
          }
          const aFare = typeof a[1].fare_tnd === 'object' ? a[1].fare_tnd?.min : a[1].fare_tnd;
          const bFare = typeof b[1].fare_tnd === 'object' ? b[1].fare_tnd?.min : b[1].fare_tnd;
          if (aFare === null && bFare === null) return 0;
          if (aFare === null) return 1;
          if (bFare === null) return -1;
          return aFare - bFare;
        })
    : [];

  return (
    <div style={{
      padding: '24px',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg,#3B82F6,#6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', boxShadow: '0 6px 16px rgba(59,130,246,0.3)',
          }}>
            🗺️
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
              Simulateur de Trajet
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Planificateur multi-modal — 18 villes tunisiennes
            </p>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div style={{
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '10px',
          padding: '10px 14px',
          fontSize: '12px',
          color: '#D97706',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          ⚠️ <strong>Distances et tarifs estimés — à titre indicatif uniquement.</strong> Les distances sont calculées à vol d'oiseau ×1.3 (approximation route). Consultez l'opérateur pour un prix exact.
        </div>
      </div>

      {/* ── Top Panel: Selectors + Map ──────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        gap: '20px',
        marginBottom: '24px',
        alignItems: 'start',
      }}>
        {/* ── Left: Route Builder ──────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Origin */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛣️ <span>Planifier votre itinéraire</span>
            </div>

            <CitySelect
              label="🟢 Départ"
              value={originId}
              onChange={v => { setOriginId(v); setResult(null); setError(null); }}
              exclude={destinationId}
              color="#10B981"
            />

            {/* Swap button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleSwap}
                disabled={!originId || !destinationId}
                title="Inverser départ / arrivée"
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: originId && destinationId ? 'linear-gradient(135deg,#3B82F6,#6366F1)' : 'var(--surface-2)',
                  border: '1px solid var(--border-color)',
                  color: '#FFF', cursor: originId && destinationId ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', transition: 'transform 0.2s',
                }}
                onMouseEnter={e => { if (originId && destinationId) e.currentTarget.style.transform = 'rotate(180deg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'rotate(0deg)'; }}
              >
                ⇅
              </button>
            </div>

            <CitySelect
              label="🟡 Arrivée"
              value={destinationId}
              onChange={v => { setDestinationId(v); setResult(null); setError(null); }}
              exclude={originId}
              color="#F59E0B"
            />
          </div>

          {/* Calculate button */}
          <button
            onClick={handleCalculate}
            disabled={!originId || !destinationId || loading}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: originId && destinationId
                ? 'linear-gradient(135deg,#3B82F6,#6366F1)'
                : 'var(--surface-2)',
              color: originId && destinationId ? '#FFF' : 'var(--text-muted)',
              fontSize: '14px',
              fontWeight: '700',
              cursor: originId && destinationId ? 'pointer' : 'not-allowed',
              boxShadow: originId && destinationId ? '0 6px 16px rgba(59,130,246,0.3)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Calcul en cours…
              </>
            ) : (
              <>🧮 Calculer les modes de transport</>
            )}
          </button>

          {/* Route summary card */}
          {result && (
            <div style={{
              background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(99,102,241,0.1))',
              border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: '14px',
              padding: '16px',
            }}>
              <div style={{ fontSize: '12px', color: '#93C5FD', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                📊 Résumé du trajet
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-main)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Départ</span>
                  <span style={{ fontWeight: '600' }}>🟢 {result.origin?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Arrivée</span>
                  <span style={{ fontWeight: '600' }}>🟡 {result.destination?.name}</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Distance estimée</span>
                  <span style={{ fontWeight: '700', color: '#60A5FA' }}>~{result.distance_km?.toFixed(0)} km</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Modes disponibles</span>
                  <span style={{ fontWeight: '700', color: '#34D399' }}>{sortedModes.length} modes</span>
                </div>
              </div>
              <div style={{
                marginTop: '10px',
                fontSize: '10px',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                lineHeight: '1.4',
              }}>
                ⚡ {result.distance_note}
              </div>
            </div>
          )}

          {error && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#EF4444',
              fontSize: '13px',
            }}>
              ❌ {error}
            </div>
          )}
        </div>

        {/* ── Right: Map ────────────────────────────────────────── */}
        <div style={{ height: '460px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <TripPlannerMap
            originId={originId}
            destinationId={destinationId}
            distanceKm={result?.distance_km}
            onCitySelect={handleMapCitySelect}
          />
        </div>
      </div>

      {/* ── Mode Cards ───────────────────────────────────────────────── */}
      {sortedModes.length > 0 && (
        <div>
          {/* Section header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                🚀 Modes de transport disponibles
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {CITIES.find(c => c.id === originId)?.name} → {CITIES.find(c => c.id === destinationId)?.name}
              </p>
            </div>

            {/* Sort toggle */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setSortByCo2(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: !sortByCo2 ? 'linear-gradient(135deg,#F59E0B,#D97706)' : 'var(--surface-2)',
                  color: !sortByCo2 ? '#FFF' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                💰 Moins cher en premier
              </button>
              <button
                onClick={() => setSortByCo2(true)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: sortByCo2 ? 'linear-gradient(135deg,#10B981,#059669)' : 'var(--surface-2)',
                  color: sortByCo2 ? '#FFF' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🌱 Trajet le plus écologique
              </button>
            </div>
          </div>

          {/* Cards row */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            {sortedModes.map(([mode, data], idx) => (
              <ModeCard
                key={mode}
                mode={mode}
                data={data}
                rank={idx}
                sortByCo2={sortByCo2}
              />
            ))}
          </div>

          {/* Unavailable modes note */}
          {result && Object.entries(result.modes).filter(([, v]) => !v.available).length > 0 && (
            <div style={{
              marginTop: '20px',
              padding: '14px 16px',
              background: 'var(--surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}>
              <div style={{ fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
                ℹ️ Modes non disponibles pour ce trajet
              </div>
              {Object.entries(result.modes)
                .filter(([, v]) => !v.available)
                .map(([mode, data]) => {
                  const meta = MODE_META[mode] || { emoji: '❓', label: mode };
                  return (
                    <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                      <span>{meta.emoji}</span>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{meta.label}</span>
                      <span>—</span>
                      <span>{data.reason || data.fare_note || 'Non disponible sur cette ligne'}</span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────── */}
      {!result && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
            Sélectionnez votre itinéraire
          </div>
          <div style={{ fontSize: '14px', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>
            Choisissez une ville de départ et d'arrivée via les menus déroulants,
            ou cliquez directement sur les marqueurs de la carte.
          </div>
        </div>
      )}

      {/* ── Spinner keyframes via style tag ──────────────────────────── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default TripSimulator;
