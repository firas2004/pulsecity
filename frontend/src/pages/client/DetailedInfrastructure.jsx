import React from 'react';
import { Zap, Trash2, Droplets, Gauge, AlertTriangle, CheckCircle } from 'lucide-react';

const DetailedInfrastructure = () => {
  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(14,165,233,0.12))',
        border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: '20px',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#8B5CF6,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Infrastructure, Énergie & Réseaux ⚡
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Suivi de la consommation électrique globale, du taux de remplissage des conteneurs à déchets et de la pureté du réseau d'eau.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Waste Container Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Trash2 color="#84CC16" />
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)' }}>Remplissage Conteneurs Déchets</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#84CC16', margin: '16px 0 8px 0' }}>42 %</div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Collecte optimisée</span>
        </div>

        {/* Water Quality pH Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Droplets color="#0EA5E9" />
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)' }}>Qualité de l'Eau Potable</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#0EA5E9', margin: '16px 0 8px 0' }}>7.4 pH</div>
          <span style={{ fontSize: '12px', background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>✓ Eau Potable Parfaite</span>
        </div>

        {/* Grid Energy Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap color="#8B5CF6" />
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)' }}>Charge du Réseau Électrique</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#8B5CF6', margin: '16px 0 8px 0' }}>285 kWh</div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Consommation normale</span>
        </div>
      </div>
    </div>
  );
};

export default DetailedInfrastructure;
