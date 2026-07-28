import React from 'react';
import { Wind, Volume2, Thermometer, Droplets, Gauge, ShieldAlert, Sparkles } from 'lucide-react';

const DetailedEnvironment = () => {
  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.12))',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: '20px',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#10B981,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wind size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Analyse Environnementale & Qualité de l'Air 🌿
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Surveillance continue du CO₂, de la pollution sonore, des microclimats urbains et des anomalies climatiques.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* CO2 Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wind color="#10B981" />
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)' }}>Indice CO₂ & Qualité de l'Air</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#10B981', margin: '16px 0 8px 0' }}>420 ppm</div>
          <span style={{ fontSize: '12px', background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>✓ Qualité Excellente</span>
        </div>

        {/* Noise Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Volume2 color="#F59E0B" />
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)' }}>Pollution Sonore</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#F59E0B', margin: '16px 0 8px 0' }}>58 dB</div>
          <span style={{ fontSize: '12px', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>! Niveau Modéré</span>
        </div>

        {/* Temperature Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Thermometer color="#EF4444" />
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)' }}>Température Urbaine</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#EF4444', margin: '16px 0 8px 0' }}>26.5 °C</div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Météo de saison</span>
        </div>
      </div>
    </div>
  );
};

export default DetailedEnvironment;
