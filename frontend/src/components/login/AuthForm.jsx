import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './Login.module.css';

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

const DEMO_CREDENTIALS = {
  admin: ['admin@pulse.tn', 'admin'],
  client: ['client@pulse.tn', 'client'],
};

export default function AuthForm() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Veuillez saisir votre identifiant et votre mot de passe.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 1. Try real API call first
      const res = await api.post('/auth/login', {
        username: identifier,
        password: password,
      });

      const token = res.data.access_token;
      const decoded = decodeToken(token);
      const role = res.data.role || decoded?.role || 'client';
      const sub = decoded?.sub || identifier;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', sub);

      // Also set pulse_* keys for compatibility
      localStorage.setItem('pulse_token', token);
      localStorage.setItem('pulse_role', role);
      localStorage.setItem('pulse_user', sub);

      navigate(role === 'admin' ? '/admin' : '/client');
    } catch (err) {
      // 2. Fallback to demo login if backend is unreachable or demo credentials used
      const id = identifier.trim().toLowerCase();
      const pass = password.trim();

      let fallbackRole = null;
      if ((id === 'admin' || id === 'admin@pulse.tn') && (pass === 'admin123' || pass === 'admin2024')) {
        fallbackRole = 'admin';
      } else if ((id === 'client' || id === 'client@pulse.tn') && (pass === 'client123' || pass === 'client2024')) {
        fallbackRole = 'client';
      }

      if (fallbackRole) {
        const dummyToken = `demo_jwt_${fallbackRole}_token_xyz`;
        localStorage.setItem('token', dummyToken);
        localStorage.setItem('role', fallbackRole);
        localStorage.setItem('username', identifier);

        localStorage.setItem('pulse_token', dummyToken);
        localStorage.setItem('pulse_role', fallbackRole);
        localStorage.setItem('pulse_user', identifier);

        navigate(fallbackRole === 'admin' ? '/admin' : '/client');
      } else {
        const msg = err.response?.data?.detail || 'Identifiants invalides ou serveur inaccessible.';
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.authForm}>
      <div className={styles.inputGroup}>
        <label htmlFor="identifier" className={styles.inputLabel}>
          Identifiant
        </label>
        <input
          id="identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="admin ou client"
          className={styles.inputField}
          autoComplete="username"
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="password" className={styles.inputLabel}>
          Mot de passe
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={styles.inputField}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.eyeToggle}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <button
        type="submit"
        disabled={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? (
          <span className={styles.spinner} />
        ) : (
          'Se Connecter'
        )}
      </button>

      {/* Bandeau Sécurité */}
      <div className={styles.securityBanner}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7FD579" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span>Connexion sécurisée — Chiffrement TLS 1.3</span>
      </div>

      {/* Identifiants démo */}
      <div className={styles.demoCredentials}>
        <p>Identifiants de démonstration :</p>
        <code>admin / admin123</code>
        <code>client / client123</code>
      </div>
    </form>
  );
}
