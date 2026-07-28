import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Extended POI datasets for Tunisian cities
const cityPois = {
  "la-marsa": {
    beaches: [
      { name: "Plage de La Marsa", lat: 36.8830, lon: 10.3300, status: "Ideal", water_ph: 7.4, temp: "24°C" },
      { name: "Plage de Gammarth", lat: 36.9150, lon: 10.2980, status: "Ideal", water_ph: 7.6, temp: "25°C" },
      { name: "Crique de Sidi Bou Saïd", lat: 36.8710, lon: 10.3450, status: "Ideal", water_ph: 7.5, temp: "24°C" },
    ],
    parkings: [
      { name: "Parking Marsa Plage", lat: 36.8845, lon: 10.3280, free: 45, total: 120 },
      { name: "Parking Saf-Saf", lat: 36.8810, lon: 10.3230, free: 12, total: 80 },
    ],
    pedestrians: [
      { name: "Avenue Habib Bourguiba (Marsa)", lat: 36.8820, lon: 10.3250, count: "140 p/min" },
      { name: "Place du Saf Saf", lat: 36.8805, lon: 10.3220, count: "95 p/min" },
    ]
  },
  "sousse": {
    beaches: [
      { name: "Plage Boujaafar", lat: 35.8350, lon: 10.6380, status: "Ideal", water_ph: 7.5, temp: "26°C" },
      { name: "Plage Port El Kantaoui", lat: 35.8920, lon: 10.5980, status: "Ideal", water_ph: 7.7, temp: "26°C" },
      { name: "Plage Las Vegas Sousse", lat: 35.8480, lon: 10.6280, status: "Warning", water_ph: 8.1, temp: "26°C" },
    ],
    parkings: [
      { name: "Parking Port El Kantaoui", lat: 35.8910, lon: 10.5950, free: 85, total: 300 },
      { name: "Parking Médina Sousse", lat: 35.8260, lon: 10.6350, free: 15, total: 150 },
    ],
    pedestrians: [
      { name: "Boulevard du 14 Janvier", lat: 35.8450, lon: 10.6250, count: "210 p/min" },
      { name: "Gare de Sousse", lat: 35.8300, lon: 10.6370, count: "180 p/min" },
    ]
  },
  "tunis-centre": {
    beaches: [],
    parkings: [
      { name: "Parking Municipal Lafayette", lat: 36.8120, lon: 10.1800, free: 88, total: 250 },
      { name: "Parking Place du Passage", lat: 36.8045, lon: 10.1800, free: 32, total: 180 },
      { name: "Parking Central Kasbah", lat: 36.7970, lon: 10.1700, free: 110, total: 400 },
    ],
    pedestrians: [
      { name: "Avenue Habib Bourguiba", lat: 36.8002, lon: 10.1860, count: "320 p/min" },
      { name: "Gare TGM Tunis Marine", lat: 36.8015, lon: 10.1940, count: "280 p/min" },
      { name: "Place Barcelone", lat: 36.7950, lon: 10.1800, count: "410 p/min" },
    ]
  },
  "ariana": {
    beaches: [],
    parkings: [
      { name: "Parking Ariana Centre", lat: 36.8665, lon: 10.1930, free: 54, total: 160 },
      { name: "Parking Ennasr 2", lat: 36.8580, lon: 10.1700, free: 23, total: 100 },
    ],
    pedestrians: [
      { name: "Station Métro Ariana", lat: 36.8640, lon: 10.1910, count: "230 p/min" },
      { name: "Avenue Hédi Nouira (Ennasr)", lat: 36.8550, lon: 10.1680, count: "160 p/min" },
    ]
  },
  "bizerte": {
    beaches: [
      { name: "Corniche de Bizerte", lat: 37.2800, lon: 9.8780, status: "Ideal", water_ph: 7.4, temp: "23°C" },
      { name: "Plage Rmel Bizerte", lat: 37.2600, lon: 9.9100, status: "Ideal", water_ph: 7.3, temp: "22°C" },
      { name: "Plage Les Grottes", lat: 37.3300, lon: 9.8600, status: "Ideal", water_ph: 7.5, temp: "23°C" },
    ],
    parkings: [
      { name: "Parking Vieux Port Bizerte", lat: 37.2750, lon: 9.8730, free: 40, total: 140 }
    ],
    pedestrians: [
      { name: "Vieux Port de Bizerte", lat: 37.2744, lon: 9.8739, count: "190 p/min" }
    ]
  },
  "monastir": {
    beaches: [
      { name: "Plage Qaraiya", lat: 35.7720, lon: 10.8320, status: "Ideal", water_ph: 7.6, temp: "26°C" },
      { name: "Plage Skanes", lat: 35.7800, lon: 10.7700, status: "Ideal", water_ph: 7.5, temp: "26°C" },
    ],
    parkings: [
      { name: "Parking Marina Monastir", lat: 35.7750, lon: 10.8300, free: 62, total: 200 }
    ],
    pedestrians: [
      { name: "Esplanade du Ribat", lat: 35.7710, lon: 10.8330, count: "175 p/min" }
    ]
  },
  "sfax": {
    beaches: [
      { name: "Plage Chott El Karkanah", lat: 34.7200, lon: 10.7800, status: "Warning", water_ph: 8.0, temp: "25°C" }
    ],
    parkings: [
      { name: "Parking Bab Bhar", lat: 34.7330, lon: 10.7630, free: 78, total: 320 }
    ],
    pedestrians: [
      { name: "Médina de Sfax", lat: 34.7350, lon: 10.7600, count: "340 p/min" }
    ]
  },
  "mahdia": {
    beaches: [
      { name: "Plage Zone Touristique Mahdia", lat: 35.5150, lon: 11.0500, status: "Ideal", water_ph: 7.4, temp: "26°C" },
      { name: "Plage Salakta", lat: 35.3950, lon: 11.0500, status: "Ideal", water_ph: 7.5, temp: "25°C" }
    ],
    parkings: [
      { name: "Parking Skifa El Kahla", lat: 35.5040, lon: 11.0620, free: 35, total: 110 }
    ],
    pedestrians: [
      { name: "Péninsule Mahdia", lat: 35.5047, lon: 11.0622, count: "130 p/min" }
    ]
  }
};

const createEmojiIcon = (emoji, bg = '#3B82F6') => {
  return L.divIcon({
    html: `
      <div style="
        width: 32px; height: 32px; border-radius: 50%;
        background: ${bg}; border: 2px solid #FFF;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 16px;
      ">
        ${emoji}
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const CityMap = ({ center, cityId, metrics, status }) => {
  const [showBeaches, setShowBeaches] = useState(true);
  const [showParkings, setShowParkings] = useState(true);
  const [showPedestrians, setShowPedestrians] = useState(true);

  const mapCenter = center && !isNaN(center[0]) && !isNaN(center[1]) ? center : [36.8065, 10.1815];
  const pois = cityPois[cityId] || { beaches: [], parkings: [], pedestrians: [] };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '380px', borderRadius: '16px', overflow: 'hidden' }}>
      {/* ── Filter Layer Toggle Panel ──────────────────────────────── */}
      <div style={{
        position: 'absolute', top: '12px', right: '12px', zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px',
        padding: '8px 12px', display: 'flex', gap: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
      }}>
        <button
          onClick={() => setShowBeaches(!showBeaches)}
          style={{
            background: showBeaches ? '#0EA5E9' : 'rgba(255,255,255,0.1)',
            color: '#FFF', border: 'none', borderRadius: '8px', padding: '6px 10px',
            fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          🏖️ Plages ({pois.beaches.length})
        </button>
        <button
          onClick={() => setShowParkings(!showParkings)}
          style={{
            background: showParkings ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
            color: '#FFF', border: 'none', borderRadius: '8px', padding: '6px 10px',
            fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          🅿️ Parkings ({pois.parkings.length})
        </button>
        <button
          onClick={() => setShowPedestrians(!showPedestrians)}
          style={{
            background: showPedestrians ? '#F97316' : 'rgba(255,255,255,0.1)',
            color: '#FFF', border: 'none', borderRadius: '8px', padding: '6px 10px',
            fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          🚶 Piétons ({pois.pedestrians.length})
        </button>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        key={`${mapCenter[0]}-${mapCenter[1]}`}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🏖️ Beach POIs */}
        {showBeaches && pois.beaches.map((b, idx) => (
          <Marker key={`beach-${idx}`} position={[b.lat, b.lon]} icon={createEmojiIcon('🏖️', '#0EA5E9')}>
            <Popup>
              <div style={{ fontFamily: 'system-ui, sans-serif', padding: '4px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#0284C7' }}>🌊 {b.name}</h4>
                <div style={{ fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>🟢 <strong>Baignade :</strong> {b.status}</span>
                  <span>💧 <strong>Qualité Eau :</strong> {b.water_ph} pH</span>
                  <span>🌡️ <strong>Temp. Mer :</strong> {b.temp}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 🅿️ Parking POIs */}
        {showParkings && pois.parkings.map((p, idx) => (
          <Marker key={`parking-${idx}`} position={[p.lat, p.lon]} icon={createEmojiIcon('🅿️', '#8B5CF6')}>
            <Popup>
              <div style={{ fontFamily: 'system-ui, sans-serif', padding: '4px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#6D28D9' }}>🚗 {p.name}</h4>
                <div style={{ fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>🅿️ <strong>Places libres :</strong> <strong style={{ color: '#10B981' }}>{p.free}</strong> / {p.total}</span>
                  <span>📊 <strong>Taux d'occupation :</strong> {Math.round(((p.total - p.free) / p.total) * 100)}%</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 🚶 Pedestrian POIs */}
        {showPedestrians && pois.pedestrians.map((ped, idx) => (
          <Marker key={`ped-${idx}`} position={[ped.lat, ped.lon]} icon={createEmojiIcon('🚶', '#F97316')}>
            <Popup>
              <div style={{ fontFamily: 'system-ui, sans-serif', padding: '4px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#C2410C' }}>🚶 {ped.name}</h4>
                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <span>👥 <strong>Affluence piétonne :</strong> {ped.count}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CityMap;
