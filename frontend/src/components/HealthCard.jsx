import React from 'react';
import { TYPE_CONFIG } from './HealthMap';
import { useNavigate } from 'react-router-dom';

const HealthCard = ({ establishment: e, isSelected = false, onClick, onNavigate }) => {
  const cfg = TYPE_CONFIG[e.type] || { emoji: '📍', color: '#546E7A', label: e.type };
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (onNavigate) return onNavigate(e);
    navigate(`/client/trip-simulator?to_lat=${e.lat}&to_lng=${e.lng}&to_name=${encodeURIComponent(e.name)}`);
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isSelected ? cfg.color : 'var(--border-color)'}`,
        borderLeft: `4px solid ${cfg.color}`,
        borderRadius: '14px',
        padding: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isSelected ? `0 8px 24px ${cfg.color}22` : '0 2px 6px rgba(0,0,0,0.05)',
        position: 'relative',
        transform: isSelected ? 'translateX(4px)' : 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px ${cfg.color}22`; e.currentTarget.style.borderColor = cfg.color; }}
      onMouseLeave={ev => { if (!isSelected) { ev.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)'; ev.currentTarget.style.borderColor = 'var(--border-color)'; } }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px', background: cfg.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', flexShrink: 0,
        }}>
          {cfg.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.3', marginBottom: '3px' }}>
            {e.name}
          </div>
          <div style={{ fontSize: '10px', color: cfg.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {cfg.label}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
        {e.has_emergency && (
          <span style={{ background: '#D32F2F', color: '#FFF', borderRadius: '10px', padding: '2px 8px', fontSize: '10px', fontWeight: '700' }}>
            🚨 Urgences 24h
          </span>
        )}
        {e.cnam_convention && (
          <span style={{ background: '#388E3C', color: '#FFF', borderRadius: '10px', padding: '2px 8px', fontSize: '10px', fontWeight: '700' }}>
            ✅ CNAM
          </span>
        )}
        {e.level === 'universitaire' && (
          <span style={{ background: '#1565C0', color: '#FFF', borderRadius: '10px', padding: '2px 8px', fontSize: '10px', fontWeight: '700' }}>
            🎓 Universitaire
          </span>
        )}
        {e.is_on_duty && (
          <span style={{ background: '#2E7D32', color: '#FFF', borderRadius: '10px', padding: '2px 8px', fontSize: '10px', fontWeight: '700' }}>
            💊 Garde
          </span>
        )}
        {e.sector === 'prive' && (
          <span style={{ background: '#7B1FA2', color: '#FFF', borderRadius: '10px', padding: '2px 8px', fontSize: '10px', fontWeight: '700' }}>
            🏢 Privé
          </span>
        )}
      </div>

      {/* Address + Distance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
          <span style={{ flexShrink: 0 }}>📍</span>
          <span style={{ lineHeight: '1.3' }}>{e.address}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {e.distance_km != null && (
            <span style={{ background: 'rgba(59,130,246,0.1)', borderRadius: '6px', padding: '2px 7px', color: '#60A5FA', fontWeight: '700' }}>
              📏 {e.distance_km} km
            </span>
          )}
          {e.walk_min != null && (
            <span style={{ color: 'var(--text-muted)' }}>
              🚶 ~{e.walk_min} min à pied
            </span>
          )}
        </div>
      </div>

      {/* Specialties chips */}
      {e.specialties && e.specialties.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
          {e.specialties.slice(0, 4).map(spec => (
            <span key={spec} style={{
              background: 'var(--surface-2)', borderRadius: '6px', padding: '2px 8px',
              fontSize: '10px', color: 'var(--text-muted)', fontWeight: '500',
            }}>
              {spec}
            </span>
          ))}
          {e.specialties.length > 4 && (
            <span style={{ background: 'var(--surface-2)', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', color: 'var(--text-muted)' }}>
              +{e.specialties.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {e.phone && (
          <a
            href={`tel:${e.phone}`}
            onClick={ev => ev.stopPropagation()}
            style={{
              flex: 1, padding: '7px', borderRadius: '9px', background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)', color: '#10B981',
              fontSize: '11px', fontWeight: '700', textAlign: 'center', textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
            }}>
            📞 Appeler
          </a>
        )}
        <button
          onClick={ev => { ev.stopPropagation(); handleNavigate(); }}
          style={{
            flex: 1, padding: '7px', borderRadius: '9px', background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.25)', color: '#3B82F6',
            fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
          }}>
          🗺️ Itinéraire
        </button>
      </div>
    </div>
  );
};

export default HealthCard;
