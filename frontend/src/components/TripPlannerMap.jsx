import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// ── All 18 monitored cities with coordinates ───────────────────────────────────
export const CITIES = [
  { id: 'tunis-centre',  name: 'Tunis-Centre',  lat: 36.8065, lng: 10.1815 },
  { id: 'ariana',        name: 'Ariana',         lat: 36.8625, lng: 10.1956 },
  { id: 'ben-arous',     name: 'Ben-Arous',      lat: 36.7545, lng: 10.2189 },
  { id: 'la-marsa',      name: 'La Marsa',       lat: 36.8781, lng: 10.3247 },
  { id: 'sfax',          name: 'Sfax',           lat: 34.7406, lng: 10.7603 },
  { id: 'sousse',        name: 'Sousse',          lat: 35.8256, lng: 10.6084 },
  { id: 'gabes',         name: 'Gabès',          lat: 33.8815, lng: 10.0982 },
  { id: 'bizerte',       name: 'Bizerte',         lat: 37.2744, lng:  9.8739 },
  { id: 'kairouan',      name: 'Kairouan',        lat: 35.6781, lng: 10.0963 },
  { id: 'monastir',      name: 'Monastir',        lat: 35.7643, lng: 10.8113 },
  { id: 'nabeul',        name: 'Nabeul',          lat: 36.4561, lng: 10.7376 },
  { id: 'medenine',      name: 'Médenine',        lat: 33.3549, lng: 10.5055 },
  { id: 'jendouba',      name: 'Jendouba',        lat: 36.5011, lng:  8.7803 },
  { id: 'gafsa',         name: 'Gafsa',           lat: 34.4250, lng:  8.7842 },
  { id: 'mahdia',        name: 'Mahdia',           lat: 35.5047, lng: 11.0622 },
  { id: 'tozeur',        name: 'Tozeur',           lat: 33.9197, lng:  8.1335 },
  { id: 'beja',          name: 'Béja',            lat: 36.7256, lng:  9.1817 },
  { id: 'siliana',       name: 'Siliana',          lat: 36.0844, lng:  9.3708 },
];

// ── Icon factory (copied from CityMap.jsx — no import dependency) ─────────────
const createEmojiIcon = (emoji, bg = '#3B82F6') => {
  return L.divIcon({
    html: `
      <div style="
        width: 32px; height: 32px; border-radius: 50%;
        background: ${bg}; border: 2px solid #FFF;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35); font-size: 15px;
      ">
        ${emoji}
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createCityIcon = (color, label) => {
  return L.divIcon({
    html: `
      <div style="
        padding: 4px 8px; border-radius: 20px;
        background: ${color}; border: 2px solid #FFF;
        color: #FFF; font-size: 11px; font-weight: 700;
        white-space: nowrap; font-family: system-ui, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        display: flex; align-items: center; gap: 4px;
      ">
        📍 ${label}
      </div>
    `,
    className: '',
    iconSize: [null, 24],
    iconAnchor: [0, 12],
  });
};

// ── Helper: auto-fit map bounds when route changes ────────────────────────────
const FitBounds = ({ origin, destination }) => {
  const map = useMap();
  useEffect(() => {
    if (origin && destination) {
      const bounds = L.latLngBounds(
        [origin.lat, origin.lng],
        [destination.lat, destination.lng]
      );
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 12 });
    } else if (origin) {
      map.setView([origin.lat, origin.lng], 11);
    }
  }, [origin, destination, map]);
  return null;
};

// ── Midpoint distance label overlay ──────────────────────────────────────────
const DistanceLabel = ({ origin, destination, distanceKm }) => {
  const map = useMap();
  const labelRef = useRef(null);

  useEffect(() => {
    if (labelRef.current) {
      labelRef.current.remove();
      labelRef.current = null;
    }
    if (!origin || !destination || !distanceKm) return;

    const midLat = (origin.lat + destination.lat) / 2;
    const midLng = (origin.lng + destination.lng) / 2;

    const div = L.divIcon({
      html: `
        <div style="
          background: rgba(15,23,42,0.92); color: #FFF;
          padding: 6px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 700;
          font-family: system-ui, sans-serif;
          border: 1px solid rgba(255,255,255,0.2);
          white-space: nowrap;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          pointer-events: none;
        ">
          📏 ~${distanceKm.toFixed(0)} km (estimation route ×1.3)
        </div>
      `,
      className: '',
      iconAnchor: [60, 12],
    });

    const marker = L.marker([midLat, midLng], { icon: div, interactive: false });
    marker.addTo(map);
    labelRef.current = marker;

    return () => {
      if (labelRef.current) {
        labelRef.current.remove();
        labelRef.current = null;
      }
    };
  }, [origin, destination, distanceKm, map]);

  return null;
};

// ── Main Component ────────────────────────────────────────────────────────────
const TripPlannerMap = ({ originId, destinationId, distanceKm, onCitySelect }) => {
  const origin = CITIES.find(c => c.id === originId) || null;
  const destination = CITIES.find(c => c.id === destinationId) || null;

  const mapCenter = [35.5, 10.0]; // Tunisia center

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '420px',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      {/* ── Legend overlay ─────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '12px',
        color: '#CBD5E1',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981' }} />
          Départ
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
          Arrivée
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#64748B' }} />
          Cliquer pour sélectionner
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={6}
        style={{ width: '100%', height: '100%' }}
        key="trip-planner-map"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fit map to route */}
        <FitBounds origin={origin} destination={destination} />

        {/* Distance label on midpoint */}
        {origin && destination && (
          <DistanceLabel origin={origin} destination={destination} distanceKm={distanceKm} />
        )}

        {/* Route polyline */}
        {origin && destination && (
          <Polyline
            positions={[
              [origin.lat, origin.lng],
              [destination.lat, destination.lng],
            ]}
            pathOptions={{
              color: '#3B82F6',
              weight: 4,
              opacity: 0.85,
              dashArray: '10, 6',
            }}
          />
        )}

        {/* All 18 city markers */}
        {CITIES.map((city) => {
          const isOrigin = city.id === originId;
          const isDest = city.id === destinationId;
          const iconBg = isOrigin ? '#10B981' : isDest ? '#F59E0B' : '#475569';
          const emoji = isOrigin ? '🟢' : isDest ? '🟡' : '📍';

          return (
            <Marker
              key={city.id}
              position={[city.lat, city.lng]}
              icon={createEmojiIcon(emoji, iconBg)}
              eventHandlers={{
                click: () => {
                  if (onCitySelect) onCitySelect(city.id);
                },
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'system-ui, sans-serif', padding: '4px', minWidth: '160px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: iconBg, fontWeight: '700' }}>
                    {isOrigin ? '🟢 Départ' : isDest ? '🟡 Arrivée' : '📍'} {city.name}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#475569' }}>
                    <span>🌐 {city.lat.toFixed(4)}°N, {city.lng.toFixed(4)}°E</span>
                    {!isOrigin && (
                      <button
                        onClick={() => onCitySelect && onCitySelect(city.id)}
                        style={{
                          marginTop: '6px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          background: '#3B82F6',
                          color: '#FFF',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        Sélectionner comme destination
                      </button>
                    )}
                    {!isDest && (
                      <button
                        onClick={() => onCitySelect && onCitySelect(city.id, true)}
                        style={{
                          marginTop: '4px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          background: '#10B981',
                          color: '#FFF',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        Sélectionner comme départ
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default TripPlannerMap;
