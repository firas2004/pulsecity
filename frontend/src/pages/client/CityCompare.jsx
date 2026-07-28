import React, { useState } from 'react';
import { GitCompare, Building2, Check, ArrowRight } from 'lucide-react';

const CITIES = [
  { id: 'tunis-centre', name: 'Tunis Centre', traffic: '65 v/min', air: '450 ppm', noise: '62 dB', energy: '320 kWh', ph: '7.4', parking: '65%' },
  { id: 'ariana', name: 'Ariana', traffic: '42 v/min', air: '410 ppm', noise: '55 dB', energy: '240 kWh', ph: '7.5', parking: '45%' },
  { id: 'la-marsa', name: 'La Marsa', traffic: '28 v/min', air: '380 ppm', noise: '48 dB', energy: '190 kWh', ph: '7.4', parking: '70%' },
  { id: 'sfax', name: 'Sfax', traffic: '78 v/min', air: '580 ppm', noise: '68 dB', energy: '410 kWh', ph: '7.8', parking: '30%' },
  { id: 'sousse', name: 'Sousse', traffic: '50 v/min', air: '430 ppm', noise: '58 dB', energy: '280 kWh', ph: '7.6', parking: '55%' },
  { id: 'bizerte', name: 'Bizerte', traffic: '35 v/min', air: '390 ppm', noise: '52 dB', energy: '210 kWh', ph: '7.4', parking: '60%' },
];

const CityCompare = () => {
  const [cityA, setCityA] = useState(CITIES[0]);
  const [cityB, setCityB] = useState(CITIES[1]);

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.12))',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: '20px',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#6366F1,#A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitCompare size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Comparaison Comparative des Villes 📈
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Comparez les indicateurs environnementaux, de mobilité et d'infrastructures côte à côte.
            </p>
          </div>
        </div>
      </div>

      {/* Selectors */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ flex: 1, background: 'var(--surface)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Première Ville</label>
          <select
            value={cityA.id}
            onChange={e => setCityA(CITIES.find(c => c.id === e.target.value))}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)', fontSize: '14px' }}
          >
            {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <ArrowRight size={24} color="#6366F1" />

        <div style={{ flex: 1, background: 'var(--surface)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Deuxième Ville</label>
          <select
            value={cityB.id}
            onChange={e => setCityB(CITIES.find(c => c.id === e.target.value))}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)', fontSize: '14px' }}
          >
            {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Side by side comparison table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Métrique / Indicateur</th>
              <th style={{ padding: '12px', color: '#6366F1', fontSize: '16px' }}>{cityA.name}</th>
              <th style={{ padding: '12px', color: '#A855F7', fontSize: '16px' }}>{cityB.name}</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontWeight: '600' }}>🚦 Trafic Routier</td>
              <td style={{ padding: '12px' }}>{cityA.traffic}</td>
              <td style={{ padding: '12px' }}>{cityB.traffic}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontWeight: '600' }}>💨 Qualité Air CO₂</td>
              <td style={{ padding: '12px' }}>{cityA.air}</td>
              <td style={{ padding: '12px' }}>{cityB.air}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontWeight: '600' }}>🔊 Niveau Sonore</td>
              <td style={{ padding: '12px' }}>{cityA.noise}</td>
              <td style={{ padding: '12px' }}>{cityB.noise}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontWeight: '600' }}>⚡ Consommation Énergie</td>
              <td style={{ padding: '12px' }}>{cityA.energy}</td>
              <td style={{ padding: '12px' }}>{cityB.energy}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontWeight: '600' }}>💧 Qualité de l'Eau</td>
              <td style={{ padding: '12px' }}>{cityA.ph} pH</td>
              <td style={{ padding: '12px' }}>{cityB.ph} pH</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', fontWeight: '600' }}>🅿️ Places Parking Libres</td>
              <td style={{ padding: '12px' }}>{cityA.parking}</td>
              <td style={{ padding: '12px' }}>{cityB.parking}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CityCompare;
