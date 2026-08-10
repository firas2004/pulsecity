import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// ── Type config ───────────────────────────────────────────────────────────────
export const TYPE_CONFIG = {
  chu:                   { emoji: '🏥', color: '#D32F2F', label: 'CHU',               size: 32 },
  hopital_regional:      { emoji: '🏥', color: '#F44336', label: 'Hôpital Régional',  size: 28 },
  hopital_circonscription:{ emoji: '🏥', color: '#EF5350', label: 'Hôpital',          size: 26 },
  clinique:              { emoji: '🏥', color: '#7B1FA2', label: 'Clinique',           size: 26 },
  centre_sante:          { emoji: '🩺', color: '#388E3C', label: 'CSB',               size: 22 },
  institut_specialise:   { emoji: '🔬', color: '#1565C0', label: 'Institut',          size: 26 },
  centre_specialise:     { emoji: '🔬', color: '#0D47A1', label: 'Centre Spécialisé', size: 24 },
  centre_dialyse:        { emoji: '🩸', color: '#C62828', label: 'Dialyse',           size: 22 },
  laboratoire:           { emoji: '🧪', color: '#F57C00', label: 'Laboratoire',       size: 22 },
  pharmacie:             { emoji: '💊', color: '#2E7D32', label: 'Pharmacie',         size: 22 },
};

const DEFAULT_TYPE = { emoji: '📍', color: '#546E7A', label: 'Établissement', size: 24 };

const createHealthIcon = (type, isSelected = false) => {
  const cfg = TYPE_CONFIG[type] || DEFAULT_TYPE;
  const size = isSelected ? cfg.size + 8 : cfg.size;
  const border = isSelected ? '3px solid #FFF' : '2px solid rgba(255,255,255,0.85)';
  const shadow = isSelected
    ? `0 0 0 3px ${cfg.color}, 0 6px 20px rgba(0,0,0,0.4)`
    : '0 3px 10px rgba(0,0,0,0.3)';
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${cfg.color};border:${border};display:flex;align-items:center;justify-content:center;box-shadow:${shadow};font-size:${size * 0.45}px;transition:all 0.2s;">${cfg.emoji}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const createUserIcon = () => L.divIcon({
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#3B82F6;border:3px solid #FFF;box-shadow:0 0 0 3px rgba(59,130,246,0.4),0 4px 12px rgba(0,0,0,0.3);animation:pulse-blue 2s infinite;"></div>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// ── FitBounds to markers ──────────────────────────────────────────────────────
const FitToMarkers = ({ establishments, userLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (establishments.length === 0) return;
    const pts = establishments.map(e => [e.lat, e.lng]);
    if (userLocation) pts.push([userLocation.lat, userLocation.lng]);
    const bounds = L.latLngBounds(pts);
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [establishments.length, userLocation, map]);
  return null;
};

// ── Layer Toggle Bar ──────────────────────────────────────────────────────────
const LayerToggleBar = ({ visible, onToggle }) => (
  <div style={{
    position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
    zIndex: 1000, display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center',
    background: 'rgba(15,23,42,0.90)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '30px', padding: '5px 10px',
    maxWidth: '95%',
  }}>
    {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
      <button
        key={type}
        onClick={() => onToggle(type)}
        title={visible[type] ? `Masquer ${cfg.label}` : `Afficher ${cfg.label}`}
        style={{
          padding: '4px 9px', borderRadius: '20px', border: 'none', cursor: 'pointer',
          background: visible[type] ? cfg.color : 'rgba(255,255,255,0.1)',
          color: '#FFF', fontSize: '10px', fontWeight: '700', whiteSpace: 'nowrap',
          transition: 'all 0.2s',
          boxShadow: visible[type] ? `0 2px 8px ${cfg.color}66` : 'none',
        }}
      >
        {cfg.emoji} {cfg.label}
      </button>
    ))}
  </div>
);

// ── Main HealthMap Component ──────────────────────────────────────────────────
const HealthMap = ({
  establishments = [],
  selectedId = null,
  onSelect,
  userLocation = null,
  searchRadius = 0,
}) => {
  const [visibleTypes, setVisibleTypes] = useState(() => {
    const init = {};
    Object.keys(TYPE_CONFIG).forEach(t => { init[t] = true; });
    return init;
  });

  const toggleType = (type) =>
    setVisibleTypes(prev => ({ ...prev, [type]: !prev[type] }));

  const filteredEstablishments = establishments.filter(e => visibleTypes[e.type]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
      <LayerToggleBar visible={visibleTypes} onToggle={toggleType} />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: '12px', right: '12px', zIndex: 1000,
        background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
        padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px',
        fontSize: '10px', color: '#CBD5E1', maxWidth: '150px',
      }}>
        {Object.entries(TYPE_CONFIG).slice(0, 5).map(([type, cfg]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
            {cfg.label}
          </div>
        ))}
      </div>

      <MapContainer
        center={[36.0, 9.5]}
        zoom={6}
        style={{ width: '100%', height: '100%' }}
        key="health-map"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitToMarkers establishments={filteredEstablishments} userLocation={userLocation} />

        {/* User location + search radius */}
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
              <Popup><div style={{ fontFamily: 'system-ui', fontWeight: '700', color: '#3B82F6' }}>📍 Votre position</div></Popup>
            </Marker>
            {searchRadius > 0 && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={searchRadius * 1000}
                pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.06, weight: 2, dashArray: '6,4' }}
              />
            )}
          </>
        )}

        {/* Establishment markers */}
        {filteredEstablishments.map(e => {
          const cfg = TYPE_CONFIG[e.type] || DEFAULT_TYPE;
          const isSelected = e.id === selectedId;
          return (
            <Marker
              key={e.id}
              position={[e.lat, e.lng]}
              icon={createHealthIcon(e.type, isSelected)}
              eventHandlers={{ click: () => onSelect && onSelect(e) }}
              zIndexOffset={isSelected ? 1000 : 0}
            >
              <Popup>
                <div style={{ fontFamily: 'system-ui', padding: '4px', minWidth: '180px' }}>
                  <div style={{ fontWeight: '800', color: cfg.color, fontSize: '13px', marginBottom: '6px' }}>
                    {cfg.emoji} {e.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span>📍 {e.address}</span>
                    {e.phone && <a href={`tel:${e.phone}`} style={{ color: '#3B82F6' }}>📞 {e.phone}</a>}
                    {e.distance_km != null && <span>📏 {e.distance_km} km</span>}
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {e.has_emergency && <span style={{ background: '#D32F2F', color: '#FFF', borderRadius: '10px', padding: '2px 7px', fontSize: '9px', fontWeight: '700' }}>🚨 Urgences</span>}
                    {e.cnam_convention && <span style={{ background: '#388E3C', color: '#FFF', borderRadius: '10px', padding: '2px 7px', fontSize: '9px', fontWeight: '700' }}>✅ CNAM</span>}
                  </div>
                  {onSelect && (
                    <button
                      onClick={() => onSelect(e)}
                      style={{ marginTop: '8px', width: '100%', padding: '5px', borderRadius: '8px', background: cfg.color, color: '#FFF', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                      📋 Voir la fiche
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style>{`@keyframes pulse-blue { 0%,100%{box-shadow:0 0 0 3px rgba(59,130,246,0.4),0 4px 12px rgba(0,0,0,0.3)} 50%{box-shadow:0 0 0 6px rgba(59,130,246,0.2),0 4px 12px rgba(0,0,0,0.3)} }`}</style>
    </div>
  );
};

export default HealthMap;
