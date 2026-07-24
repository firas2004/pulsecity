import React, { useState, useEffect } from 'react';
import { Bell, Filter, RefreshCw, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import AlertBadge from '../../components/AlertBadge';
import api from '../../services/api';

const DEFAULT_CITIES = ['tunis-centre', 'ariana', 'la-marsa', 'sfax', 'sousse', 'ben-arous'];

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllAlerts = async () => {
    setRefreshing(true);
    try {
      const results = await Promise.allSettled(
        DEFAULT_CITIES.map(cityId => api.get(`/alerts/${cityId}`).then(r => ({ cityId, data: r.data })))
      );

      const allAlerts = [];
      results.forEach(r => {
        if (r.status === 'fulfilled') {
          const { cityId, data } = r.value;
          // API returns { db_alerts: [...], ml_anomalies: [...] }
          const dbAlerts = (data.db_alerts || []).map(a => ({ ...a, cityId }));
          const mlAlerts = (data.ml_anomalies || []).map(a => ({
            ...a,
            cityId,
            level: a.alert_level || 'Critical',
            message: a.message || `Anomalie ML: ${a.sensor_type} = ${Number(a.value || 0).toFixed(1)} ${a.unit || ''}`
          }));
          dbAlerts.forEach(a => allAlerts.push(a));
          mlAlerts.forEach(a => allAlerts.push(a));
        }
      });

      allAlerts.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      setAlerts(allAlerts);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAllAlerts(); }, []);

  const filtered = alerts.filter(a => {
    const levelMatch = filterLevel === 'All' || (a.alert_level || a.level || 'Warning') === filterLevel;
    const cityMatch = filterCity === 'All' || a.cityId === filterCity || a.zone?.toLowerCase().includes(filterCity.replace('-', ' '));
    return levelMatch && cityMatch;
  });

  const criticals = alerts.filter(a => (a.alert_level || a.level) === 'Critical').length;
  const warnings = alerts.filter(a => (a.alert_level || a.level) === 'Warning').length;

  const LevelIcon = ({ level }) => {
    if (level === 'Critical') return <XCircle size={16} style={{ color: '#EF4444' }} />;
    if (level === 'Warning') return <AlertTriangle size={16} style={{ color: '#F59E0B' }} />;
    return <CheckCircle size={16} style={{ color: '#10B981' }} />;
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={22} style={{ color: 'var(--warning)' }} /> Centre d'Alertes
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Toutes les anomalies détectées par les agents IA PulseCity
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchAllAlerts} disabled={refreshing}>
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Chargement...' : 'Rafraîchir'}
        </button>
      </div>

      {/* Stats rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Alertes', value: alerts.length, color: 'var(--primary)', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Critiques', value: criticals, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Avertissements', value: warnings, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' }
        ].map(stat => (
          <div key={stat.label} className="card" style={{ border: `1px solid ${stat.color}20`, background: stat.bg }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{stat.label}</p>
            <p style={{ fontSize: '32px', fontWeight: '800', color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Critical', 'Warning', 'Normal'].map(level => (
            <button key={level} onClick={() => setFilterLevel(level)}
              style={{
                padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                border: '1px solid var(--border-color)', cursor: 'pointer',
                backgroundColor: filterLevel === level ? 'var(--primary)' : 'var(--surface)',
                color: filterLevel === level ? '#FFF' : 'var(--text-main)'
              }}>
              {level === 'All' ? 'Tout' : level}
            </button>
          ))}
        </div>
        <select value={filterCity} onChange={e => setFilterCity(e.target.value)}
          style={{ padding: '6px 12px', backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '12px', outline: 'none' }}>
          <option value="All">Toutes les villes</option>
          {DEFAULT_CITIES.map(c => <option key={c} value={c}>{c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
        </select>
      </div>

      {/* Liste d'alertes */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '10px' }} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((alert, idx) => {
            const level = alert.alert_level || alert.level || 'Warning';
            return (
              <div key={idx} className="card" style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
                borderLeft: `4px solid ${level === 'Critical' ? '#EF4444' : level === 'Warning' ? '#F59E0B' : '#10B981'}`,
                transition: 'transform 0.2s'
              }}>
                <LevelIcon level={level} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500', marginBottom: '4px' }}>
                    {alert.message || alert.description || `${alert.sensor_type || 'Capteur'}: valeur ${alert.value} ${alert.unit || ''}`}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>📍 {alert.zone || alert.cityId?.replace('-', ' ') || 'Zone inconnue'}</span>
                    {alert.sensor_type && <span>• Capteur: {alert.sensor_type}</span>}
                    {alert.isolation_score && <span>• Score: {Number(alert.isolation_score).toFixed(3)}</span>}
                    <span>• {alert.timestamp ? new Date(alert.timestamp).toLocaleString('fr-FR') : 'Récent'}</span>
                  </div>
                </div>
                <AlertBadge level={level} />
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <CheckCircle size={40} style={{ marginBottom: '16px', color: '#10B981', opacity: 0.6 }} />
          <p style={{ fontSize: '16px', fontWeight: '500' }}>Aucune alerte trouvée</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Tous les systèmes fonctionnent normalement.</p>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
