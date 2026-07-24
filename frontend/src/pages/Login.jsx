import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, User, Eye, EyeOff, Wifi, Sparkles, ShieldCheck, TrendingUp } from 'lucide-react';
import api from '../services/api';
import { ThemeToggle } from '../theme';

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    if (!form.username.trim() || !form.password.trim()) {
      setError('Veuillez saisir votre identifiant et votre mot de passe.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        username: form.username,
        password: form.password
      });

      const token = res.data.access_token;
      const decoded = decodeToken(token);
      // Role from API response is most reliable; JWT decoded.role as fallback
      const role = res.data.role || decoded?.role || 'client';
      const sub = decoded?.sub || form.username;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', sub);

      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/client');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Identifiants invalides ou serveur inaccessible.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--bg-color), var(--surface))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '700px', height: '700px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%', maxWidth: '1080px', display: 'grid', gridTemplateColumns: '1.08fr 0.92fr', gap: '24px', position: 'relative', zIndex: 10
      }}>
        <div style={{
          padding: '36px 32px', background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '24px', boxShadow: 'var(--shadow)', backdropFilter: 'blur(18px)', animation: 'fadeInUp 0.55s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={22} style={{ color: '#FFF' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>PulseCity</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>Intelligence urbaine</div>
            </div>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '10px', lineHeight: 1.2 }}>Surveillez votre ville comme une plateforme premium.</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>Trafic, qualité de l’air, alertes et IA en temps réel, centralisés dans un espace administrateur et client moderne.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
            {['Temps réel', 'Alertes IA', 'Kubernetes', 'Observabilité'].map((item) => (
              <span key={item} style={{ padding: '7px 12px', borderRadius: '999px', background: 'var(--surface-2)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '12px', fontWeight: '600' }}>{item}</span>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { title: 'Monitoring', value: '24/7', icon: <TrendingUp size={16} /> },
              { title: 'AI Agents', value: '4+', icon: <Sparkles size={16} /> },
            ].map((item) => (
              <div key={item.title} style={{ padding: '14px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>{item.icon}<span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>{item.value}</span></div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: '40px 34px', background: 'linear-gradient(180deg, var(--surface), var(--surface-2))', border: '1px solid var(--border-color)', borderRadius: '24px', boxShadow: 'var(--shadow)', position: 'relative', zIndex: 10, animation: 'fadeInUp 0.6s ease-out'
        }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <ThemeToggle />
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '60px', height: '60px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.2) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            marginBottom: '16px'
          }}>
            <Building2 size={28} style={{ color: '#3B82F6' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            PULSE<span style={{ color: '#3B82F6' }}>CITY</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Smart City Platform V2</p>
        </div>

        {/* Status indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 14px', borderRadius: '8px',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          marginBottom: '28px'
        }}>
          <Wifi size={14} style={{ color: '#10B981' }} />
          <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '500' }}>
            Connexion sécurisée — Cluster Kubernetes actif
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Identifiant
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="admin ou client"
                required
                style={{
                  width: '100%', padding: '12px 12px 12px 38px',
                  backgroundColor: 'var(--surface-2)', border: `1px solid ${touched.username && !form.username.trim() ? 'rgba(239,68,68,0.35)' : 'var(--border-color)'}`,
                  borderRadius: '10px', color: 'var(--text-main)', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '12px 40px 12px 38px',
                  backgroundColor: 'var(--surface-2)', border: `1px solid ${touched.password && !form.password.trim() ? 'rgba(239,68,68,0.35)' : 'var(--border-color)'}`,
                  borderRadius: '10px', color: 'var(--text-main)', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#FCA5A5', fontSize: '13px', marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{
              width: '100%', padding: '13px', fontSize: '15px', fontWeight: '600',
              background: loading ? '#2D314E' : 'linear-gradient(135deg, #3B82F6, #6366F1)',
              cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)', borderRadius: '999px'
            }}>
            {loading ? 'Connexion en cours...' : 'Se Connecter'}
          </button>
        </form>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <ShieldCheck size={14} color="#34D399" />
            <span>JWT sécurisé • Rôles Admin / Client • Kubernetes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
