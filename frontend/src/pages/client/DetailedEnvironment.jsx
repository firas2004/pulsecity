import React, { useState, useEffect, useCallback } from 'react';
import { Wind, Volume2, Thermometer, Droplets, Gauge } from 'lucide-react';
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

const DetailedEnvironment = () => {
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
      console.warn('Environment fetch error:', e.message);
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

  const co2 = metrics.air_co2;
  const noise = metrics.noise;
  const temp = metrics.temperature;
  const hum = metrics.humidity;
  const wind = metrics.wind_speed;

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.12))',
        border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '24px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#10B981,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wind size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Analyse Environnementale & Qualité de l'Air 🌿 (18 Villes)
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Surveillance continue du CO₂, de la pollution sonore, des microclimats urbains et des vents.
              {lastUpdate && <span style={{ marginLeft: '12px', color: '#10B981', fontWeight: '700' }}>● Mis à jour {lastUpdate.toLocaleTimeString()}</span>}
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
              border: selectedCity.id === c.id ? '1px solid #10B981' : '1px solid var(--border-color)',
              background: selectedCity.id === c.id ? 'rgba(16,185,129,0.15)' : 'var(--surface-2)',
              color: selectedCity.id === c.id ? '#10B981' : 'var(--text-muted)',
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Sensor Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* CO2 */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${co2?.anomaly ? '#EF4444' : 'var(--border-color)'}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wind size={20} color="#10B981" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>CO₂ & Qualité Air</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: co2?.anomaly ? '#EF4444' : '#10B981' }}>
            {fmt(co2?.value, 1)} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ppm</span>
          </div>
          <span style={{ fontSize: '12px', background: co2?.anomaly ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: co2?.anomaly ? '#EF4444' : '#10B981', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', display: 'inline-block', marginTop: '10px' }}>
            {co2?.anomaly ? '⚠ Pollué' : '✓ Qualité Excellente'}
          </span>
        </div>

        {/* Noise */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${noise?.anomaly ? '#EF4444' : 'var(--border-color)'}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Volume2 size={20} color="#F59E0B" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>Pollution Sonore</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: noise?.anomaly ? '#EF4444' : '#F59E0B' }}>
            {fmt(noise?.value, 1)} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>dB</span>
          </div>
          <span style={{ fontSize: '12px', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', display: 'inline-block', marginTop: '10px' }}>
            Niveau Sonore
          </span>
        </div>

        {/* Temperature */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${temp?.anomaly ? '#EF4444' : 'var(--border-color)'}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Thermometer size={20} color="#EF4444" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>Température</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#EF4444' }}>
            {fmt(temp?.value, 1)} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>°C</span>
          </div>
          <span style={{ fontSize: '12px', background: 'rgba(239,68,68,0.15)', color: '#EF4444', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', display: 'inline-block', marginTop: '10px' }}>
            Météo Urbaine
          </span>
        </div>

        {/* Humidity */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${hum?.anomaly ? '#EF4444' : 'var(--border-color)'}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={20} color="#06B6D4" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>Humidité</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#06B6D4' }}>
            {fmt(hum?.value, 1)} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>%</span>
          </div>
          <span style={{ fontSize: '12px', background: 'rgba(6,182,212,0.15)', color: '#06B6D4', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', display: 'inline-block', marginTop: '10px' }}>
            Taux d'Humidité
          </span>
        </div>

        {/* Wind Speed */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${wind?.anomaly ? '#EF4444' : 'var(--border-color)'}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(100,116,139,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gauge size={20} color="#64748B" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>Vitesse du Vent</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#64748B' }}>
            {fmt(wind?.value, 1)} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>km/h</span>
          </div>
          <span style={{ fontSize: '12px', background: 'rgba(100,116,139,0.15)', color: '#64748B', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', display: 'inline-block', marginTop: '10px' }}>
            Vent Soufflant
          </span>
        </div>
      </div>
    </div>
  );
};

export default DetailedEnvironment;
