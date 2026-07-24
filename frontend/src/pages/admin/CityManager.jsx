import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Activity, MapPin } from 'lucide-react';
import CityMap from '../../components/CityMap';
import MetricCard from '../../components/MetricCard';
import api from '../../services/api';
import { connectWebSocket } from '../../services/websocket';

const CityManager = () => {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const [city, setCity] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [thresholds, setThresholds] = useState({});
  const [savingThresholds, setSavingThresholds] = useState(false);

  useEffect(() => {
    const loadCity = async () => {
      setLoading(true);
      try {
        const [cityRes, metricsRes] = await Promise.allSettled([
          api.get(`/admin/cities/${cityId}`),
          api.get(`/metrics/${cityId}`)
        ]);

        if (cityRes.status === 'fulfilled') setCity(cityRes.value.data);
        if (metricsRes.status === 'fulfilled') {
          const data = metricsRes.value.data;
          setMetrics(data.sensors || data || {});
        }
      } catch (err) {
        console.error('Error loading city:', err);
        setCity({ name: cityId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), city_id: cityId, lat: 36.8, lon: 10.18 });
      } finally {
        setLoading(false);
      }
    };
    loadCity();

    const cleanup = connectWebSocket(cityId, (data) => {
      if (data.sensors) setMetrics(prev => ({ ...prev, ...data.sensors }));
    });
    return cleanup;
  }, [cityId]);

  const handleSaveThresholds = async () => {
    setSavingThresholds(true);
    try {
      await api.put(`/admin/cities/${cityId}/thresholds`, thresholds);
      alert('Seuils sauvegardés avec succès !');
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSavingThresholds(false);
    }
  };

  return (
    <div>
      {/* Navigation retour */}
      <button className="btn btn-secondary" onClick={() => navigate('/admin')} style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Retour aux Villes
      </button>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton" style={{ height: '40px', width: '40%', borderRadius: '8px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '12px' }} />)}
          </div>
        </div>
      ) : (
        <>
          {/* En-tête Ville */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <MapPin size={24} style={{ color: '#3B82F6' }} />
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-main)' }}>{city?.name || cityId}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                {city?.lat && city?.lon ? `${city.lat}, ${city.lon}` : 'Coordonnées non définies'} • {cityId}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Grille de Métriques */}
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} style={{ color: 'var(--primary)' }} /> Métriques en Direct
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                {Object.entries(metrics).map(([type, data]) => (
                  <MetricCard key={type} type={type} value={data?.value} unit={data?.unit}
                    status={data?.anomaly ? 'Critical' : data?.status || 'Normal'} />
                ))}
              </div>
            </div>

            {/* Panneau Configuration */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Carte miniature */}
              <div className="card" style={{ padding: 0, overflow: 'hidden', height: '220px' }}>
                {city && (
                  <CityMap center={[city.lat || 36.8, city.lon || 10.18]} cityId={cityId} metrics={metrics} status="Normal" />
                )}
              </div>

              {/* Configuration Seuils */}
              <div className="card">
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={16} style={{ color: 'var(--accent)' }} /> Seuils d'Alerte
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.keys(metrics).map(key => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', width: '80px', textTransform: 'capitalize' }}>{key}</span>
                      <input type="number"
                        value={thresholds[key] || ''}
                        onChange={e => setThresholds(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder="max"
                        style={{
                          flex: 1, padding: '6px 10px',
                          backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-color)',
                          borderRadius: '6px', color: 'var(--text-main)', fontSize: '13px', outline: 'none'
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                      />
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" onClick={handleSaveThresholds} disabled={savingThresholds}
                  style={{ width: '100%', marginTop: '16px' }}>
                  {savingThresholds ? 'Sauvegarde...' : 'Sauvegarder les Seuils'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CityManager;
