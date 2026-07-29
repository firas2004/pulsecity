import React, { useState, useEffect, useCallback } from 'react';
import { Waves, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import CityMap from '../../components/CityMap';
import api from '../../services/api';
import { connectWebSocket } from '../../services/websocket';

const COASTAL_CITIES = [
  { id: 'la-marsa', name: 'La Marsa', region: 'Tunis Nord' },
  { id: 'sousse',   name: 'Sousse',   region: 'Sahel' },
  { id: 'bizerte',  name: 'Bizerte',  region: 'Nord' },
  { id: 'monastir', name: 'Monastir', region: 'Sahel' },
  { id: 'nabeul',   name: 'Nabeul & Hammamet', region: 'Cap Bon' },
  { id: 'mahdia',   name: 'Mahdia',   region: 'Sahel' },
  { id: 'sfax',     name: 'Sfax',     region: 'Sud-Est' },
  { id: 'gabes',    name: 'Gabès',    region: 'Sud' },
  { id: 'medenine', name: 'Djerba (Médenine)', region: 'Sud' },
];

const BEACH_DESCRIPTIONS = {
  'la-marsa': [
    { name: 'Plage de La Marsa', desc: 'Plage sablonneuse populaire avec promenade et restaurants' },
    { name: 'Plage de Gammarth', desc: 'Zone balnéaire hôtelière haut de gamme' },
    { name: 'Crique Sidi Bou Saïd', desc: 'Port de plaisance et crique pittoresque au pied du village' }
  ],
  'sousse': [
    { name: 'Plage Boujaafar', desc: 'Grande plage urbaine au centre de Sousse' },
    { name: 'Port El Kantaoui', desc: 'Station balnéaire intégrée avec marina' },
    { name: 'Plage Las Vegas', desc: 'Plage côtière avec animation estivale' }
  ],
  'bizerte': [
    { name: 'Corniche de Bizerte', desc: 'Longue baie surplombée par le fort d\'Espagne' },
    { name: 'Plage Les Grottes', desc: 'Crique naturelle sauvage au cap Blanc' },
    { name: 'Plage Rmel', desc: 'Plage de sable fin bordée de forêts de pins' }
  ],
  'monastir': [
    { name: 'Plage Qaraiya', desc: 'Plage au pied du Ribat historique' },
    { name: 'Plage Skanès', desc: 'Zone touristique balnéaire avec clubs nautiques' }
  ],
  'nabeul': [
    { name: 'Plage de Kélibia Fort', desc: 'L\'un des plus beaux sables blancs du bassin méditerranéen' },
    { name: 'Plage Yasmine Hammamet', desc: 'Station balnéaire majeure avec parcs aquatiques' }
  ],
  'mahdia': [
    { name: 'Plage Salakta', desc: 'Plage historique au sable fin et eau turquoise' },
    { name: 'Zone Touristique Mahdia', desc: 'Plage calme bordée par des récifs coralliens' }
  ],
  'sfax': [
    { name: 'Plage Chaffar', desc: 'Grande plage sablonneuse fréquentée par les familles' }
  ],
  'gabes': [
    { name: 'Plage Lemawa', desc: 'Seule oasis maritime de la Méditerranée' }
  ],
  'medenine': [
    { name: 'Plage Sidi Mahrez (Djerba)', desc: 'Célèbre plage de l\'île de Djerba' },
    { name: 'Plage Seguia (Djerba)', desc: 'Lagon naturel aux eaux cristallines' }
  ]
};

const fmt = (val, dec = 1) => (val !== undefined && val !== null ? Number(val).toFixed(dec) : '—');

const BeachQuality = () => {
  const [selectedCity, setSelectedCity] = useState(COASTAL_CITIES[0]);
  const [metrics, setMetrics] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadData = useCallback(async (cityId) => {
    try {
      const res = await api.get(`/metrics/${cityId}`);
      if (res.data && res.data.metrics) {
        setMetrics(res.data.metrics);
        setLastUpdate(new Date());
      }
    } catch (e) {
      console.warn('Beach metrics fetch error:', e.message);
    }
  }, []);

  useEffect(() => {
    setMetrics({});
    loadData(selectedCity.id);

    const cleanup = connectWebSocket(selectedCity.id, (data) => {
      const sensorData = data.metrics || data.sensors;
      if (sensorData) {
        setMetrics(prev => ({ ...prev, ...sensorData }));
        setLastUpdate(new Date());
      }
    });

    return () => { if (cleanup) cleanup(); };
  }, [selectedCity.id, loadData]);

  const water = metrics.water_quality;
  const temp = metrics.temperature;
  const wind = metrics.wind_speed;
  const pedestrian = metrics.pedestrian;

  const beaches = BEACH_DESCRIPTIONS[selectedCity.id] || [];

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(59,130,246,0.12))',
        border: '1px solid rgba(14,165,233,0.3)', borderRadius: '20px', padding: '24px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#0EA5E9,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Waves size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Qualité des Plages & Indice de Baignade 🏖️ ({COASTAL_CITIES.length} Villes Côtières)
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Suivi de la température de la mer, qualité du pH de l'eau et état de baignade des côtes tunisiennes.
              {lastUpdate && <span style={{ marginLeft: '12px', color: '#0EA5E9', fontWeight: '700' }}>● Mis à jour {lastUpdate.toLocaleTimeString()}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* City Selector Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {COASTAL_CITIES.map((city) => {
          const isSelected = selectedCity.id === city.id;
          return (
            <button
              key={city.id}
              onClick={() => setSelectedCity(city)}
              style={{
                padding: '10px 18px', borderRadius: '999px',
                border: isSelected ? '1px solid #0EA5E9' : '1px solid var(--border-color)',
                background: isSelected ? 'rgba(14,165,233,0.15)' : 'var(--surface-2)',
                color: isSelected ? '#0EA5E9' : 'var(--text-muted)',
                fontWeight: isSelected ? '700' : '500', fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
              }}
            >
              <MapPin size={14} /> {city.name}
            </button>
          );
        })}
      </div>

      {/* Live Sensors Summary Bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px',
        background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '16px', padding: '16px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>💧 pH Eau Potable/Mer</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#0EA5E9' }}>{fmt(water?.value, 2)} pH</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🌡️ Température Eau</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#EF4444' }}>{fmt(temp?.value, 1)} °C</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🌬️ Vent Côtier</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#8B5CF6' }}>{fmt(wind?.value, 1)} km/h</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🚶 Affluence Plage</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#F97316' }}>{fmt(pedestrian?.value, 1)} p/min</div>
        </div>
      </div>

      {/* Beach List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {beaches.map((b, idx) => {
          const isIdeal = !water?.anomaly;
          return (
            <div key={idx} style={{
              background: 'var(--surface)',
              border: isIdeal ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
              borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--text-main)' }}>
                  🌊 {b.name}
                </h3>
                <span style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                  background: isIdeal ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  color: isIdeal ? '#10B981' : '#EF4444',
                  display: 'flex', alignItems: 'center', gap: '4px'
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
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>pH Eau</span>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0EA5E9' }}>{fmt(water?.value, 2)} pH</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Temp. Eau</span>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#EF4444' }}>{fmt(temp?.value, 1)} °C</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vent</span>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#8B5CF6' }}>{fmt(wind?.value, 1)} km/h</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Affluence</span>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#F97316' }}>{fmt(pedestrian?.value, 1)} p/min</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Map */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
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
