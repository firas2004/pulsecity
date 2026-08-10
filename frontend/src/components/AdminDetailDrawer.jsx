import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TYPE_CONFIG = {
  gouvernorat:  { color: '#0D47A1', bg: '#E3F2FD', emoji: '🏰' },
  municipalite: { color: '#1565C0', bg: '#E3F2FD', emoji: '🏛️' },
  delegation:   { color: '#1976D2', bg: '#E8EAF6', emoji: '🏢' },
  poste:        { color: '#E65100', bg: '#FFF3E0', emoji: '📮' },
  cnss:         { color: '#2E7D32', bg: '#E8F5E9', emoji: '🛡️' },
  cnam:         { color: '#1B5E20', bg: '#E8F5E9', emoji: '💳' },
  ministere:    { color: '#4A148C', bg: '#F3E5F5', emoji: '🏛️' },
  police:       { color: '#B71C1C', bg: '#FFEBEE', emoji: '👮' },
  tribunal:     { color: '#263238', bg: '#ECEFF1', emoji: '⚖️' },
};

// Fiches pratiques liées à chaque type d'administration
const PROCEDURES_BY_TYPE = {
  municipalite: ['extrait-naissance', 'livret-famille', 'acte-mariage', 'acte-deces', 'permis-construire'],
  delegation:   ['cin-renouvellement', 'passeport', 'permis-conduire', 'permis-construire'],
  police:       ['cin-renouvellement', 'passeport'],
  cnss:         ['affiliation-cnss'],
  cnam:         ['carte-cnam'],
  tribunal:     [],
  ministere:    ['e-tasrih', 'timbre-fiscal', 'creation-entreprise'],
  poste:        ['timbre-fiscal'],
};

function CheckItem({ label, defaultChecked = false }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 6 }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => setChecked(!checked)}
        style={{ accentColor: '#1565C0', width: 16, height: 16 }}
      />
      <span style={{
        fontSize: 13, color: checked ? '#9CA3AF' : '#374151',
        textDecoration: checked ? 'line-through' : 'none',
        transition: 'all 0.2s',
      }}>
        {label}
      </span>
    </label>
  );
}

export default function AdminDetailDrawer({ establishment, onClose, onNavigate }) {
  const navigate = useNavigate();
  const [relatedAdmins, setRelatedAdmins] = useState([]);
  const e = establishment;

  useEffect(() => {
    if (!e) return;
    const controller = new AbortController();
    fetch(`/api/admin-finder/nearby?lat=${e.lat}&lng=${e.lng}&radius=5&limit=5`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => setRelatedAdmins((d.results || []).filter(x => x.id !== e.id).slice(0, 3)))
      .catch(() => {});
    return () => controller.abort();
  }, [e?.id]);

  if (!e) return null;

  const cfg = TYPE_CONFIG[e.type] || { color: '#607D8B', bg: '#ECEFF1', emoji: '🏢' };
  const linkedProcedures = PROCEDURES_BY_TYPE[e.type] || [];

  const handleNavigate = () => {
    if (onNavigate) { onNavigate(e); return; }
    navigate(`/client/trajet?to_lat=${e.lat}&to_lng=${e.lng}&to_name=${encodeURIComponent(e.name)}`);
  };

  const labelStyle = { fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 };
  const valueStyle = { fontSize: 14, color: '#1F2937', marginBottom: 12 };
  const sectionStyle = { borderTop: '1px solid #F3F4F6', paddingTop: 14, marginTop: 14 };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
      background: 'white', zIndex: 1000,
      boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
      display: 'flex', flexDirection: 'column',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      animation: 'slideInRight 0.25s ease',
    }}>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

      {/* Header coloré */}
      <div style={{
        background: `linear-gradient(135deg, ${cfg.color} 0%, ${cfg.color}CC 100%)`,
        padding: '20px 20px 16px',
        color: 'white', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 52, height: 52, minWidth: 52,
            background: 'rgba(255,255,255,0.2)', borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          }}>
            {cfg.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              {e.type_label || e.type}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.3, marginBottom: 4 }}>
              {e.name}
            </div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              {e.governorate} {e.city && e.city !== e.governorate ? `— ${e.city}` : ''}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none',
            color: 'white', fontSize: 18, width: 32, height: 32,
            borderRadius: 8, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            ✕
          </button>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {e.emergency && (
            <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 6, fontSize: 11, padding: '3px 8px', fontWeight: 600 }}>
              🚨 Urgences 24h/24
            </span>
          )}
          {e.has_etat_civil && (
            <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 6, fontSize: 11, padding: '3px 8px', fontWeight: 600 }}>
              📋 État Civil
            </span>
          )}
          {e.opening_hours && (
            <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 6, fontSize: 11, padding: '3px 8px', fontWeight: 600 }}>
              🕐 {e.opening_hours}
            </span>
          )}
        </div>
      </div>

      {/* Contenu scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>

        {/* Coordonnées */}
        <div>
          <div style={labelStyle}>Coordonnées</div>
          {e.address && (
            <div style={{ fontSize: 14, color: '#374151', marginBottom: 6, display: 'flex', gap: 6 }}>
              <span>📍</span><span>{e.address}</span>
            </div>
          )}
          {e.phone && (
            <a href={`tel:${e.phone}`} style={{ display: 'flex', gap: 6, textDecoration: 'none', color: '#1565C0', fontSize: 14, marginBottom: 6 }}>
              <span>📞</span><span>{e.phone}</span>
            </a>
          )}
          {e.fax && (
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>
              📠 {e.fax}
            </div>
          )}
          {e.email && (
            <a href={`mailto:${e.email}`} style={{ display: 'flex', gap: 6, textDecoration: 'none', color: '#1565C0', fontSize: 13, marginBottom: 6 }}>
              <span>✉️</span><span>{e.email}</span>
            </a>
          )}
          {e.numero_vert && (
            <a href={`tel:${e.numero_vert}`} style={{ display: 'flex', gap: 6, textDecoration: 'none', color: '#16A34A', fontSize: 13, marginBottom: 6, fontWeight: 600 }}>
              <span>📲</span><span>N° vert : {e.numero_vert}</span>
            </a>
          )}
          {e.website && (
            <a href={e.website} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', gap: 6, textDecoration: 'none', color: '#7C3AED', fontSize: 13, marginBottom: 6 }}>
              <span>🌐</span><span>{e.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
        </div>

        {/* Horaires */}
        {e.opening_hours && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Horaires</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: '📅 Standard', val: e.opening_hours },
                { label: '☀️ Été', val: e.opening_hours_summer || '07:30-13:00' },
                { label: '🌙 Ramadan', val: e.opening_hours_ramadan || '08:00-14:00' },
                { label: '📆 Samedi', val: 'Fermé' },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: '#F9FAFB', borderRadius: 10, padding: '8px 10px' }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {e.services && e.services.length > 0 && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Services disponibles</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {e.services.map(s => (
                <span key={s} style={{
                  background: cfg.bg, color: cfg.color,
                  fontSize: 12, padding: '4px 10px', borderRadius: 20, fontWeight: 500,
                }}>
                  {s.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Démarches possibles ici */}
        {linkedProcedures.length > 0 && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Démarches possibles ici</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {linkedProcedures.map(pId => (
                <div key={pId} style={{
                  background: '#F0F9FF', border: '1px solid #BAE6FD',
                  borderRadius: 10, padding: '8px 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 13, color: '#0369A1', fontWeight: 500 }}>
                    📋 {pId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span style={{ fontSize: 11, color: '#0EA5E9' }}>Voir →</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents à préparer (checkbox) */}
        {e.type === 'municipalite' && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Préparer pour l'État Civil</div>
            {['CIN du demandeur', 'Numéro d\'acte de naissance', 'Timbre fiscal (0.150-0.200 TND)'].map(doc => (
              <CheckItem key={doc} label={doc} />
            ))}
          </div>
        )}

        {/* Établissements similaires */}
        {relatedAdmins.length > 0 && (
          <div style={sectionStyle}>
            <div style={labelStyle}>À proximité</div>
            {relatedAdmins.map(r => (
              <div key={r.id} style={{
                background: '#F9FAFB', borderRadius: 10, padding: '8px 12px', marginBottom: 6,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>{TYPE_CONFIG[r.type]?.emoji || '🏢'}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{r.distance_km} km</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div style={{
        padding: '14px 20px', borderTop: '1px solid #F3F4F6',
        display: 'flex', gap: 10, flexShrink: 0,
        background: 'white',
      }}>
        {e.phone && (
          <a href={`tel:${e.phone}`} style={{
            flex: 1, textAlign: 'center', padding: '11px',
            background: '#F0FDF4', color: '#16A34A',
            borderRadius: 12, fontSize: 13, fontWeight: 700,
            textDecoration: 'none', border: '1px solid #BBF7D0',
          }}>
            📞 Appeler
          </a>
        )}
        <button onClick={handleNavigate} style={{
          flex: 1, padding: '11px',
          background: cfg.color, color: 'white',
          borderRadius: 12, fontSize: 13, fontWeight: 700,
          border: 'none', cursor: 'pointer',
        }}>
          🗺️ S'y rendre
        </button>
      </div>
    </div>
  );
}
