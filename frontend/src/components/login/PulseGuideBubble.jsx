import { useState, useEffect } from 'react';
import styles from './Login.module.css';

const TIPS = [
  'Utilisez vos identifiants professionnels pour accéder à votre espace.',
  'Le tableau de bord admin permet de gérer les alertes en temps réel.',
  'Vos données sont chiffrées de bout en bout.',
  'Contactez le support technique pour toute question.',
];

export default function PulseGuideBubble() {
  const [visible, setVisible] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % TIPS.length);
  };

  if (!visible) return null;

  return (
    <div className={styles.pulseGuide}>
      <div className={styles.pulseGuideHeader}>
        <span className={styles.pulseGuideIcon}>💡</span>
        <span className={styles.pulseGuideTitle}>Pulse Guide</span>
        <button onClick={() => setVisible(false)} className={styles.pulseGuideClose}>×</button>
      </div>
      <p className={styles.pulseGuideText}>{TIPS[tipIndex]}</p>
      <button onClick={nextTip} className={styles.pulseGuideNext}>
        Astuce suivante →
      </button>
    </div>
  );
}
