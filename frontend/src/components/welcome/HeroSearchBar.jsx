import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SUGGESTIONS = [
  { icon: '🏥', label: 'Trouver un hôpital ou une urgence 24h', action: '/client/sante', section: 'santé' },
  { icon: '🚗', label: 'Itinéraire Tunis vers Sousse / Sfax', action: '/client/trip-simulator', section: 'transport' },
  { icon: '⛽', label: 'Prix des carburants & Essence SP95', action: '/client/eco', section: 'éco' },
  { icon: '🏛️', label: 'Renouveler ma carte d\'identité (CIN)', action: '/client/administrations', section: 'admin' },
  { icon: '🛒', label: 'Promotions Carrefour & Monoprix', action: '/client/magasins', section: 'magasins' },
  { icon: '🏖️', label: 'Plages & Baignade La Marsa / Sousse', action: '/client/beaches', section: 'plages' },
  { icon: '📊', label: 'Cours du Dinar (EUR / USD / GBP)', action: '/client/eco', section: 'éco' },
  { icon: '🚇', label: 'Tarifs & Horaires Métro / TGM', action: '/client/trip-simulator', section: 'transport' },
];

export default function HeroSearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState(SUGGESTIONS);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Handle Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items
  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setFiltered(SUGGESTIONS);
    } else {
      setFiltered(
        SUGGESTIONS.filter(
          (s) =>
            s.label.toLowerCase().includes(q) ||
            s.section.toLowerCase().includes(q)
        )
      );
    }
  }, [query]);

  const handleSelect = (item) => {
    setOpen(false);
    setQuery('');
    navigate(item.action);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', maxWidth: '620px', width: '100%', margin: '36px auto 0' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(18, 18, 26, 0.92)',
        border: open ? '1px solid #0066FF' : '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '2px',
        padding: '14px 20px',
        backdropFilter: 'blur(12px)',
        transition: 'all 200ms ease',
      }}>
        <span style={{ color: '#8BB5FF', fontSize: '18px' }}>🔍</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Rechercher un service (ex: hôpital, trajet, CIN, promos)..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#FFFFFF',
            fontFamily: 'var(--font-primary, sans-serif)',
            fontSize: '15px',
            width: '100%',
            letterSpacing: '-0.01em',
          }}
        />
        <kbd style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          color: '#C8C8D8',
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          flexShrink: 0,
        }}>⌘K</kbd>
      </div>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: '#12121A',
          border: '1px solid rgba(0, 102, 255, 0.4)',
          borderRadius: '2px',
          overflow: 'hidden',
          zIndex: 100,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)',
        }}>
          {filtered.map((item, i) => (
            <div
              key={i}
              onClick={() => handleSelect(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 20px',
                cursor: 'pointer',
                transition: 'background 150ms ease',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1E1E2E')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ fontFamily: 'var(--font-primary, sans-serif)', fontSize: '14px', color: '#FFFFFF', flex: 1 }}>
                {item.label}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '10px',
                textTransform: 'uppercase',
                color: '#8BB5FF',
                background: 'rgba(0, 102, 255, 0.15)',
                padding: '3px 8px',
                borderRadius: '4px',
              }}>
                {item.section}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '16px', color: '#C8C8D8', fontSize: '14px', textAlign: 'center' }}>
              Aucun résultat. Essayez "hôpital", "trajet", "cin", "essence"...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
