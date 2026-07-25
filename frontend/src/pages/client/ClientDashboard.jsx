import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity, MapPin, Bell, ChevronDown, RefreshCw,
  Car, Wind, Volume2, Zap, Thermometer, Droplets,
  Gauge, Users, Trash2, ParkingSquare, PersonStanding,
  AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Wifi, WifiOff, ChevronRight, X, MessageCircle, Info
} from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import CityMap from '../../components/CityMap';
import SensorChart from '../../components/SensorChart';
import AgentAdvice from '../../components/AgentAdvice';
import AlertBadge from '../../components/AlertBadge';
import api from '../../services/api';
import { connectWebSocket } from '../../services/websocket';

/* ─── Constants ────────────────────────────────────────────────── */
const DEFAULT_CITIES = [
  { id: 'tunis-centre', name: 'Tunis Centre', lat: 36.8002, lon: 10.1860 },
  { id: 'ariana',       name: 'Ariana',       lat: 36.8665, lon: 10.1930 },
  { id: 'la-marsa',     name: 'La Marsa',     lat: 36.8830, lon: 10.3300 },
  { id: 'sfax',         name: 'Sfax',         lat: 34.7406, lon: 10.7603 },
  { id: 'sousse',       name: 'Sousse',       lat: 35.8256, lon: 10.6369 },
  { id: 'ben-arous',    name: 'Ben Arous',    lat: 36.7531, lon: 10.2222 },
];

const CHART_COLORS = {
  traffic: '#3B82F6', air_co2: '#10B981', noise: '#F59E0B', energy: '#8B5CF6',
  temperature: '#EF4444', humidity: '#06B6D4', wind_speed: '#64748B',
  pedestrian: '#F97316', waste_fill: '#84CC16',
  water_quality: '#0EA5E9', parking: '#7C3AED', foot_traffic: '#FB923C',
};

const METRIC_GROUPS = [
  {
    id: 'mobility', label: '🚦 Mobilité', accent: '#3B82F6',
    keys: ['traffic', 'foot_traffic', 'pedestrian', 'parking'],
  },
  {
    id: 'environment', label: '🌿 Environnement', accent: '#10B981',
    keys: ['air_co2', 'noise', 'temperature', 'humidity'],
  },
  {
    id: 'infrastructure', label: '⚡ Infrastructure', accent: '#8B5CF6',
    keys: ['energy', 'wind_speed', 'waste_fill', 'water_quality'],
  },
];

const METRIC_LABELS = {
  traffic: 'Trafic Routier', foot_traffic: 'Flux Piétons Gare',
  pedestrian: 'Flux Piétonnier', parking: 'Places Parking Libres',
  air_co2: 'Qualité de l\'Air', noise: 'Niveau Sonore',
  temperature: 'Température', humidity: 'Humidité',
  energy: 'Consommation Énergie', wind_speed: 'Vitesse du Vent',
  waste_fill: 'Remplissage Poubelles', water_quality: 'Qualité Eau (pH)',
};

const ICON_MAP = {
  traffic: Car, foot_traffic: PersonStanding, pedestrian: Users, parking: ParkingSquare,
  air_co2: Wind, noise: Volume2, temperature: Thermometer, humidity: Droplets,
  energy: Zap, wind_speed: Gauge, waste_fill: Trash2, water_quality: Droplets,
};

const UNIT_MAP = {
  traffic: 'v/min', foot_traffic: 'p/min', pedestrian: 'p/min', parking: '%',
  air_co2: 'ppm', noise: 'dB', temperature: '°C', humidity: '%',
  energy: 'kWh', wind_speed: 'km/h', waste_fill: '%', water_quality: 'pH',
};

/* ─── Compact Metric Tile ───────────────────────────────────────── */
const MetricTile = ({ type, data, selected, onClick }) => {
  const Icon = ICON_MAP[type] || Activity;
  const label = METRIC_LABELS[type] || type;
  const color = CHART_COLORS[type] || '#6366F1';
  const val = data?.value;
  const isAnom = data?.anomaly || data?.status === 'Critical';
  const isWarn = data?.status === 'Warning';
  const statusColor = isAnom ? '#EF4444' : isWarn ? '#F59E0B' : '#10B981';

  return (
    <div
      onClick={onClick}
      style={{
        background: selected
          ? `linear-gradient(135deg, ${color}22, ${color}11)`
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selected ? color : isAnom ? '#EF444440' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '16px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: `${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span style={{
          fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em',
          padding: '3px 8px', borderRadius: '20px',
          background: `${statusColor}18`, color: statusColor,
        }}>
          {isAnom ? '⚠ ALERTE' : isWarn ? '! AVERT.' : '✓ OK'}
        </span>
      </div>

      {/* Value */}
      <div style={{ marginBottom: '4px' }}>
        <span style={{ fontSize: '26px', fontWeight: '800', color: '#F1F5F9', letterSpacing: '-0.02em' }}>
          {val !== undefined && val !== null ? Number(val).toFixed(1) : '—'}
        </span>
        <span style={{ fontSize: '12px', color: '#64748B', marginLeft: '4px' }}>
          {data?.unit || UNIT_MAP[type] || ''}
        </span>
      </div>

      {/* Label */}
      <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500', lineHeight: 1.3 }}>
        {label}
      </div>

      {/* Selected glow strip */}
      {selected && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }} />
      )}
    </div>
  );
};

/* ─── Compact Alert Row ─────────────────────────────────────────── */
const AlertRow = ({ alert }) => {
  const isErr = alert.alert_level === 'Critical' || alert.level === 'Critical';
  const color = isErr ? '#EF4444' : '#F59E0B';
  const msg = alert.message || alert.description
    || `${alert.sensor_type || 'Capteur'}: ${Number(alert.value || 0).toFixed(1)} ${alert.unit || ''}`;
  const time = alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '8px 12px', borderRadius: '10px',
      background: `${color}0D`, border: `1px solid ${color}25`,
    }}>
      <AlertTriangle size={14} style={{ color, flexShrink: 0 }} />
      <p style={{ fontSize: '12px', color: '#CBD5E1', flex: 1, margin: 0, lineHeight: 1.4,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg}</p>
      <span style={{ fontSize: '10px', color: '#64748B', flexShrink: 0 }}>{time}</span>
    </div>
  );
};

/* ─── Main Component ────────────────────────────────────────────── */
const ClientDashboard = () => {
  const [cities, setCities] = useState(DEFAULT_CITIES);
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0]);
  const [metrics, setMetrics] = useState({});
  const [history, setHistory] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [agentAdvice, setAgentAdvice] = useState([]);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('traffic');
  const [cityStatuses, setCityStatuses] = useState({});
  const [showAlerts, setShowAlerts] = useState(false);
  const cleanupRef = useRef(null);

  const criticalCount = alerts.filter(a => a.alert_level === 'Critical' || a.level === 'Critical').length;
  const currentStatus = cityStatuses[selectedCity.id] || 'Normal';

  /* Fetch initial data */
  const fetchInitialData = useCallback(async (city) => {
    setLoading(true);
    try {
      const alertRes = await api.get(`/metrics/${city.id}/alerts`);
      const alertData = alertRes.data || {};
      const dbAlerts = (alertData.alerts || []).map(a => ({ ...a, level: a.alert_level || 'Warning' }));
      const mlAlerts = (alertData.anomalies || []).map(a => ({
        ...a, level: a.alert_level || 'Critical',
        message: a.message || `ML: ${a.sensor_type} = ${Number(a.value || 0).toFixed(1)} ${a.unit || ''}`
      }));
      setAlerts([...dbAlerts, ...mlAlerts].slice(0, 10));
      setAgentAdvice((alertData.agent_advices || []).slice(0, 3).map(adv => ({
        type: adv.agent_type || 'info', text: adv.advice, timestamp: new Date(adv.timestamp)
      })));

      const ALL_SENSOR_TYPES = [
        'traffic', 'air_co2', 'noise', 'energy',
        'temperature', 'humidity', 'wind_speed', 'pedestrian', 'waste_fill',
        'water_quality', 'parking', 'foot_traffic',
      ];
      const historyRes = await Promise.allSettled(
        ALL_SENSOR_TYPES.map(sensor =>
          api.get(`/metrics/${city.id}/history?sensor=${sensor}&hours=2`)
            .then(r => ({ sensor, data: r.data }))
        )
      );
      const newHistory = {};
      historyRes.forEach(r => {
        if (r.status === 'fulfilled' && Array.isArray(r.value.data) && r.value.data.length > 0) {
          newHistory[r.value.sensor] = r.value.data.map(pt => ({ time: pt.timestamp, value: pt.value }));
        }
      });
      if (Object.keys(newHistory).length > 0) setHistory(newHistory);
    } catch (err) {
      console.warn('Could not fetch initial data:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /* WebSocket handler */
  const handleWsMessage = useCallback((data) => {
    setWsStatus('connected');
    setLastUpdate(new Date());
    const sensorData = data.metrics || data.sensors;
    if (sensorData) {
      setMetrics(prev => ({ ...prev, ...sensorData }));
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
      const hasCritical = Object.values(sensorData).some(s => s?.anomaly || s?.status === 'Critical');
      const hasWarning = Object.values(sensorData).some(s => s?.status === 'Warning');
      setCityStatuses(prev => ({
        ...prev, [selectedCity.id]: hasCritical ? 'Critical' : hasWarning ? 'Warning' : 'Normal'
      }));
    }
  }, [selectedCity.id]);

  /* Connect WS on city change */
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

  /* Load cities */
  useEffect(() => {
    api.get('/admin/cities').then(res => {
      if (res.data?.length > 0) {
        setCities(res.data);
        setSelectedCity(res.data[0]);
      }
    }).catch(() => {});
  }, []);

  /* Set first available metric as selected when data arrives */
  useEffect(() => {
    const keys = Object.keys(metrics);
    if (keys.length > 0 && !metrics[selectedMetric]) {
      setSelectedMetric(keys[0]);
    }
  }, [metrics]);

  const statusColor = currentStatus === 'Critical' ? '#EF4444' : currentStatus === 'Warning' ? '#F59E0B' : '#10B981';
  const activeMetricCount = Object.keys(metrics).length;

  /* ─── RENDER ────────────────────────────────────────────────── */
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0F1E 0%, #0D1B2A 50%, #0A1628 100%)',
      color: '#F1F5F9',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '0',
    }}>

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 28px',
        display: 'flex', alignItems: 'center', gap: '16px', height: '60px',
      }}>
        {/* City selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <MapPin size={16} style={{ color: '#3B82F6' }} />
          <select
            value={selectedCity.id}
            onChange={e => { const c = cities.find(x => x.id === e.target.value); if (c) setSelectedCity(c); }}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: '#F1F5F9', fontSize: '14px', fontWeight: '600',
              padding: '6px 28px 6px 10px', cursor: 'pointer', outline: 'none', appearance: 'none',
            }}
          >
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown size={14} style={{ color: '#64748B', marginLeft: '-22px', pointerEvents: 'none' }} />
        </div>

        {/* Status pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px',
            background: wsStatus === 'connected' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
            border: `1px solid ${wsStatus === 'connected' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
            borderRadius: '20px', fontSize: '12px', fontWeight: '600',
            color: wsStatus === 'connected' ? '#10B981' : '#F59E0B',
          }}>
            {wsStatus === 'connected'
              ? <><span style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', boxShadow: '0 0 6px #10B981' }} />Live</>
              : <><WifiOff size={12} />Connexion...</>
            }
          </div>

          {/* Alerts bell */}
          <button onClick={() => setShowAlerts(!showAlerts)} style={{
            position: 'relative', background: criticalCount > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${criticalCount > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '10px', padding: '7px 12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            color: criticalCount > 0 ? '#EF4444' : '#94A3B8', fontSize: '13px', fontWeight: '600',
          }}>
            <Bell size={14} />
            <span>{alerts.length} alertes</span>
            {criticalCount > 0 && (
              <span style={{ background: '#EF4444', color: '#fff', borderRadius: '10px',
                fontSize: '10px', fontWeight: '800', padding: '1px 6px' }}>{criticalCount}</span>
            )}
          </button>

          {/* Global status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px',
            background: `${statusColor}12`, border: `1px solid ${statusColor}30`,
            borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: statusColor,
          }}>
            <span style={{ width: '6px', height: '6px', background: statusColor, borderRadius: '50%',
              boxShadow: `0 0 6px ${statusColor}` }} />
            {currentStatus === 'Normal' ? 'Nominal' : currentStatus === 'Warning' ? 'Vigilance' : 'Critique'}
          </div>

          {/* Update time */}
          {lastUpdate && (
            <span style={{ fontSize: '11px', color: '#475569' }}>
              MàJ {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* ── ALERTS DROPDOWN ─────────────────────────────────────── */}
      {showAlerts && (
        <div style={{
          position: 'fixed', top: '60px', right: '28px', zIndex: 200, width: '420px',
          background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '700', fontSize: '14px', color: '#F1F5F9' }}>
              Alertes actives — {selectedCity.name}
            </span>
            <button onClick={() => setShowAlerts(false)}
              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {alerts.length === 0
              ? <p style={{ color: '#64748B', textAlign: 'center', padding: '20px', fontSize: '13px' }}>✓ Aucune alerte active</p>
              : alerts.map((a, i) => <AlertRow key={i} alert={a} />)
            }
          </div>
          {agentAdvice.length > 0 && (
            <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: '11px', color: '#475569', fontWeight: '700', letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '8px' }}>Conseils IA</p>
              {agentAdvice.map((adv, i) => (
                <AgentAdvice key={i} type={adv.type} text={adv.text} timestamp={adv.timestamp} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div style={{ padding: '20px 28px', maxWidth: '1600px', margin: '0 auto' }}>

        {/* ── HEADER ───────────────────────────────────────────── */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Activity size={14} style={{ color: '#3B82F6' }} />
            <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#3B82F6' }}>Tableau de Bord Opérationnel</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#F1F5F9', margin: 0, letterSpacing: '-0.02em' }}>
            {selectedCity.name}
            <span style={{ fontSize: '16px', fontWeight: '400', color: '#64748B', marginLeft: '12px' }}>
              — Vue temps réel · {activeMetricCount} capteurs actifs
            </span>
          </h1>
        </div>

        {/* ── STATS STRIP ─────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px',
        }}>
          {[
            { label: 'Capteurs actifs', value: activeMetricCount, unit: '/ 12', color: '#3B82F6', icon: <Activity size={16} /> },
            { label: 'Alertes critiques', value: criticalCount, unit: 'anomalies', color: '#EF4444', icon: <AlertTriangle size={16} /> },
            { label: 'Statut global', value: currentStatus === 'Normal' ? 'Nominal' : currentStatus, unit: '', color: statusColor, icon: <CheckCircle size={16} /> },
            { label: 'Données', value: wsStatus === 'connected' ? 'Live' : 'Hors ligne', unit: wsStatus === 'connected' ? '· temps réel' : '', color: wsStatus === 'connected' ? '#10B981' : '#64748B', icon: wsStatus === 'connected' ? <Wifi size={16} /> : <WifiOff size={16} /> },
          ].map((s, i) => (
            <div key={i} style={{
              background: `linear-gradient(135deg, ${s.color}12, ${s.color}06)`,
              border: `1px solid ${s.color}25`, borderRadius: '14px', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px',
                background: `${s.color}20`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '2px' }}>{s.label}</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#F1F5F9' }}>
                  {s.value} <span style={{ fontSize: '12px', fontWeight: '400', color: '#475569' }}>{s.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── 3-COLUMN METRIC GROUPS ───────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          {METRIC_GROUPS.map(group => (
            <div key={group.id} style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px', padding: '16px', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div style={{ width: '3px', height: '18px', background: group.accent, borderRadius: '2px' }} />
                <span style={{ fontSize: '12px', fontWeight: '700', color: group.accent,
                  letterSpacing: '0.1em', textTransform: 'uppercase' }}>{group.label}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {group.keys.map(type => {
                  const data = metrics[type];
                  return (
                    <MetricTile
                      key={type}
                      type={type}
                      data={data}
                      selected={selectedMetric === type}
                      onClick={() => setSelectedMetric(type)}
                    />
                  );
                })}
                {loading && group.keys.filter(k => !metrics[k]).map(k => (
                  <div key={k} style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px', padding: '16px', height: '110px',
                    animation: 'pulse 2s infinite',
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── MAP + CHART ROW ──────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '16px', marginBottom: '16px' }}>

          {/* MAP */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '20px', overflow: 'hidden', height: '380px',
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} style={{ color: '#3B82F6' }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#F1F5F9' }}>Carte — {selectedCity.name}</span>
              </div>
              <span style={{ fontSize: '11px', color: '#475569' }}>
                {selectedCity.lat?.toFixed(4)}, {selectedCity.lon?.toFixed(4)}
              </span>
            </div>
            <div style={{ height: 'calc(100% - 49px)' }}>
              <CityMap
                center={[selectedCity.lat, selectedCity.lon]}
                cityId={selectedCity.id}
                metrics={metrics}
                status={currentStatus}
              />
            </div>
          </div>

          {/* CHART */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', height: '380px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={14} style={{ color: CHART_COLORS[selectedMetric] || '#3B82F6' }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#F1F5F9' }}>
                  Évolution — {METRIC_LABELS[selectedMetric] || selectedMetric}
                </span>
              </div>
              {metrics[selectedMetric] && (
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                  background: `${CHART_COLORS[selectedMetric]}18`, color: CHART_COLORS[selectedMetric], fontWeight: '600' }}>
                  {Number(metrics[selectedMetric]?.value).toFixed(1)} {metrics[selectedMetric]?.unit || UNIT_MAP[selectedMetric] || ''}
                </span>
              )}
            </div>

            {/* Metric tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {Object.keys(metrics).map(key => (
                <button key={key} onClick={() => setSelectedMetric(key)} style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                  border: `1px solid ${selectedMetric === key ? CHART_COLORS[key] : 'rgba(255,255,255,0.08)'}`,
                  background: selectedMetric === key ? `${CHART_COLORS[key]}20` : 'transparent',
                  color: selectedMetric === key ? CHART_COLORS[key] : '#64748B',
                  cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}>
                  {METRIC_LABELS[key]?.split(' ')[0] || key}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, minHeight: 0 }}>
              <SensorChart
                data={history[selectedMetric] || []}
                metricName={selectedMetric}
                unit={metrics[selectedMetric]?.unit || UNIT_MAP[selectedMetric] || ''}
                color={CHART_COLORS[selectedMetric] || '#3B82F6'}
              />
            </div>
          </div>
        </div>

        {/* ── CITY SWITCHER ROW ────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '8px', flexWrap: 'wrap',
          padding: '12px 16px', background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px',
        }}>
          <span style={{ fontSize: '11px', color: '#475569', fontWeight: '700',
            textTransform: 'uppercase', letterSpacing: '0.1em', alignSelf: 'center', marginRight: '4px' }}>Villes:</span>
          {cities.slice(0, 8).map(city => {
            const st = cityStatuses[city.id];
            const dot = st === 'Critical' ? '#EF4444' : st === 'Warning' ? '#F59E0B' : st === 'Normal' ? '#10B981' : '#475569';
            const active = city.id === selectedCity.id;
            return (
              <button key={city.id} onClick={() => setSelectedCity(city)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                background: active ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: active ? '#60A5FA' : '#94A3B8', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%',
                  background: dot, boxShadow: `0 0 4px ${dot}`, flexShrink: 0 }} />
                {city.name}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default ClientDashboard;
