import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, LayerGroup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Config catégories ──────────────────────────────────────────────────────
const CAT = {
  restaurant:        { color: '#E65100', emoji: '🍽️', size: 30 },
  cafe:              { color: '#6D4C41', emoji: '☕',  size: 28 },
  bar:               { color: '#7B1FA2', emoji: '🍸', size: 26 },
  fast_food:         { color: '#F57C00', emoji: '🍔', size: 24 },
  patisserie:        { color: '#C2185B', emoji: '🧁', size: 24 },
  boulangerie:       { color: '#EF6C00', emoji: '🥖', size: 22 },
  coworking:         { color: '#1565C0', emoji: '💻', size: 28 },
  parc:              { color: '#2E7D32', emoji: '🌳', size: 28 },
  plage:             { color: '#0277BD', emoji: '🏖️', size: 32 },
  musee:             { color: '#5D4037', emoji: '🏛️', size: 28 },
  cinema:            { color: '#C62828', emoji: '🎬', size: 28 },
  souk:              { color: '#F9A825', emoji: '🛍️', size: 28 },
  centre_commercial: { color: '#455A64', emoji: '🏬', size: 30 },
  hotel:             { color: '#00838F', emoji: '🏨', size: 28 },
  salle_sport:       { color: '#D84315', emoji: '🏋️', size: 24 },
  bibliotheque:      { color: '#37474F', emoji: '📚', size: 24 },
  monument:          { color: '#6A1B9A', emoji: '🗿', size: 32 },
  mosquee:           { color: '#1B5E20', emoji: '🕌', size: 30 },
  galerie_art:       { color: '#AD1457', emoji: '🎨', size: 26 },
  theatre:           { color: '#880E4F', emoji: '🎭', size: 26 },
  spa:               { color: '#00695C', emoji: '🧖', size: 26 },
  banque:            { color: '#1565C0', emoji: '🏦', size: 24 },
  pharmacie:         { color: '#2E7D32', emoji: '💊', size: 22 },
  station_essence:   { color: '#212121', emoji: '⛽', size: 20 },
  atm:               { color: '#37474F', emoji: '🏧', size: 20 },
  tourisme:          { color: '#6A1B9A', emoji: '📸', size: 32 },
  oasis:             { color: '#2E7D32', emoji: '🌴', size: 30 },
};

function makePoiIcon(category, isSelected = false, isEmblematic = false) {
  const cfg = CAT[category] || { color: '#607D8B', emoji: '📍', size: 26 };
  const size = isSelected ? cfg.size + 10 : isEmblematic ? cfg.size + 4 : cfg.size;
  const border = isSelected ? '3px solid white' : isEmblematic ? '2px solid gold' : '2px solid rgba(255,255,255,0.85)';
  const shadow = isSelected
    ? `0 0 0 3px ${cfg.color}90, 0 6px 20px rgba(0,0,0,0.5)`
    : isEmblematic
    ? `0 0 0 2px gold, 0 4px 12px rgba(0,0,0,0.3)`
    : '0 2px 8px rgba(0,0,0,0.3)';

  const html = `
    <div style="position:relative;">
      <div style="
        width:${size}px;height:${size}px;
        background:${cfg.color};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:${border};
        box-shadow:${shadow};
        display:flex;align-items:center;justify-content:center;
        transition:all 0.2s;
      ">
        <span style="transform:rotate(45deg);font-size:${Math.round(size * 0.44)}px;line-height:1;">
          ${cfg.emoji}
        </span>
      </div>
      ${isEmblematic ? `<div style="position:absolute;top:-6px;right:-6px;background:gold;color:#333;font-size:8px;font-weight:900;padding:1px 4px;border-radius:6px;white-space:nowrap;">⭐</div>` : ''}
    </div>`;

  return L.divIcon({
    className: '',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -(size + 4)],
  });
}

function FitBounds({ pois }) {
  const map = useMap();
  useEffect(() => {
    if (!pois || pois.length === 0) return;
    const pts = pois.filter(p => p.lat && p.lng).map(p => [p.lat, p.lng]);
    if (pts.length > 0) {
      map.fitBounds(pts, { padding: [40, 40], maxZoom: 14, animate: true });
    }
  }, [pois, map]);
  return null;
}

function CenterOn({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 15, { animate: true });
  }, [lat, lng, map]);
  return null;
}

// ── Composant carte principal ─────────────────────────────────────────────────
export default function POIMap({
  pois = [],
  selectedId = null,
  onSelect,
  onNavigate,
  userPosition = null,
  radius = null,
  filterCategory = null,
  centerLat = null,
  centerLng = null,
}) {
  const filtered = filterCategory
    ? pois.filter(p => p.category === filterCategory)
    : pois;

  return (
    <MapContainer
      center={[33.8, 9.5]}
      zoom={6}
      style={{ height: '100%', width: '100%', borderRadius: '16px' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <ZoomControl position="topright" />

      {centerLat && centerLng && <CenterOn lat={centerLat} lng={centerLng} />}
      {!centerLat && filtered.length > 0 && filtered.length < 300 && (
        <FitBounds pois={filtered} />
      )}

      {/* Cercle de rayon autour de l'utilisateur */}
      {userPosition && radius && (
        <Circle
          center={[userPosition.lat, userPosition.lng]}
          radius={radius * 1000}
          pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.08, weight: 2 }}
        />
      )}

      {/* Marqueur position utilisateur */}
      {userPosition && (
        <Marker
          position={[userPosition.lat, userPosition.lng]}
          icon={L.divIcon({
            className: '',
            html: `<div style="width:16px;height:16px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 3px #3B82F680;"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        >
          <Popup><strong>📍 Votre position</strong></Popup>
        </Marker>
      )}

      <LayerGroup>
        {filtered.map(poi => (
          <Marker
            key={poi.id}
            position={[poi.lat, poi.lng]}
            icon={makePoiIcon(poi.category, poi.id === selectedId, poi.is_emblematic)}
            eventHandlers={{ click: () => onSelect && onSelect(poi) }}
          >
            <Popup maxWidth={300} className="poi-popup">
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 230 }}>
                {/* Photo miniature */}
                <div style={{
                  width: '100%', height: 100,
                  background: `url("${poi.photo_url}") center/cover`,
                  borderRadius: '8px 8px 0 0', marginBottom: 10,
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', bottom: 6, left: 6,
                    background: (CAT[poi.category] || {}).color || '#607D8B',
                    color: 'white', borderRadius: 6, padding: '2px 8px',
                    fontSize: 10, fontWeight: 700,
                  }}>
                    {(CAT[poi.category] || {}).emoji} {poi.category_label || poi.category}
                  </div>
                  {poi.is_emblematic && (
                    <div style={{
                      position: 'absolute', top: 6, right: 6,
                      background: '#FFD700', color: '#333',
                      borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 800,
                    }}>
                      ⭐ Emblématique
                    </div>
                  )}
                </div>

                {/* Nom + rating */}
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1A1A2E', marginBottom: 4 }}>
                  {poi.name}
                </div>

                {poi.rating && (
                  <div style={{ fontSize: 12, color: '#F59E0B', marginBottom: 4 }}>
                    {'★'.repeat(Math.round(poi.rating))}{'☆'.repeat(5 - Math.round(poi.rating))}
                    <span style={{ color: '#6B7280', marginLeft: 4 }}>
                      {poi.rating} ({poi.reviews_count?.toLocaleString()} avis)
                    </span>
                  </div>
                )}

                {poi.address && (
                  <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>📍 {poi.address}</div>
                )}
                {poi.distance_km != null && (
                  <div style={{ fontSize: 11, color: '#6366F1', marginBottom: 8, fontWeight: 600 }}>
                    📏 {poi.distance_km} km — ~{poi.walk_min} min à pied
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => onSelect && onSelect(poi)} style={{
                    flex: 1, padding: '7px 4px', fontSize: 11, fontWeight: 700,
                    background: (CAT[poi.category] || {}).color || '#607D8B',
                    color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
                  }}>
                    📋 Détails
                  </button>
                  <button onClick={() => onNavigate && onNavigate(poi)} style={{
                    flex: 1, padding: '7px 4px', fontSize: 11, fontWeight: 700,
                    background: '#F59E0B', color: 'white', border: 'none',
                    borderRadius: 8, cursor: 'pointer',
                  }}>
                    🗺️ Y aller
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </LayerGroup>
    </MapContainer>
  );
}
