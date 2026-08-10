import LoginLeftPanel from '../components/login/LoginLeftPanel';
import AuthForm from '../components/login/AuthForm';
import ThemeToggle from '../components/login/ThemeToggle';
import PulseGuideBubble from '../components/login/PulseGuideBubble';
import styles from '../components/login/Login.module.css';

export default function Login() {
  return (
    <div className={styles.loginPage}>
      {/* Panneau Gauche — Constellation + Contenu */}
      <LoginLeftPanel />

      {/* Panneau Droit — Formulaire */}
      <div className={styles.rightPanel}>
        <ThemeToggle />

        <div className={styles.rightContent}>
          {/* Logo Central */}
          <div className={styles.rightLogo}>
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="2" fill="#0066FF" />
              <path d="M8 16L14 10L20 16L26 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="10" r="2" fill="white"/>
              <circle cx="20" cy="16" r="2" fill="white"/>
              <circle cx="26" cy="10" r="2" fill="white"/>
            </svg>
          </div>

          {/* Badge Statut */}
          <div className={styles.statusBadge}>
            <span className={styles.statusDot} />
            Système opérationnel
          </div>

          <h2 className={styles.rightTitle}>Connexion</h2>
          <p className={styles.rightSubtitle}>
            Accédez à votre espace de gestion urbaine
          </p>

          <AuthForm />
        </div>

        <PulseGuideBubble />
      </div>
    </div>
  );
}
