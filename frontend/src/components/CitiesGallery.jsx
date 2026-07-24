import React, {useEffect, useRef} from 'react';

export default function CitiesGallery({images = [], titles = []}){
  const wrapRef = useRef(null);

  // simple auto-scroll
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let pos = 0;
    let raf;
    const step = () => {
      pos += 0.25;
      if (pos > el.scrollWidth/2) pos = 0;
      el.scrollLeft = pos;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ padding: '40px 12px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 18, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>Villes surveillées</div>

      <div
        ref={wrapRef}
        style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
      >
        {images.map((src, i) => (
          <div key={i} style={{ minWidth: 300, width: 300, flex: '0 0 auto', borderRadius: 12, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>
            <div style={{ width: '100%', height: 180, backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div style={{ padding: 12, background: 'var(--surface-2)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 15 }}>{titles[i] || `Ville ${i+1}`}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>Surveillance 24/7 — capteurs actifs</div>
            </div>
          </div>
        ))}

        {/* duplicate for continuous feel */}
        {images.map((src, i) => (
          <div key={`dup-${i}`} style={{ minWidth: 300, width: 300, flex: '0 0 auto', borderRadius: 12, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>
            <div style={{ width: '100%', height: 180, backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div style={{ padding: 12, background: 'var(--surface-2)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 15 }}>{titles[i] || `Ville ${i+1}`}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>Surveillance 24/7 — capteurs actifs</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
