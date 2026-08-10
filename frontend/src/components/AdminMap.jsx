import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Couleurs & config par type ────────────────────────────────────────────────
const TYPE_CONFIG = {
  gouvernorat:       { color: '#0D47A1', emoji: '🏰', label: 'Gouvernorat',        size: 38 },
  municipalite:      { color: '#1565C0', emoji: '🏛️', label: 'Municipalité',       size: 32 },
  delegation:        { color: '#1976D2', emoji: '🏢', label: 'Délégation',          size: 28 },
  poste:             { color: '#F57C00', emoji: '📮', label: 'Bureau de Poste',     size: 28 },
  cnss:              { color: '#388E3C', emoji: '🛡️', label: 'CNSS',               size: 28 },
  cnam:              { color: '#2E7D32', emoji: '💳', label: 'CNAM',               size: 28 },
  ministere:         { color: '#6A1B9A', emoji: '🏛️', label: 'Ministère',          size: 34 },
  police:            { color: '#C62828', emoji: '👮', label: 'Police',             size: 28 },
  tribunal:          { color: '#455A64', emoji: '⚖️', label: 'Tribunal',           size: 28 },
  service_exterieur: { color: '#5D4037', emoji: '📋', label: 'Service Extérieur',  size: 24 },
};

// ── Crée un icône SVG custom Leaflet ─────────────────────────────────────────
function makeIcon(type, isSelected = false) {
  const cfg = TYPE_CONFIG[type] || { color: '#607D8B', emoji: '🏢', size: 26 };
  const size = isSelected ? cfg.size + 8 : cfg.size;
  const border = isSelected ? '3px solid white' : '2px solid rgba(255,255,255,0.8)';
  const shadow = isSelected
    ? `0 0 0 3px ${cfg.color}80, 0 4px 16px rgba(0,0,0,0.4)`
    : '0 2px 8px rgba(0,0,0,0.3)';

  const svg = `
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
      <span style="transform:rotate(45deg);font-size:${Math.round(size*0.45)}px;line-height:1;">
        ${cfg.emoji}
      </span>
    </div>`;

  return L.divIcon({
    className: '',
    html: svg,
    iconSize:   [size, size],
    iconAnchor: [size/2, size],
    popupAnchor:[0, -(size+4)],
  });
}

// ── FitBounds helper ──────────────────────────────────────────────────────────
function FitBoundsHelper({ establishments }) {
  const map = useMap();
  useEffect(() => {
    if (!establishments || establishments.length === 0) return;
    const pts = establishments.filter(e => e.lat && e.lng).map(e => [e.lat, e.lng]);
    if (pts.length > 0) {
      map.fitBounds(pts, { padding: [40, 40], maxZoom: 14, animate: true });
    }
  }, [establishments, map]);
  return null;
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function AdminMap({
  establishments = [],
  selectedId = null,
  onSelect,
  onNavigate,
  visibleTypes,
  centerOn = null,
}) {
  const tunisiaCenter = [33.8, 9.5];
  const defaultZoom   = 6;

  const filtered = establishments.filter(e => {
    if (!visibleTypes || visibleTypes.size === 0) return true;
    return visibleTypes.has(e.type);
  });

  return (
    <MapContainer
      center={tunisiaCenter}
      zoom={defaultZoom}
      style={{ height: '100%', width: '100%', borderRadius: '16px' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <ZoomControl position="topright" />

      {centerOn && (
        <FitBoundsHelper establishments={[centerOn]} />
      )}
      {!centerOn && filtered.length > 0 && filtered.length < 200 && (
        <FitBoundsHelper establishments={filtered} />
      )}

      <LayerGroup>
        {filtered.map(e => (
          <Marker
            key={e.id}
            position={[e.lat, e.lng]}
            icon={makeIcon(e.type, e.id === selectedId)}
            eventHandlers={{
              click: () => onSelect && onSelect(e),
            }}
          >
            <Popup className="admin-popup" maxWidth={300}>
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    background: (TYPE_CONFIG[e.type] || {}).color || '#607D8B',
                    color: 'white',
                    borderRadius: 8,
                    padding: '2px 8px',
                    fontSize: 11,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}>
                    {(TYPE_CONFIG[e.type] || {}).emoji} {e.type_label || e.type}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>
                  {e.name}
                </div>
                {e.address && (
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                    📍 {e.address}
                  </div>
                )}
                {e.opening_hours && (
                  <div style={{ fontSize: 12, color: '#388E3C', marginBottom: 6 }}>
                    🕐 {e.opening_hours}
                  </div>
                )}
                {e.phone && e.phone !== '197' && (
                  <div style={{ fontSize: 12, color: '#1565C0', marginBottom: 8 }}>
                    📞 {e.phone}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button
                    onClick={() => onSelect && onSelect(e)}
                    style={{
                      flex: 1, padding: '6px 8px', fontSize: 11, fontWeight: 600,
                      background: '#1565C0', color: 'white', border: 'none',
                      borderRadius: 8, cursor: 'pointer',
                    }}
                  >
                    📋 Détails
                  </button>
                  <button
                    onClick={() => onNavigate && onNavigate(e)}
                    style={{
                      flex: 1, padding: '6px 8px', fontSize: 11, fontWeight: 600,
                      background: '#F57C00', color: 'white', border: 'none',
                      borderRadius: 8, cursor: 'pointer',
                    }}
                  >
                    🗺️ Itinéraire
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
