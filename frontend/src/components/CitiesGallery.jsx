import React, { useEffect, useRef } from 'react';

export default function CitiesGallery({ images = [], titles = [] }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let pos = 0;
    let raf;
    const step = () => {
      pos += 0.35;
      if (pos >= el.scrollWidth / 2) pos = 0;
      el.scrollLeft = pos;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const renderCard = (src, title, idx) => (
    <div
      key={idx}
      style={{
        minWidth: 280,
        width: 280,
        flex: '0 0 auto',
        borderRadius: '2px',
        overflow: 'hidden',
        background: 'var(--pulse-carbon, #12121A)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#0066FF';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          width: '100%',
          height: 160,
          backgroundImage: `url("${src}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      />
      <div style={{ padding: '14px', background: 'var(--pulse-graphite, #1E1E2E)' }}>
        <div style={{
          fontWeight: 700,
          color: 'var(--pulse-pure, #FFFFFF)',
          fontSize: '15px',
          fontFamily: 'var(--font-primary, sans-serif)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>{title}</span>
          <span style={{
            fontSize: '9px',
            fontFamily: 'var(--font-mono, monospace)',
            color: '#7FD579',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#7FD579' }} />
            EN DIRECT
          </span>
        </div>
        <div style={{
          color: 'var(--pulse-mist, #C8C8D8)',
          fontSize: '12px',
          marginTop: '6px',
          fontFamily: 'var(--font-mono, monospace)',
        }}>
          Surveillance IoT 24/7
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '10px 0', maxWidth: '100%', overflow: 'hidden' }}>
      <div
        ref={wrapRef}
        style={{
          display: 'flex',
          gap: 20,
          overflowX: 'auto',
          paddingBottom: 12,
          scrollBehavior: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {images.map((src, i) => renderCard(src, titles[i] || `Ville ${i + 1}`, `orig-${i}`))}
        {images.map((src, i) => renderCard(src, titles[i] || `Ville ${i + 1}`, `dup-${i}`))}
      </div>
    </div>
  );
}
