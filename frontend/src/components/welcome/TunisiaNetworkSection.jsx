import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Mock Data: 24 Tunisian Cities with Coordinates & Status ─────────────────
const CITIES = [
  { id: 'tunis', name: 'Tunis', lat: 36.8065, lng: 10.1815, status: 'active', region: 'Grand Tunis' },
  { id: 'ariana', name: 'Ariana', lat: 36.8665, lng: 10.1647, status: 'active', region: 'Grand Tunis' },
  { id: 'ben_arous', name: 'Ben Arous', lat: 36.7538, lng: 10.2317, status: 'active', region: 'Grand Tunis' },
  { id: 'manouba', name: 'La Manouba', lat: 36.8086, lng: 10.1014, status: 'active', region: 'Grand Tunis' },
  { id: 'bizerte', name: 'Bizerte', lat: 37.2746, lng: 9.8739, status: 'active', region: 'Nord' },
  { id: 'nabeul', name: 'Nabeul', lat: 36.4561, lng: 10.7376, status: 'active', region: 'Cap Bon' },
  { id: 'beja', name: 'Béja', lat: 36.7257, lng: 9.1817, status: 'active', region: 'Nord-Ouest' },
  { id: 'jendouba', name: 'Jendouba', lat: 36.5011, lng: 8.7802, status: 'active', region: 'Nord-Ouest' },
  { id: 'le_kef', name: 'Le Kef', lat: 36.1742, lng: 8.7047, status: 'active', region: 'Nord-Ouest' },
  { id: 'siliana', name: 'Siliana', lat: 36.0849, lng: 9.3708, status: 'active', region: 'Nord-Ouest' },
  { id: 'kairouan', name: 'Kairouan', lat: 35.6781, lng: 10.0963, status: 'active', region: 'Centre' },
  { id: 'sousse', name: 'Sousse', lat: 35.8256, lng: 10.6412, status: 'active', region: 'Sahel' },
  { id: 'monastir', name: 'Monastir', lat: 35.7833, lng: 10.8262, status: 'active', region: 'Sahel' },
  { id: 'mahdia', name: 'Mahdia', lat: 35.5047, lng: 11.0622, status: 'active', region: 'Sahel' },
  { id: 'sfax', name: 'Sfax', lat: 34.7406, lng: 10.7603, status: 'active', region: 'Sud-Est' },
  { id: 'gabes', name: 'Gabès', lat: 33.8815, lng: 10.0982, status: 'active', region: 'Sud-Est' },
  { id: 'gafsa', name: 'Gafsa', lat: 34.425, lng: 8.7842, status: 'active', region: 'Sud-Ouest' },
  { id: 'tozeur', name: 'Tozeur', lat: 33.9197, lng: 8.1335, status: 'active', region: 'Sud-Ouest' },
  { id: 'medenine', name: 'Médenine', lat: 33.3549, lng: 10.5055, status: 'active', region: 'Sud-Est' },
  { id: 'kasserine', name: 'Kasserine', lat: 35.1676, lng: 8.8365, status: 'active', region: 'Centre-Ouest' },
  { id: 'sidi_bouzid', name: 'Sidi Bouzid', lat: 35.0382, lng: 9.4849, status: 'active', region: 'Centre' },
  { id: 'kebili', name: 'Kebili', lat: 33.7044, lng: 8.969, status: 'active', region: 'Sud-Ouest' },
  { id: 'tataouine', name: 'Tataouine', lat: 32.9297, lng: 10.4518, status: 'active', region: 'Extreme Sud' },
  { id: 'zaghouan', name: 'Zaghouan', lat: 36.4029, lng: 10.1429, status: 'active', region: 'Nord-Est' },
];

// ── Leaflet Custom Marker Icons Generator ─────────────────────────────────────
function createCustomIcon(status, isSelected, isHovered) {
  const isActive = status === 'active';
  const mainColor = isActive ? '#0066FF' : '#666666';
  const size = isSelected ? 22 : isHovered ? 18 : 14;

  const html = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    ">
      ${isActive ? `
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(0, 102, 255, 0.4);
          animation: pulseMarker 2s infinite ease-out;
        "></div>
      ` : ''}
      <div style="
        position: relative;
        width: ${size * 0.65}px;
        height: ${size * 0.65}px;
        border-radius: 50%;
        background-color: ${mainColor};
        border: ${isSelected ? '2px solid #FFFFFF' : '1.5px solid rgba(255,255,255,0.8)'};
        box-shadow: 0 0 0 1px ${mainColor};
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-city-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// ── Helper Component to Animate Map Movement ──────────────────────────────────
function MapFlyController({ activeTarget, resetToDefault }) {
  const map = useMap();

  useEffect(() => {
    if (activeTarget) {
      map.flyTo([activeTarget.lat, activeTarget.lng], 9, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    } else if (resetToDefault) {
      map.flyTo([34.0, 9.0], 6, {
        duration: 1.2,
      });
    }
  }, [activeTarget, resetToDefault, map]);

  return null;
}

export default function TunisiaNetworkSection() {
  const [search, setSearch] = useState('');
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [hoveredCityId, setHoveredCityId] = useState(null);

  const markerRefs = useRef({});

  // Filter cities by search term
  const filteredCities = CITIES.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  // Auto select/fly to city if single match found in search
  const autoMatch = search.trim().length > 1 && filteredCities.length === 1 ? filteredCities[0] : null;
  const activeCity = CITIES.find((c) => c.id === selectedCityId) || autoMatch;
  const isDefaultView = !activeCity && search.trim() === '';

  // Open marker popup automatically when selected or auto-matched
  useEffect(() => {
    const targetId = activeCity ? activeCity.id : null;
    if (targetId && markerRefs.current[targetId]) {
      markerRefs.current[targetId].openPopup();
    }
  }, [activeCity]);

  const handleCityClick = (city) => {
    setSelectedCityId(city.id);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val.trim() === '') {
      setSelectedCityId(null);
    }
  };

  return (
    <section
      id="reseau-surveillance"
      style={{
        width: '100%',
        background: '#0A0A0F',
        borderTop: '1px solid #2D2D44',
        borderBottom: '1px solid #2D2D44',
        position: 'relative',
        zIndex: 5,
        fontFamily: 'var(--font-primary, "Inter", sans-serif)',
      }}
    >
      {/* Dynamic Keyframe for Pulsing Markers */}
      <style>{`
        @keyframes pulseMarker {
          0% { transform: scale(0.9); opacity: 0.8; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .custom-city-marker {
          background: none !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          background: #12121A !important;
          color: #FFFFFF !important;
          border: 1px solid #2D2D44 !important;
          border-radius: 2px !important;
          font-family: var(--font-primary, sans-serif) !important;
          padding: 4px 8px !important;
          box-shadow: none !important;
        }
        .leaflet-popup-tip {
          background: #12121A !important;
          border: 1px solid #2D2D44 !important;
        }
        @media (max-width: 768px) {
          .tunisia-network-container {
            flex-direction: column !important;
          }
          .tunisia-network-list-panel {
            width: 100% !important;
            max-height: 300px !important;
          }
          .tunisia-network-map-panel {
            width: 100% !important;
            height: 400px !important;
          }
        }
      `}</style>

      {/* Header Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 32px', textAlign: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '12px',
          textTransform: 'uppercase',
          color: '#0066FF',
          letterSpacing: '0.1em',
          fontWeight: '600',
        }}>
          • COUVERTURE NATIONALE
        </span>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 800,
          color: '#FFFFFF',
          margin: '12px 0 8px',
          letterSpacing: '-0.02em',
        }}>
          Réseau de Surveillance — Villes Tunisiennes
        </h2>
        <p style={{ fontSize: '15px', color: '#C8C8D8', maxWidth: '580px', margin: '0 auto' }}>
          Explorez en direct la télémétrie et les capteurs IoT déployés à travers les 24 gouvernorats de Tunisie.
        </p>
      </div>

      {/* Main 2-Column Split Section */}
      <div
        className="tunisia-network-container"
        style={{
          maxWidth: '1200px',
          margin: '0 auto 64px',
          padding: '0 24px',
          display: 'flex',
          gap: '0',
          border: '1px solid #2D2D44',
          borderRadius: '2px',
          overflow: 'hidden',
          background: '#12121A',
        }}
      >
        {/* LEFT PANEL (40% width) — City List & Search */}
        <div
          className="tunisia-network-list-panel"
          style={{
            width: '40%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #2D2D44',
            background: '#0A0A0F',
          }}
        >
          {/* Search Header */}
          <div style={{ padding: '20px', borderBottom: '1px solid #2D2D44', background: '#12121A' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '12px',
                textTransform: 'uppercase',
                color: '#C8C8D8',
                letterSpacing: '0.08em',
                fontWeight: '600',
              }}>
                WILAYAS ({filteredCities.length})
              </span>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#7FD579',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#7FD579' }} />
                EN DIRECT
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Rechercher une wilaya..."
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 36px',
                  background: '#1E1E2E',
                  border: '1px solid #2D2D44',
                  borderRadius: '2px',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-primary, sans-serif)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#0066FF')}
                onBlur={(e) => (e.target.style.borderColor = '#2D2D44')}
              />
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#C8C8D8',
                fontSize: '14px',
                pointerEvents: 'none',
              }}>
                🔍
              </span>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#C8C8D8',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Scrollable City List */}
          <div
            style={{
              overflowY: 'auto',
              maxHeight: '480px',
              padding: '8px 0',
              scrollbarWidth: 'thin',
              scrollbarColor: '#2D2D44 #0A0A0F',
            }}
          >
            {filteredCities.map((city) => {
              const isSelected = activeCity?.id === city.id;
              const isHovered = hoveredCityId === city.id;

              return (
                <div
                  key={city.id}
                  onClick={() => handleCityClick(city)}
                  onMouseEnter={() => setHoveredCityId(city.id)}
                  onMouseLeave={() => setHoveredCityId(null)}
                  style={{
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isSelected
                      ? 'rgba(0, 102, 255, 0.12)'
                      : isHovered
                      ? '#1E1E2E'
                      : 'transparent',
                    borderLeft: isSelected
                      ? '3px solid #0066FF'
                      : '3px solid transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Status dot */}
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: city.status === 'active' ? '#7FD579' : '#666666',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: isSelected ? '700' : '500',
                        color: isSelected ? '#FFFFFF' : isHovered ? '#FFFFFF' : '#C8C8D8',
                      }}
                    >
                      {city.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '11px',
                      color: isSelected ? '#8BB5FF' : '#666666',
                    }}>
                      {city.region}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: isSelected ? '#0066FF' : '#666666',
                    }}>
                      →
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredCities.length === 0 && (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#C8C8D8', fontSize: '14px' }}>
                Aucune wilaya trouvée pour "{search}".
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL (60% width) — Leaflet Map */}
        <div
          className="tunisia-network-map-panel"
          style={{
            width: '60%',
            height: '560px',
            position: 'relative',
            background: '#0A0A0F',
          }}
        >
          <MapContainer
            center={[34.0, 9.0]}
            zoom={6}
            style={{ width: '100%', height: '100%', borderRadius: 0, background: '#0A0A0F' }}
            zoomControl={true}
          >
            {/* CartoDB Dark Tile Layer */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              maxZoom={18}
            />

            {/* Controller for FlyTo Animations */}
            <MapFlyController activeTarget={activeCity} resetToDefault={isDefaultView} />

            {/* Render Markers for all 24 Cities */}
            {CITIES.map((city) => {
              const isSelected = activeCity?.id === city.id;
              const isHovered = hoveredCityId === city.id;

              return (
                <Marker
                  key={city.id}
                  position={[city.lat, city.lng]}
                  icon={createCustomIcon(city.status, isSelected, isHovered)}
                  ref={(ref) => {
                    if (ref) markerRefs.current[city.id] = ref;
                  }}
                  eventHandlers={{
                    click: () => handleCityClick(city),
                    mouseover: () => setHoveredCityId(city.id),
                    mouseout: () => setHoveredCityId(null),
                  }}
                >
                  <Popup closeButton={false} offset={[0, -10]}>
                    <div style={{ padding: '4px 6px', textAlign: 'center' }}>
                      <div style={{ fontWeight: '800', fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }}>
                        {city.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#7FD579', fontFamily: 'var(--font-mono, monospace)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#7FD579' }} />
                        Surveillance active
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </section>
  );
}
