import React, { useState, useEffect } from 'react';
import { Waves, Sun, Thermometer, Wind, CheckCircle, AlertTriangle, ShieldAlert, MapPin, Eye, Users } from 'lucide-react';
import CityMap from '../../components/CityMap';

const COASTAL_CITIES = [
  { id: 'la-marsa', name: 'La Marsa', region: 'Tunis Nord', beachesCount: 3 },
  { id: 'sousse', name: 'Sousse', region: 'Sahel', beachesCount: 3 },
  { id: 'monastir', name: 'Monastir', region: 'Sahel', beachesCount: 2 },
  { id: 'bizerte', name: 'Bizerte', region: 'Nord', beachesCount: 3 },
  { id: 'nabeul', name: 'Nabeul & Hammamet', region: 'Cap Bon', beachesCount: 3 },
  { id: 'mahdia', name: 'Mahdia', region: 'Sahel', beachesCount: 2 },
  { id: 'sfax', name: 'Sfax', region: 'Sud-Est', beachesCount: 1 },
  { id: 'gabes', name: 'Gabès', region: 'Sud', beachesCount: 1 },
];

const BEACH_DATA = {
  'la-marsa': [
    { name: 'Plage de La Marsa', status: 'Ideal', ph: 7.4, seaTemp: '24°C', uv: 5, wind: '14 km/h', crowd: 'Modérée', desc: 'Plage sablonneuse populaire avec promenade et restaurants' },
    { name: 'Plage de Gammarth', status: 'Ideal', ph: 7.6, seaTemp: '25°C', uv: 6, wind: '12 km/h', crowd: 'Faible', desc: 'Zone balnéaire hôtelière haut de gamme' },
    { name: 'Crique Sidi Bou Saïd', status: 'Ideal', ph: 7.5, seaTemp: '24°C', uv: 5, wind: '10 km/h', crowd: 'Élevée', desc: 'Port de plaisance et crique pittoresque au pied du village' }
  ],
  'sousse': [
    { name: 'Plage Boujaafar', status: 'Ideal', ph: 7.5, seaTemp: '26°C', uv: 7, wind: '15 km/h', crowd: 'Élevée', desc: 'Grande plage urbaine au centre de Sousse' },
    { name: 'Port El Kantaoui', status: 'Ideal', ph: 7.7, seaTemp: '26°C', uv: 7, wind: '11 km/h', crowd: 'Modérée', desc: 'Station balnéaire intégrée avec marina' },
    { name: 'Plage Las Vegas', status: 'Warning', ph: 8.1, seaTemp: '26°C', uv: 8, wind: '22 km/h', crowd: 'Moyenne', desc: 'Plage côtière avec animation estivale' }
  ],
  'bizerte': [
    { name: 'Corniche de Bizerte', status: 'Ideal', ph: 7.4, seaTemp: '23°C', uv: 5, wind: '18 km/h', crowd: 'Modérée', desc: 'Longue baie surplombée par le fort d\'Espagne' },
    { name: 'Plage Les Grottes', status: 'Ideal', ph: 7.5, seaTemp: '23°C', uv: 6, wind: '16 km/h', crowd: 'Faible', desc: 'Crique naturelle sauvage au cap Blanc' },
    { name: 'Plage Rmel', status: 'Ideal', ph: 7.3, seaTemp: '22°C', uv: 5, wind: '14 km/h', crowd: 'Faible', desc: 'Plage de sable fin bordée de forêts de pins' }
  ],
  'monastir': [
    { name: 'Plage Qaraiya', status: 'Ideal', ph: 7.6, seaTemp: '26°C', uv: 7, wind: '12 km/h', crowd: 'Élevée', desc: 'Plage au pied du Ribat historique' },
    { name: 'Plage Skanès', status: 'Ideal', ph: 7.5, seaTemp: '26°C', uv: 7, wind: '13 km/h', crowd: 'Modérée', desc: 'Zone touristique balnéaire avec clubs nautiques' }
  ],
  'nabeul': [
    { name: 'Plage de Kélibia Fort', status: 'Ideal', ph: 7.3, seaTemp: '25°C', uv: 6, wind: '11 km/h', crowd: 'Modérée', desc: 'L\'un des plus beaux sables blancs du bassin méditerranéen' },
    { name: 'Plage Yasmine Hammamet', status: 'Ideal', ph: 7.6, seaTemp: '26°C', uv: 7, wind: '14 km/h', crowd: 'Élevée', desc: 'Station balnéaire majeure avec parcs aquatiques' }
  ]
};

const BeachQuality = () => {
  const [selectedCity, setSelectedCity] = useState(COASTAL_CITIES[0]);
  const beaches = BEACH_DATA[selectedCity.id] || [];

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── Header Banner ────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(59,130,246,0.12))',
        border: '1px solid rgba(14,165,233,0.3)',
        borderRadius: '20px',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#0EA5E9,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Waves size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Qualité des Plages & Indice de Baignade 🏖️
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Suivi de la température de la mer, qualité du pH de l'eau, indice UV et état de baignade des côtes tunisiennes.
            </p>
          </div>
        </div>
      </div>

      {/* ── City Selector Pills ──────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {COASTAL_CITIES.map((city) => {
          const isSelected = selectedCity.id === city.id;
          return (
            <button
              key={city.id}
              onClick={() => setSelectedCity(city)}
              style={{
                padding: '10px 18px',
                borderRadius: '999px',
                border: isSelected ? '1px solid #0EA5E9' : '1px solid var(--border-color)',
                background: isSelected ? 'rgba(14,165,233,0.15)' : 'var(--surface-2)',
                color: isSelected ? '#0EA5E9' : 'var(--text-muted)',
                fontWeight: isSelected ? '700' : '500',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              <MapPin size={14} /> {city.name}
            </button>
          );
        })}
      </div>

      {/* ── Beach List & Details ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {beaches.map((b, idx) => {
          const isIdeal = b.status === 'Ideal';
          return (
            <div key={idx} style={{
              background: 'var(--surface)',
              border: isIdeal ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: 'var(--shadow)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--text-main)' }}>
                  🌊 {b.name}
                </h3>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                  background: isIdeal ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                  color: isIdeal ? '#10B981' : '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {isIdeal ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                  {isIdeal ? 'Baignade Autorisée' : 'Prudence Recommandée'}
                </span>
              </div>

              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {b.desc}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--surface-2)', padding: '12px', borderRadius: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>pH Eau Potable/Mer</span>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0EA5E9' }}>{b.ph} pH</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Temp. Eau</span>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#EF4444' }}>{b.seaTemp}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Indice UV</span>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#F59E0B' }}>{b.uv} / 11</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Affluence</span>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#10B981' }}>{b.crowd}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Interactive Coastal Map ──────────────────────────────── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📍 Carte des Plages & Spots de Baignade — {selectedCity.name}
        </h3>
        <div style={{ height: '380px', width: '100%' }}>
          <CityMap cityId={selectedCity.id} />
        </div>
      </div>
    </div>
  );
};

export default BeachQuality;
