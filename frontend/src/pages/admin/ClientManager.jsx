import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Key, CheckCircle, XCircle, Sparkles, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

const ClientManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', city_id: '' });
  const [stats, setStats] = useState({ clients: 0, assigned: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/admin/users');
      const data = Array.isArray(res.data) ? res.data : res.data.users || [];
      setUsers(data);
      setStats({
        clients: data.filter(u => u.role === 'client').length,
        assigned: data.filter(u => u.role === 'client' && u.city_id).length,
      });
    } catch (err) {
      console.error('Cannot load users list:', err.message);
      // Mock data pour la démo
      setUsers([
        { id: 1, username: 'client1', role: 'client', city_id: 'tunis-centre', created_at: '2025-01-15T10:00:00Z' },
        { id: 2, username: 'admin', role: 'admin', city_id: null, created_at: '2025-01-10T08:00:00Z' }
      ]);
      setStats({ clients: 1, assigned: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async () => {
    if (!form.username || !form.password) { setError('Identifiant et mot de passe requis.'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.post('/auth/admin/users', { ...form, role: 'client' });
      setSuccess(`Client "${form.username}" créé avec succès !`);
      setForm({ username: '', password: '', city_id: '' });
      setShowCreate(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la création.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Supprimer l'utilisateur ${username} ?`)) return;
    try {
      await api.delete(`/auth/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="page-shell">
      <div className="dashboard-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">Gestion des accès</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>Administration des clients et des villes assignées</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '660px' }}>Ajoutez, gérez et suivez les accès client depuis une vue plus structurée et professionnelle.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="stat-chip"><Users size={14} style={{ color: '#3B82F6' }} /> {stats.clients} clients</div>
          <div className="stat-chip"><ShieldCheck size={14} style={{ color: '#10B981' }} /> {stats.assigned} assignés</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={22} style={{ color: 'var(--primary)' }} /> Gestion des Clients
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Gérez les accès aux portails client par ville
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowCreate(!showCreate); setError(''); setSuccess(''); }}>
          <Plus size={16} /> Nouveau Client
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Clients actifs', value: stats.clients, icon: <Users size={16} />, color: '#3B82F6' },
          { label: 'Clients avec ville', value: stats.assigned, icon: <ShieldCheck size={16} />, color: '#10B981' },
        ].map((item) => (
          <div key={item.label} className="card" style={{ padding: '16px', border: `1px solid ${item.color}22`, backgroundColor: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: item.color, marginBottom: '8px' }}>{item.icon}<span style={{ fontSize: '12px', fontWeight: '600' }}>{item.label}</span></div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main)' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Messages de retour */}
      {success && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* Formulaire création */}
      {showCreate && (
        <div className="card" style={{ marginBottom: '24px', border: '1px solid rgba(59,130,246,0.2)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={16} style={{ color: 'var(--primary)' }} /> Créer un Accès Client
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {[
              { key: 'username', label: 'Identifiant', placeholder: 'client_tunis' },
              { key: 'password', label: 'Mot de passe', placeholder: '••••••••', type: 'password' },
              { key: 'city_id', label: 'Ville assignée (ID)', placeholder: 'tunis-centre' }
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{f.label}</label>
                <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '9px 12px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
            ))}
          </div>
          {error && (
            <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.1)', color: '#FCA5A5', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={14} /> {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleCreateUser} disabled={saving}>
              {saving ? 'Création...' : 'Créer l\'accès'}
            </button>
          </div>
        </div>
      )}

      {/* Table utilisateurs */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '60px', borderRadius: '8px' }} />)}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(59,130,246,0.16)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-2)' }}>
                {['Identifiant', 'Rôle', 'Ville Assignée', 'Créé le', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: user.role === 'admin' ? 'rgba(124,58,237,0.16)' : 'rgba(37,99,235,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: user.role === 'admin' ? 'var(--accent)' : 'var(--primary)' }}>
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>{user.username}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', backgroundColor: user.role === 'admin' ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.15)', color: user.role === 'admin' ? '#A78BFA' : '#60A5FA' }}>
                      {user.role === 'admin' ? '🔑 Admin' : '👤 Client'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {user.city_id ? (
                      <code style={{ fontSize: '12px', color: 'var(--primary)', backgroundColor: 'rgba(37,99,235,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{user.city_id}</code>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Accès global</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {user.role !== 'admin' && (
                      <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '12px' }}
                        onClick={() => handleDelete(user.id, user.username)}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientManager;
