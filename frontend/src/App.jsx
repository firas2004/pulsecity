import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatBubble from './components/chat/ChatBubble';

// Pages
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import CityManager from './pages/admin/CityManager';
import ClientManager from './pages/admin/ClientManager';
import SensorManager from './pages/admin/SensorManager';
import IssueManager from './pages/admin/IssueManager';
import ResourceAllocation from './pages/admin/ResourceAllocation';
import ClientDashboard from './pages/client/ClientDashboard';
import AlertsPanel from './pages/client/AlertsPanel';
import ChatBot from './pages/client/ChatBot';
import DetailedMobility from './pages/client/DetailedMobility';
import DetailedEnvironment from './pages/client/DetailedEnvironment';
import BeachQuality from './pages/client/BeachQuality';
import DetailedInfrastructure from './pages/client/DetailedInfrastructure';
import CityCompare from './pages/client/CityCompare';
import CityRanking from './pages/client/CityRanking';
import ReportIssue from './pages/client/ReportIssue';
import AlertPreferences from './pages/client/AlertPreferences';
import PublicBeachView from './pages/PublicBeachView';
import TripSimulator from './pages/client/TripSimulator';
import HealthFinder from './pages/client/HealthFinder';
import AdminFinder from './pages/client/AdminFinder';
import POIFinder from './pages/client/POIFinder';
import EcoPulse from './pages/client/EcoPulse';
import StoresFinder from './pages/client/StoresFinder';

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

// ── Unified Layout with Left Navigation Sidebar ──────────────────────────────
const AppLayout = ({ role = 'client', children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <Sidebar role={role} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        <main style={{ flex: 1, backgroundColor: 'var(--bg-color)' }}>{children}</main>
      </div>
    </div>
  );
};

// ── App Router ────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <ChatBubble />
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Welcome />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Public Beach Tourism Widget */}
        <Route path="/beaches/:cityId" element={<PublicBeachView />} />

        {/* ── Admin portal ───────────────────────────────────────── */}
        <Route path="/admin" element={<AdminGuard><AppLayout role="admin"><AdminDashboard /></AppLayout></AdminGuard>} />
        <Route path="/admin/cities" element={<AdminGuard><AppLayout role="admin"><AdminDashboard /></AppLayout></AdminGuard>} />
        <Route path="/admin/cities/:cityId" element={<AdminGuard><AppLayout role="admin"><CityManager /></AppLayout></AdminGuard>} />
        <Route path="/admin/cities/:cityId/sensors" element={<AdminGuard><AppLayout role="admin"><SensorManager /></AppLayout></AdminGuard>} />
        <Route path="/admin/clients" element={<AdminGuard><AppLayout role="admin"><ClientManager /></AppLayout></AdminGuard>} />
        <Route path="/admin/issues" element={<AdminGuard><AppLayout role="admin"><IssueManager /></AppLayout></AdminGuard>} />
        <Route path="/admin/resources" element={<AdminGuard><AppLayout role="admin"><ResourceAllocation /></AppLayout></AdminGuard>} />
        {/* Admin domain pages */}
        <Route path="/admin/mobility" element={<AdminGuard><AppLayout role="admin"><DetailedMobility /></AppLayout></AdminGuard>} />
        <Route path="/admin/environment" element={<AdminGuard><AppLayout role="admin"><DetailedEnvironment /></AppLayout></AdminGuard>} />
        <Route path="/admin/beaches" element={<AdminGuard><AppLayout role="admin"><BeachQuality /></AppLayout></AdminGuard>} />
        <Route path="/admin/infrastructure" element={<AdminGuard><AppLayout role="admin"><DetailedInfrastructure /></AppLayout></AdminGuard>} />
        <Route path="/admin/compare" element={<AdminGuard><AppLayout role="admin"><CityCompare /></AppLayout></AdminGuard>} />
        <Route path="/admin/ranking" element={<AdminGuard><AppLayout role="admin"><CityRanking /></AppLayout></AdminGuard>} />
        <Route path="/admin/alerts" element={<AdminGuard><AppLayout role="admin"><AlertsPanel /></AppLayout></AdminGuard>} />
        <Route path="/admin/chat" element={<AdminGuard><AppLayout role="admin"><ChatBot /></AppLayout></AdminGuard>} />

        {/* ── Client portal ──────────────────────────────────────── */}
        <Route path="/client" element={<ClientGuard><AppLayout role="client"><ClientDashboard /></AppLayout></ClientGuard>} />
        <Route path="/client/mobility" element={<ClientGuard><AppLayout role="client"><DetailedMobility /></AppLayout></ClientGuard>} />
        <Route path="/client/environment" element={<ClientGuard><AppLayout role="client"><DetailedEnvironment /></AppLayout></ClientGuard>} />
        <Route path="/client/beaches" element={<ClientGuard><AppLayout role="client"><BeachQuality /></AppLayout></ClientGuard>} />
        <Route path="/client/infrastructure" element={<ClientGuard><AppLayout role="client"><DetailedInfrastructure /></AppLayout></ClientGuard>} />
        <Route path="/client/compare" element={<ClientGuard><AppLayout role="client"><CityCompare /></AppLayout></ClientGuard>} />
        <Route path="/client/ranking" element={<ClientGuard><AppLayout role="client"><CityRanking /></AppLayout></ClientGuard>} />
        <Route path="/client/alerts" element={<ClientGuard><AppLayout role="client"><AlertsPanel /></AppLayout></ClientGuard>} />
        <Route path="/client/chat" element={<ClientGuard><AppLayout role="client"><ChatBot /></AppLayout></ClientGuard>} />
        <Route path="/client/issues" element={<ClientGuard><AppLayout role="client"><ReportIssue /></AppLayout></ClientGuard>} />
        <Route path="/client/subscriptions" element={<ClientGuard><AppLayout role="client"><AlertPreferences /></AppLayout></ClientGuard>} />
        <Route path="/client/trip-simulator" element={<ClientGuard><AppLayout role="client"><TripSimulator /></AppLayout></ClientGuard>} />
        <Route path="/client/sante" element={<ClientGuard><AppLayout role="client"><HealthFinder /></AppLayout></ClientGuard>} />
        <Route path="/admin/sante" element={<AdminGuard><AppLayout role="admin"><HealthFinder /></AppLayout></AdminGuard>} />
        <Route path="/client/administrations" element={<ClientGuard><AppLayout role="client"><AdminFinder /></AppLayout></ClientGuard>} />
        <Route path="/admin/administrations" element={<AdminGuard><AppLayout role="admin"><AdminFinder /></AppLayout></AdminGuard>} />
        <Route path="/client/local" element={<ClientGuard><AppLayout role="client"><POIFinder /></AppLayout></ClientGuard>} />
        <Route path="/admin/local" element={<AdminGuard><AppLayout role="admin"><POIFinder /></AppLayout></AdminGuard>} />
        <Route path="/client/eco" element={<ClientGuard><AppLayout role="client"><EcoPulse /></AppLayout></ClientGuard>} />
        <Route path="/admin/eco" element={<AdminGuard><AppLayout role="admin"><EcoPulse /></AppLayout></AdminGuard>} />
        <Route path="/client/magasins" element={<ClientGuard><AppLayout role="client"><StoresFinder /></AppLayout></ClientGuard>} />
        <Route path="/admin/magasins" element={<AdminGuard><AppLayout role="admin"><StoresFinder /></AppLayout></AdminGuard>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
