import React from 'react';

const PARTNERS = [
  { name: 'République Tunisienne', abbr: 'RT' },
  { name: 'Ministère du Transport', abbr: 'MT' },
  { name: 'Banque Centrale (BCT)', abbr: 'BCT' },
  { name: 'INS Tunisie', abbr: 'INS' },
  { name: 'CNSS & CNAM', abbr: 'CNSS' },
  { name: 'Société du Métro', abbr: 'TRANSTU' },
  { name: 'Open Data Tunisie', abbr: 'DATA' },
  { name: 'Smart Tunisia', abbr: 'ST' },
];

export default function TrustBar() {
  return (
    <section style={{ padding: '48px 24px', background: '#0A0A0F', borderTop: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative', zIndex: 5 }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', textTransform: 'uppercase', color: '#C8C8D8', letterSpacing: '0.1em', marginBottom: '28px' }}>
          DONNÉES OFFICIELLES & SOURCES INSTITUTIONNELLES CERTIFIÉES
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '36px', flexWrap: 'wrap', opacity: 0.65 }}>
          {PARTNERS.map((p, i) => (
            <div
              key={i}
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '13px',
                color: '#C8C8D8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'opacity 200ms ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.65')}
            >
              <span style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: '700',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
              }}>
                {p.abbr}
              </span>
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
