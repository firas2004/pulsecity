import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit3, Trash2, MapPin, Activity, X, Check, Sparkles, Radar, Users, Filter, ShieldAlert, Gauge, BellRing, ArrowRight, Clock3 } from 'lucide-react';
import AlertBadge from '../../components/AlertBadge';
import api from '../../services/api';

const EMPTY_CITY = { name: '', city_id: '', lat: '', lon: '', description: '' };

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [form, setForm] = useState(EMPTY_CITY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cityStatuses, setCityStatuses] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/cities');
      setCities(Array.isArray(res.data) ? res.data : res.data.cities || []);
    } catch (err) {
      console.error('Failed to fetch cities:', err);
      // Mock data pour la demo si l'API n'est pas encore disponible
      setCities([
        { id: 'tunis-centre', city_id: 'tunis-centre', name: 'Tunis Centre', lat: 36.8002, lon: 10.1860, description: 'Capitale — zone dense', status: 'Normal' },
        { id: 'ariana', city_id: 'ariana', name: 'Ariana', lat: 36.8665, lon: 10.1930, description: 'Banlieue nord de Tunis', status: 'Warning' },
        { id: 'sfax', city_id: 'sfax', name: 'Sfax', lat: 34.7406, lon: 10.7603, description: 'Centre industriel du sud', status: 'Normal' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer le statut de chaque ville via les alertes
  const fetchStatuses = async (cityList) => {
    const statuses = {};
    await Promise.allSettled(
      cityList.map(async (city) => {
        try {
          const res = await api.get(`/alerts/${city.city_id || city.id}`);
          const alerts = Array.isArray(res.data) ? res.data : res.data.alerts || [];
          const hasCritical = alerts.some(a => (a.alert_level || a.level) === 'Critical');
          const hasWarning = alerts.some(a => (a.alert_level || a.level) === 'Warning');
          statuses[city.city_id || city.id] = hasCritical ? 'Critical' : hasWarning ? 'Warning' : 'Normal';
        } catch {
          statuses[city.city_id || city.id] = 'Unknown';
        }
      })
    );
    setCityStatuses(statuses);
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (cities.length > 0) fetchStatuses(cities);
  }, [cities]);

  const getCityStatus = (city) => {
    const key = city.city_id || city.id;
    return (cityStatuses[key] || city.status || 'Unknown').toLowerCase();
  };

  const summaryMetrics = {
    total: cities.length,
    critical: cities.filter((city) => getCityStatus(city) === 'critical').length,
    warning: cities.filter((city) => getCityStatus(city) === 'warning').length,
    healthy: cities.filter((city) => getCityStatus(city) === 'normal').length,
    coverage: cities.length ? Math.round((cities.filter((city) => ['critical', 'warning', 'normal'].includes(getCityStatus(city))).length / cities.length) * 100) : 100,
  };

  const statusOptions = [
    { value: 'all', label: 'Tous', color: '#60A5FA' },
    { value: 'critical', label: 'Critique', color: '#EF4444' },
    { value: 'warning', label: 'Avertissement', color: '#F59E0B' },
    { value: 'normal', label: 'Saines', color: '#10B981' },
    { value: 'unknown', label: 'Inconnues', color: '#94A3B8' },
  ];

  const filteredCities = cities.filter((city) => {
    if (statusFilter === 'all') return true;
    return getCityStatus(city) === statusFilter;
  });

  const openCreate = () => {
    setEditingCity(null);
    setForm(EMPTY_CITY);
    setError('');
    setShowModal(true);
  };

  const openEdit = (city) => {
    setEditingCity(city);
    setForm({
      name: city.name || '',
      city_id: city.city_id || city.id || '',
      lat: city.lat || '',
      lon: city.lon || '',
      description: city.description || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.city_id) {
      setError('Le nom et l\'identifiant sont requis.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingCity) {
        await api.put(`/admin/cities/${editingCity.city_id || editingCity.id}`, form);
      } else {
        await api.post('/admin/cities', form);
      }
      setShowModal(false);
      fetchCities();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cityId) => {
    if (!window.confirm(`Supprimer définitivement la ville ${cityId} ?`)) return;
    try {
      await api.delete(`/admin/cities/${cityId}`);
      fetchCities();
    } catch (err) {
      alert('Erreur lors de la suppression: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="page-shell">
      <div className="dashboard-hero" style={{ display: 'grid', gap: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div className="section-title">Administration PulseCity</div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>Pilotage intelligent des villes et des clients</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-soft)', maxWidth: '700px' }}>Créez, gérez et supervisez les villes, les accès clients et les alertes depuis une vue plus opérationnelle, plus claire et plus rapide à exploiter.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div className="stat-chip"><MapPin size={14} style={{ color: '#3B82F6' }} /> {summaryMetrics.total} villes</div>
            <div className="stat-chip"><Activity size={14} style={{ color: summaryMetrics.critical > 0 ? '#EF4444' : '#10B981' }} /> {summaryMetrics.critical > 0 ? 'Priorité élevée' : 'Stable'}</div>
          </div>
        </div>

        <div className="kpi-grid">
          {[
            { label: 'Villes surveillées', value: summaryMetrics.total, icon: <MapPin size={16} />, accent: '#3B82F6' },
            { label: 'États critiques', value: summaryMetrics.critical, icon: <ShieldAlert size={16} />, accent: '#EF4444' },
            { label: 'Avertissements', value: summaryMetrics.warning, icon: <BellRing size={16} />, accent: '#F59E0B' },
            { label: 'Couverture', value: `${summaryMetrics.coverage}%`, icon: <Gauge size={16} />, accent: '#10B981' },
          ].map((item) => (
            <div key={item.label} className="kpi-tile" style={{ borderColor: `${item.accent}22` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: item.accent, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{item.label}</span>
                {item.icon}
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', marginBottom: '20px' }}>
        <div className="panel-card" style={{ padding: '18px' }}>
          <div className="section-title">Actions rapides</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {[
              { label: 'Créer une ville', text: 'Ajouter un nouvel espace de supervision', icon: <Plus size={16} />, action: openCreate, accent: '#3B82F6' },
              { label: 'Gérer les clients', text: 'Créer des accès et assigner des villes', icon: <Users size={16} />, action: () => navigate('/admin/clients'), accent: '#10B981' },
              { label: 'Surveillance IA', text: 'Suivre les alertes intelligentes et les seuils', icon: <Sparkles size={16} />, action: () => navigate('/admin'), accent: '#8B5CF6' },
            ].map((card) => (
              <button key={card.label} onClick={card.action} style={{ textAlign: 'left', border: `1px solid ${card.accent}22`, borderRadius: '14px', padding: '16px', background: 'var(--surface-2)', cursor: 'pointer', color: 'var(--text-main)', transition: 'transform 0.2s ease, border-color 0.2s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: card.accent, fontSize: '12px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '8px' }}>{card.icon}{card.label}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-soft)', lineHeight: 1.5 }}>{card.text}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="panel-card" style={{ padding: '18px' }}>
          <div className="section-title">Vue opérations</div>
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              { label: 'Priorité d’intervention', value: summaryMetrics.critical > 0 ? `${summaryMetrics.critical} ville(s) nécessitent une action` : 'Aucune action critique en attente', color: summaryMetrics.critical > 0 ? '#EF4444' : '#10B981' },
              { label: 'Temps de réponse', value: 'Flux IA + capteurs synchronisés', color: '#3B82F6' },
              { label: 'État de la plateforme', value: 'Observabilité et monitoring actifs', color: '#8B5CF6' },
            ].map((item) => (
              <div key={item.label} className="ops-item" style={{ borderColor: `${item.color}22` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{item.label}</span>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-main)', marginTop: '4px' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel-card" style={{ padding: '16px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} style={{ color: '#3B82F6' }} />
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>Filtrer par statut</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`filter-pill ${statusFilter === option.value ? 'active' : ''}`}
              style={{ borderColor: `${option.color}22`, color: statusFilter === option.value ? '#FFF' : '#CBD5E1' }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-main)' }}>Gestion des Villes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {filteredCities.length} zone{filteredCities.length > 1 ? 's' : ''} affichée{filteredCities.length > 1 ? 's' : ''} • {cities.length} au total
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Ajouter une Ville
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Villes surveillées', value: cities.length, icon: <MapPin size={16} />, color: '#3B82F6' },
          { label: 'État global', value: cities.some(c => (cityStatuses[c.city_id || c.id] || c.status) === 'Critical') ? 'Critique' : 'Stable', icon: <Radar size={16} />, color: '#10B981' },
        ].map((item) => (
          <div key={item.label} className="card" style={{ padding: '16px', border: `1px solid ${item.color}22` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: item.color, marginBottom: '8px' }}>{item.icon}<span style={{ fontSize: '12px', fontWeight: '600' }}>{item.label}</span></div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main)' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Tableau des villes */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '12px' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredCities.length === 0 ? (
            <div className="card empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '28px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59,130,246,0.14)', marginBottom: '12px' }}>
                <Filter size={18} style={{ color: '#3B82F6' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>Aucune ville ne correspond à ce filtre</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Essayez un autre statut pour afficher les villes correspondantes.</p>
            </div>
          ) : filteredCities.map((city) => {
            const cityKey = city.city_id || city.id;
            const status = cityStatuses[cityKey] || city.status || 'Unknown';
            return (
              <div key={cityKey} className="card fade-slide-up" style={{
                borderTop: `3px solid ${status === 'Critical' ? '#EF4444' : status === 'Warning' ? '#F59E0B' : status === 'Normal' ? '#10B981' : '#374151'}`,
                cursor: 'pointer', transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} style={{ color: '#3B82F6' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>{city.name}</h3>
                  </div>
                  <AlertBadge level={status} />
                </div>

                {city.description && (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>{city.description}</p>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>Latitude</span>
                    <span style={{ color: '#E5E7EB', fontWeight: '500' }}>{city.lat || '—'}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>Longitude</span>
                    <span style={{ color: '#E5E7EB', fontWeight: '500' }}>{city.lon || '—'}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                    <span style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>Identifiant API</span>
                    <code style={{ color: '#60A5FA', fontSize: '12px', backgroundColor: 'rgba(59,130,246,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{cityKey}</code>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" style={{ flex: '1 1 120px', padding: '8px', fontSize: '13px' }}
                    onClick={() => navigate(`/admin/cities/${cityKey}`)}>
                    <Activity size={14} /> Détails
                  </button>
                  <button className="btn btn-secondary" style={{ flex: '1 1 120px', padding: '8px', fontSize: '13px' }}
                    onClick={() => navigate(`/admin/cities/${cityKey}/sensors`)}>
                    <Radar size={14} /> Capteurs
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '8px 10px' }} onClick={() => openEdit(city)}>
                    <Edit3 size={14} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '8px 10px' }} onClick={() => handleDelete(cityKey)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Créer/Modifier */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', margin: '16px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
                {editingCity ? 'Modifier la Ville' : 'Ajouter une Ville'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'name', label: 'Nom de la ville', placeholder: 'ex: Tunis Centre' },
                { key: 'city_id', label: 'Identifiant API', placeholder: 'ex: tunis-centre' },
                { key: 'lat', label: 'Latitude', placeholder: 'ex: 36.8002' },
                { key: 'lon', label: 'Longitude', placeholder: 'ex: 10.1860' },
                { key: 'description', label: 'Description (optionnel)', placeholder: 'ex: Capitale économique' }
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '500' }}>
                    {field.label}
                  </label>
                  <input type="text" value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', padding: '10px 12px',
                      backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-color)',
                      borderRadius: '8px', color: 'var(--text-main)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>
              ))}
            </div>

            {error && (
              <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                Annuler
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                <Check size={16} /> {saving ? 'Sauvegarde...' : (editingCity ? 'Mettre à jour' : 'Créer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
