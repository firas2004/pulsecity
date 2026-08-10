import React from 'react';
import { useNavigate } from 'react-router-dom';

const USE_CASES = [
  {
    icon: '👤',
    role: 'Citoyen',
    title: 'Je veux savoir si le métro est en retard',
    desc: 'Consultez le trafic en temps réel, planifiez votre trajet multimodal (métro, louage, train, taxi) et recevez des alertes personnalisées.',
    cta: 'Accéder au profil citoyen',
    link: '/login',
    color: '#0066FF',
  },
  {
    icon: '🏢',
    role: 'Administration',
    title: 'Je dois surveiller les services de ma commune',
    desc: 'Tableau de bord complet avec alertes automatiques de conteneurs pleins, gestion des capteurs IoT et allocation des ressources.',
    cta: 'Espace administration',
    link: '/login',
    color: '#D896FF',
  },
  {
    icon: '🧑‍💼',
    role: 'Entreprise & Investisseur',
    title: 'Je veux m\'installer dans la meilleure ville',
    desc: 'Comparez les indicateurs économiques (cours du dinar, prix carburants, inflation), l\'infrastructure et la qualité de vie entre les 18 villes.',
    cta: 'Données Éco Pulse',
    link: '/login',
    color: '#B8AD97',
  },
];

export default function UseCasesSection() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: '88px 24px', background: '#0A0A0F', position: 'relative', zIndex: 5 }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', textTransform: 'uppercase', color: '#0066FF', letterSpacing: '0.1em' }}>
            • CAS D'USAGE
          </span>
          <h2 style={{ fontFamily: 'var(--font-primary, sans-serif)', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 42px)', color: '#FFFFFF', marginTop: '12px', letterSpacing: '-0.02em' }}>
            Pulse City s'adapte à votre profil
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {USE_CASES.map((u, i) => (
            <div
              key={i}
              onClick={() => navigate(u.link)}
              style={{
                background: '#12121A',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '2px',
                padding: '40px 32px',
                transition: 'all 300ms ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1E1E2E';
                e.currentTarget.style.borderColor = u.color;
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#12121A';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>{u.icon}</div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', textTransform: 'uppercase', color: u.color, letterSpacing: '0.1em', marginBottom: '10px' }}>
                  {u.role}
                </div>
                <h3 style={{ fontFamily: 'var(--font-primary, sans-serif)', fontWeight: 800, fontSize: '20px', color: '#FFFFFF', lineHeight: 1.3 }}>
                  {u.title}
                </h3>
                <p style={{ fontFamily: 'var(--font-primary, sans-serif)', fontSize: '14px', color: '#C8C8D8', lineHeight: 1.6, marginTop: '12px' }}>
                  {u.desc}
                </p>
              </div>

              <div style={{ marginTop: '28px', fontFamily: 'var(--font-primary, sans-serif)', fontWeight: 700, fontSize: '13px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {u.cta} <span style={{ color: u.color }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
