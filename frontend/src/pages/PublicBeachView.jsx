import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Waves, CheckCircle, AlertTriangle, MapPin, ShieldAlert, Sun, Thermometer, Wind } from 'lucide-react';
import CityMap from '../components/CityMap';

const COASTAL_CITIES_DICT = {
  'la-marsa': { id: 'la-marsa', name: 'La Marsa', region: 'Tunis Nord' },
  'sousse': { id: 'sousse', name: 'Sousse', region: 'Sahel' },
  'monastir': { id: 'monastir', name: 'Monastir', region: 'Sahel' },
  'bizerte': { id: 'bizerte', name: 'Bizerte', region: 'Nord' },
  'nabeul': { id: 'nabeul', name: 'Nabeul & Hammamet', region: 'Cap Bon' },
  'mahdia': { id: 'mahdia', name: 'Mahdia', region: 'Sahel' },
  'sfax': { id: 'sfax', name: 'Sfax', region: 'Sud-Est' },
  'gabes': { id: 'gabes', name: 'Gabès', region: 'Sud' },
};

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
    { name: 'Plage Les Grottes', status: 'Ideal', ph: 7.5, seaTemp: '23°C', uv: 6, wind: '16 km/h', crowd: 'Faible', desc: 'Crique naturelle sauvage au cap Blanc' }
  ],
  'monastir': [
    { name: 'Plage Qaraiya', status: 'Ideal', ph: 7.6, seaTemp: '26°C', uv: 7, wind: '12 km/h', crowd: 'Élevée', desc: 'Plage au pied du Ribat historique' },
    { name: 'Plage Skanès', status: 'Ideal', ph: 7.5, seaTemp: '26°C', uv: 7, wind: '13 km/h', crowd: 'Modérée', desc: 'Zone touristique balnéaire avec clubs nautiques' }
  ]
};

const PublicBeachView = () => {
  const { cityId } = useParams();
  const currentCity = COASTAL_CITIES_DICT[cityId || 'la-marsa'] || COASTAL_CITIES_DICT['la-marsa'];
  const beaches = BEACH_DATA[currentCity.id] || BEACH_DATA['la-marsa'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0B1120', color: '#F8FAFC', padding: '32px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Public Tourism Header */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(59,130,246,0.15))',
          border: '1px solid rgba(14,165,233,0.3)',
          borderRadius: '24px',
          padding: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg,#0EA5E9,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Waves size={30} color="#FFF" />
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#0EA5E9', letterSpacing: '1px', textTransform: 'uppercase' }}>Portail Touristique Officiel</span>
              <h1 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '800', color: '#FFF' }}>
                Qualité des Plages — {currentCity.name} 🏖️
              </h1>
            </div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ padding: '6px 14px', borderRadius: '20px', background: 'rgba(16,185,129,0.15)', color: '#10B981', fontWeight: '700', fontSize: '13px' }}>
              🟢 Bulletin Baignade Direct
            </span>
          </div>
        </div>

        {/* Beach Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {beaches.map((b, idx) => {
            const isIdeal = b.status === 'Ideal';
            return (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.04)',
                border: isIdeal ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#FFF' }}>🌊 {b.name}</h3>
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                    background: isIdeal ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                    color: isIdeal ? '#10B981' : '#F59E0B'
                  }}>
                    {isIdeal ? 'Baignade Autorisée' : 'Prudence Recommandée'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', lineHeight: '1.5' }}>{b.desc}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>pH Qualité Eau</span>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#0EA5E9' }}>{b.ph} pH</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Temp. Eau</span>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#EF4444' }}>{b.seaTemp}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Indice UV</span>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#F59E0B' }}>{b.uv} / 11</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Affluence</span>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#10B981' }}>{b.crowd}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '20px', height: '380px' }}>
          <CityMap cityId={currentCity.id} />
        </div>
      </div>
    </div>
  );
};

export default PublicBeachView;
