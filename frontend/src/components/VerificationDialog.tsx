import { useEffect, useState, type FormEvent } from 'react';
import { useCheckTimerMutation } from '../store/api';
import { useTimer } from '../hooks/useTimer';
import styles from './VerificationDialog.module.css';

const DISPLAY_DURATION_MS = 10_000;
const TICK_INTERVAL_MS = 200;

type Phase = 'input' | 'displaying';

type VerificationDialogProps = {
  onClose: () => void;
};

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function VerificationDialog({ onClose }: VerificationDialogProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('input');
  const [displayedTime, setDisplayedTime] = useState('');

  const { endTime } = useTimer();
  const [checkTimer, { isLoading }] = useCheckTimerMutation();

  useEffect(() => {
    if (phase !== 'displaying' || endTime === null) return;

    const tick = () => {
      const remaining = Math.max(0, endTime - Date.now());
      const next = formatRemaining(remaining);
      setDisplayedTime((previous) => (previous === next ? previous : next));
    };

    tick();
    const closeId = window.setTimeout(onClose, DISPLAY_DURATION_MS);
    const tickId = window.setInterval(tick, TICK_INTERVAL_MS);
    return () => {
      window.clearTimeout(closeId);
      window.clearInterval(tickId);
    };
  }, [phase, onClose, endTime]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setError('Le code doit contenir exactement 6 chiffres.');
      return;
    }
    try {
      await checkTimer({ code: trimmed }).unwrap();
      setPhase('displaying');
    } catch {
      setError('Code invalide, déjà utilisé ou expiré. Veuillez régénérer un nouveau code.');
    }
  };

  return (
    <div className="colnet-modal-overlay">
      <div className={`colnet-panel ${styles.dialog}`}>
        <div className="colnet-panel__header">Vérification de session</div>
        <div className={`colnet-panel__body ${styles.body}`}>
          {phase === 'input' ? (
            <form className={styles.body} onSubmit={handleSubmit}>
              <label htmlFor="verification-code" className={styles.intro}>
                Veuillez entrer votre code de vérification à 6 chiffres pour
                afficher le temps restant de votre session pendant 10 secondes.
                Chaque code n&apos;est utilisable qu&apos;une seule fois.
              </label>
              <input
                id="verification-code"
                className={styles.codeInput}
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoFocus
                disabled={isLoading}
              />
              {error && <p className={styles.error}>{error}</p>}
              <div className={styles.buttonRow}>
                <button
                  type="button"
                  className="colnet-form__submit"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="colnet-form__submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Vérification...' : 'Afficher le temps restant'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className={styles.timerDisplay}>
                <p className={styles.timerLabel}>Temps restant avant expiration</p>
                <p className={styles.timerValue}>{displayedTime}</p>
              </div>
              <p className={styles.autoCloseHint}>
                Cette fenêtre se fermera automatiquement dans 10 secondes pour
                des raisons de sécurité.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
