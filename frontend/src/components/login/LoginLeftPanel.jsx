import ConstellationCanvas from './ConstellationCanvas';
import BackToWelcomeButton from './BackToWelcomeButton';
import styles from './Login.module.css';

const ARCHITECTURE_PILLS = [
  { label: 'React 18', color: '#0066FF' },
  { label: 'FastAPI', color: '#7FD579' },
  { label: 'PostgreSQL', color: '#D896FF' },
  { label: 'JWT Auth', color: '#B8AD97' },
];

const KPI_CARDS = [
  { value: '18', unit: '/18', label: 'Villes Connectées', accent: '#0066FF' },
  { value: '99.9', unit: '%', label: 'Uptime Réseau', accent: '#7FD579' },
];

export default function LoginLeftPanel() {
  return (
    <div className={styles.leftPanel}>
      <ConstellationCanvas />
      <BackToWelcomeButton />

      <div className={styles.leftContent}>
        {/* Logo + Badge */}
        <div className={styles.leftHeader}>
          <div className={styles.leftLogo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="2" fill="#0066FF" />
              <path d="M8 16L14 10L20 16L26 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="10" r="2" fill="white"/>
              <circle cx="20" cy="16" r="2" fill="white"/>
              <circle cx="26" cy="10" r="2" fill="white"/>
            </svg>
            <span className={styles.logoText}>PULSE CITY</span>
          </div>
          <span className={styles.versionBadge}>v2.4.0</span>
        </div>

        {/* Titre d'accroche */}
        <h1 className={styles.leftTitle}>
          Le système nerveux
          <br />
          <span className={styles.leftTitleAccent}>de la Tunisie.</span>
        </h1>

        {/* Description */}
        <p className={styles.leftDescription}>
          Plateforme unifiée de gestion urbaine intelligente. 
          Connectez-vous pour accéder au tableau de bord de votre ville 
          et piloter les infrastructures en temps réel.
        </p>

        {/* Badges d'architecture */}
        <div className={styles.archPills}>
          {ARCHITECTURE_PILLS.map((pill) => (
            <span
              key={pill.label}
              className={styles.archPill}
              style={{ borderColor: `${pill.color}40`, color: pill.color }}
            >
              <span className={styles.pillDot} style={{ background: pill.color }} />
              {pill.label}
            </span>
          ))}
        </div>

        {/* Mini-Widgets KPI */}
        <div className={styles.kpiGrid}>
          {KPI_CARDS.map((kpi) => (
            <div key={kpi.label} className={styles.kpiCard}>
              <div className={styles.kpiValue} style={{ color: kpi.accent }}>
                {kpi.value}
                <span className={styles.kpiUnit}>{kpi.unit}</span>
              </div>
              <div className={styles.kpiLabel}>{kpi.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
