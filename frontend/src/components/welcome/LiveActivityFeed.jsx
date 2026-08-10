import React, { useState, useEffect } from 'react';

const ACTIVITIES = [
  { icon: '🟢', text: 'Trafic fluide à Ariana (24 v/min)', time: '3s' },
  { icon: '🟡', text: 'CO₂ modéré détecté à Sousse (415 ppm)', time: '12s' },
  { icon: '🔵', text: 'Nouvelle promo Carrefour La Marsa (-20%)', time: '45s' },
  { icon: '🟢', text: '14 citoyens consultent Éco Pulse en ce moment', time: '1min' },
  { icon: '🟢', text: 'Baignade idéale à la plage de Hammamet (24°C)', time: '2min' },
  { icon: '🔵', text: 'Métro L4 Tunis — passage dans 3 min', time: '3min' },
  { icon: '🟡', text: 'Alerte conteneur déchet 87% — Bab Bhar', time: '5min' },
  { icon: '🟢', text: 'Qualité air excellente à Bizerte Corniche', time: '6min' },
];

export default function LiveActivityFeed() {
  const [items, setItems] = useState(ACTIVITIES);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        const next = [...prev];
        next.push(next.shift());
        return next;
      });
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: '#12121A',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '12px 0',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 5,
    }}>
      <div style={{
        display: 'flex',
        gap: '40px',
        animation: 'marquee-scroll 35s linear infinite',
        width: 'max-content',
      }}>
        {[...items, ...items, ...items].map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0,
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12px',
              color: '#C8C8D8',
            }}
          >
            <span>{item.icon}</span>
            <span style={{ fontWeight: '500' }}>{item.text}</span>
            <span style={{ color: '#33334D', fontSize: '11px' }}>— {item.time}</span>
            <span style={{ color: 'rgba(0, 102, 255, 0.4)', fontSize: '10px' }}>◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}
