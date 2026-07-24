import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, MapPin, Bell, ChevronDown, RefreshCw } from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import CityMap from '../../components/CityMap';
import SensorChart from '../../components/SensorChart';
import AgentAdvice from '../../components/AgentAdvice';
import AlertBadge from '../../components/AlertBadge';
import api from '../../services/api';
import { connectWebSocket } from '../../services/websocket';

// Villes disponibles par défaut (en attente de l'API)
const DEFAULT_CITIES = [
  { id: 'tunis-centre', name: 'Tunis Centre', lat: 36.8002, lon: 10.1860 },
  { id: 'ariana', name: 'Ariana', lat: 36.8665, lon: 10.1930 },
  { id: 'la-marsa', name: 'La Marsa', lat: 36.8830, lon: 10.3300 },
  { id: 'sfax', name: 'Sfax', lat: 34.7406, lon: 10.7603 },
  { id: 'sousse', name: 'Sousse', lat: 35.8256, lon: 10.6369 },
  { id: 'ben-arous', name: 'Ben Arous', lat: 36.7531, lon: 10.2222 }
];

const CHART_COLORS = {
  traffic: '#3B82F6', air_co2: '#10B981', noise: '#F59E0B',
  energy: '#8B5CF6', temperature: '#EF4444', humidity: '#06B6D4'
};

// Skeleton placeholder card
const SkeletonCard = () => (
  <div className="card" style={{ height: '120px' }}>
    <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '12px' }} />
    <div className="skeleton" style={{ height: '28px', width: '40%', marginBottom: '16px' }} />
    <div className="skeleton" style={{ height: '22px', width: '30%' }} />
  </div>
);

const ClientDashboard = () => {
  const [cities, setCities] = useState(DEFAULT_CITIES);
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0]);
  const [metrics, setMetrics] = useState({});
  const [history, setHistory] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [agentAdvice, setAgentAdvice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('traffic');
  const [cityStatuses, setCityStatuses] = useState({});
  const cleanupRef = useRef(null);

  // Charger les données initiales depuis l'API REST
  const fetchInitialData = useCallback(async (city) => {
    setLoading(true);
    try {
      const [metricsRes, alertsRes] = await Promise.allSettled([
        api.get(`/metrics/${city.id}`),
        api.get(`/alerts/${city.id}`)
      ]);

      if (metricsRes.status === 'fulfilled' && metricsRes.value.data) {
        const data = metricsRes.value.data;
        // API returns { city_id, name, metrics: {...} }
        setMetrics(data.metrics || data || {});
      }

      if (alertsRes.status === 'fulfilled' && alertsRes.value.data) {
        const alertData = alertsRes.value.data;
        // API returns { db_alerts: [...], ml_anomalies: [...], agent_advices: [...] }
        const dbAlerts = alertData.db_alerts || [];
        const mlAlerts = (alertData.ml_anomalies || []).map(a => ({
          ...a,
          level: a.alert_level || 'Critical',
          message: a.message || `Anomalie ML: ${a.sensor_type} = ${Number(a.value || 0).toFixed(1)} ${a.unit || ''}`
        }));
        const allAlerts = [...dbAlerts, ...mlAlerts];
        setAlerts(allAlerts.slice(0, 8));

        // Extraire les conseils des agents
        const advice = (alertData.agent_advices || []).slice(0, 3).map(adv => ({
          type: adv.agent_type || 'info',
          text: adv.advice,
          timestamp: new Date(adv.timestamp)
        }));
        setAgentAdvice(advice);
      }

      // Fetch history for the chart (last 2 hours for each sensor)
      const historyRes = await Promise.allSettled(
        ['traffic', 'air_co2', 'noise', 'energy'].map(sensor =>
          api.get(`/metrics/${city.id}/history?sensor=${sensor}&hours=2`)
            .then(r => ({ sensor, data: r.data }))
        )
      );
      const newHistory = {};
      historyRes.forEach(r => {
        if (r.status === 'fulfilled' && Array.isArray(r.value.data) && r.value.data.length > 0) {
          newHistory[r.value.sensor] = r.value.data.map(pt => ({
            time: pt.timestamp,
            value: pt.value
          }));
        }
      });
      if (Object.keys(newHistory).length > 0) setHistory(newHistory);

    } catch (err) {
      console.warn('Could not fetch initial data:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handler du WebSocket — le backend envoie { city_id, status, metrics: {...} }
  const handleWsMessage = useCallback((data) => {
    setWsStatus('connected');
    setLastUpdate(new Date());

    // Backend sends 'metrics', not 'sensors'
    const sensorData = data.metrics || data.sensors;
    if (sensorData) {
      setMetrics(prev => ({ ...prev, ...sensorData }));

      // Build real-time chart history
      const ts = new Date().toISOString();
      setHistory(prev => {
        const next = { ...prev };
        Object.entries(sensorData).forEach(([key, val]) => {
          if (val?.value !== null && val?.value !== undefined) {
            if (!next[key]) next[key] = [];
            next[key] = [...next[key].slice(-119), { time: ts, value: val.value }];
          }
        });
        return next;
      });

      // Update city status indicator
      const hasCritical = Object.values(sensorData).some(s => s?.anomaly || s?.status === 'Critical');
      const hasWarning = Object.values(sensorData).some(s => s?.status === 'Warning');
      setCityStatuses(prev => ({
        ...prev,
        [selectedCity.id]: hasCritical ? 'Critical' : hasWarning ? 'Warning' : 'Normal'
      }));
    }
  }, [selectedCity.id]);

  // Connecter WebSocket lors du changement de ville
  useEffect(() => {
    if (cleanupRef.current) cleanupRef.current();
    setWsStatus('connecting');
    setMetrics({});
    setHistory({});

    fetchInitialData(selectedCity);
    const cleanup = connectWebSocket(selectedCity.id, handleWsMessage);
    cleanupRef.current = cleanup;

    return () => { if (cleanupRef.current) cleanupRef.current(); };
  }, [selectedCity.id]);

  // Charger les villes depuis l'API si admin l'a configuré
  useEffect(() => {
    api.get('/admin/cities').then(res => {
      if (res.data && res.data.length > 0) {
        const mapped = res.data.map(c => ({
          id: c.id,
          name: c.name,
          lat: c.latitude || c.lat || 36.8002,
          lon: c.longitude || c.lon || 10.1860
        }));
        setCities(mapped);
        setSelectedCity(mapped[0]);
      }
    }).catch(() => {}); // Pas bloquant
  }, []);

  const currentStatus = cityStatuses[selectedCity.id] || 'Normal';
  const criticalCount = Object.values(metrics).filter(m => m?.anomaly || m?.status === 'Critical').length;
  const warningCount = Object.values(metrics).filter(m => m?.status === 'Warning').length;

  return (
    <div className="page-shell">
      <div className="dashboard-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">Tableau de bord client</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>Vue opérationnelle de {selectedCity.name}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-soft)', maxWidth: '640px' }}>Suivi des métriques, alertes et recommandations IA en temps réel depuis un espace de pilotage moderne.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="stat-chip"><Activity size={14} style={{ color: '#10B981' }} /> {currentStatus}</div>
          <div className="stat-chip"><Bell size={14} style={{ color: '#F59E0B' }} /> {alerts.length} alertes</div>
          <div className="stat-chip"><MapPin size={14} style={{ color: '#3B82F6' }} /> {selectedCity.name}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Métriques actives', value: Object.keys(metrics).length, accent: '#3B82F6' },
          { label: 'Alertes critiques', value: criticalCount, accent: '#EF4444' },
          { label: 'Conseils IA', value: agentAdvice.length, accent: '#8B5CF6' },
        ].map((item) => (
          <div key={item.label} className="card" style={{ padding: '14px 16px', border: `1px solid ${item.accent}22` }}>
            <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', color: item.accent }}>{item.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="insight-panel" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
        <div>
          <div className="kpi-pill" style={{ marginBottom: '10px' }}><Activity size={12} /> Espace mission control</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>Vue d’opérations immersive pour votre ville</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-soft)', lineHeight: 1.6 }}>
            Suivi temps réel, priorisation des incidents et recommandations IA, le tout dans une vue plus directe et professionnelle.
          </p>
        </div>
        <div style={{ display: 'grid', gap: '10px' }}>
          {[
            { label: 'État actuel', value: currentStatus, color: currentStatus === 'Critical' ? '#EF4444' : currentStatus === 'Warning' ? '#F59E0B' : '#10B981' },
            { label: 'Dernière mise à jour', value: lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR') : 'À l’instant', color: '#3B82F6' },
            { label: 'Source live', value: wsStatus === 'connected' ? 'Flux actif' : 'Connexion…', color: '#8B5CF6' },
          ].map((item) => (
            <div key={item.label} style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--surface-2)', border: `1px solid ${item.color}22` }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* En-tête : Statut global + Sélecteur de ville */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        {/* Statut global des villes */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '12px 20px', borderRadius: '10px',
          backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-color)',
          flexWrap: 'wrap', gap: '8px'
        }}>
          {cities.slice(0, 4).map(city => {
            const st = cityStatuses[city.id];
            let dot = '#6B7280';
            if (st === 'Critical') dot = '#EF4444';
            else if (st === 'Warning') dot = '#F59E0B';
            else if (st === 'Normal') dot = '#10B981';
            return (
              <div key={city.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dot, display: 'inline-block', boxShadow: `0 0 6px ${dot}` }} />
                <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>{city.name}</span>
                {st === 'Warning' && <span style={{ fontSize: '11px', color: '#F59E0B' }}>({warningCount} alertes)</span>}
              </div>
            );
          })}
          {lastUpdate && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
              • Mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
            </span>
          )}
        </div>

        {/* Sélecteur de ville */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} style={{ color: wsStatus === 'connected' ? '#10B981' : '#F59E0B' }} />
            <span style={{ fontSize: '12px', color: wsStatus === 'connected' ? '#10B981' : '#F59E0B', fontWeight: '500' }}>
              {wsStatus === 'connected' ? 'Live' : 'Connexion...'}
            </span>
          </span>

          <div style={{ position: 'relative' }}>
            <MapPin size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <select
              value={selectedCity.id}
              onChange={(e) => {
                const city = cities.find(c => c.id === e.target.value);
                if (city) setSelectedCity(city);
              }}
              style={{
                padding: '9px 32px 9px 32px',
                backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)',
                borderRadius: '8px', color: 'var(--text-main)', fontSize: '14px', fontWeight: '500',
                cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: '160px'
              }}
            >
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Grille de Métriques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          Object.entries(metrics).map(([type, data]) => (
            <div key={type} style={{ cursor: 'pointer' }} onClick={() => setSelectedMetric(type)}>
              <MetricCard
                type={type}
                value={data?.value}
                unit={data?.unit}
                status={data?.anomaly ? 'Critical' : data?.status || 'Normal'}
              />
            </div>
          ))
        )}
        {!loading && Object.keys(metrics).length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
            <RefreshCw size={24} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>En attente des données live du cluster...</p>
          </div>
        )}
      </div>

      {/* Rangée Carte + Graphique + Alertes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 380px', gap: '20px', minHeight: '380px' }}>
        {/* Carte Leaflet */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '12px' }}>
          <CityMap
            center={[selectedCity.lat, selectedCity.lon]}
            cityId={selectedCity.id}
            metrics={metrics}
            status={currentStatus}
          />
        </div>

        {/* Graphique Temps Réel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>Évolution Temps Réel</h3>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {Object.keys(metrics).map(key => (
                <button key={key} onClick={() => setSelectedMetric(key)}
                  style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                    border: 'none', cursor: 'pointer', textTransform: 'uppercase',
                    backgroundColor: selectedMetric === key ? CHART_COLORS[key] || '#3B82F6' : 'var(--surface-2)',
                    color: selectedMetric === key ? '#FFF' : 'var(--text-main)',
                    transition: 'all 0.2s'
                  }}>
                  {key}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minHeight: '260px' }}>
            <SensorChart
              data={history[selectedMetric] || []}
              metricName={selectedMetric}
              unit={metrics[selectedMetric]?.unit || ''}
              color={CHART_COLORS[selectedMetric] || '#3B82F6'}
            />
          </div>
        </div>

        {/* Panneau Alertes + Conseils IA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Bell size={16} style={{ color: '#F59E0B' }} />
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Alertes récentes</h3>
              {criticalCount > 0 && (
                <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', backgroundColor: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
                  {criticalCount} critique{criticalCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '50px', borderRadius: '8px' }} />
                ))
              ) : alerts.length > 0 ? (
                alerts.slice(0, 5).map((alert, idx) => (
                  <div key={idx} style={{
                    padding: '10px', borderRadius: '8px',
                    backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-color)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.4', marginBottom: '4px' }}>
                        {alert.message || alert.description || `${alert.sensor_type || 'Capteur'}: ${alert.value} ${alert.unit || ''}`}
                      </p>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {alert.zone || selectedCity.name} • {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString('fr-FR') : 'Récent'}
                      </span>
                    </div>
                    <AlertBadge level={alert.alert_level || alert.level || 'Warning'} />
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
                  ✓ Aucune alerte active
                </p>
              )}
            </div>
          </div>

          {/* Conseils IA */}
          {agentAdvice.length > 0 && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                Conseils Agents AI
              </h3>
              {agentAdvice.map((advice, idx) => (
                <AgentAdvice key={idx} type={advice.type} text={advice.text} timestamp={advice.timestamp} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
