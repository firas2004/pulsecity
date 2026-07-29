import React, { useState, useEffect, useCallback } from 'react';
import { Trophy } from 'lucide-react';
import api from '../../services/api';
import { connectWebSocket } from '../../services/websocket';

const CITIES = [
  { id: 'tunis-centre', name: 'Tunis Centre' },
  { id: 'ariana',       name: 'Ariana' },
  { id: 'ben-arous',    name: 'Ben Arous' },
  { id: 'la-marsa',     name: 'La Marsa' },
  { id: 'sfax',         name: 'Sfax' },
  { id: 'sousse',       name: 'Sousse' },
  { id: 'gabes',        name: 'Gabès' },
  { id: 'bizerte',      name: 'Bizerte' },
  { id: 'kairouan',     name: 'Kairouan' },
  { id: 'monastir',     name: 'Monastir' },
  { id: 'nabeul',       name: 'Nabeul' },
  { id: 'medenine',     name: 'Médenine' },
  { id: 'jendouba',     name: 'Jendouba' },
  { id: 'gafsa',        name: 'Gafsa' },
  { id: 'mahdia',       name: 'Mahdia' },
  { id: 'tozeur',       name: 'Tozeur' },
  { id: 'beja',         name: 'Béja' },
  { id: 'siliana',      name: 'Siliana' },
];

const computeLivabilityScore = (metrics) => {
  if (!metrics || Object.keys(metrics).length === 0) return 75; // fallback
  let score = 100;

  // Deductions for bad metrics / anomalies
  if (metrics.air_co2?.value > 600) score -= 10;
  if (metrics.air_co2?.value > 800) score -= 15;
  if (metrics.traffic?.value > 100) score -= 10;
  if (metrics.traffic?.value > 200) score -= 15;
  if (metrics.noise?.value > 65) score -= 8;
  if (metrics.waste_fill?.value > 75) score -= 10;
  if (metrics.water_quality?.value && (metrics.water_quality.value < 6.5 || metrics.water_quality.value > 8.5)) score -= 10;

  // Anomalies
  Object.values(metrics).forEach(s => {
    if (s?.anomaly) score -= 8;
  });

  return Math.max(30, Math.min(100, Math.round(score)));
};

const airQualityLabel = (co2) => {
  if (!co2?.value) return 'Normale';
  if (co2.value < 450) return 'Excellente';
  if (co2.value < 600) return 'Bonne';
  if (co2.value < 750) return 'Moyenne';
  return 'Modérée';
};

const trafficStatusLabel = (traffic) => {
  if (!traffic?.value) return 'Fluide';
  if (traffic.value < 50) return 'Fluide';
  if (traffic.value < 120) return 'Modéré';
  if (traffic.value < 220) return 'Dense';
  return 'Très Dense';
};

const CityRanking = () => {
  const [cityData, setCityData] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch initial HTTP metrics for all cities
  const loadAllCities = useCallback(async () => {
    const newData = {};
    for (const city of CITIES) {
      try {
        const res = await api.get(`/metrics/${city.id}`);
        if (res.data && res.data.metrics) {
          newData[city.id] = res.data.metrics;
        }
      } catch (e) {}
    }
    setCityData(prev => ({ ...prev, ...newData }));
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    loadAllCities();

    // Connect WS for all 18 cities to get live streams!
    const cleanups = CITIES.map(city => {
      return connectWebSocket(city.id, (data) => {
        const sensorData = data.metrics || data.sensors;
        if (sensorData) {
          setCityData(prev => ({
            ...prev,
            [city.id]: { ...(prev[city.id] || {}), ...sensorData }
          }));
          setLastUpdate(new Date());
        }
      });
    });

    return () => { cleanups.forEach(c => c && c()); };
  }, [loadAllCities]);

  // Compute ranks dynamically
  const rankedCities = CITIES.map(c => {
    const m = cityData[c.id] || {};
    const score = computeLivabilityScore(m);
    return {
      ...c,
      score,
      air: airQualityLabel(m.air_co2),
      traffic: trafficStatusLabel(m.traffic),
      metrics: m,
    };
  }).sort((a, b) => b.score - a.score);

  const badges = ['🥇 1er - Qualité de Vie', '🥈 2ème - Eco-Leader', '🥉 3ème - Port Vert', 'Top 5', 'Top 5', 'Top 10', 'Top 10', 'Top 10', 'Top 10', 'Top 10'];

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(234,179,8,0.12))',
        border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px', padding: '24px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#F59E0B,#EAB308)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Classement & Indice de Livabilité Urbaine 🏆 (18 Villes)
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Score composite (0-100) calculé en temps réel sur l'ensemble des 18 gouvernorats et villes de Tunisie.
              {lastUpdate && <span style={{ marginLeft: '12px', color: '#F59E0B', fontWeight: '700' }}>● Mis à jour {lastUpdate.toLocaleTimeString()}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>Rang</th>
              <th style={{ padding: '12px' }}>Ville</th>
              <th style={{ padding: '12px' }}>Score de Livabilité</th>
              <th style={{ padding: '12px' }}>Qualité Air</th>
              <th style={{ padding: '12px' }}>Trafic</th>
              <th style={{ padding: '12px' }}>Distinction</th>
            </tr>
          </thead>
          <tbody>
            {rankedCities.map((c, idx) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '14px 12px', fontWeight: '800', fontSize: '16px', color: idx === 0 ? '#F59E0B' : idx === 1 ? '#94A3B8' : idx === 2 ? '#B45309' : 'var(--text-muted)' }}>
                  #{idx + 1}
                </td>
                <td style={{ padding: '14px 12px', fontWeight: '700', fontSize: '15px', color: 'var(--text-main)' }}>
                  {c.name}
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, maxWidth: '100px', height: '8px', borderRadius: '4px', background: 'var(--surface-2)', overflow: 'hidden' }}>
                      <div style={{ width: `${c.score}%`, height: '100%', background: 'linear-gradient(90deg,#10B981,#3B82F6)', borderRadius: '4px' }} />
                    </div>
                    <span style={{ fontWeight: '800', color: '#10B981', fontSize: '14px' }}>{c.score}/100</span>
                  </div>
                </td>
                <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{c.air}</td>
                <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{c.traffic}</td>
                <td style={{ padding: '14px 12px' }}>
                  <span style={{ background: 'var(--surface-2)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                    {badges[idx] || 'Ville Membre'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CityRanking;
