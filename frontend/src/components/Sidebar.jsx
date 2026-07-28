import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ThemeToggle } from '../theme';

const Sidebar = ({ role = 'client' }) => {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('pulsecity_sidebar_collapsed') === 'true';
  });

  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || (role === 'admin' ? 'Administrateur' : 'Citoyen');

  useEffect(() => {
    localStorage.setItem('pulsecity_sidebar_collapsed', collapsed);
  }, [collapsed]);

  const toggleSidebar = () => setCollapsed(prev => !prev);

  const basePath = role === 'admin' ? '/admin' : '/client';

  const mainNavItems = [
    { to: basePath, icon: Icons.LayoutDashboard, label: 'Vue Globale', end: true },
    { to: `${basePath}/mobility`, icon: Icons.Car, label: 'Mobilité Détaillée' },
    { to: `${basePath}/environment`, icon: Icons.Wind, label: 'Environnement' },
    { to: `${basePath}/beaches`, icon: Icons.Waves, label: 'Plages & Baignade' },
    { to: `${basePath}/infrastructure`, icon: Icons.Zap, label: 'Infrastructure' },
    { to: `${basePath}/compare`, icon: Icons.GitCompare, label: 'Comparaison Villes' },
    { to: `${basePath}/ranking`, icon: Icons.Trophy, label: 'Score & Classement' },
    { to: `${basePath}/alerts`, icon: Icons.Bell, label: 'Centre d\'Alertes' },
    { to: `${basePath}/chat`, icon: Icons.MessageSquare, label: 'Assistant IA' },
  ];

  const adminNavItems = [
    { to: '/admin/cities', icon: Icons.Building2, label: 'Gestion des Villes' },
    { to: '/admin/clients', icon: Icons.Users, label: 'Gestion des Clients' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside style={{
      width: collapsed ? '72px' : '260px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 110,
      backgroundColor: 'var(--surface)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: 'var(--shadow)',
      backdropFilter: 'blur(16px)',
      userSelect: 'none',
    }}>
      {/* ── Brand Header ─────────────────────────────────────────── */}
      <div style={{
        padding: collapsed ? '16px 12px' : '18px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: role === 'admin' 
              ? 'linear-gradient(135deg,#3B82F6,#6366F1)' 
              : 'linear-gradient(135deg,#10B981,#0EA5E9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
            flexShrink: 0,
          }}>
            {role === 'admin' ? <Icons.Building2 size={20} color="#FFF" /> : <Icons.Globe size={20} color="#FFF" />}
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                PULSE<span style={{ color: role === 'admin' ? '#6366F1' : '#10B981' }}>CITY</span>
              </span>
              <span style={{ fontSize: '10px', fontWeight: '700', color: role === 'admin' ? '#6366F1' : '#10B981', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                {role === 'admin' ? 'Espace Administration' : 'Plateforme Citoyenne'}
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={toggleSidebar}
            title="Réduire la barre"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Icons.ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* ── Navigation Links ──────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: collapsed ? '16px 8px' : '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        {collapsed && (
          <button
            onClick={toggleSidebar}
            title="Agrandir la barre"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              transition: 'all 0.2s',
            }}
          >
            <Icons.ChevronRight size={18} />
          </button>
        )}

        <div style={{
          fontSize: '11px',
          fontWeight: '700',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          padding: collapsed ? '0' : '8px 12px 4px 12px',
          textAlign: collapsed ? 'center' : 'left',
        }}>
          {!collapsed ? 'Navigation' : '•••'}
        </div>

        {mainNavItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={idx}
              to={item.to}
              end={item.end}
              title={collapsed ? item.label : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '12px' : '11px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '12px',
                color: isActive ? '#FFF' : 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                background: isActive 
                  ? role === 'admin' 
                    ? 'linear-gradient(135deg,#3B82F6,#6366F1)' 
                    : 'linear-gradient(135deg,#10B981,#3B82F6)'
                  : 'transparent',
                boxShadow: isActive ? '0 6px 16px rgba(59,130,246,0.25)' : 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                  e.currentTarget.style.color = 'var(--text-main)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}

        {role === 'admin' && (
          <>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: collapsed ? '0' : '16px 12px 4px 12px',
              textAlign: collapsed ? 'center' : 'left',
            }}>
              {!collapsed ? 'Administration' : '•••'}
            </div>

            {adminNavItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={idx}
                  to={item.to}
                  title={collapsed ? item.label : ''}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: collapsed ? '12px' : '11px 14px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: '12px',
                    color: isActive ? '#FFF' : 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    background: isActive ? 'linear-gradient(135deg,#3B82F6,#6366F1)' : 'transparent',
                    boxShadow: isActive ? '0 6px 16px rgba(59,130,246,0.25)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                      e.currentTarget.style.color = 'var(--text-main)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }
                  }}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </>
        )}
      </div>

      {/* ── Footer / User Profile ─────────────────────────────────── */}
      <div style={{
        padding: collapsed ? '16px 8px' : '16px 14px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#3B82F6,#6366F1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              color: '#FFF',
              fontSize: '13px',
              flexShrink: 0,
            }}>
              {username.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{username}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{role.toUpperCase()}</span>
              </div>
            )}
          </div>
          {!collapsed && <ThemeToggle />}
        </div>

        <button
          onClick={handleLogout}
          title={collapsed ? 'Déconnexion' : ''}
          style={{
            width: '100%',
            padding: collapsed ? '10px' : '9px 12px',
            borderRadius: '10px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#EF4444',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
        >
          <Icons.LogOut size={16} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
