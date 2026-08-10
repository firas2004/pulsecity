import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CAT_COLORS = {
  restaurant: '#E65100', cafe: '#6D4C41', bar: '#7B1FA2', fast_food: '#F57C00',
  patisserie: '#C2185B', coworking: '#1565C0', parc: '#2E7D32', plage: '#0277BD',
  musee: '#5D4037', cinema: '#C62828', souk: '#F9A825', centre_commercial: '#455A64',
  hotel: '#00838F', salle_sport: '#D84315', monument: '#6A1B9A', mosquee: '#1B5E20',
  galerie_art: '#AD1457', theatre: '#880E4F', spa: '#00695C', tourisme: '#6A1B9A', oasis: '#2E7D32',
};
const CAT_EMOJI = {
  restaurant: '🍽️', cafe: '☕', bar: '🍸', fast_food: '🍔', patisserie: '🧁',
  coworking: '💻', parc: '🌳', plage: '🏖️', musee: '🏛️', cinema: '🎬',
  souk: '🛍️', centre_commercial: '🏬', hotel: '🏨', salle_sport: '🏋️',
  monument: '🗿', mosquee: '🕌', galerie_art: '🎨', theatre: '🎭',
  spa: '🧖', tourisme: '📸', oasis: '🌴',
};

const FEATURE_LABELS = {
  wifi: '📶 WiFi', terrace: '🌿 Terrasse', parking: '🅿️ Parking',
  halal: '✅ Halal', vegetarian: '🥦 Végétarien', outdoor_seating: '🪑 Extérieur',
  reservation: '📅 Réservation', delivery: '🛵 Livraison', air_conditioning: '❄️ Clim',
  live_music: '🎵 Musique live', credit_card: '💳 CB', view: '🌅 Vue',
  meeting_rooms: '🏢 Salles réunion', coffee_included: '☕ Café inclus',
  accessible: '♿ PMR', zoo: '🦁 Zoo', playground: '🎠 Aire de jeux',
  jogging_track: '🏃 Jogging', hotel: '🏨 Hébergement',
};

function Stars({ rating }) {
  if (!rating) return null;
  const full = Math.round(rating);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ color: '#F59E0B', fontSize: 16 }}>
        {'★'.repeat(full)}{'☆'.repeat(5 - full)}
      </span>
      <strong style={{ fontSize: 16, color: '#1F2937' }}>{rating}</strong>
      <span style={{ fontSize: 12, color: '#9CA3AF' }}>/ 5</span>
    </div>
  );
}

export default function POIDetailDrawer({ poi, onClose, onNavigate, isFavorite = false, onFavorite }) {
  const navigate = useNavigate();
  const [photoIdx, setPhotoIdx] = useState(0);

  if (!poi) return null;

  const color = CAT_COLORS[poi.category] || '#607D8B';
  const emoji = CAT_EMOJI[poi.category] || '📍';

  const handleNavigate = () => {
    if (onNavigate) { onNavigate(poi); return; }
    navigate(`/client/trajet?to_lat=${poi.lat}&to_lng=${poi.lng}&to_name=${encodeURIComponent(poi.name)}`);
    onClose();
  };

  const priceMap = { 0: { t: 'Gratuit', c: '#16A34A' }, 1: { t: '€ (0–10 TND)', c: '#D97706' }, 2: { t: '€€ (10–30 TND)', c: '#EA580C' }, 3: { t: '€€€ (30+ TND)', c: '#DC2626' } };
  const priceCfg = priceMap[poi.price_level];

  const labelS = { fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 };
  const divider = { borderTop: '1px solid #F3F4F6', paddingTop: 14, marginTop: 14 };

  const enabledFeatures = Object.entries(poi.features || {}).filter(([, v]) => v === true);

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 440,
      background: 'white', zIndex: 1000, display: 'flex', flexDirection: 'column',
      boxShadow: '-6px 0 32px rgba(0,0,0,0.18)',
      fontFamily: '"Inter","Segoe UI",sans-serif',
      animation: 'slideIn 0.25s ease',
    }}>
      <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>

      {/* ── Photo hero ──────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: 200, flexShrink: 0, overflow: 'hidden' }}>
        <img
          src={poi.photo_url}
          alt={poi.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={ev => { ev.currentTarget.src = '/assests/Tunis.png'; }}
        />
        {/* Overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)',
        }} />

        {/* Badges flottants */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <span style={{ background: color, color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
            {emoji} {poi.category_label || poi.category}
          </span>
          {poi.is_emblematic && (
            <span style={{ background: '#FFD700', color: '#333', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20 }}>
              ⭐ Emblématique
            </span>
          )}
        </div>

        {/* Bouton fermer */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
          width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>
          ✕
        </button>

        {/* Titre sur photo */}
        <div style={{ position: 'absolute', bottom: 14, left: 16, right: 48 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'white', lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {poi.name}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>
            {poi.city || ''} {poi.governorate ? `— ${poi.governorate}` : ''}
          </div>
        </div>
      </div>

      {/* ── Corps scrollable ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

        {/* Rating + Prix + Distance */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
          <Stars rating={poi.rating} />
          {poi.reviews_count > 0 && (
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>({poi.reviews_count.toLocaleString()} avis)</span>
          )}
          {priceCfg && (
            <span style={{ background: `${priceCfg.c}18`, color: priceCfg.c, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
              {priceCfg.t}
            </span>
          )}
          {poi.entry_fee_tnd != null && poi.entry_fee_tnd > 0 && (
            <span style={{ background: '#FEF9C3', color: '#854D0E', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
              Entrée : {poi.entry_fee_tnd} TND
            </span>
          )}
          {poi.must_see && (
            <span style={{ background: '#FEF9C3', color: '#854D0E', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>
              🏆 Incontournable
            </span>
          )}
        </div>

        {/* Distance */}
        {poi.distance_km != null && (
          <div style={{ background: '#EFF6FF', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 16 }}>
            <span style={{ fontSize: 13, color: '#1D4ED8', fontWeight: 600 }}>📏 {poi.distance_km} km</span>
            {poi.walk_min && <span style={{ fontSize: 13, color: '#6B7280' }}>🚶 ~{poi.walk_min} min à pied</span>}
            {poi.car_min && <span style={{ fontSize: 13, color: '#6B7280' }}>🚗 ~{poi.car_min} min en voiture</span>}
          </div>
        )}

        {/* Description */}
        {poi.description && (
          <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 14 }}>
            {poi.description}
          </div>
        )}

        {/* Coordonnées */}
        <div style={divider}>
          <div style={labelS}>Coordonnées</div>
          {poi.address && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#374151' }}>📍 {poi.address}</span>
              <button
                onClick={() => navigator.clipboard.writeText(poi.address)}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 10, cursor: 'pointer', color: '#6B7280' }}
              >
                📋 Copier
              </button>
            </div>
          )}
          {poi.phone && (
            <a href={`tel:${poi.phone}`} style={{ display: 'flex', gap: 6, textDecoration: 'none', color: '#1565C0', fontSize: 13, marginBottom: 6 }}>
              <span>📞</span><span>{poi.phone}</span>
            </a>
          )}
          {poi.website && (
            <a href={poi.website} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', gap: 6, textDecoration: 'none', color: '#7C3AED', fontSize: 13, marginBottom: 6 }}>
              <span>🌐</span><span>{poi.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
        </div>

        {/* Horaires */}
        {poi.opening_hours && (
          <div style={divider}>
            <div style={labelS}>Horaires</div>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#15803D' }}>
              🕐 {poi.opening_hours}
            </div>
          </div>
        )}

        {/* Features */}
        {enabledFeatures.length > 0 && (
          <div style={divider}>
            <div style={labelS}>Équipements & Services</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {enabledFeatures.map(([key]) => (
                <span key={key} style={{
                  background: '#EFF6FF', color: '#1D4ED8',
                  fontSize: 11, fontWeight: 600, padding: '4px 10px',
                  borderRadius: 20, border: '1px solid #BFDBFE',
                }}>
                  {FEATURE_LABELS[key] || key}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {poi.tags && poi.tags.length > 0 && (
          <div style={divider}>
            <div style={labelS}>Tags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {poi.tags.map(t => (
                <span key={t} style={{ background: '#F3F4F6', color: '#374151', fontSize: 12, padding: '4px 10px', borderRadius: 20 }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Note OSM */}
        {poi.datasource === 'openstreetmap' && (
          <div style={{ ...divider, marginTop: 14 }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>
              Données © <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" style={{ color: '#6B7280' }}>OpenStreetMap</a> contributors
            </div>
          </div>
        )}
      </div>

      {/* ── Footer actions ───────────────────────────────────────────────────── */}
      <div style={{
        padding: '14px 20px', borderTop: '1px solid #F3F4F6',
        display: 'flex', gap: 10, flexShrink: 0, background: 'white',
      }}>
        <button
          onClick={() => onFavorite && onFavorite(poi.id)}
          style={{
            width: 46, padding: '11px',
            background: isFavorite ? '#FEF2F2' : '#F9FAFB',
            color: isFavorite ? '#EF4444' : '#9CA3AF',
            border: `1px solid ${isFavorite ? '#FECACA' : '#E5E7EB'}`,
            borderRadius: 12, cursor: 'pointer', fontSize: 18,
          }}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
        {poi.phone && (
          <a href={`tel:${poi.phone}`} style={{
            flex: 1, textAlign: 'center', padding: '11px',
            background: '#F0FDF4', color: '#16A34A',
            border: '1px solid #BBF7D0', borderRadius: 12,
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}>
            📞 Appeler
          </a>
        )}
        <button onClick={handleNavigate} style={{
          flex: 2, padding: '11px', background: color, color: 'white',
          border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer',
        }}>
          🗺️ S'y rendre
        </button>
      </div>
    </div>
  );
}
