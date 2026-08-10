import React, { useState, useCallback } from 'react';
import TripPlannerMap, { CITIES } from '../../components/TripPlannerMap';

// ─── Complete mode metadata ───────────────────────────────────────────────────
const MODE_META = {
  marche:         { emoji: '🚶', color: '#8D6E63', label: 'À pied',                  gradient: 'linear-gradient(135deg,#8D6E63,#6D4C41)' },
  velo:           { emoji: '🚲', color: '#66BB6A', label: 'Vélo',                    gradient: 'linear-gradient(135deg,#66BB6A,#43A047)' },
  taxi:           { emoji: '🚕', color: '#F59E0B', label: 'Taxi',                    gradient: 'linear-gradient(135deg,#F59E0B,#D97706)' },
  metro_transtu:  { emoji: '🚇', color: '#0055A4', label: 'Métro Léger (TRANSTU)',   gradient: 'linear-gradient(135deg,#0055A4,#003A80)' },
  tgm:            { emoji: '🚊', color: '#00A9E0', label: 'TGM',                     gradient: 'linear-gradient(135deg,#00A9E0,#0081C1)' },
  rfr:            { emoji: '⚡', color: '#4CAF50', label: 'RFR',                     gradient: 'linear-gradient(135deg,#4CAF50,#2E7D32)' },
  louage:         { emoji: '🚐', color: '#8B5CF6', label: 'Louage',                  gradient: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' },
  bus_metro:      { emoji: '🚌', color: '#10B981', label: 'Bus Urbain (Transtu)',    gradient: 'linear-gradient(135deg,#10B981,#059669)' },
  bus_sntri:      { emoji: '🚍', color: '#FF9800', label: 'Bus SNTRI',              gradient: 'linear-gradient(135deg,#FF9800,#E65100)' },
  train:          { emoji: '🚂', color: '#3B82F6', label: 'Train SNCFT',            gradient: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' },
  avion:          { emoji: '✈️', color: '#9C27B0', label: 'Avion intérieur',        gradient: 'linear-gradient(135deg,#9C27B0,#6A1B9A)' },
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchTripData(originId, destId) {
  const url = `${API_BASE}/trip-simulator/calculate?origin_city_id=${originId}&destination_city_id=${destId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ─── Nearby Stations Panel ────────────────────────────────────────────────────
const STATION_TYPE_META = {
  metro:   { emoji: '🚇', color: '#0055A4', label: 'Métro' },
  tgm:     { emoji: '🚊', color: '#00A9E0', label: 'TGM' },
  rfr:     { emoji: '⚡', color: '#4CAF50', label: 'RFR' },
  louage:  { emoji: '🚐', color: '#EF4444', label: 'Louage' },
  airport: { emoji: '✈️', color: '#9C27B0', label: 'Aéroport' },
  sncft:   { emoji: '🚂', color: '#795548', label: 'SNCFT' },
};

const StationCard = ({ station }) => {
  const meta = STATION_TYPE_META[station.type] || { emoji: '📍', color: '#64748B', label: station.type };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '8px 12px', borderRadius: '10px',
      background: 'var(--surface)', border: `1px solid ${meta.color}33`,
      fontSize: '12px',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px',
        background: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '15px', flexShrink: 0,
      }}>
        {meta.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '700', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {station.name}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          {meta.label} · {station.distance_km} km · 🚶 ~{station.walk_min} min
        </div>
      </div>
    </div>
  );
};

const NearbyPanel = ({ stationsNearby, originName, destName }) => {
  if (!stationsNearby) return null;
  const { origin = [], destination = [] } = stationsNearby;
  if (origin.length === 0 && destination.length === 0) return null;

  return (
    <div style={{
      marginTop: '24px',
      background: 'var(--surface)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      padding: '20px',
    }}>
      <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px' }}>
        🏛️ Infrastructures de transport à proximité
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {origin.length > 0 && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              🟢 Près de {originName}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {origin.map(s => <StationCard key={s.id || s.name} station={s} />)}
            </div>
          </div>
        )}
        {destination.length > 0 && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              🟡 Près de {destName}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {destination.map(s => <StationCard key={s.id || s.name} station={s} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Mode Card ───────────────────────────────────────────────────────────────
const ModeCard = ({ data, isCheapest, isFastest, isEco }) => {
  const meta = MODE_META[data.mode_id] || { emoji: '🚗', color: '#64748B', label: data.mode_id, gradient: 'linear-gradient(135deg,#64748B,#475569)' };
  const highlighted = isCheapest || isFastest || isEco;

  const fareDisplay = data.fare_tnd === null
    ? <span style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '13px' }}>{data.fare_note?.split('—')[0] || 'Variable'}</span>
    : <span style={{ fontSize: '21px', fontWeight: '800', color: '#F1F5F9' }}>
        {data.fare_tnd === 0 ? 'Gratuit' : `${Number(data.fare_tnd).toFixed(3)} TND`}
        {data.fare_range && <span style={{ fontSize: '12px', fontWeight: '400', color: '#94A3B8' }}> ({data.fare_range[0].toFixed(2)}–{data.fare_range[1].toFixed(2)})</span>}
      </span>;

  const durationDisplay = data.duration_min != null
    ? `${data.duration_min >= 60 ? Math.floor(data.duration_min / 60) + 'h ' : ''}${data.duration_min % 60 || (data.duration_min >= 60 ? '' : data.duration_min)}${data.duration_min < 60 ? ' min' : 'min'}`
    : null;

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: `1px solid ${highlighted ? meta.color + '66' : 'var(--border-color)'}`,
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: highlighted ? `0 8px 24px ${meta.color}22` : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        flex: '1 1 220px',
        minWidth: '210px',
        maxWidth: '300px',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 32px ${meta.color}30`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = highlighted ? `0 8px 24px ${meta.color}22` : '0 2px 8px rgba(0,0,0,0.08)'; }}
    >
      {/* Accent bar */}
      <div style={{ height: '4px', background: meta.gradient }} />

      {/* Badges */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-end' }}>
        {isCheapest && <span style={{ background: meta.gradient, color: '#FFF', borderRadius: '20px', padding: '2px 7px', fontSize: '9px', fontWeight: '700', letterSpacing: '0.5px' }}>💰 MOINS CHER</span>}
        {isFastest  && <span style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#FFF', borderRadius: '20px', padding: '2px 7px', fontSize: '9px', fontWeight: '700', letterSpacing: '0.5px' }}>⚡ PLUS RAPIDE</span>}
        {isEco      && <span style={{ background: 'linear-gradient(135deg,#10B981,#059669)', color: '#FFF', borderRadius: '20px', padding: '2px 7px', fontSize: '9px', fontWeight: '700', letterSpacing: '0.5px' }}>🌱 PLUS ÉCOLO</span>}
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: meta.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
            {meta.emoji}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>{meta.label}</div>
            <div style={{ fontSize: '10px', color: meta.color, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Disponible</div>
          </div>
        </div>

        {/* Fare */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '3px' }}>Tarif estimé</div>
          {fareDisplay}
        </div>

        {/* Duration + Wait */}
        {(durationDisplay || data.wait_time_min) && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            {durationDisplay && (
              <div style={{ background: 'rgba(59,130,246,0.1)', borderRadius: '8px', padding: '5px 9px', fontSize: '11px', fontWeight: '700', color: '#60A5FA' }}>
                ⏱️ ~{durationDisplay}
              </div>
            )}
            {data.wait_time_min > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.1)', borderRadius: '8px', padding: '5px 9px', fontSize: '11px', fontWeight: '600', color: '#F59E0B' }}>
                🕐 +{data.wait_time_min} min
              </div>
            )}
          </div>
        )}

        {/* CO2 */}
        {data.co2_kg != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', padding: '7px 9px', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px' }}>🌱</span>
            <div>
              <div style={{ fontSize: '10px', color: '#10B981', fontWeight: '700' }}>CO₂</div>
              <div style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '600' }}>
                {data.co2_kg === 0 ? '0 kg — zéro émission' : `${Number(data.co2_kg).toFixed(3)} kg`}
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        {data.warning && (
          <div style={{ background: 'rgba(239,68,68,0.08)', borderRadius: '8px', padding: '6px 9px', marginBottom: '10px', fontSize: '10px', color: '#EF4444', fontWeight: '600' }}>
            ⚠️ {data.warning}
          </div>
        )}

        {/* Formula note */}
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
          📐 {data.fare_note}
        </div>

        {/* Deep links (Taxi) */}
        {data.mode_id === 'taxi' && data.deep_links && (
          <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {Object.values(data.deep_links).map(dl => (
              <a key={dl.name} href={dl.url} target="_blank" rel="noopener noreferrer"
                style={{ padding: '4px 9px', borderRadius: '20px', background: '#1E293B', color: '#93C5FD', fontSize: '10px', fontWeight: '700', textDecoration: 'none', border: '1px solid rgba(148,197,253,0.2)' }}>
                📱 {dl.name}
              </a>
            ))}
          </div>
        )}

        {/* External links (Train, Bus SNTRI, Avion) */}
        {data.external_link && (
          <a href={data.external_link} target="_blank" rel="noopener noreferrer"
            style={{ marginTop: '8px', display: 'inline-block', padding: '4px 10px', borderRadius: '20px', background: '#1E293B', color: '#93C5FD', fontSize: '10px', fontWeight: '700', textDecoration: 'none', border: '1px solid rgba(148,197,253,0.2)' }}>
            🔗 Réserver / Horaires
          </a>
        )}
      </div>
    </div>
  );
};

// ─── City Select Dropdown ─────────────────────────────────────────────────────
const CitySelect = ({ label, value, onChange, exclude, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px' }}>
    <label style={{ fontSize: '12px', fontWeight: '700', color, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '11px 13px', borderRadius: '12px', border: `2px solid ${color}44`,
        background: 'var(--surface)', color: 'var(--text-main)', fontSize: '14px',
        fontWeight: '600', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '40px',
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
  const [sortMode, setSortMode] = useState('price'); // 'price' | 'speed' | 'eco'

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

  // Available modes as array (fix: iterate directly, not Object.entries)
  const availableModes = result
    ? (result.modes || []).filter(m => m.available)
    : [];

  // Sort available modes
  const sortedModes = [...availableModes].sort((a, b) => {
    if (sortMode === 'speed') {
      const aDur = a.duration_min ?? Infinity;
      const bDur = b.duration_min ?? Infinity;
      return aDur - bDur;
    }
    if (sortMode === 'eco') {
      const aCo2 = a.co2_kg ?? Infinity;
      const bCo2 = b.co2_kg ?? Infinity;
      return aCo2 - bCo2;
    }
    // price
    const aFare = a.fare_tnd ?? Infinity;
    const bFare = b.fare_tnd ?? Infinity;
    return aFare - bFare;
  });

  // Badges
  const cheapestId = sortedModes.length > 0 ? sortedModes.slice().sort((a, b) => (a.fare_tnd ?? Infinity) - (b.fare_tnd ?? Infinity))[0]?.mode_id : null;
  const fastestId  = sortedModes.length > 0 ? sortedModes.slice().sort((a, b) => (a.duration_min ?? Infinity) - (b.duration_min ?? Infinity))[0]?.mode_id : null;
  const ecoId      = sortedModes.length > 0 ? sortedModes.slice().sort((a, b) => (a.co2_kg ?? Infinity) - (b.co2_kg ?? Infinity))[0]?.mode_id : null;

  const unavailableModes = result ? (result.modes || []).filter(m => !m.available) : [];

  return (
    <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: 'var(--bg-color)', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#3B82F6,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 6px 16px rgba(59,130,246,0.3)' }}>
            🗺️
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Simulateur de Trajet</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Planificateur multi-modal — 18 villes · Métro · TGM · RFR · Louage · Train · Bus · Avion
            </p>
          </div>
        </div>
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', padding: '9px 14px', fontSize: '12px', color: '#D97706', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚠️ <strong>Distances et tarifs estimés — indicatifs uniquement.</strong> Activez les layers sur la carte pour visualiser l'infrastructure (Métro, TGM, RFR, Aéroports…).
        </div>
      </div>

      {/* ── Top Panel: Selectors + Map ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', marginBottom: '24px', alignItems: 'start' }}>

        {/* Left: Route Builder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛣️ Planifier votre itinéraire
            </div>

            <CitySelect label="🟢 Départ" value={originId} onChange={v => { setOriginId(v); setResult(null); setError(null); }} exclude={destinationId} color="#10B981" />

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleSwap}
                disabled={!originId || !destinationId}
                title="Inverser départ / arrivée"
                style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: originId && destinationId ? 'linear-gradient(135deg,#3B82F6,#6366F1)' : 'var(--surface-2)',
                  border: '1px solid var(--border-color)', color: '#FFF',
                  cursor: originId && destinationId ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', transition: 'transform 0.3s',
                }}
                onMouseEnter={e => { if (originId && destinationId) e.currentTarget.style.transform = 'rotate(180deg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'rotate(0)'; }}
              >⇅</button>
            </div>

            <CitySelect label="🟡 Arrivée" value={destinationId} onChange={v => { setDestinationId(v); setResult(null); setError(null); }} exclude={originId} color="#F59E0B" />
          </div>

          {/* Calculate button */}
          <button
            onClick={handleCalculate}
            disabled={!originId || !destinationId || loading}
            style={{
              padding: '13px', borderRadius: '12px', border: 'none',
              background: originId && destinationId ? 'linear-gradient(135deg,#3B82F6,#6366F1)' : 'var(--surface-2)',
              color: originId && destinationId ? '#FFF' : 'var(--text-muted)',
              fontSize: '14px', fontWeight: '700',
              cursor: originId && destinationId ? 'pointer' : 'not-allowed',
              boxShadow: originId && destinationId ? '0 6px 16px rgba(59,130,246,0.3)' : 'none',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {loading
              ? <><span style={{ display: 'inline-block', width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Calcul en cours…</>
              : <>🧮 Calculer les modes de transport</>
            }
          </button>

          {/* Route summary card */}
          {result && (
            <div style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(99,102,241,0.1))', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '14px', padding: '14px' }}>
              <div style={{ fontSize: '12px', color: '#93C5FD', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>📊 Résumé du trajet</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px', color: 'var(--text-main)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Départ</span>
                  <span style={{ fontWeight: '600' }}>🟢 {result.origin?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Arrivée</span>
                  <span style={{ fontWeight: '600' }}>🟡 {result.destination?.name}</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Distance</span>
                  <span style={{ fontWeight: '700', color: '#60A5FA' }}>~{result.distance_km?.toFixed(0)} km</span>
                </div>
                {result.duration_min > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Durée estimée</span>
                    <span style={{ fontWeight: '700', color: '#F59E0B' }}>~{result.duration_min} min</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Modes dispo.</span>
                  <span style={{ fontWeight: '700', color: '#34D399' }}>{availableModes.length} modes</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Routing</span>
                  <span style={{ fontWeight: '600', color: result.route_source === 'osrm' ? '#34D399' : '#94A3B8', fontSize: '11px' }}>
                    {result.route_source === 'osrm' ? '🛣️ OSRM' : '📐 Haversine ×1.3'}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.4' }}>
                ⚡ {result.distance_note}
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: '11px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '13px' }}>
              ❌ {error}
            </div>
          )}
        </div>

        {/* Right: Map */}
        <div style={{ height: '480px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <TripPlannerMap
            originId={originId}
            destinationId={destinationId}
            distanceKm={result?.distance_km}
            durationMin={result?.duration_min}
            routeGeometry={result?.route_geometry}
            routeSource={result?.route_source}
            onCitySelect={handleMapCitySelect}
          />
        </div>
      </div>

      {/* ── Mode Cards ───────────────────────────────────────────────── */}
      {sortedModes.length > 0 && (
        <div>
          {/* Section header + sort buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>🚀 Modes disponibles</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {CITIES.find(c => c.id === originId)?.name} → {CITIES.find(c => c.id === destinationId)?.name}
                {' · '}{sortedModes.length} options
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { key: 'price', label: '💰 Prix', activeColor: '#F59E0B' },
                { key: 'speed', label: '⚡ Vitesse', activeColor: '#F59E0B' },
                { key: 'eco',   label: '🌱 Écologie', activeColor: '#10B981' },
              ].map(btn => (
                <button key={btn.key} onClick={() => setSortMode(btn.key)}
                  style={{
                    padding: '7px 13px', borderRadius: '20px', border: 'none',
                    background: sortMode === btn.key ? `linear-gradient(135deg,${btn.activeColor},${btn.activeColor}CC)` : 'var(--surface-2)',
                    color: sortMode === btn.key ? '#FFF' : 'var(--text-muted)',
                    fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            {sortedModes.map(data => (
              <ModeCard
                key={data.mode_id}
                data={data}
                isCheapest={data.mode_id === cheapestId}
                isFastest={data.mode_id === fastestId}
                isEco={data.mode_id === ecoId}
              />
            ))}
          </div>

          {/* Unavailable modes */}
          {unavailableModes.length > 0 && (
            <div style={{ marginTop: '20px', padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <div style={{ fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>ℹ️ Non disponibles pour ce trajet</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {unavailableModes.map(mode => {
                  const meta = MODE_META[mode.mode_id] || { emoji: '❓', label: mode.mode_id };
                  return (
                    <div key={mode.mode_id} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--surface-2)', borderRadius: '8px', padding: '4px 9px', fontSize: '11px' }}>
                      <span>{meta.emoji}</span>
                      <span style={{ fontWeight: '600' }}>{meta.label}</span>
                      {mode.reason && <span style={{ color: 'var(--text-muted)' }}>— {mode.reason}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nearby Stations */}
          <NearbyPanel
            stationsNearby={result?.stations_nearby}
            originName={result?.origin?.name}
            destName={result?.destination?.name}
          />
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────── */}
      {!result && !loading && (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>Sélectionnez votre itinéraire</div>
          <div style={{ fontSize: '13px', maxWidth: '420px', margin: '0 auto', lineHeight: '1.7' }}>
            Choisissez une ville de départ et d'arrivée, puis cliquez sur <strong>Calculer</strong>.<br />
            Activez les couches sur la carte pour visualiser Métro, TGM, RFR, Louages et Aéroports.
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default TripSimulator;
