import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CAT_COLORS = {
  restaurant: '#E65100', cafe: '#6D4C41', bar: '#7B1FA2', fast_food: '#F57C00',
  patisserie: '#C2185B', boulangerie: '#EF6C00', coworking: '#1565C0',
  parc: '#2E7D32', plage: '#0277BD', musee: '#5D4037', cinema: '#C62828',
  souk: '#F9A825', centre_commercial: '#455A64', hotel: '#00838F',
  salle_sport: '#D84315', bibliotheque: '#37474F', monument: '#6A1B9A',
  mosquee: '#1B5E20', galerie_art: '#AD1457', theatre: '#880E4F',
  spa: '#00695C', tourisme: '#6A1B9A', oasis: '#2E7D32',
};
const CAT_EMOJI = {
  restaurant: '🍽️', cafe: '☕', bar: '🍸', fast_food: '🍔', patisserie: '🧁',
  boulangerie: '🥖', coworking: '💻', parc: '🌳', plage: '🏖️', musee: '🏛️',
  cinema: '🎬', souk: '🛍️', centre_commercial: '🏬', hotel: '🏨',
  salle_sport: '🏋️', bibliotheque: '📚', monument: '🗿', mosquee: '🕌',
  galerie_art: '🎨', theatre: '🎭', spa: '🧖', tourisme: '📸', oasis: '🌴',
};

function PriceLabel({ level }) {
  if (level == null) return null;
  const labels = { 0: { t: 'Gratuit', c: '#16A34A' }, 1: { t: '€', c: '#D97706' }, 2: { t: '€€', c: '#EA580C' }, 3: { t: '€€€', c: '#DC2626' } };
  const l = labels[level] || {};
  return (
    <span style={{ background: `${l.c}18`, color: l.c, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>
      {l.t}
    </span>
  );
}

function Stars({ rating }) {
  if (!rating) return null;
  const full = Math.round(rating);
  return (
    <span style={{ fontSize: 11 }}>
      <span style={{ color: '#F59E0B' }}>{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>
      <span style={{ color: '#9CA3AF', marginLeft: 3 }}>{rating}</span>
    </span>
  );
}

export default function POICard({ poi, isSelected = false, onClick, onNavigate, onFavorite, isFavorite = false }) {
  const navigate = useNavigate();
  const color = CAT_COLORS[poi.category] || '#607D8B';
  const emoji = CAT_EMOJI[poi.category] || '📍';

  const handleNavigate = (e) => {
    e.stopPropagation();
    if (onNavigate) { onNavigate(poi); return; }
    navigate(`/client/trajet?to_lat=${poi.lat}&to_lng=${poi.lng}&to_name=${encodeURIComponent(poi.name)}`);
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? '#F0F9FF' : 'white',
        border: isSelected ? `2px solid ${color}` : '1px solid #E8EDF2',
        borderRadius: 16, padding: '12px 14px', cursor: 'pointer',
        transition: 'all 0.2s', marginBottom: 10,
        boxShadow: isSelected ? `0 4px 20px ${color}25` : '0 1px 4px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={ev => { if (!isSelected) ev.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; }}
      onMouseLeave={ev => { if (!isSelected) ev.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
    >
      <div style={{ display: 'flex', gap: 10 }}>
        {/* Photo */}
        <div style={{
          width: 72, height: 72, minWidth: 72, borderRadius: 12, overflow: 'hidden',
          background: `url("${poi.photo_url}") center/cover`,
          position: 'relative',
        }}>
          {poi.is_emblematic && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
              color: '#FFD700', fontSize: 9, fontWeight: 800, textAlign: 'center', padding: '4px 2px',
            }}>
              ⭐ Emblématique
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{
              background: `${color}18`, color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
            }}>
              {emoji} {poi.category_label || poi.category}
            </span>
            <PriceLabel level={poi.price_level} />
            {poi.must_see && (
              <span style={{ background: '#FEF9C3', color: '#854D0E', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 20 }}>
                🏆 Incontournable
              </span>
            )}
          </div>

          {/* Nom */}
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A2E', lineHeight: 1.3, marginBottom: 2 }}>
            {poi.name}
          </div>

          {/* Rating + avis */}
          <div style={{ marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Stars rating={poi.rating} />
            {poi.reviews_count > 0 && (
              <span style={{ fontSize: 10, color: '#9CA3AF' }}>({poi.reviews_count.toLocaleString()})</span>
            )}
          </div>

          {/* Ville + Distance */}
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            📍 {poi.city || poi.governorate}
            {poi.distance_km != null && (
              <span style={{ color: '#6366F1', fontWeight: 600, marginLeft: 8 }}>
                {poi.distance_km} km
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Features chips */}
      {poi.features && Object.keys(poi.features).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {poi.features.wifi && <Chip>📶 WiFi</Chip>}
          {poi.features.terrace && <Chip>🌿 Terrasse</Chip>}
          {poi.features.halal && <Chip>✅ Halal</Chip>}
          {poi.features.parking && <Chip>🅿️</Chip>}
          {poi.features.view && <Chip>🌅 Vue</Chip>}
          {poi.features.reservation && <Chip>📅 Résa</Chip>}
        </div>
      )}

      {/* Tags */}
      {poi.tags && poi.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
          {poi.tags.slice(0, 3).map(t => (
            <span key={t} style={{ background: '#F3F4F6', color: '#374151', fontSize: 10, padding: '2px 7px', borderRadius: 20 }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        {poi.phone && (
          <a href={`tel:${poi.phone}`} onClick={ev => ev.stopPropagation()} style={{
            flex: 1, textAlign: 'center', padding: '7px 4px', fontSize: 11, fontWeight: 600,
            background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0',
            borderRadius: 10, textDecoration: 'none',
          }}>
            📞
          </a>
        )}
        <button onClick={handleNavigate} style={{
          flex: 2, padding: '7px 8px', fontSize: 11, fontWeight: 700,
          background: '#FFF7ED', color: '#D97706', border: '1px solid #FDE68A',
          borderRadius: 10, cursor: 'pointer',
        }}>
          🗺️ Itinéraire
        </button>
        <button
          onClick={ev => { ev.stopPropagation(); onFavorite && onFavorite(poi.id); }}
          style={{
            flex: 1, padding: '7px 4px', fontSize: 13,
            background: isFavorite ? '#FEF2F2' : '#F9FAFB',
            color: isFavorite ? '#EF4444' : '#9CA3AF',
            border: `1px solid ${isFavorite ? '#FECACA' : '#E5E7EB'}`,
            borderRadius: 10, cursor: 'pointer',
          }}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span style={{
      background: '#EFF6FF', color: '#1D4ED8', fontSize: 10, fontWeight: 600,
      padding: '2px 7px', borderRadius: 20, border: '1px solid #BFDBFE',
    }}>
      {children}
    </span>
  );
}
