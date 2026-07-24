import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ThemeToggle } from './theme';

// Pages
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import CityManager from './pages/admin/CityManager';
import ClientManager from './pages/admin/ClientManager';
import SensorManager from './pages/admin/SensorManager';
import ClientDashboard from './pages/client/ClientDashboard';
import AlertsPanel from './pages/client/AlertsPanel';
import ChatBot from './pages/client/ChatBot';

// JWT Decoder
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch { return null; }
};

// ── Route Guards ──────────────────────────────────────────────────────────────
const AdminGuard = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" replace />;
  const userRole = role || decodeToken(token)?.role;
  if (userRole !== 'admin') return <Navigate to="/login" replace />;
  return children;
};

const ClientGuard = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" replace />;
  const userRole = role || decodeToken(token)?.role;
  if (userRole !== 'client') return <Navigate to="/login" replace />;
  return children;
};

// ── Nav link style helper ─────────────────────────────────────────────────────
const navLinkStyle = ({ isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '9px 14px',
  borderRadius: '999px',
  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: isActive ? '700' : '500',
  background: isActive ? 'linear-gradient(135deg, rgba(59,130,246,0.16), rgba(99,102,241,0.14))' : 'var(--surface-2)',
  border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border-color)',
  boxShadow: isActive ? '0 8px 18px rgba(59,130,246,0.18)' : 'none',
  transition: 'all 0.2s ease',
});

// ── Admin Layout ──────────────────────────────────────────────────────────────
const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username') || 'Administrateur';

  // Breadcrumb
  const crumbs = [{ label: 'Admin', to: '/admin' }];
  if (location.pathname.includes('/admin/cities/')) {
    const parts = location.pathname.split('/');
    const cityId = parts[3];
    if (cityId) crumbs.push({ label: cityId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), to: null });
    if (location.pathname.includes('/sensors')) crumbs.push({ label: 'Capteurs', to: null });
  } else if (location.pathname === '/admin/clients') {
    crumbs.push({ label: 'Clients', to: null });
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 32px', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border-color)', boxShadow: 'var(--shadow)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#3B82F6,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Building2 size={18} color="#FFF"/>
          </div>
          <span style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            PULSE<span style={{ color: '#6366F1' }}>CITY</span>
          </span>
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#6366F1', border: '1px solid rgba(99,102,241,0.4)', padding: '2px 8px', borderRadius: '20px', letterSpacing: '1px' }}>ADMIN</span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <NavLink to="/admin" end style={navLinkStyle}>
            <Icons.LayoutDashboard size={15}/>  Villes
          </NavLink>
          <NavLink to="/admin/clients" style={navLinkStyle}>
            <Icons.Users size={15}/> Clients
          </NavLink>
        </nav>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#FFF' }}>
              {username.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{username}</span>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ padding: '7px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
          >
            <Icons.LogOut size={14}/> Déconnexion
          </button>
        </div>
      </header>

      {/* Breadcrumb */}
      <div style={{ padding: '10px 32px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: '#374151' }}>/</span>}
            {c.to ? (
              <NavLink to={c.to} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>{c.label}</NavLink>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>{c.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      <main style={{ flex: 1, padding: '32px', backgroundColor: 'var(--bg-color)' }}>{children}</main>
    </div>
  );
};

// ── Client Layout ─────────────────────────────────────────────────────────────
const ClientLayout = ({ children }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Utilisateur';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 32px', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border-color)', boxShadow: 'var(--shadow)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#10B981,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Globe size={18} color="#FFF"/>
          </div>
          <span style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            PULSE<span style={{ color: '#10B981' }}>CITY</span>
          </span>
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#10B981', border: '1px solid rgba(16,185,129,0.4)', padding: '2px 8px', borderRadius: '20px', letterSpacing: '1px' }}>PORTAL</span>
        </div>

        <nav style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <NavLink to="/client" end style={navLinkStyle}>
            <Icons.LayoutDashboard size={15}/> Tableau de Bord
          </NavLink>
          <NavLink to="/client/alerts" style={navLinkStyle}>
            <Icons.Bell size={15}/> Alertes
          </NavLink>
          <NavLink to="/client/chat" style={navLinkStyle}>
            <Icons.MessageSquare size={15}/> Assistant IA
          </NavLink>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#FFF' }}>
              {username.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{username}</span>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ padding: '7px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
          >
            <Icons.LogOut size={14}/> Déconnexion
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)' }}>{children}</main>
    </div>
  );
};

// ── App Router ────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Welcome />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin portal */}
        <Route path="/admin" element={<AdminGuard><AdminLayout><AdminDashboard /></AdminLayout></AdminGuard>} />
        <Route path="/admin/cities/:cityId" element={<AdminGuard><AdminLayout><CityManager /></AdminLayout></AdminGuard>} />
        <Route path="/admin/cities/:cityId/sensors" element={<AdminGuard><AdminLayout><SensorManager /></AdminLayout></AdminGuard>} />
        <Route path="/admin/clients" element={<AdminGuard><AdminLayout><ClientManager /></AdminLayout></AdminGuard>} />

        {/* Client portal */}
        <Route path="/client" element={<ClientGuard><ClientLayout><ClientDashboard /></ClientLayout></ClientGuard>} />
        <Route path="/client/alerts" element={<ClientGuard><ClientLayout><AlertsPanel /></ClientLayout></ClientGuard>} />
        <Route path="/client/chat" element={<ClientGuard><ClientLayout><ChatBot /></ClientLayout></ClientGuard>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
