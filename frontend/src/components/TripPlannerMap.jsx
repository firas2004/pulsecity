import React, { useEffect, useRef, useState } from 'react';
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

// ── Infrastructure static data ─────────────────────────────────────────────────
const METRO_STATIONS_SAMPLE = [
  { id: 'barcelone', name: 'Place de Barcelone', lat: 36.7990, lng: 10.1825, line: 'L1/L4/L5', type: 'metro' },
  { id: 'republique', name: 'Place de la République', lat: 36.8015, lng: 10.1800, line: 'L2/L4/L5', type: 'metro' },
  { id: 'tunis-marine', name: 'Tunis Marine', lat: 36.8020, lng: 10.1790, line: 'L3/L6 + TGM', type: 'metro' },
  { id: 'bab-saadoun-m', name: 'Bab Saadoun', lat: 36.8060, lng: 10.1700, line: 'L3/L4/L5', type: 'metro' },
  { id: 'bardo-m', name: 'Le Bardo', lat: 36.8095, lng: 10.1345, line: 'L4 + RFR D', type: 'metro' },
  { id: 'intilaka-m', name: 'Intilaka', lat: 36.7900, lng: 10.1400, line: 'L5', type: 'metro' },
  { id: 'ben-arous-m', name: 'Ben Arous', lat: 36.7545, lng: 10.2189, line: 'L1', type: 'metro' },
  { id: 'ariana-m', name: 'Ariana', lat: 36.8400, lng: 10.1960, line: 'L2', type: 'metro' },
  { id: 'kheireddine-m', name: 'Kheireddine', lat: 36.8080, lng: 10.1200, line: 'L4', type: 'metro' },
  { id: 'el-mourouj4-m', name: 'El Mourouj 4', lat: 36.7590, lng: 10.2050, line: 'L6', type: 'metro' },
];

const TGM_STATIONS_SAMPLE = [
  { id: 'tgm-marine', name: 'Tunis Marine (TGM)', lat: 36.8020, lng: 10.1790, type: 'tgm' },
  { id: 'tgm-cherguia', name: 'Cherguia', lat: 36.8200, lng: 10.2100, type: 'tgm' },
  { id: 'tgm-el-aouina', name: 'El Aouina', lat: 36.8440, lng: 10.2270, type: 'tgm' },
  { id: 'tgm-sidi-daoud', name: 'Sidi Daoud', lat: 36.8600, lng: 10.2500, type: 'tgm' },
  { id: 'tgm-marsa', name: 'La Marsa Plage', lat: 36.8781, lng: 10.3247, type: 'tgm' },
];

const RFR_STATIONS_SAMPLE = [
  { id: 'rfr-tunis', name: 'Gare de Tunis (RFR D&E)', lat: 36.7991, lng: 10.1819, line: 'D + E', type: 'rfr' },
  { id: 'rfr-bardo', name: 'Le Bardo', lat: 36.8095, lng: 10.1345, line: 'D', type: 'rfr' },
  { id: 'rfr-manouba', name: 'Manouba', lat: 36.8085, lng: 10.1015, line: 'D', type: 'rfr' },
  { id: 'rfr-gobaa', name: 'Gobâa 2 (terminus)', lat: 36.8038, lng: 10.0650, line: 'D', type: 'rfr' },
  { id: 'rfr-sidi-hassine', name: 'Bougatfa-Sidi Hassine (terminus)', lat: 36.7780, lng: 10.1020, line: 'E', type: 'rfr' },
];

const LOUAGE_STATIONS_SAMPLE = [
  { id: 'bab-saadoun-l', name: 'Station Bab Saadoun', lat: 36.8095, lng: 10.1645, type: 'louage', dest: 'Nord & Nord-Ouest' },
  { id: 'moncef-bey-l', name: 'Station Moncef Bey', lat: 36.7985, lng: 10.1815, type: 'louage', dest: 'Centre & Sud' },
  { id: 'bab-alioua-l', name: 'Station Bab Alioua', lat: 36.7895, lng: 10.1815, type: 'louage', dest: 'Cap Bon' },
  { id: 'sfax-l', name: 'Station Louage Sfax', lat: 34.7406, lng: 10.7603, type: 'louage', dest: 'Sud' },
  { id: 'sousse-l', name: 'Station Louage Sousse', lat: 35.8256, lng: 10.6084, type: 'louage', dest: 'Sahel' },
];

const AIRPORTS_SAMPLE = [
  { id: 'TUN', name: 'Aéroport Tunis-Carthage', lat: 36.8510, lng: 10.2272, iata: 'TUN', type: 'airport' },
  { id: 'DJE', name: 'Aéroport Djerba-Zarzis', lat: 33.8750, lng: 10.7755, iata: 'DJE', type: 'airport' },
  { id: 'MIR', name: 'Aéroport Monastir', lat: 35.7580, lng: 10.7547, iata: 'MIR', type: 'airport' },
  { id: 'NBE', name: 'Aéroport Enfidha', lat: 36.0758, lng: 10.4386, iata: 'NBE', type: 'airport' },
  { id: 'SFA', name: 'Aéroport Sfax', lat: 34.7179, lng: 10.6909, iata: 'SFA', type: 'airport' },
  { id: 'TOE', name: 'Aéroport Tozeur', lat: 33.9397, lng: 8.1106, iata: 'TOE', type: 'airport' },
];

const SNCFT_STATIONS_SAMPLE = [
  { id: 'sncft-tunis', name: 'Gare de Tunis (SNCFT)', lat: 36.7991, lng: 10.1819, type: 'sncft' },
  { id: 'sncft-sousse', name: 'Gare de Sousse', lat: 35.8256, lng: 10.6084, type: 'sncft' },
  { id: 'sncft-sfax', name: 'Gare de Sfax', lat: 34.7406, lng: 10.7603, type: 'sncft' },
  { id: 'sncft-gabes', name: 'Gare de Gabès', lat: 33.8815, lng: 10.0982, type: 'sncft' },
  { id: 'sncft-monastir', name: 'Gare de Monastir', lat: 35.7643, lng: 10.8113, type: 'sncft' },
  { id: 'sncft-bizerte', name: 'Gare de Bizerte', lat: 37.2744, lng: 9.8739, type: 'sncft' },
  { id: 'sncft-nabeul', name: 'Gare de Nabeul', lat: 36.4561, lng: 10.7376, type: 'sncft' },
];

// ── Layer config ──────────────────────────────────────────────────────────────
const LAYER_CONFIG = {
  metro:  { label: '🚇 Métro',    color: '#0055A4', data: METRO_STATIONS_SAMPLE },
  tgm:    { label: '🚊 TGM',      color: '#00A9E0', data: TGM_STATIONS_SAMPLE },
  rfr:    { label: '🚄 RFR',      color: '#4CAF50', data: RFR_STATIONS_SAMPLE },
  louage: { label: '🚐 Louages',  color: '#EF4444', data: LOUAGE_STATIONS_SAMPLE },
  airport:{ label: '✈️ Aéroports',color: '#9C27B0', data: AIRPORTS_SAMPLE },
  sncft:  { label: '🚂 SNCFT',    color: '#795548', data: SNCFT_STATIONS_SAMPLE },
};

// ── Icon factory ──────────────────────────────────────────────────────────────
const createEmojiIcon = (emoji, bg = '#3B82F6') =>
  L.divIcon({
    html: `<div style="width:30px;height:30px;border-radius:50%;background:${bg};border:2px solid #FFF;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.35);font-size:14px;">${emoji}</div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

const createInfraIcon = (emoji, color, size = 26) =>
  L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:6px;background:${color};border:2px solid rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);font-size:${size * 0.45}px;">${emoji}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const TYPE_ICONS = {
  metro:  (c) => createInfraIcon('Ⓜ', c || '#0055A4'),
  tgm:    () => createInfraIcon('🚊', '#00A9E0'),
  rfr:    () => createInfraIcon('🚄', '#4CAF50'),
  louage: () => createInfraIcon('🚐', '#EF4444'),
  airport:() => createInfraIcon('✈', '#9C27B0', 30),
  sncft:  () => createInfraIcon('🚂', '#795548'),
};

// ── FitBounds helper ──────────────────────────────────────────────────────────
const FitBounds = ({ origin, destination }) => {
  const map = useMap();
  useEffect(() => {
    if (origin && destination) {
      const bounds = L.latLngBounds([origin.lat, origin.lng], [destination.lat, destination.lng]);
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 12 });
    } else if (origin) {
      map.setView([origin.lat, origin.lng], 11);
    }
  }, [origin, destination, map]);
  return null;
};

// ── Distance label ────────────────────────────────────────────────────────────
const DistanceLabel = ({ origin, destination, distanceKm, durationMin, routeSource }) => {
  const map = useMap();
  const labelRef = useRef(null);

  useEffect(() => {
    if (labelRef.current) { labelRef.current.remove(); labelRef.current = null; }
    if (!origin || !destination || !distanceKm) return;

    const midLat = (origin.lat + destination.lat) / 2;
    const midLng = (origin.lng + destination.lng) / 2;
    const srcIcon = routeSource === 'osrm' ? '🛣️' : '📏';
    const srcLabel = routeSource === 'osrm' ? 'route réelle' : 'estimation ×1.3';
    const durationLabel = durationMin ? ` · ⏱️ ~${durationMin} min` : '';

    const div = L.divIcon({
      html: `<div style="background:rgba(15,23,42,0.92);color:#FFF;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:700;font-family:system-ui,sans-serif;border:1px solid rgba(255,255,255,0.2);white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,0.4);pointer-events:none;">
        ${srcIcon} ~${distanceKm.toFixed(0)} km (${srcLabel})${durationLabel}
      </div>`,
      className: '',
      iconAnchor: [80, 12],
    });

    const marker = L.marker([midLat, midLng], { icon: div, interactive: false });
    marker.addTo(map);
    labelRef.current = marker;
    return () => { if (labelRef.current) { labelRef.current.remove(); labelRef.current = null; } };
  }, [origin, destination, distanceKm, durationMin, routeSource, map]);

  return null;
};

// ── Infrastructure Layer ──────────────────────────────────────────────────────
const InfraLayer = ({ layerKey, config, visible }) => {
  if (!visible) return null;
  return config.data.map((station) => {
    const iconFn = TYPE_ICONS[layerKey];
    const icon = iconFn ? iconFn(station.line_color) : createInfraIcon('📍', config.color);
    return (
      <Marker key={station.id} position={[station.lat, station.lng]} icon={icon}>
        <Popup>
          <div style={{ fontFamily: 'system-ui,sans-serif', padding: '4px', minWidth: '160px' }}>
            <div style={{ fontWeight: '700', color: config.color, fontSize: '13px', marginBottom: '4px' }}>
              {config.label} — {station.name}
            </div>
            {station.line && <div style={{ fontSize: '11px', color: '#475569' }}>📍 Lignes: {station.line}</div>}
            {station.dest && <div style={{ fontSize: '11px', color: '#475569' }}>🗺️ Destinations: {station.dest}</div>}
            {station.iata && <div style={{ fontSize: '11px', color: '#475569' }}>✈️ IATA: {station.iata}</div>}
          </div>
        </Popup>
      </Marker>
    );
  });
};

// ── Main Component ────────────────────────────────────────────────────────────
const TripPlannerMap = ({ originId, destinationId, distanceKm, durationMin, routeGeometry, routeSource, onCitySelect }) => {
  const origin = CITIES.find(c => c.id === originId) || null;
  const destination = CITIES.find(c => c.id === destinationId) || null;

  // Layer visibility state
  const [visibleLayers, setVisibleLayers] = useState({
    metro: false, tgm: false, rfr: false, louage: false, airport: false, sncft: false,
  });

  const toggleLayer = (key) =>
    setVisibleLayers(prev => ({ ...prev, [key]: !prev[key] }));

  const mapCenter = [35.5, 10.0];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '420px', borderRadius: '16px', overflow: 'hidden' }}>

      {/* ── Layer Toggle Bar ───────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000, display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center',
        background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '30px',
        padding: '6px 10px',
      }}>
        {Object.entries(LAYER_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => toggleLayer(key)}
            title={visibleLayers[key] ? `Masquer ${cfg.label}` : `Afficher ${cfg.label}`}
            style={{
              padding: '4px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              background: visibleLayers[key] ? cfg.color : 'rgba(255,255,255,0.1)',
              color: '#FFF', fontSize: '11px', fontWeight: '700',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
              boxShadow: visibleLayers[key] ? `0 2px 8px ${cfg.color}66` : 'none',
            }}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* ── Legend ────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: '12px', left: '12px', zIndex: 1000,
        background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px',
        padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '5px',
        fontSize: '11px', color: '#CBD5E1',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} /> Départ
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} /> Arrivée
        </div>
        {routeSource === 'osrm' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60A5FA' }}>
            <div style={{ width: 10, height: 2, background: '#60A5FA' }} /> Route réelle (OSRM)
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8', fontSize: '10px' }}>
          Cliquer sur la carte pour sélectionner
        </div>
      </div>

      <MapContainer center={mapCenter} zoom={6} style={{ width: '100%', height: '100%' }} key="trip-planner-map">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds origin={origin} destination={destination} />

        {origin && destination && (
          <DistanceLabel
            origin={origin}
            destination={destination}
            distanceKm={distanceKm}
            durationMin={durationMin}
            routeSource={routeSource}
          />
        )}

        {/* ── Route: OSRM polyline (solid) or straight dash ─── */}
        {origin && destination && routeGeometry && routeGeometry.length > 2 ? (
          <Polyline
            positions={routeGeometry}
            pathOptions={{ color: '#3B82F6', weight: 4, opacity: 0.9 }}
          />
        ) : origin && destination ? (
          <Polyline
            positions={[[origin.lat, origin.lng], [destination.lat, destination.lng]]}
            pathOptions={{ color: '#3B82F6', weight: 4, opacity: 0.75, dashArray: '10, 6' }}
          />
        ) : null}

        {/* ── Infrastructure layers ────────────────────────── */}
        {Object.entries(LAYER_CONFIG).map(([key, cfg]) => (
          <InfraLayer key={key} layerKey={key} config={cfg} visible={visibleLayers[key]} />
        ))}

        {/* ── City markers ────────────────────────────────── */}
        {CITIES.map((city) => {
          const isOrigin = city.id === originId;
          const isDest   = city.id === destinationId;
          const iconBg   = isOrigin ? '#10B981' : isDest ? '#F59E0B' : '#475569';
          const emoji    = isOrigin ? '🟢' : isDest ? '🟡' : '📍';

          return (
            <Marker
              key={city.id}
              position={[city.lat, city.lng]}
              icon={createEmojiIcon(emoji, iconBg)}
              eventHandlers={{ click: () => onCitySelect && onCitySelect(city.id) }}
            >
              <Popup>
                <div style={{ fontFamily: 'system-ui,sans-serif', padding: '4px', minWidth: '160px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: iconBg, fontWeight: '700' }}>
                    {isOrigin ? '🟢 Départ' : isDest ? '🟡 Arrivée' : '📍'} {city.name}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span>🌐 {city.lat.toFixed(4)}°N, {city.lng.toFixed(4)}°E</span>
                    {!isOrigin && (
                      <button onClick={() => onCitySelect && onCitySelect(city.id)}
                        style={{ marginTop: '6px', padding: '5px 10px', borderRadius: '8px', background: '#3B82F6', color: '#FFF', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                        → Destination
                      </button>
                    )}
                    {!isDest && (
                      <button onClick={() => onCitySelect && onCitySelect(city.id, true)}
                        style={{ marginTop: '4px', padding: '5px 10px', borderRadius: '8px', background: '#10B981', color: '#FFF', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                        ← Départ
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
