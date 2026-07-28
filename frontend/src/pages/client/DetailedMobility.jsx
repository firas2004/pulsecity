import React, { useState } from 'react';
import { Car, Users, ParkingSquare, Navigation, MapPin, Clock, AlertCircle } from 'lucide-react';
import CityMap from '../../components/CityMap';

const CITY_MOBILITY_DATA = {
  'tunis-centre': {
    population: '650 000 habitants',
    density: '4 200 hab/km²',
    parkings: [
      { name: 'Parking Municipal Lafayette', free: 88, total: 250, status: 'Disponible' },
      { name: 'Parking Place du Passage', free: 32, total: 180, status: 'Presque plein' },
      { name: 'Parking Kasbah Central', free: 110, total: 400, status: 'Disponible' },
    ],
    transitDelays: [
      { route: 'Avenue Bourguiba ➔ La Fayette', delay: '+12 min', status: 'Dense' },
      { route: 'Autoroute A1 (Entrée Sud)', delay: '+8 min', status: 'Fluide' },
      { route: 'Aéroport Tunis-Carthage ➔ Centre', delay: '+15 min', status: 'Ralenti' }
    ]
  },
  'ariana': {
    population: '500 000 habitants',
    density: '3 800 hab/km²',
    parkings: [
      { name: 'Parking Ariana Centre', free: 54, total: 160, status: 'Disponible' },
      { name: 'Parking Ennasr 2', free: 23, total: 100, status: 'Presque plein' },
    ],
    transitDelays: [
      { route: 'Technopôle El Ghazala ➔ Ennasr', delay: '+4 min', status: 'Fluide' },
      { route: 'Avenue Hédi Nouira', delay: '+10 min', status: 'Dense' }
    ]
  },
  'sousse': {
    population: '270 000 habitants',
    density: '2 900 hab/km²',
    parkings: [
      { name: 'Parking Port El Kantaoui', free: 85, total: 300, status: 'Disponible' },
      { name: 'Parking Médina Sousse', free: 15, total: 150, status: 'Complet' },
    ],
    transitDelays: [
      { route: 'Kantaoui ➔ Sousse Centre', delay: '+6 min', status: 'Fluide' }
    ]
  }
};

const CITIES = [
  { id: 'tunis-centre', name: 'Tunis Centre' },
  { id: 'ariana', name: 'Ariana' },
  { id: 'sousse', name: 'Sousse' },
];

const DetailedMobility = () => {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const mobData = CITY_MOBILITY_DATA[selectedCity.id] || CITY_MOBILITY_DATA['tunis-centre'];

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.12))',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: '20px',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#3B82F6,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Car size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Mobilité & Parkings Détaillés 🚗
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Analyse du trafic routier, disponibilité des parkings municipaux et temps d'itinéraire en temps réel.
            </p>
          </div>
        </div>
      </div>

      {/* City Selector */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {CITIES.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCity(c)}
            style={{
              padding: '10px 18px',
              borderRadius: '999px',
              border: selectedCity.id === c.id ? '1px solid #3B82F6' : '1px solid var(--border-color)',
              background: selectedCity.id === c.id ? 'rgba(59,130,246,0.15)' : 'var(--surface-2)',
              color: selectedCity.id === c.id ? '#3B82F6' : 'var(--text-muted)',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Population Urbaîne</span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#3B82F6', marginTop: '4px' }}>{mobData.population}</div>
        </div>
        <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Densité Démographique</span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#8B5CF6', marginTop: '4px' }}>{mobData.density}</div>
        </div>
      </div>

      {/* Parkings & Commutes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Parkings */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ParkingSquare size={18} color="#8B5CF6" /> Places de Parking Disponibles
          </h3>
          {mobData.parkings.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)', padding: '12px 16px', borderRadius: '12px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-main)' }}>{p.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Capacité: {p.total} places</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: p.free > 30 ? '#10B981' : '#EF4444' }}>{p.free} libres</span>
              </div>
            </div>
          ))}
        </div>

        {/* Commutes */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#3B82F6" /> Estimations des Retards de Trafic
          </h3>
          {mobData.transitDelays.map((t, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)', padding: '12px 16px', borderRadius: '12px' }}>
              <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-main)' }}>{t.route}</div>
              <span style={{ fontSize: '14px', fontWeight: '800', color: t.delay.includes('1') ? '#EF4444' : '#10B981' }}>{t.delay}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '16px', height: '380px' }}>
        <CityMap cityId={selectedCity.id} />
      </div>
    </div>
  );
};

export default DetailedMobility;
