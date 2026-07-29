import React, { useState, useEffect, useCallback } from 'react';
import { Car, ParkingSquare, Users, PersonStanding } from 'lucide-react';
import CityMap from '../../components/CityMap';
import api from '../../services/api';
import { connectWebSocket } from '../../services/websocket';

const CITIES = [
  { id: 'tunis-centre', name: 'Tunis Centre', population: '650 000 hab.', density: '4 200 hab/km²' },
  { id: 'ariana',       name: 'Ariana',       population: '500 000 hab.', density: '3 800 hab/km²' },
  { id: 'ben-arous',    name: 'Ben Arous',    population: '600 000 hab.', density: '2 100 hab/km²' },
  { id: 'la-marsa',     name: 'La Marsa',     population: '90 000 hab.',  density: '1 200 hab/km²' },
  { id: 'sfax',         name: 'Sfax',         population: '330 000 hab.', density: '2 400 hab/km²' },
  { id: 'sousse',       name: 'Sousse',       population: '270 000 hab.', density: '2 900 hab/km²' },
  { id: 'gabes',        name: 'Gabès',        population: '140 000 hab.', density: '1 600 hab/km²' },
  { id: 'bizerte',      name: 'Bizerte',      population: '115 000 hab.', density: '1 800 hab/km²' },
  { id: 'kairouan',     name: 'Kairouan',     population: '120 000 hab.', density: '1 400 hab/km²' },
  { id: 'monastir',     name: 'Monastir',     population: '73 000 hab.',  density: '950 hab/km²' },
  { id: 'nabeul',       name: 'Nabeul',       population: '80 000 hab.',  density: '1 100 hab/km²' },
  { id: 'medenine',     name: 'Médenine',     population: '70 000 hab.',  density: '850 hab/km²' },
  { id: 'jendouba',     name: 'Jendouba',     population: '45 000 hab.',  density: '650 hab/km²' },
  { id: 'gafsa',        name: 'Gafsa',        population: '85 000 hab.',  density: '1 000 hab/km²' },
  { id: 'mahdia',       name: 'Mahdia',       population: '45 000 hab.',  density: '800 hab/km²' },
  { id: 'tozeur',       name: 'Tozeur',       population: '40 000 hab.',  density: '600 hab/km²' },
  { id: 'beja',         name: 'Béja',         population: '55 000 hab.',  density: '700 hab/km²' },
  { id: 'siliana',      name: 'Siliana',      population: '25 000 hab.',  density: '450 hab/km²' },
];

const fmt = (val, dec = 1) => (val !== undefined && val !== null ? Number(val).toFixed(dec) : '—');

const DetailedMobility = () => {
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
      console.warn('Mobility fetch error:', e.message);
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

  const traffic = metrics.traffic;
  const parking = metrics.parking;
  const pedestrian = metrics.pedestrian;
  const footTraffic = metrics.foot_traffic;

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.12))',
        border: '1px solid rgba(59,130,246,0.3)', borderRadius: '20px', padding: '24px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#3B82F6,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Car size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Mobilité & Parkings Détaillés 🚗 (18 Villes)
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Suivi en temps réel de la circulation routière, des places de parking et des flux piétons.
              {lastUpdate && <span style={{ marginLeft: '12px', color: '#3B82F6', fontWeight: '700' }}>● Mis à jour {lastUpdate.toLocaleTimeString()}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* City Selector (All 18 cities) */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {CITIES.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCity(c)}
            style={{
              padding: '8px 16px', borderRadius: '999px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
              border: selectedCity.id === c.id ? '1px solid #3B82F6' : '1px solid var(--border-color)',
              background: selectedCity.id === c.id ? 'rgba(59,130,246,0.15)' : 'var(--surface-2)',
              color: selectedCity.id === c.id ? '#3B82F6' : 'var(--text-muted)',
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Population Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--surface)', padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Population Urbaîne</span>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#3B82F6', marginTop: '4px' }}>{selectedCity.population}</div>
        </div>
        <div style={{ background: 'var(--surface)', padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Densité Démographique</span>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#8B5CF6', marginTop: '4px' }}>{selectedCity.density}</div>
        </div>
      </div>

      {/* 4 Core Mobility Sensor Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* 1. Trafic Routier */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${traffic?.anomaly ? '#EF4444' : 'var(--border-color)'}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Car size={20} color="#3B82F6" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>Trafic Routier</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: traffic?.anomaly ? '#EF4444' : '#3B82F6' }}>
            {fmt(traffic?.value, 1)} <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>v/min</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: traffic?.anomaly ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: traffic?.anomaly ? '#EF4444' : '#10B981', display: 'inline-block', marginTop: '8px' }}>
            {traffic?.anomaly ? '⚠ Trafic Dense' : '✓ Fluide'}
          </span>
        </div>

        {/* 2. Places Parking Libres */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${parking?.anomaly ? '#EF4444' : 'var(--border-color)'}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ParkingSquare size={20} color="#7C3AED" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>Places Parking Libres</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#7C3AED' }}>
            {fmt(parking?.value, 1)} <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>%</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: 'rgba(124,58,237,0.15)', color: '#7C3AED', display: 'inline-block', marginTop: '8px' }}>
            Disponibilité Globale
          </span>
        </div>

        {/* 3. Flux Piétonnier */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${pedestrian?.anomaly ? '#EF4444' : 'var(--border-color)'}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#F97316" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>Flux Piétonnier</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#F97316' }}>
            {fmt(pedestrian?.value, 1)} <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>p/min</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: 'rgba(249,115,22,0.15)', color: '#F97316', display: 'inline-block', marginTop: '8px' }}>
            Zone Piétonne
          </span>
        </div>

        {/* 4. Trafic Piéton Global */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${footTraffic?.anomaly ? '#EF4444' : 'var(--border-color)'}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(251,146,60,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonStanding size={20} color="#FB923C" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>Trafic Piéton Gare</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#FB923C' }}>
            {fmt(footTraffic?.value, 1)} <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>p/min</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: 'rgba(251,146,60,0.15)', color: '#FB923C', display: 'inline-block', marginTop: '8px' }}>
            Hub de Transport
          </span>
        </div>
      </div>

      {/* Interactive Map */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '16px', height: '380px' }}>
        <CityMap cityId={selectedCity.id} />
      </div>
    </div>
  );
};

export default DetailedMobility;
