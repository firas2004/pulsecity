import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Trash2, Droplets } from 'lucide-react';
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

const DetailedInfrastructure = () => {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
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
      console.warn('Infrastructure fetch error:', e.message);
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

  const waste = metrics.waste_fill;
  const water = metrics.water_quality;
  const energy = metrics.energy;

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(14,165,233,0.12))',
        border: '1px solid rgba(139,92,246,0.3)', borderRadius: '20px', padding: '24px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#8B5CF6,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Infrastructure, Énergie & Réseaux ⚡ (18 Villes)
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Suivi de la consommation électrique globale, du taux de remplissage des conteneurs à déchets et de la pureté du réseau d'eau.
              {lastUpdate && <span style={{ marginLeft: '12px', color: '#8B5CF6', fontWeight: '700' }}>● Mis à jour {lastUpdate.toLocaleTimeString()}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* City Selector */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {CITIES.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCity(c)}
            style={{
              padding: '8px 16px', borderRadius: '999px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
              border: selectedCity.id === c.id ? '1px solid #8B5CF6' : '1px solid var(--border-color)',
              background: selectedCity.id === c.id ? 'rgba(139,92,246,0.15)' : 'var(--surface-2)',
              color: selectedCity.id === c.id ? '#8B5CF6' : 'var(--text-muted)',
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Infrastructure Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Waste Container Card */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${waste?.anomaly ? '#EF4444' : 'var(--border-color)'}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(132,204,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={20} color="#84CC16" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>Remplissage Conteneurs Déchets</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: waste?.anomaly ? '#EF4444' : '#84CC16' }}>
            {fmt(waste?.value, 1)} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>%</span>
          </div>
          <span style={{ fontSize: '12px', background: waste?.anomaly ? 'rgba(239,68,68,0.15)' : 'rgba(132,204,22,0.15)', color: waste?.anomaly ? '#EF4444' : '#84CC16', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', display: 'inline-block', marginTop: '10px' }}>
            {waste?.anomaly ? '⚠ Conteneur Plein' : '✓ Collecte Optimisée'}
          </span>
        </div>

        {/* Water Quality pH Card */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${water?.anomaly ? '#EF4444' : 'var(--border-color)'}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={20} color="#0EA5E9" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>Qualité de l'Eau Potable</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: water?.anomaly ? '#EF4444' : '#0EA5E9' }}>
            {fmt(water?.value, 2)} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>pH</span>
          </div>
          <span style={{ fontSize: '12px', background: water?.anomaly ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: water?.anomaly ? '#EF4444' : '#10B981', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', display: 'inline-block', marginTop: '10px' }}>
            {water?.anomaly ? '⚠ anomalie pH' : '✓ Eau Potable Parfaite'}
          </span>
        </div>

        {/* Grid Energy Card */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${energy?.anomaly ? '#EF4444' : 'var(--border-color)'}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="#8B5CF6" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>Charge du Réseau Électrique</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: energy?.anomaly ? '#EF4444' : '#8B5CF6' }}>
            {fmt(energy?.value, 1)} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>kWh</span>
          </div>
          <span style={{ fontSize: '12px', background: energy?.anomaly ? 'rgba(239,68,68,0.15)' : 'rgba(139,92,246,0.15)', color: energy?.anomaly ? '#EF4444' : '#8B5CF6', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', display: 'inline-block', marginTop: '10px' }}>
            {energy?.anomaly ? '⚠ Surcharge Réseau' : 'Consommation Normale'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DetailedInfrastructure;
