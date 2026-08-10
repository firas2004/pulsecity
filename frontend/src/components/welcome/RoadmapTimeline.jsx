import React from 'react';

const ROADMAP = [
  { quarter: '2026 Q1', label: 'Surveillance 18 Villes', status: 'done' },
  { quarter: '2026 Q2', label: 'IA Groq + Simulateur Trajet', status: 'done' },
  { quarter: '2026 Q3', label: 'Santé, Admin & Magasins', status: 'done' },
  { quarter: '2026 Q4', label: 'Télémédecine & e-Dinar', status: 'progress' },
  { quarter: '2027 Q1', label: 'Open Data API Publique', status: 'upcoming' },
];

export default function RoadmapTimeline() {
  return (
    <section style={{ padding: '88px 24px', background: '#0A0A0F', position: 'relative', zIndex: 5 }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', textTransform: 'uppercase', color: '#0066FF', letterSpacing: '0.1em' }}>
            • FEUILLE DE ROUTE
          </span>
          <h2 style={{ fontFamily: 'var(--font-primary, sans-serif)', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 40px)', color: '#FFFFFF', marginTop: '12px', letterSpacing: '-0.02em' }}>
            L'Avenir du Smart City en Tunisie
          </h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', flexWrap: 'wrap', gap: '20px' }}>
          {/* Connector Line */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '40px',
            right: '40px',
            height: '2px',
            background: 'linear-gradient(90deg, #0066FF 60%, rgba(255, 255, 255, 0.1) 60%)',
            zIndex: 0,
            display: 'block',
          }} className="timeline-connector" />

          {ROADMAP.map((item, i) => (
            <div key={i} style={{ position: 'relative', zIndex: 1, textAlign: 'center', flex: 1, minWidth: '140px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: item.status === 'done' ? '#0066FF' : item.status === 'progress' ? '#B8AD97' : '#1E1E2E',
                border: `2px solid ${item.status === 'done' ? '#0066FF' : item.status === 'progress' ? '#B8AD97' : 'rgba(255, 255, 255, 0.15)'}`,
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: '#FFFFFF',
                fontWeight: '700',
              }}>
                {item.status === 'done' ? '✓' : item.status === 'progress' ? '⟳' : '○'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', color: '#8BB5FF', marginTop: '14px', fontWeight: '700' }}>
                {item.quarter}
              </div>
              <div style={{ fontFamily: 'var(--font-primary, sans-serif)', fontSize: '13px', color: '#C8C8D8', marginTop: '6px', lineHeight: '1.4' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
