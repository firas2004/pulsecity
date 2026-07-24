import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Coordonnées approximatives des zones pour les marqueurs dans la ville
const zoneCoordinates = {
  "tunis-centre": [
    { name: "Avenue Bourguiba", lat: 36.8002, lon: 10.1860, type: "traffic" },
    { name: "Place du Passage", lat: 36.8045, lon: 10.1800, type: "air_co2" },
    { name: "La Fayette", lat: 36.8110, lon: 10.1815, type: "noise" },
    { name: "Belvédère", lat: 36.8200, lon: 10.1850, type: "energy" }
  ],
  "ariana": [
    { name: "Ariana Centre", lat: 36.8665, lon: 10.1930, type: "traffic" },
    { name: "Ennasr 2", lat: 36.8580, lon: 10.1700, type: "air_co2" },
    { name: "Menzah 6", lat: 36.8450, lon: 10.1800, type: "noise" }
  ],
  "la-marsa": [
    { name: "Marsa Plage", lat: 36.8830, lon: 10.3300, type: "traffic" },
    { name: "Sidi Bou Saïd", lat: 36.8710, lon: 10.3450, type: "noise" },
    { name: "Gammarth", lat: 36.9150, lon: 10.2980, type: "energy" }
  ],
  "sfax": [
    { name: "Bab Bhar", lat: 34.7330, lon: 10.7630, type: "traffic" },
    { name: "Route de Téniour", lat: 34.7600, lon: 10.7400, type: "air_co2" }
  ],
  "sousse": [
    { name: "Boulevard du 14 Janvier", lat: 35.8450, lon: 10.6250, type: "traffic" },
    { name: "Sousse Médina", lat: 35.8270, lon: 10.6380, type: "noise" }
  ],
  "ben-arous": [
    { name: "Zone Industrielle Radès", lat: 36.7680, lon: 10.2750, type: "energy" },
    { name: "Ben Arous Centre", lat: 36.7531, lon: 10.2222, type: "air_co2" }
  ]
};

const METRIC_LABELS = {
  traffic:  { label: 'Trafic Routier',     unit: 'véh/min', icon: '🚗' },
  air_co2:  { label: 'CO₂ / Qualité Air', unit: 'ppm',     icon: '💨' },
  noise:    { label: 'Niveau Sonore',      unit: 'dB',      icon: '🔊' },
  energy:   { label: 'Consommation',       unit: 'kWh',     icon: '⚡' },
};

const getPulsingMarker = (status) => {
  let color = '#10B981';
  let isPulsing = false;
  if (status === 'Critical' || status === 'red' || status === 'danger') {
    color = '#EF4444';
    isPulsing = true;
  } else if (status === 'Warning' || status === 'orange' || status === 'warning') {
    color = '#F59E0B';
  }

  const pulseClass = isPulsing ? 'marker-pulse' : '';

  return L.divIcon({
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <div class="${pulseClass}" style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: ${color}; opacity: 0.35;"></div>
        <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${color}; border: 1.5px solid #FFFFFF; z-index: 10; box-shadow: 0 0 6px ${color};"></div>
      </div>
    `,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const CityMap = ({ center, cityId, metrics, status }) => {
  const mapCenter = center && !isNaN(center[0]) && !isNaN(center[1]) ? center : [36.8065, 10.1815];
  const zones = zoneCoordinates[cityId] || [];

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ width: '100%', height: '100%', minHeight: '350px' }}
      key={`${mapCenter[0]}-${mapCenter[1]}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {zones.map((zone, idx) => {
        const metricVal = metrics ? metrics[zone.type] : null;
        const isCritical = metricVal?.anomaly;
        const activeStatus = isCritical ? 'Critical' : status;

        return (
          <Marker
            key={idx}
            position={[zone.lat, zone.lon]}
            icon={getPulsingMarker(activeStatus)}
          >
            <Popup>
              <div style={{ minWidth: '210px', fontFamily: 'system-ui, sans-serif' }}>
                {/* Zone name */}
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '700', color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '6px' }}>
                  📍 {zone.name}
                </h4>

                {/* Primary sensor for this zone */}
                {metricVal && metricVal.value !== null ? (
                  <div style={{
                    padding: '8px 10px', borderRadius: '6px', marginBottom: '8px',
                    background: isCritical ? '#FEF2F2' : '#F0FDF4',
                    border: `1px solid ${isCritical ? '#FECACA' : '#BBF7D0'}`
                  }}>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>
                      {METRIC_LABELS[zone.type]?.icon} {METRIC_LABELS[zone.type]?.label}
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: isCritical ? '#EF4444' : '#10B981', lineHeight: 1.1 }}>
                      {Number(metricVal.value).toFixed(1)}
                      <span style={{ fontSize: '11px', fontWeight: '400', marginLeft: '4px', color: '#6B7280' }}>
                        {metricVal.unit || METRIC_LABELS[zone.type]?.unit}
                      </span>
                    </div>
                    {isCritical && (
                      <div style={{ fontSize: '11px', color: '#EF4444', fontWeight: '700', marginTop: '3px' }}>
                        ⚠ ANOMALIE DÉTECTÉE
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '6px 8px', background: '#F9FAFB', borderRadius: '6px', marginBottom: '8px', fontSize: '12px', color: '#9CA3AF' }}>
                    {METRIC_LABELS[zone.type]?.icon} En attente des données live...
                  </div>
                )}

                {/* All other metrics for context */}
                {metrics && (
                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '6px' }}>
                    {Object.keys(METRIC_LABELS).filter(k => k !== zone.type).map(key => {
                      const m = metrics[key];
                      if (!m || m.value === null || m.value === undefined) return null;
                      const info = METRIC_LABELS[key];
                      const isAnom = m.anomaly;
                      return (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '3px 0', color: '#374151' }}>
                          <span style={{ color: '#6B7280' }}>{info.icon} {info.label}</span>
                          <span style={{ fontWeight: '600', color: isAnom ? '#EF4444' : '#374151' }}>
                            {Number(m.value).toFixed(1)} <span style={{ fontWeight: '400', color: '#9CA3AF' }}>{m.unit}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default CityMap;
