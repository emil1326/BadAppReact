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
    // Most browsers block window.close() on tabs they didn't open, so this
    // is a deliberate two-step: try to close, then redirect on the next line.
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
      <div className="colnet-login__card colnet-panel">
        <div className="colnet-panel__header">
          {PORTAL_NAME} - {PORTAL_SECTION}
        </div>
        <div className="colnet-panel__body">
          <p className="colnet-login__institution">
            {COLLEGE_NAME_LONG}
            <br />
            <span className="colnet-login__tagline">{PORTAL_TAGLINE}</span>
          </p>
          <form className="colnet-form" onSubmit={handleSubmit}>
            <div className="colnet-form__field">
              <label className="colnet-form__label" htmlFor="username">
                Nom d&apos;utilisateur
              </label>
              <input
                id="username"
                className="colnet-form__input"
                type="text"
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                autoFocus
                disabled={isLoading}
              />
            </div>
            {errorMessage && (
              <div className="colnet-form__error">{errorMessage}</div>
            )}
            <button
              type="submit"
              className="colnet-form__submit"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <p className="colnet-login__version">{PORTAL_VERSION}</p>
        </div>
      </div>
    </div>
  );
}
