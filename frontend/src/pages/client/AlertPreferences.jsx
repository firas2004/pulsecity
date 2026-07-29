import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, ShieldAlert, Check, Filter } from 'lucide-react';
import api from '../../services/api';

const METRICS_OPTIONS = [
  { id: 'traffic', label: '🚦 Trafic Routier' },
  { id: 'air_co2', label: '💨 Qualité Air (CO₂)' },
  { id: 'noise', label: '🔊 Niveau Sonore' },
  { id: 'energy', label: '⚡ Consommation Électrique' },
  { id: 'waste_fill', label: '🗑️ Remplissage Poubelles' },
  { id: 'water_quality', label: '🚰 Qualité de l\'Eau' },
  { id: 'parking', label: '🅿️ Places de Parking' },
  { id: 'wind_speed', label: '🌬️ Vent & Tempête' },
];

const CITIES = [
  { id: 'tunis-centre', name: 'Tunis Centre' },
  { id: 'ariana', name: 'Ariana' },
  { id: 'la-marsa', name: 'La Marsa' },
  { id: 'sousse', name: 'Sousse' },
  { id: 'sfax', name: 'Sfax' },
  { id: 'bizerte', name: 'Bizerte' },
];

const AlertPreferences = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedCity, setSelectedCity] = useState(CITIES[0].id);
  const [selectedMetric, setSelectedMetric] = useState(METRICS_OPTIONS[0].id);
  const [overrideValue, setOverrideValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('subscriptions'); // 'subscriptions' | 'my_alerts'

  useEffect(() => {
    fetchSubscriptions();
    fetchAlerts();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get('/subscriptions');
      setSubscriptions(res.data || []);
    } catch (err) {
      console.error('Erreur abonnements:', err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data || []);
    } catch (err) {
      console.error('Erreur alertes:', err);
    }
  };

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/subscriptions', {
        city_id: selectedCity,
        metric_type: selectedMetric,
        threshold_override: overrideValue ? parseFloat(overrideValue) : null,
        notification_channel: 'in-app'
      });
      setOverrideValue('');
      fetchSubscriptions();
    } catch (err) {
      alert('Erreur lors de l\'ajout de l\'abonnement.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscription = async (id) => {
    try {
      await api.delete(`/subscriptions/${id}`);
      fetchSubscriptions();
    } catch (err) {
      alert('Erreur suppression.');
    }
  };

  // Filter system alerts based on user subscriptions
  const subscribedAlerts = alerts.filter(alertItem => {
    return subscriptions.some(sub => sub.city_id === alertItem.city_id && sub.metric_type === alertItem.sensor_type);
  });

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
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
            <Bell size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Mes Alertes Personnalisées 🔔
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Abonnez-vous aux métriques et villes de votre choix pour filtrer les notifications d'anomalies.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'var(--surface-2)', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setActiveTab('subscriptions')}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: activeTab === 'subscriptions' ? 'linear-gradient(135deg,#6366F1,#A855F7)' : 'transparent',
              color: activeTab === 'subscriptions' ? '#FFF' : 'var(--text-muted)',
              fontWeight: '600', fontSize: '13px', cursor: 'pointer'
            }}
          >
            Gérer mes Abonnements ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('my_alerts')}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: activeTab === 'my_alerts' ? 'linear-gradient(135deg,#6366F1,#A855F7)' : 'transparent',
              color: activeTab === 'my_alerts' ? '#FFF' : 'var(--text-muted)',
              fontWeight: '600', fontSize: '13px', cursor: 'pointer'
            }}
          >
            Alertes Filtrées ({subscribedAlerts.length})
          </button>
        </div>
      </div>

      {activeTab === 'subscriptions' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Add form */}
          <form onSubmit={handleAddSubscription} style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Ville</label>
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)' }}
              >
                {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Capteur / Métrique</label>
              <select
                value={selectedMetric}
                onChange={e => setSelectedMetric(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)' }}
              >
                {METRICS_OPTIONS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>

            <div style={{ width: '160px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Seuil Perso (Optionnel)</label>
              <input
                type="number"
                step="any"
                value={overrideValue}
                onChange={e => setOverrideValue(e.target.value)}
                placeholder="Ex: 80"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '11px 20px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg,#6366F1,#A855F7)', color: '#FFF',
                fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Plus size={16} /> S'abonner
            </button>
          </form>

          {/* List Subscriptions */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>Vos Abonnements Actifs</h3>
            {subscriptions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Aucun abonnement configuré. Utilisez le formulaire ci-dessus.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {subscriptions.map(sub => (
                  <div key={sub.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14px' }}>
                        {METRICS_OPTIONS.find(m => m.id === sub.metric_type)?.label || sub.metric_type}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        📍 Ville : {sub.city_id} {sub.threshold_override ? `| Seuil: > ${sub.threshold_override}` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSubscription(sub.id)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Filtered My Alerts Tab */
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>Alertes Relatives à Vos Abonnements</h3>
          {subscribedAlerts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Aucune alerte active ne correspond à vos critères d'abonnement.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {subscribedAlerts.map((a, idx) => (
                <div key={idx} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <ShieldAlert size={20} color="#EF4444" />
                  <div>
                    <div style={{ fontWeight: '700', color: '#EF4444', fontSize: '14px' }}>{a.message || `Anomalie détectée sur ${a.sensor_type}`}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 Ville : {a.city_id} | Niveau : {a.level || 'CRITICAL'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertPreferences;
