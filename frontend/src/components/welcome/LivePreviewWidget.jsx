import React, { useState, useEffect } from 'react';

const INITIAL_WIDGETS = [
  { id: 'traffic', label: 'Trafic Tunis Centre', value: 45, unit: 'veh/min', color: '#0066FF', sparkline: [38, 40, 42, 45, 43, 45, 47] },
  { id: 'co2', label: 'Qualité Air CO₂ Sousse', value: 415, unit: 'ppm', color: '#7FD579', sparkline: [420, 418, 416, 415, 414, 415, 413] },
  { id: 'energy', label: 'Consommation Sfax', value: 1240, unit: 'kWh', color: '#D896FF', sparkline: [1100, 1150, 1200, 1220, 1240, 1230, 1240] },
  { id: 'parking', label: 'Parking Ariana Libres', value: 78, unit: '%', color: '#3385FF', sparkline: [60, 65, 70, 75, 78, 80, 78] },
];

function MiniSparkline({ data, color }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 70;
      const y = 30 - ((v - min) / range) * 26;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width="70" height="32" style={{ marginTop: '10px' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LivePreviewWidget() {
  const [widgets, setWidgets] = useState(INITIAL_WIDGETS);

  useEffect(() => {
    const interval = setInterval(() => {
      setWidgets((prev) =>
        prev.map((w) => {
          let delta = Math.floor(Math.random() * 3) - 1;
          let newVal = Math.max(1, w.value + delta);
          return {
            ...w,
            value: newVal,
            sparkline: [...w.sparkline.slice(1), newVal],
          };
        })
      );
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section style={{
      padding: '88px 24px',
      background: '#12121A',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'relative',
      zIndex: 5,
    }}>
      <div style={{ maxWidth: '1050px', margin: '0 auto', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', textTransform: 'uppercase', color: '#0066FF', letterSpacing: '0.1em' }}>
          • APERÇU EN DIRECT
        </span>
        <h2 style={{ fontFamily: 'var(--font-primary, sans-serif)', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 42px)', color: '#FFFFFF', marginTop: '12px', letterSpacing: '-0.02em' }}>
          Votre ville, en un coup d'œil
        </h2>
        <p style={{ fontFamily: 'var(--font-primary, sans-serif)', fontSize: '15px', color: '#C8C8D8', marginTop: '10px', maxWidth: '540px', margin: '10px auto 0' }}>
          Flux de télémétrie en temps réel. Connectez-vous pour accéder à l'ensemble des 72+ capteurs actifs.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '48px' }}>
          {widgets.map((w) => (
            <div
              key={w.id}
              style={{
                background: '#0A0A0F',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '2px',
                padding: '24px 20px',
                textAlign: 'left',
                transition: 'border-color 300ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0, 102, 255, 0.4)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
            >
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', textTransform: 'uppercase', color: '#C8C8D8', letterSpacing: '0.05em' }}>
                {w.label}
              </div>
              <div style={{ fontFamily: 'var(--font-primary, sans-serif)', fontWeight: 800, fontSize: '28px', color: '#FFFFFF', marginTop: '8px', letterSpacing: '-0.02em' }}>
                {w.value} <span style={{ fontSize: '14px', color: '#C8C8D8', fontWeight: '500' }}>{w.unit}</span>
              </div>
              <MiniSparkline data={w.sparkline} color={w.color} />
            </div>
          ))}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ width: '6px', height: '6px', backgroundColor: '#7FD579', borderRadius: '50%', animation: 'pulse-live 2s infinite' }} />
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: '#C8C8D8', textTransform: 'uppercase' }}>
            ACTUALISATION FLUIDE · WEBSOCKET LIVE
          </span>
        </div>
      </div>
    </section>
  );
}
