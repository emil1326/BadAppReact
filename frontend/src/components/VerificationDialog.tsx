import { useEffect, useState, type FormEvent } from 'react';
import { useCheckTimerMutation } from '../store/api';
import { useTimer } from '../hooks/useTimer';
import styles from './VerificationDialog.module.css';

const DISPLAY_DURATION_MS = 10_000;
const TICK_INTERVAL_MS = 100;

type Phase = 'input' | 'displaying';

type VerificationDialogProps = {
  open: boolean;
  onClose: () => void;
};

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function VerificationDialog({ open, onClose }: VerificationDialogProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('input');
  const [, setTick] = useState(0);

  const { remainingMs } = useTimer();
  const [checkTimer, { isLoading }] = useCheckTimerMutation();

  // Reset to input phase whenever the dialog is freshly opened.
  useEffect(() => {
    if (open) {
      setCode('');
      setError(null);
      setPhase('input');
    }
  }, [open]);

  // While displaying the timer, tick the local re-render every 100ms so the
  // countdown updates, and auto-close after exactly 10 seconds.
  useEffect(() => {
    if (!open || phase !== 'displaying') return;
    const closeId = window.setTimeout(onClose, DISPLAY_DURATION_MS);
    const tickId = window.setInterval(
      () => setTick((value) => value + 1),
      TICK_INTERVAL_MS,
    );
    return () => {
      window.clearTimeout(closeId);
      window.clearInterval(tickId);
    };
  }, [open, phase, onClose]);

  if (!open) return null;

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
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={`colnet-panel ${styles.dialog}`}>
        <div className="colnet-panel__header">Vérification de session</div>
        <div className={`colnet-panel__body ${styles.body}`}>
          {phase === 'input' ? (
            <form className={styles.body} onSubmit={handleSubmit}>
              <p className={styles.intro}>
                Veuillez entrer votre code de vérification à 6 chiffres pour
                afficher le temps restant de votre session pendant 10 secondes.
                Chaque code n&apos;est utilisable qu&apos;une seule fois.
              </p>
              <input
                className={styles.codeInput}
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoFocus
                disabled={isLoading}
                aria-label="Code de vérification"
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
                <p className={styles.timerValue}>
                  {formatRemaining(remainingMs())}
                </p>
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
