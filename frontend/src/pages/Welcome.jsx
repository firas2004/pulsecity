import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CitiesGallery from '../components/CitiesGallery';
import { ThemeToggle } from '../theme';
import '../styles/welcome.css';

// Animated counter hook
const useCounter = (target, duration = 2000, started = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, started]);
  return count;
};

const FEATURES = [
  {
    icon: '🌐',
    title: 'Surveillance Temps Réel',
    desc: 'Données capteurs actualisées toutes les 5 secondes via WebSocket. Trafic, CO₂, bruit, énergie, température et plus encore.',
    color: '#0066FF',
  },
  {
    icon: '🤖',
    title: 'Intelligence Artificielle',
    desc: 'Détection d\'anomalies par Isolation Forest, conseils automatiques par agents IA, et chatbot expert propulsé par Groq LLaMA.',
    color: '#3385FF',
  },
  {
    icon: '🔔',
    title: 'Alertes Proactives',
    desc: 'Système d\'alertes multi-niveaux avec seuils configurables. Chaque anomalie déclenchée est propagée en temps réel à tous les portails.',
    color: '#7FD579',
  },
];

const STATS = [
  { value: 18, suffix: '', label: 'Villes Tunisiennes' },
  { value: 72, suffix: '+', label: 'Capteurs Actifs' },
  { value: 5, suffix: 's', label: 'Refresh Temps Réel' },
  { value: 24, suffix: '/7', label: 'Surveillance Continue' },
];

export default function Welcome() {
  const navigate = useNavigate();
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  // Vana Electric Particle Canvas
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const PARTICLE_COLORS = [
      'rgba(0, 102, 255, 0.65)',   // electric blue
      'rgba(51, 133, 255, 0.45)',  // cobalt
      'rgba(139, 181, 255, 0.35)', // periwinkle
      'rgba(127, 213, 121, 0.45)', // lime
    ];

    const particles = Array.from({ length: 85 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      // Connect nearby particles with Vana electric line
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 102, 255, ${0.16 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  // Intersection observer for stats
  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const c0 = useCounter(STATS[0].value, 1800, statsVisible);
  const c1 = useCounter(STATS[1].value, 2000, statsVisible);
  const c2 = useCounter(STATS[2].value, 1000, statsVisible);
  const c3 = useCounter(STATS[3].value, 1500, statsVisible);
  const counts = [c0, c1, c2, c3];

  return (
    <div className="welcome-page">
      {/* Vana Canvas & Radial Blurs */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
      <div className="hero-radial-circle-1" />
      <div className="hero-radial-circle-2" />

      {/* ── HEADER ── */}
      <header className="welcome-header">
        <div className="logo">
          <span className="logo-text">PULSE</span>
          <span className="logo-accent">CITY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <ThemeToggle />
          <button
            onClick={() => navigate('/login')}
            className="btn-login"
          >
            Se Connecter →
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="hero-section">
        {/* Badge Live */}
        <div className="hero-badge-live">
          <span className="dot" />
          <span>PLATEFORME SMART CITY EN PRODUCTION · TUNISIE</span>
        </div>

        <h1 className="hero-title">
          La Ville <span className="highlight">Intelligente</span><br />
          au bout des doigts
        </h1>

        <p className="hero-subtitle">
          PulseCity surveille en temps réel les 18 grandes villes tunisiennes. Trafic, qualité d'air, bruit, énergie — une IA analyse, alerte et conseille 24h/24.
        </p>

        <div className="hero-cta-group">
          <button
            onClick={() => navigate('/login')}
            className="hero-btn-primary"
          >
            🚀 Accéder à la Plateforme
          </button>
          <a
            href="#features"
            className="hero-btn-secondary"
          >
            En savoir plus ↓
          </a>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} className="stats-section">
        <div className="stats-grid">
          {STATS.map((stat, i) => (
            <div key={i} className="stats-card">
              <div className="stats-number">
                {counts[i]}{stat.suffix}
              </div>
              <div className="stats-label">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES / PILLARS ── */}
      <section id="features" className="pillars-section">
        <div className="pillars-label">ARCHITECTURE PROTOCOLE</div>
        <h2 className="pillars-title">
          Une Plateforme. Trois Piliers.
        </h2>

        <div className="pillars-grid">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="pillar-card"
              onMouseMove={(e) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                card.style.transform = `perspective(1000px) rotateX(${-y / 20}deg) rotateY(${x / 20}deg) translateY(-4px)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
              }}
            >
              <div className="pillar-icon">{f.icon}</div>
              <h3 className="pillar-title">{f.title}</h3>
              <p className="pillar-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CITIES GALLERY ── */}
      <div className="gallery-section">
        <div className="gallery-section-title">VILLES SURVEILLÉES EN TEMPS RÉEL</div>
        <CitiesGallery
          images={[
            '/assests/Ariana.jpg','/assests/Beja.jpg','/assests/Ben Arous.jpg','/assests/Monastir.jpg','/assests/Sfax.jpg','/assests/sousse.png','/assests/Tunis.png'
          ]}
          titles={['Ariana','Béja','Ben Arous','Monastir','Sfax','Sousse','Tunis']}
        />
      </div>

      {/* ── CTA FINAL ── */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">
            Prêt à explorer votre ville ?
          </h2>
          <p className="cta-subtitle">
            Connectez-vous en tant qu'administrateur ou citoyen pour accéder aux métriques en direct.
          </p>

          <button onClick={() => navigate('/login')} className="cta-btn-main">
            Se Connecter →
          </button>

          <div className="demo-credentials-grid">
            <div className="demo-card">
              <div className="role">👤 Administrateur</div>
              <div className="credentials">admin / admin123</div>
            </div>
            <div className="demo-card">
              <div className="role">🏙️ Citoyen</div>
              <div className="credentials">client / client123</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="welcome-footer">
        <p>
          © 2026 PULSECITY — PLATFORME SMART CITY <span className="flag">🇹🇳 TUNISIE</span>
        </p>
      </footer>
    </div>
  );
}
