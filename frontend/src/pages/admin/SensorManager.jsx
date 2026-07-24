import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, ToggleLeft, ToggleRight, X, Check, Activity, Zap, Wind, Droplets, Thermometer, Volume2, Car, Cpu, Gauge } from 'lucide-react';
import api from '../../services/api';

// Known sensor types with presets
const SENSOR_PRESETS = [
  { type: 'traffic',     label: 'Trafic Routier',      icon: <Car size={18}/>,         unit: 'vehicles/min', min_normal: 10,   max_normal: 120,  min_anomaly: 200,  max_anomaly: 400,  color: '#F59E0B' },
  { type: 'air_co2',    label: 'Qualité Air (CO₂)',    icon: <Wind size={18}/>,         unit: 'ppm',          min_normal: 350,  max_normal: 800,  min_anomaly: 1200, max_anomaly: 2000, color: '#10B981' },
  { type: 'noise',      label: 'Niveau Sonore',        icon: <Volume2 size={18}/>,      unit: 'dB',           min_normal: 35,   max_normal: 75,   min_anomaly: 100,  max_anomaly: 130,  color: '#8B5CF6' },
  { type: 'energy',     label: 'Consommation Énergie', icon: <Zap size={18}/>,          unit: 'kWh',          min_normal: 50,   max_normal: 500,  min_anomaly: 900,  max_anomaly: 1500, color: '#3B82F6' },
  { type: 'temperature',label: 'Température',          icon: <Thermometer size={18}/>, unit: '°C',            min_normal: 10,   max_normal: 40,   min_anomaly: 50,   max_anomaly: 70,   color: '#EF4444' },
  { type: 'humidity',   label: 'Humidité',             icon: <Droplets size={18}/>,     unit: '%',            min_normal: 20,   max_normal: 80,   min_anomaly: 90,   max_anomaly: 100,  color: '#06B6D4' },
  { type: 'pressure',   label: 'Pression Atm.',        icon: <Gauge size={18}/>,        unit: 'hPa',          min_normal: 990,  max_normal: 1020, min_anomaly: 940,  max_anomaly: 980,  color: '#64748B' },
  { type: 'wind',       label: 'Vent',                 icon: <Activity size={18}/>,     unit: 'km/h',         min_normal: 0,    max_normal: 40,   min_anomaly: 80,   max_anomaly: 150,  color: '#A3E635' },
  { type: 'custom',     label: 'Capteur Personnalisé', icon: <Cpu size={18}/>,          unit: 'unit',         min_normal: 0,    max_normal: 100,  min_anomaly: 150,  max_anomaly: 300,  color: '#F472B6' },
];

const EMPTY_FORM = {
  type: '',
  unit: '',
  min_normal: '',
  max_normal: '',
  min_anomaly: '',
  max_anomaly: '',
  description: '',
};

const TYPE_ICON_MAP = {
  traffic: <Car size={16}/>,
  air_co2: <Wind size={16}/>,
  noise: <Volume2 size={16}/>,
  energy: <Zap size={16}/>,
  temperature: <Thermometer size={16}/>,
  humidity: <Droplets size={16}/>,
  pressure: <Gauge size={16}/>,
  wind: <Activity size={16}/>,
};

const TYPE_COLOR_MAP = {
  traffic: '#F59E0B', air_co2: '#10B981', noise: '#8B5CF6', energy: '#3B82F6',
  temperature: '#EF4444', humidity: '#06B6D4', pressure: '#64748B',
  wind: '#A3E635', default: '#6366F1',
};

export default function SensorManager() {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const [sensors, setSensors] = useState([]);
  const [cityName, setCityName] = useState(cityId);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [liveValues, setLiveValues] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const fetchSensors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/cities/${cityId}/sensors`);
      setSensors(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [cityId]);

  const fetchCityInfo = useCallback(async () => {
    try {
      const res = await api.get(`/admin/cities`);
      const cities = Array.isArray(res.data) ? res.data : res.data.cities || [];
      const city = cities.find(c => (c.id || c.city_id) === cityId);
      if (city) setCityName(city.name);
    } catch {}
  }, [cityId]);

  // Poll metrics
  const pollMetrics = useCallback(async () => {
    try {
      const res = await api.get(`/metrics/${cityId}`);
      setLiveValues(res.data || {});
    } catch {}
  }, [cityId]);

  useEffect(() => {
    fetchSensors();
    fetchCityInfo();
  }, [fetchSensors, fetchCityInfo]);

  useEffect(() => {
    pollMetrics();
    const interval = setInterval(pollMetrics, 5000);
    return () => clearInterval(interval);
  }, [pollMetrics]);

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.type);
    if (preset.type === 'custom') {
      setForm(EMPTY_FORM);
    } else {
      setForm({
        type: preset.type,
        unit: preset.unit,
        min_normal: preset.min_normal,
        max_normal: preset.max_normal,
        min_anomaly: preset.min_anomaly,
        max_anomaly: preset.max_anomaly,
        description: preset.label,
      });
    }
    setError('');
  };

  const handleSave = async () => {
    if (!form.type) { setError('Le type est requis.'); return; }
    if (!form.unit) { setError('L\'unité est requise.'); return; }
    setSaving(true); setError('');
    try {
      await api.post(`/admin/cities/${cityId}/sensors`, {
        type: form.type,
        unit: form.unit,
        min_normal: parseFloat(form.min_normal) || 0,
        max_normal: parseFloat(form.max_normal) || 100,
        min_anomaly: parseFloat(form.min_anomaly) || 150,
        max_anomaly: parseFloat(form.max_anomaly) || 300,
        description: form.description || '',
      });
      setShowModal(false);
      setForm(EMPTY_FORM);
      setSelectedPreset(null);
      fetchSensors();
    } catch (e) {
      setError(e.response?.data?.detail || 'Erreur lors de la création.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (sensor) => {
    try {
      await api.put(`/admin/cities/${cityId}/sensors/${sensor.id}`, { enabled: !sensor.enabled });
      fetchSensors();
    } catch (e) {
      alert('Erreur lors de la mise à jour.');
    }
  };

  const handleDelete = async (sensorId) => {
    if (!window.confirm(`Supprimer définitivement le capteur ${sensorId} ?`)) return;
    setDeletingId(sensorId);
    try {
      await api.delete(`/admin/cities/${cityId}/sensors/${sensorId}`);
      fetchSensors();
    } catch (e) {
      alert('Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
    }
  };

  const getColor = (type) => TYPE_COLOR_MAP[type] || TYPE_COLOR_MAP.default;
  const getLiveValue = (sensor) => {
    const m = liveValues[sensor.type];
    if (!m || m.value === null) return null;
    return { value: m.value, unit: sensor.unit || m.unit, anomaly: m.anomaly };
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={() => navigate('/admin')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--border-color)', color: 'var(--text-main)', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--surface)'}
        >
          <ArrowLeft size={15}/> Retour
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-main)' }}>
            Capteurs — <span style={{ color: 'var(--primary)' }}>{cityName}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            {sensors.filter(s => s.enabled).length} actif(s) · {sensors.length} total · données actualisées toutes les 5s
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(EMPTY_FORM); setSelectedPreset(null); setError(''); }}>
            <Plus size={15}/> Ajouter un Capteur
          </button>
        </div>
      </div>

      {/* Sensor Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '180px', borderRadius: '14px' }}/>)}
        </div>
      ) : sensors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📡</div>
          <h3 style={{ color: '#FFF', marginBottom: '8px' }}>Aucun capteur configuré</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Ajoutez votre premier capteur pour commencer la surveillance.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15}/> Ajouter un Capteur</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {sensors.map(sensor => {
            const color = getColor(sensor.type);
            const live = getLiveValue(sensor);
            return (
              <div key={sensor.id} className="card" style={{ borderTop: `3px solid ${color}`, opacity: sensor.enabled ? 1 : 0.55, transition: 'all 0.3s' }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color }}>{TYPE_ICON_MAP[sensor.type] || <Activity size={16}/>}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', textTransform: 'capitalize' }}>
                        {sensor.type.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sensor.id}</div>
                    </div>
                  </div>
                  {/* Toggle */}
                  <button onClick={() => handleToggle(sensor)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: sensor.enabled ? '#10B981' : '#6B7280', padding: '4px' }}>
                    {sensor.enabled ? <ToggleRight size={28}/> : <ToggleLeft size={28}/>}
                  </button>
                </div>

                {/* Live value */}
                <div style={{ marginBottom: '12px', padding: '12px', borderRadius: '10px', background: 'var(--surface-2)', border: `1px solid ${live?.anomaly ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}` }}>
                  {live ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '28px', fontWeight: '800', color: live.anomaly ? '#EF4444' : '#FFF' }}>
                          {live.value}
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{live.unit}</span>
                        {live.anomaly && <span style={{ fontSize: '11px', color: '#EF4444', padding: '2px 8px', borderRadius: '20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>⚠ Anomalie</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Normal: {sensor.min_normal}–{sensor.max_normal} {sensor.unit}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {sensor.enabled ? '⏳ En attente de données...' : '⏸ Capteur désactivé'}
                    </div>
                  )}
                </div>

                {/* Description */}
                {sensor.description && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>{sensor.description}</p>
                )}

                {/* Delete */}
                <button onClick={() => handleDelete(sensor.id)} disabled={deletingId === sensor.id}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#F87171', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'}
                >
                  <Trash2 size={13}/> {deletingId === sensor.id ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Sensor Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 40px 100px rgba(0,0,0,0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FFF' }}>Ajouter un Capteur</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20}/></button>
            </div>

            {/* Preset selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '500' }}>Type de Capteur</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {SENSOR_PRESETS.map(preset => (
                  <button key={preset.type} onClick={() => handlePresetSelect(preset)}
                    style={{ padding: '10px 8px', borderRadius: '10px', border: `1px solid ${selectedPreset === preset.type ? preset.color : 'var(--border-color)'}`, background: selectedPreset === preset.type ? `${preset.color}18` : 'var(--surface-2)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                    <span style={{ color: preset.color }}>{preset.icon}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: '500', textAlign: 'center', lineHeight: '1.3' }}>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { key: 'type', label: 'Type (identifiant)', placeholder: 'ex: temperature, pollution_pm25...', disabled: selectedPreset && selectedPreset !== 'custom' },
                { key: 'unit', label: 'Unité', placeholder: 'ex: °C, ppm, dB, kWh, %' },
                { key: 'description', label: 'Description (optionnel)', placeholder: 'ex: Capteur de température extérieure' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: '500' }}>{field.label}</label>
                  <input type="text" value={form[field.key]} onChange={e => setForm({...form, [field.key]: e.target.value})}
                    placeholder={field.placeholder} disabled={field.disabled}
                    style={{ width: '100%', padding: '9px 12px', backgroundColor: field.disabled ? 'var(--surface-2)' : 'var(--surface-2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: field.disabled ? 'var(--text-muted)' : 'var(--text-main)', fontSize: '13px', outline: 'none', boxSizing: 'border-box', cursor: field.disabled ? 'not-allowed' : 'text' }}
                    onFocus={e => !field.disabled && (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border-color)')}
                  />
                </div>
              ))}

              {/* Range grid */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>Plages de Valeurs</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { key: 'min_normal',  label: '↓ Normal min',  color: '#10B981' },
                    { key: 'max_normal',  label: '↑ Normal max',  color: '#10B981' },
                    { key: 'min_anomaly', label: '⚠ Anomalie min', color: '#EF4444' },
                    { key: 'max_anomaly', label: '⚠ Anomalie max', color: '#EF4444' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', fontSize: '11px', color: field.color, marginBottom: '4px', fontWeight: '500' }}>{field.label}</label>
                      <input type="number" value={form[field.key]} onChange={e => setForm({...form, [field.key]: e.target.value})}
                        style={{ width: '100%', padding: '9px 12px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border-color)')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave} disabled={saving}>
                <Check size={15}/> {saving ? 'Création...' : 'Créer le Capteur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
