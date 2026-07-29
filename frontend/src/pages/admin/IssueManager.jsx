import React, { useState, useEffect } from 'react';
import { Megaphone, CheckCircle, Clock, Send, Filter, MapPin, Eye } from 'lucide-react';
import api from '../../services/api';

const CATEGORIES = [
  { id: 'all', label: 'Toutes les catégories' },
  { id: 'pothole', label: '🛣️ Nids de poule' },
  { id: 'streetlight', label: '💡 Éclairage public' },
  { id: 'waste', label: '🗑️ Déchets' },
  { id: 'water', label: '🚰 Eau / Assainissement' },
  { id: 'other', label: '⚠️ Autre' }
];

const CITIES = [
  { id: 'all', name: 'Toutes les villes' },
  { id: 'tunis-centre', name: 'Tunis Centre' },
  { id: 'ariana', name: 'Ariana' },
  { id: 'la-marsa', name: 'La Marsa' },
  { id: 'sousse', name: 'Sousse' },
  { id: 'sfax', name: 'Sfax' },
  { id: 'bizerte', name: 'Bizerte' },
];

const IssueManager = () => {
  const [issues, setIssues] = useState([]);
  const [filterCity, setFilterCity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await api.get('/issues');
      setIssues(res.data || []);
    } catch (err) {
      console.error('Erreur chargement signalements admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (issueId, newStatus) => {
    try {
      await api.patch(`/issues/${issueId}`, { status: newStatus });
      fetchIssues();
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut.');
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filterCity !== 'all' && issue.city_id !== filterCity) return false;
    if (filterCategory !== 'all' && issue.category !== filterCategory) return false;
    if (filterStatus !== 'all' && issue.status !== filterStatus) return false;
    return true;
  });

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.12))',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: '20px',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#3B82F6,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Gestion des Signalements Citoyens 📋
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Modération et suivi de l'avancement des signalements d'incidents soumis par les citoyens.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>
          <Filter size={16} /> Filtres :
        </div>
        <select value={filterCity} onChange={e => setFilterCity(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)', fontSize: '13px' }}>
          {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)', fontSize: '13px' }}>
          {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
        </select>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)', fontSize: '13px' }}>
          <option value="all">Tous les statuts</option>
          <option value="submitted">Transmis</option>
          <option value="in_review">En cours d'examen</option>
          <option value="resolved">Résolu</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '20px', overflowX: 'auto' }}>
        {filteredIssues.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Aucun signalement ne correspond à vos filtres.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Ville</th>
                <th style={{ padding: '12px' }}>Catégorie</th>
                <th style={{ padding: '12px' }}>Description</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Statut Actuel</th>
                <th style={{ padding: '12px' }}>Action Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue) => (
                <tr key={issue.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                  <td style={{ padding: '12px', fontWeight: '700', color: 'var(--text-main)' }}>#{issue.id}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>📍 {issue.city_id}</td>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{issue.category}</td>
                  <td style={{ padding: '12px', color: 'var(--text-main)', maxWidth: '280px' }}>{issue.description}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    {new Date(issue.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                      background: issue.status === 'resolved' ? 'rgba(16,185,129,0.15)' : issue.status === 'in_review' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
                      color: issue.status === 'resolved' ? '#10B981' : issue.status === 'in_review' ? '#F59E0B' : '#3B82F6'
                    }}>
                      {issue.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <select
                      value={issue.status}
                      onChange={e => handleUpdateStatus(issue.id, e.target.value)}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-main)', fontSize: '12px' }}
                    >
                      <option value="submitted">Transmis</option>
                      <option value="in_review">En cours</option>
                      <option value="resolved">Résolu</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default IssueManager;
