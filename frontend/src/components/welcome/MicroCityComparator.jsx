import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CITIES_DATA = {
  tunis: { name: 'Tunis', traffic: 45, co2: 420, temp: 32, livability: 87 },
  sfax: { name: 'Sfax', traffic: 38, co2: 405, temp: 33, livability: 82 },
  sousse: { name: 'Sousse', traffic: 42, co2: 415, temp: 31, livability: 84 },
  bizerte: { name: 'Bizerte', traffic: 28, co2: 380, temp: 29, livability: 80 },
  gabes: { name: 'Gabès', traffic: 25, co2: 395, temp: 34, livability: 75 },
  monastir: { name: 'Monastir', traffic: 35, co2: 390, temp: 30, livability: 86 },
  nabeul: { name: 'Nabeul', traffic: 30, co2: 385, temp: 30, livability: 83 },
  ariana: { name: 'Ariana', traffic: 40, co2: 410, temp: 32, livability: 85 },
};

const METRICS = [
  { key: 'traffic', label: '🚗 Trafic Routier', unit: 'v/m', lowerIsBetter: true },
  { key: 'co2', label: '🌿 Qualité Air CO₂', unit: 'ppm', lowerIsBetter: true },
  { key: 'temp', label: '🌡️ Température', unit: '°C', lowerIsBetter: false },
  { key: 'livability', label: '🏆 Indice Livabilité', unit: '/100', lowerIsBetter: false },
];

export default function MicroCityComparator() {
  const [cityA, setCityA] = useState('tunis');
  const [cityB, setCityB] = useState('sousse');
  const navigate = useNavigate();

  const a = CITIES_DATA[cityA] || CITIES_DATA.tunis;
  const b = CITIES_DATA[cityB] || CITIES_DATA.sousse;

  return (
    <section style={{ padding: '88px 24px', background: '#0A0A0F', position: 'relative', zIndex: 5 }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', textTransform: 'uppercase', color: '#0066FF', letterSpacing: '0.1em' }}>
          • COMPARAISON INTERACTIVE
        </span>
        <h2 style={{ fontFamily: 'var(--font-primary, sans-serif)', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 40px)', color: '#FFFFFF', marginTop: '12px', letterSpacing: '-0.02em' }}>
          Comparez deux villes tunisiennes
        </h2>
        <p style={{ fontFamily: 'var(--font-primary, sans-serif)', fontSize: '15px', color: '#C8C8D8', marginTop: '10px' }}>
          Sélectionnez deux villes pour confronter la métrologie et la qualité de vie côte à côte.
        </p>

        {/* Dropdowns */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '36px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={cityA}
            onChange={(e) => setCityA(e.target.value)}
            style={{
              background: '#12121A',
              border: '1px solid rgba(0, 102, 255, 0.4)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-primary, sans-serif)',
              fontWeight: '700',
              fontSize: '15px',
              padding: '12px 20px',
              borderRadius: '2px',
              minWidth: '180px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {Object.entries(CITIES_DATA).map(([k, v]) => (
              <option key={k} value={k} style={{ backgroundColor: '#12121A' }}>{v.name}</option>
            ))}
          </select>

          <span style={{ color: '#C8C8D8', fontFamily: 'var(--font-mono, monospace)', fontWeight: '700', fontSize: '14px' }}>VS</span>

          <select
            value={cityB}
            onChange={(e) => setCityB(e.target.value)}
            style={{
              background: '#12121A',
              border: '1px solid rgba(0, 102, 255, 0.4)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-primary, sans-serif)',
              fontWeight: '700',
              fontSize: '15px',
              padding: '12px 20px',
              borderRadius: '2px',
              minWidth: '180px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {Object.entries(CITIES_DATA).map(([k, v]) => (
              <option key={k} value={k} style={{ backgroundColor: '#12121A' }}>{v.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div style={{ marginTop: '36px', background: '#12121A', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: '#1E1E2E' }}>
            <div style={{ padding: '16px', fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: '#C8C8D8', textTransform: 'uppercase', textAlign: 'left' }}>Métrique</div>
            <div style={{ padding: '16px', fontFamily: 'var(--font-primary, sans-serif)', fontWeight: 800, fontSize: '16px', color: '#FFFFFF', textAlign: 'center' }}>{a.name}</div>
            <div style={{ padding: '16px', fontFamily: 'var(--font-primary, sans-serif)', fontWeight: 800, fontSize: '16px', color: '#FFFFFF', textAlign: 'center' }}>{b.name}</div>
          </div>
          {METRICS.map((m) => {
            const valA = a[m.key];
            const valB = b[m.key];
            const aWins = m.lowerIsBetter ? valA < valB : valA > valB;
            return (
              <div key={m.key} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', alignItems: 'center' }}>
                <div style={{ padding: '16px', fontFamily: 'var(--font-primary, sans-serif)', fontSize: '14px', color: '#C8C8D8', textAlign: 'left' }}>{m.label}</div>
                <div style={{ padding: '16px', textAlign: 'center', fontFamily: 'var(--font-mono, monospace)', fontSize: '17px', color: aWins ? '#7FD579' : '#FFFFFF', fontWeight: '700' }}>
                  {valA} <span style={{ fontSize: '12px', color: '#C8C8D8' }}>{m.unit}</span>
                </div>
                <div style={{ padding: '16px', textAlign: 'center', fontFamily: 'var(--font-mono, monospace)', fontSize: '17px', color: !aWins ? '#7FD579' : '#FFFFFF', fontWeight: '700' }}>
                  {valB} <span style={{ fontSize: '12px', color: '#C8C8D8' }}>{m.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/login')}
          style={{
            marginTop: '28px',
            background: 'transparent',
            border: '1px solid #8BB5FF',
            color: '#FFFFFF',
            fontFamily: 'var(--font-primary, sans-serif)',
            fontWeight: 700,
            fontSize: '13px',
            textTransform: 'uppercase',
            padding: '12px 28px',
            borderRadius: '2px',
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 102, 255, 0.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          Accéder au comparateur complet →
        </button>
      </div>
    </section>
  );
}
