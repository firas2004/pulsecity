import React, { useState, useEffect } from 'react';
import { Megaphone, MapPin, Send, CheckCircle, Clock, AlertTriangle, Image, FileText } from 'lucide-react';
import api from '../../services/api';
import MapPicker from '../../components/MapPicker';

const CATEGORIES = [
  { id: 'pothole', label: '🛣️ Nids de poule / Chaussée' },
  { id: 'streetlight', label: '💡 Éclairage public en panne' },
  { id: 'waste', label: '🗑️ Déchets / Poubelle débordante' },
  { id: 'water', label: '🚰 Fuite d\'eau / Assainissement' },
  { id: 'other', label: '⚠️ Autre problème urbain' }
];

const CITIES = [
  { id: 'tunis-centre', name: 'Tunis Centre', lat: 36.8065, lon: 10.1815 },
  { id: 'ariana', name: 'Ariana', lat: 36.8665, lon: 10.1930 },
  { id: 'la-marsa', name: 'La Marsa', lat: 36.8830, lon: 10.3300 },
  { id: 'sousse', name: 'Sousse', lat: 35.8256, lon: 10.6411 },
  { id: 'sfax', name: 'Sfax', lat: 34.7406, lon: 10.7603 },
  { id: 'bizerte', name: 'Bizerte', lat: 37.2744, lon: 9.8739 },
];

const ReportIssue = () => {
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [location, setLocation] = useState([CITIES[0].lat, CITIES[0].lon]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [myIssues, setMyIssues] = useState([]);

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const fetchMyIssues = async () => {
    try {
      const res = await api.get('/issues');
      setMyIssues(res.data || []);
    } catch (err) {
      console.error('Erreur chargement signalements:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      await api.post('/issues', {
        city_id: selectedCity.id,
        category,
        description,
        photo_url: photoUrl || null,
        latitude: location ? location[0] : null,
        longitude: location ? location[1] : null,
      });

      setSuccessMsg('✅ Votre signalement a été transmis avec succès aux services municipaux !');
      setDescription('');
      setPhotoUrl('');
      fetchMyIssues();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Erreur lors de la soumission du signalement.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'resolved') {
      return <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Résolu</span>;
    }
    if (status === 'in_review') {
      return <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> En Cours d'Examen</span>;
    }
    return <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(59,130,246,0.15)', color: '#3B82F6', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}><Send size={12} /> Transmis</span>;
  };

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(245,158,11,0.12))',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '20px',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#EF4444,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Signaler un Problème Urbain 📢
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Aidez votre municipalité en signalant les nids-de-poule, pannes d'éclairage ou conteneurs débordants.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--surface-2)', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setActiveTab('new')}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: activeTab === 'new' ? 'linear-gradient(135deg,#EF4444,#F59E0B)' : 'transparent',
              color: activeTab === 'new' ? '#FFF' : 'var(--text-muted)',
              fontWeight: '600', fontSize: '13px', cursor: 'pointer'
            }}
          >
            Nouveau Signalement
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: activeTab === 'history' ? 'linear-gradient(135deg,#EF4444,#F59E0B)' : 'transparent',
              color: activeTab === 'history' ? '#FFF' : 'var(--text-muted)',
              fontWeight: '600', fontSize: '13px', cursor: 'pointer'
            }}
          >
            Mes Signalements ({myIssues.length})
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', padding: '14px 20px', borderRadius: '12px', fontWeight: '600' }}>
          {successMsg}
        </div>
      )}

      {activeTab === 'new' ? (
        <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Ville Concernée</label>
              <select
                value={selectedCity.id}
                onChange={e => {
                  const city = CITIES.find(c => c.id === e.target.value) || CITIES[0];
                  setSelectedCity(city);
                  setLocation([city.lat, city.lon]);
                }}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)', fontSize: '14px' }}
              >
                {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Catégorie du Problème</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)', fontSize: '14px' }}
              >
                {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Description Détaillée</label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Décrivez précisément le problème constaté (ex: Nid-de-poule dangereux à l'intersection...)"
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)', fontSize: '14px', fontFamily: 'inherit' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>URL de la Photo (Optionnel)</label>
            <input
              type="url"
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              placeholder="https://exemple.com/photo.jpg"
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Localisation sur la Carte (Cliquez pour placer le marqueur)</label>
            <MapPicker position={location} setPosition={setLocation} center={[selectedCity.lat, selectedCity.lon]} />
            {location && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                📍 Coordonnées : Lat {location[0].toFixed(5)}, Lon {location[1].toFixed(5)}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !description.trim()}
            style={{
              padding: '14px 24px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg,#EF4444,#F59E0B)', color: '#FFF',
              fontWeight: '700', fontSize: '15px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Send size={18} /> Soumettre le Signalement
          </button>
        </form>
      ) : (
        /* History View */
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
          {myIssues.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Aucun signalement soumis pour le moment.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {myIssues.map((issue) => (
                <div key={issue.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-main)' }}>
                        {CATEGORIES.find(c => c.id === issue.category)?.label || issue.category}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 Ville : {issue.city_id}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{issue.description}</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Date : {new Date(issue.created_at).toLocaleDateString('fr-FR')} {new Date(issue.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(issue.status)}
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

export default ReportIssue;
