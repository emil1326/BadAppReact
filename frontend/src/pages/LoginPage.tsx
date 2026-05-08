import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../store/api';
import {
  COLLEGE_NAME_LONG,
  PORTAL_NAME,
  PORTAL_SECTION,
  PORTAL_TAGLINE,
  PORTAL_VERSION,
} from '../config/branding';
import styles from './LoginPage.module.css';

const DO_NOT_CLICK_REDIRECT = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

export function LoginPage() {
  const [userName, setUserName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    const trimmed = userName.trim();
    if (!trimmed) {
      setErrorMessage("Veuillez entrer un nom d'utilisateur.");
      return;
    }

    try {
      await login({ userName: trimmed }).unwrap();
      navigate('/accueil');
    } catch {
      setErrorMessage('Échec de la connexion. Veuillez réessayer.');
    }
  };

  const handleDoNotClick = () => {
    window.close();
    window.location.href = DO_NOT_CLICK_REDIRECT;
  };

  return (
    <div className="colnet-login">
      <button
        type="button"
        className="colnet-login__do-not-click"
        onClick={handleDoNotClick}
      >
        ne pas cliquer
      </button>
      <div className={`colnet-login__card colnet-panel ${styles.cardWide}`}>
        <div className="colnet-panel__header">
          {PORTAL_NAME} - {PORTAL_SECTION}
        </div>
        <div className="colnet-panel__body">
          <p className="colnet-login__institution">
            {COLLEGE_NAME_LONG}
            <br />
            <span className="colnet-login__tagline">{PORTAL_TAGLINE}</span>
          </p>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <label className={styles.label} htmlFor="username">
                Nom d&apos;utilisateur
              </label>
              <input
                id="username"
                className={styles.input}
                type="text"
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                autoFocus
                disabled={isLoading}
              />
              <button
                type="submit"
                className={styles.submit}
                disabled={isLoading}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>
            {errorMessage && (
              <div className={`colnet-form__error ${styles.error}`}>
                {errorMessage}
              </div>
            )}
          </form>
          <p className="colnet-login__version">{PORTAL_VERSION}</p>
        </div>
      </div>
    </div>
  );
}
