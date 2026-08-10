import { Link } from 'react-router-dom';
import styles from './Login.module.css';

export default function BackToWelcomeButton() {
  return (
    <Link to="/" className={styles.backToWelcome}>
      <span className={styles.backArrow}>←</span>
      Retour à l'accueil
    </Link>
  );
}
