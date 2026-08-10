import React, { useEffect, useRef } from 'react';
import { TYPE_CONFIG } from './HealthMap';

const URGENCY_NUMBERS = [
  { number: '190', label: 'SAMU', color: '#D32F2F', emoji: '🚑' },
  { number: '198', label: 'Protection Civile', color: '#F57C00', emoji: '🚒' },
  { number: '193', label: 'Police', color: '#1565C0', emoji: '👮' },
  { number: '197', label: 'Garde Nationale', color: '#2E7D32', emoji: '⚔️' },
];

const HealthDetailDrawer = ({ establishment: e, onClose, onNavigate }) => {
  const backdropRef = useRef();

  useEffect(() => {
    const handleKey = (ev) => { if (ev.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!e) return null;
  const cfg = TYPE_CONFIG[e.type] || { emoji: '📍', color: '#546E7A', label: e.type };

  const handleNavigate = () => {
    if (onNavigate) onNavigate(e);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 2001,
        width: '480px', maxWidth: '100vw',
        background: 'var(--surface)',
        borderLeft: `4px solid ${cfg.color}`,
        boxShadow: '-8px 0 48px rgba(0,0,0,0.25)',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.25s ease',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={{
          padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: '14px',
          borderBottom: '1px solid var(--border-color)',
          background: `linear-gradient(135deg, ${cfg.color}18, transparent)`,
        }}>
          <div style={{
            width: '50px', height: '50px', borderRadius: '14px', background: cfg.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', flexShrink: 0, boxShadow: `0 6px 16px ${cfg.color}44`,
          }}>
            {cfg.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.3' }}>
              {e.name}
            </h2>
            <div style={{ fontSize: '12px', color: cfg.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {e.type_label || cfg.label} · {e.sector_label || e.sector}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)',
              background: 'var(--surface-2)', color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0,
            }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── Badges ──────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {e.tags && e.tags.map(tag => (
              <span key={tag} style={{
                background: tag.includes('Urgences') ? '#D32F2F' : tag.includes('CNAM') ? '#388E3C' : tag.includes('Universitaire') ? '#1565C0' : tag.includes('Garde') ? '#2E7D32' : '#546E7A',
                color: '#FFF', borderRadius: '14px', padding: '4px 10px', fontSize: '11px', fontWeight: '700',
              }}>
                {tag}
              </span>
            ))}
          </div>

          {/* ── Info block ──────────────────────────────────────────── */}
          <div style={{ background: 'var(--surface-2)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Adresse', icon: '📍', value: e.address },
              { label: 'Gouvernorat', icon: '🗺️', value: `${e.city}, ${e.governorate}` },
              { label: 'Horaires', icon: '🕐', value: e.opening_hours },
              { label: 'Téléphone', icon: '📞', value: e.phone, isLink: true, href: `tel:${e.phone}` },
              { label: 'Lits', icon: '🛏️', value: e.beds ? `${e.beds} lits` : null },
              { label: 'Niveau', icon: '🏆', value: e.level ? e.level.charAt(0).toUpperCase() + e.level.slice(1) : null },
            ].filter(r => r.value).map(row => (
              <div key={row.label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ width: '20px', textAlign: 'center', flexShrink: 0 }}>{row.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1px' }}>
                    {row.label}
                  </div>
                  {row.isLink
                    ? <a href={row.href} style={{ fontSize: '13px', color: '#3B82F6', fontWeight: '600', textDecoration: 'none' }}>{row.value}</a>
                    : <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{row.value}</div>
                  }
                </div>
              </div>
            ))}
          </div>

          {/* ── Specialties ─────────────────────────────────────────── */}
          {e.specialties && e.specialties.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🩺 Spécialités
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {e.specialties.map(spec => (
                  <span key={spec} style={{
                    background: `${cfg.color}18`, border: `1px solid ${cfg.color}33`,
                    borderRadius: '10px', padding: '4px 10px',
                    fontSize: '12px', color: 'var(--text-main)', fontWeight: '500',
                  }}>
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Services ────────────────────────────────────────────── */}
          {e.services && e.services.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ⚙️ Services disponibles
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {e.services.map(svc => (
                  <div key={svc} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-main)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                    {svc}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CNAM info ───────────────────────────────────────────── */}
          <div style={{
            padding: '12px 14px', borderRadius: '12px',
            background: e.cnam_convention ? 'rgba(56,142,60,0.1)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${e.cnam_convention ? 'rgba(56,142,60,0.3)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            <div style={{ fontWeight: '700', fontSize: '12px', color: e.cnam_convention ? '#388E3C' : '#EF4444', marginBottom: '4px' }}>
              {e.cnam_convention ? '✅ Conventionné CNAM' : '❌ Non conventionné CNAM'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {e.cnam_convention
                ? "Cet établissement est conventionné avec la CNAM — vos soins peuvent être remboursés selon votre couverture sociale."
                : "Cet établissement n'est pas conventionné CNAM. Renseignez-vous sur les modalités de paiement avant votre visite."}
            </div>
          </div>

          {/* ── Actions ─────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleNavigate}
              style={{
                padding: '12px', borderRadius: '12px', border: 'none',
                background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}CC)`,
                color: '#FFF', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: `0 6px 16px ${cfg.color}44`,
              }}>
              🗺️ Calculer l'itinéraire
            </button>
            {e.phone && (
              <a
                href={`tel:${e.phone}`}
                style={{
                  padding: '12px', borderRadius: '12px',
                  border: '1px solid rgba(16,185,129,0.3)',
                  background: 'rgba(16,185,129,0.1)', color: '#10B981',
                  fontSize: '14px', fontWeight: '700', textAlign: 'center',
                  textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                📞 Appeler : {e.phone}
              </a>
            )}
          </div>

          {/* ── Emergency numbers ───────────────────────────────────── */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#EF4444', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🆘 Numéros d'urgence Tunisie
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {URGENCY_NUMBERS.map(u => (
                <a
                  key={u.number}
                  href={`tel:${u.number}`}
                  style={{
                    padding: '10px 12px', borderRadius: '10px',
                    background: `${u.color}18`, border: `1px solid ${u.color}33`,
                    color: u.color, textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                  <span style={{ fontSize: '18px' }}>{u.emoji}</span>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '16px' }}>{u.number}</div>
                    <div style={{ fontSize: '10px', opacity: 0.85 }}>{u.label}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideInRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
      `}</style>
    </>
  );
};

export default HealthDetailDrawer;
