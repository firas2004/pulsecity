import { useNavigate } from 'react-router-dom';

const TYPE_CONFIG = {
  gouvernorat:       { color: '#0D47A1', bg: '#E3F2FD', emoji: '🏰', label: 'Gouvernorat' },
  municipalite:      { color: '#1565C0', bg: '#E3F2FD', emoji: '🏛️', label: 'Municipalité' },
  delegation:        { color: '#1976D2', bg: '#E8EAF6', emoji: '🏢', label: 'Délégation' },
  poste:             { color: '#E65100', bg: '#FFF3E0', emoji: '📮', label: 'Poste' },
  cnss:              { color: '#2E7D32', bg: '#E8F5E9', emoji: '🛡️', label: 'CNSS' },
  cnam:              { color: '#1B5E20', bg: '#E8F5E9', emoji: '💳', label: 'CNAM' },
  ministere:         { color: '#4A148C', bg: '#F3E5F5', emoji: '🏛️', label: 'Ministère' },
  police:            { color: '#B71C1C', bg: '#FFEBEE', emoji: '👮', label: 'Police' },
  tribunal:          { color: '#263238', bg: '#ECEFF1', emoji: '⚖️', label: 'Tribunal' },
  service_exterieur: { color: '#3E2723', bg: '#EFEBE9', emoji: '📋', label: 'Service' },
};

function isOpenNow(hours) {
  if (!hours || hours === '24/7') return true;
  try {
    const [start, end] = hours.split('-');
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes();
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const nowMin   = h * 60 + m;
    const startMin = sh * 60 + sm;
    const endMin   = eh * 60 + em;
    return nowMin >= startMin && nowMin < endMin;
  } catch {
    return null;
  }
}

export default function AdminCard({
  establishment,
  isSelected = false,
  onClick,
  onNavigate,
  onSeeOnMap,
}) {
  const navigate = useNavigate();
  const e = establishment;
  const cfg = TYPE_CONFIG[e.type] || { color: '#607D8B', bg: '#ECEFF1', emoji: '🏢', label: e.type };
  const open = isOpenNow(e.opening_hours);
  const isEmergency = e.emergency || e.opening_hours === '24/7';

  const handleNavigate = () => {
    if (onNavigate) { onNavigate(e); return; }
    navigate(`/client/trajet?to_lat=${e.lat}&to_lng=${e.lng}&to_name=${encodeURIComponent(e.name)}`);
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? '#EEF4FF' : 'white',
        border: isSelected ? `2px solid ${cfg.color}` : '1px solid #E8EDF2',
        borderRadius: 16,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: isSelected ? `0 4px 20px ${cfg.color}25` : '0 1px 4px rgba(0,0,0,0.06)',
        marginBottom: 10,
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 42, height: 42, minWidth: 42,
          background: cfg.color, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {cfg.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{
              background: cfg.bg, color: cfg.color,
              fontSize: 10, fontWeight: 700, padding: '2px 7px',
              borderRadius: 6, whiteSpace: 'nowrap',
            }}>
              {cfg.emoji} {cfg.label}
            </span>
            {isEmergency && (
              <span style={{
                background: '#FFEBEE', color: '#C62828',
                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
              }}>
                🚨 24h/24
              </span>
            )}
            {open !== null && !isEmergency && (
              <span style={{
                background: open ? '#E8F5E9' : '#FFEBEE',
                color: open ? '#2E7D32' : '#C62828',
                fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 6,
              }}>
                {open ? '✅ Ouvert' : '❌ Fermé'}
              </span>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A2E', lineHeight: 1.3 }}>
            {e.name}
          </div>
        </div>
      </div>

      {/* Adresse + horaires */}
      {e.address && (
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4, display: 'flex', gap: 4 }}>
          <span>📍</span>
          <span style={{ lineHeight: 1.4 }}>{e.address}</span>
        </div>
      )}
      {e.opening_hours && (
        <div style={{ fontSize: 12, color: '#059669', marginBottom: 6 }}>
          🕐 {e.opening_hours}
          {e.opening_hours !== '24/7' && (
            <span style={{ color: '#9CA3AF', marginLeft: 6 }}>
              (Été : {e.opening_hours_summer || '07:30-13:00'})
            </span>
          )}
        </div>
      )}

      {/* Distance */}
      {e.distance_km !== null && e.distance_km !== undefined && (
        <div style={{ fontSize: 12, color: '#6366F1', marginBottom: 6, fontWeight: 600 }}>
          📍 {e.distance_km} km — ~{e.walk_min} min à pied
        </div>
      )}

      {/* Services */}
      {e.services && e.services.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {e.services.slice(0, 4).map(s => (
            <span key={s} style={{
              background: '#F3F4F6', color: '#374151',
              fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 500,
            }}>
              {s.replace(/_/g, ' ')}
            </span>
          ))}
          {e.services.length > 4 && (
            <span style={{ fontSize: 10, color: '#9CA3AF', padding: '2px 4px' }}>
              +{e.services.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        {e.phone && (
          <a
            href={`tel:${e.phone}`}
            onClick={ev => ev.stopPropagation()}
            style={{
              flex: 1, textAlign: 'center', padding: '7px 4px',
              background: '#F0FDF4', color: '#16A34A',
              borderRadius: 10, fontSize: 11, fontWeight: 600,
              textDecoration: 'none', border: '1px solid #BBF7D0',
            }}
          >
            📞 Appeler
          </a>
        )}
        <button
          onClick={ev => { ev.stopPropagation(); handleNavigate(); }}
          style={{
            flex: 1, padding: '7px 4px',
            background: '#FFF7ED', color: '#D97706',
            borderRadius: 10, fontSize: 11, fontWeight: 600,
            border: '1px solid #FDE68A', cursor: 'pointer',
          }}
        >
          🗺️ Itinéraire
        </button>
        {e.website && (
          <a
            href={e.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={ev => ev.stopPropagation()}
            style={{
              flex: 1, textAlign: 'center', padding: '7px 4px',
              background: '#F5F3FF', color: '#7C3AED',
              borderRadius: 10, fontSize: 11, fontWeight: 600,
              textDecoration: 'none', border: '1px solid #DDD6FE',
            }}
          >
            🌐 Site web
          </a>
        )}
      </div>
    </div>
  );
}
