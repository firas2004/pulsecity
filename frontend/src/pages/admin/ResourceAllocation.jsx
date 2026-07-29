import React, { useState, useEffect } from 'react';
import { BarChart3, AlertOctagon, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import api from '../../services/api';

const ResourceAllocation = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllocationData();
  }, []);

  const fetchAllocationData = async () => {
    try {
      const res = await api.get('/metrics/resource-allocation');
      setData(res.data || []);
    } catch (err) {
      console.error('Erreur chargement allocation ressources:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(59,130,246,0.12))',
        border: '1px solid rgba(168,85,247,0.3)',
        borderRadius: '20px',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#A855F7,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Allocation Inter-Villes des Ressources 📊
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Priorisation des interventions municipales basée sur l'accumulation d'anomalies et d'alertes critiques.
            </p>
          </div>
        </div>
      </div>

      {/* Allocation Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '20px', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Chargement de l'analyse d'allocation...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px' }}>
                <th style={{ padding: '12px' }}>Rang Priorité</th>
                <th style={{ padding: '12px' }}>Ville</th>
                <th style={{ padding: '12px' }}>Niveau de Priorité</th>
                <th style={{ padding: '12px' }}>Alertes Critiques</th>
                <th style={{ padding: '12px' }}>Avertissements</th>
                <th style={{ padding: '12px' }}>Métrique à Risque</th>
                <th style={{ padding: '12px' }}>Score de Risque</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={item.city_id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                  <td style={{ padding: '14px 12px', fontWeight: '800', color: idx === 0 ? '#EF4444' : idx === 1 ? '#F59E0B' : 'var(--text-muted)' }}>
                    #{idx + 1}
                  </td>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--text-main)' }}>
                    📍 {item.city_name}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                      background: item.priority_score >= 30 ? 'rgba(239,68,68,0.15)' : item.priority_score >= 10 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                      color: item.priority_score >= 30 ? '#EF4444' : item.priority_score >= 10 ? '#F59E0B' : '#10B981'
                    }}>
                      {item.priority_level}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', color: '#EF4444', fontWeight: '700' }}>{item.critical_alerts}</td>
                  <td style={{ padding: '14px 12px', color: '#F59E0B', fontWeight: '700' }}>{item.warning_alerts}</td>
                  <td style={{ padding: '14px 12px', color: 'var(--text-main)', fontWeight: '600' }}>{item.worst_metric}</td>
                  <td style={{ padding: '14px 12px', fontWeight: '800', color: 'var(--text-main)' }}>{item.priority_score} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ResourceAllocation;
