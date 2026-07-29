import React, { useState, useEffect, useCallback } from 'react';
import { GitCompare, ArrowRight } from 'lucide-react';
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

const fmt = (val, dec = 1) => (val !== undefined && val !== null ? Number(val).toFixed(dec) : '—');

const CityCompare = () => {
  const [cityA, setCityA] = useState(CITIES[0]);
  const [cityB, setCityB] = useState(CITIES[1]);
  const [metricsA, setMetricsA] = useState({});
  const [metricsB, setMetricsB] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadDataA = useCallback(async (cityId) => {
    try {
      const res = await api.get(`/metrics/${cityId}`);
      if (res.data && res.data.metrics) {
        setMetricsA(res.data.metrics);
        setLastUpdate(new Date());
      }
    } catch (e) {}
  }, []);

  const loadDataB = useCallback(async (cityId) => {
    try {
      const res = await api.get(`/metrics/${cityId}`);
      if (res.data && res.data.metrics) {
        setMetricsB(res.data.metrics);
        setLastUpdate(new Date());
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    setMetricsA({});
    loadDataA(cityA.id);
    const cleanupA = connectWebSocket(cityA.id, (data) => {
      const sensorData = data.metrics || data.sensors;
      if (sensorData) {
        setMetricsA(prev => ({ ...prev, ...sensorData }));
        setLastUpdate(new Date());
      }
    });
    return () => { if (cleanupA) cleanupA(); };
  }, [cityA.id, loadDataA]);

  useEffect(() => {
    setMetricsB({});
    loadDataB(cityB.id);
    const cleanupB = connectWebSocket(cityB.id, (data) => {
      const sensorData = data.metrics || data.sensors;
      if (sensorData) {
        setMetricsB(prev => ({ ...prev, ...sensorData }));
        setLastUpdate(new Date());
      }
    });
    return () => { if (cleanupB) cleanupB(); };
  }, [cityB.id, loadDataB]);

  const rows = [
    { label: '🚦 Trafic Routier', sensorKey: 'traffic', unit: 'v/min' },
    { label: '💨 Qualité Air (CO₂)', sensorKey: 'air_co2', unit: 'ppm' },
    { label: '🔊 Niveau Sonore', sensorKey: 'noise', unit: 'dB' },
    { label: '⚡ Consommation Énergie', sensorKey: 'energy', unit: 'kWh' },
    { label: '💧 Qualité de l\'Eau', sensorKey: 'water_quality', unit: 'pH', dec: 2 },
    { label: '🅿️ Places Parking Libres', sensorKey: 'parking', unit: '%' },
    { label: '🌡️ Température', sensorKey: 'temperature', unit: '°C' },
    { label: '💧 Humidité', sensorKey: 'humidity', unit: '%' },
    { label: '🌬️ Vitesse du Vent', sensorKey: 'wind_speed', unit: 'km/h' },
    { label: '🚶 Flux Piétons', sensorKey: 'pedestrian', unit: 'p/min' },
    { label: '🗑️ Remplissage Déchets', sensorKey: 'waste_fill', unit: '%' },
  ];

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.12))',
        border: '1px solid rgba(99,102,241,0.3)', borderRadius: '20px', padding: '24px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#6366F1,#A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitCompare size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Comparaison Comparative des Villes 📈 (18 Villes)
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Comparez les 18 gouvernorats et villes de Tunisie côte à côte en temps réel.
              {lastUpdate && <span style={{ marginLeft: '12px', color: '#6366F1', fontWeight: '700' }}>● Mis à jour {lastUpdate.toLocaleTimeString()}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* City Selectors */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ flex: 1, background: 'var(--surface)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Première Ville</label>
          <select
            value={cityA.id}
            onChange={e => setCityA(CITIES.find(c => c.id === e.target.value))}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)', fontSize: '14px', fontWeight: '600' }}
          >
            {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <ArrowRight size={24} color="#6366F1" />

        <div style={{ flex: 1, background: 'var(--surface)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Deuxième Ville</label>
          <select
            value={cityB.id}
            onChange={e => setCityB(CITIES.find(c => c.id === e.target.value))}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)', fontSize: '14px', fontWeight: '600' }}
          >
            {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Comparison Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>Métrique / Indicateur</th>
              <th style={{ padding: '12px', color: '#6366F1', fontSize: '16px', fontWeight: '800' }}>{cityA.name}</th>
              <th style={{ padding: '12px', color: '#A855F7', fontSize: '16px', fontWeight: '800' }}>{cityB.name}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const mA = metricsA[r.sensorKey];
              const mB = metricsB[r.sensorKey];
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px 12px', fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>
                    {r.label}
                  </td>
                  <td style={{ padding: '14px 12px', fontWeight: '700', fontSize: '15px', color: mA?.anomaly ? '#EF4444' : '#6366F1' }}>
                    {fmt(mA?.value, r.dec || 1)} <span style={{ fontSize: '12px', fontWeight: '400', color: 'var(--text-muted)' }}>{r.unit}</span>
                  </td>
                  <td style={{ padding: '14px 12px', fontWeight: '700', fontSize: '15px', color: mB?.anomaly ? '#EF4444' : '#A855F7' }}>
                    {fmt(mB?.value, r.dec || 1)} <span style={{ fontSize: '12px', fontWeight: '400', color: 'var(--text-muted)' }}>{r.unit}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CityCompare;
