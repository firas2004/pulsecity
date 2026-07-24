import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CitiesGallery from '../components/CitiesGallery';
import { ThemeToggle } from '../theme';

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
    color: '#3B82F6',
  },
  {
    icon: '🤖',
    title: 'Intelligence Artificielle',
    desc: 'Détection d\'anomalies par Isolation Forest, conseils automatiques par agents IA, et chatbot expert propulsé par Groq LLaMA.',
    color: '#8B5CF6',
  },
  {
    icon: '🔔',
    title: 'Alertes Proactives',
    desc: 'Système d\'alertes multi-niveaux avec seuils configurables. Chaque anomalie déclenchée est propagée en temps réel à tous les portails.',
    color: '#10B981',
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

  // Particle canvas
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.2,
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
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx.fill();
      });
      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - dist / 100)})`;
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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      {/* Particle background */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      {/* Radial glow blobs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── HEADER ── */}
      <header style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid var(--border-color)', backdropFilter: 'blur(20px)', backgroundColor: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🏙</div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            PULSE<span style={{ color: '#6366F1' }}>CITY</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ThemeToggle />
          <button
            onClick={() => navigate('/login')}
            style={{ padding: '10px 24px', borderRadius: '8px', background: 'linear-gradient(135deg,#3B82F6,#6366F1)', color: '#FFF', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', letterSpacing: '0.3px', boxShadow: '0 4px 20px rgba(99,102,241,0.4)', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)'; }}
          >
            Se Connecter →
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 5, textAlign: 'center', padding: '100px 24px 80px',
        backgroundImage: `linear-gradient(rgba(6,8,24,0.55), rgba(6,8,24,0.55)), url('/assests/1.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '30px', background: 'var(--surface-2)', border: '1px solid var(--border-color)', marginBottom: '28px', animation: 'fadeInDown 0.6s ease-out' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Plateforme Smart City en Production · Tunisie</span>
        </div>

        <h1 style={{ fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: '900', color: 'var(--text-main)', lineHeight: '1.05', letterSpacing: '-2px', margin: '0 0 24px', animation: 'fadeInUp 0.8s ease-out' }}>
          La Ville Intelligente<br />
          <span style={{ background: 'linear-gradient(135deg,#6366F1 0%,#8B5CF6 50%,#3B82F6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>au bout des doigts</span>
        </h1>

        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-muted)', maxWidth: '620px', margin: '0 auto 48px', lineHeight: '1.7', animation: 'fadeInUp 1s ease-out' }}>
          PulseCity surveille en temps réel les 18 grandes villes tunisiennes. Trafic, qualité d'air, bruit, énergie — une IA analyse, alerte et conseille 24h/24.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeInUp 1.2s ease-out' }}>
          <button
            onClick={() => navigate('/login')}
            style={{ padding: '16px 40px', borderRadius: '12px', background: 'linear-gradient(135deg,#3B82F6,#6366F1)', color: '#FFF', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '700', boxShadow: '0 8px 40px rgba(99,102,241,0.5)', transition: 'all 0.3s', letterSpacing: '0.3px' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 16px 50px rgba(99,102,241,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(99,102,241,0.5)'; }}
          >
            🚀 Accéder à la Plateforme
          </button>
          <a
            href="#features"
            style={{ padding: '16px 32px', borderRadius: '12px', background: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '16px', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', backdropFilter: 'blur(8px)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-2)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--surface)'; }}
          >
            En savoir plus ↓
          </a>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} style={{ position: 'relative', zIndex: 5, padding: '60px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2px', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--surface)', backdropFilter: 'blur(20px)' }}>
          {STATS.map((stat, i) => (
            <div key={i} style={{ padding: '40px 24px', textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.06)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ fontSize: '48px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-2px', lineHeight: 1 }}>
                {counts[i]}{stat.suffix}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ position: 'relative', zIndex: 5, padding: '60px 24px 100px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-1px', marginBottom: '16px' }}>
              Une Plateforme.<br />Trois Piliers.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '17px', maxWidth: '500px', margin: '0 auto' }}>
              Chaque fonctionnalité est conçue pour donner aux villes une vision claire et immédiate de leur état.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ padding: '36px', borderRadius: '20px', background: 'var(--surface-2)', border: '1px solid var(--border-color)', backdropFilter: 'blur(16px)', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = `${f.color}40`; e.currentTarget.style.boxShadow = `0 20px 60px ${f.color}20`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`, opacity: 0.6 }} />
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '12px' }}>{f.title}</h3>
                <p style={{ fontSize: '15px', color: 'var(--text-soft)', lineHeight: '1.7' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CITIES GALLERY ── */}
      <CitiesGallery
        images={[
          '/assests/Ariana.jpg','/assests/Beja.jpg','/assests/Ben Arous.jpg','/assests/Monastir.jpg','/assests/Sfax.jpg','/assests/sousse.png','/assests/Tunis.png'
        ]}
        titles={['Ariana','Beja','Ben Arous','Monastir','Sfax','Sousse','Tunis']}
      />

      {/* ── CTA FINAL ── */}
      <section style={{ position: 'relative', zIndex: 5, padding: '80px 24px 120px', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '60px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.2)', backdropFilter: 'blur(20px)' }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px', letterSpacing: '-1px' }}>
            Prêt à explorer votre ville ?
          </h2>
          <p style={{ color: 'var(--text-soft)', fontSize: '16px', marginBottom: '36px', lineHeight: '1.7' }}>
            Connectez-vous en tant qu'administrateur ou client pour accéder au tableau de bord en temps réel.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{ padding: '14px 36px', borderRadius: '10px', background: 'linear-gradient(135deg,#3B82F6,#6366F1)', color: '#FFF', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '700', boxShadow: '0 8px 30px rgba(99,102,241,0.4)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Se Connecter →
            </button>
          </div>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
            {[['👤 Admin', 'admin / admin123'], ['🏙 Client', 'client / client123']].map(([label, creds]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                <code style={{ fontSize: '12px', color: '#6366F1', backgroundColor: 'rgba(99,102,241,0.1)', padding: '4px 10px', borderRadius: '6px' }}>{creds}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position: 'relative', zIndex: 5, textAlign: 'center', padding: '24px', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px' }}>
        © 2026 PulseCity — Smart City Platform • Tunisie
      </footer>

      {/* ── CSS ANIMATIONS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeInDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeInUp   { from { opacity:0; transform:translateY(20px);  } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse      { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.6; transform:scale(1.3); } }
        @keyframes marquee    { from { transform:translateX(0); } to { transform:translateX(-50%); } }
      `}</style>
    </div>
  );
}
