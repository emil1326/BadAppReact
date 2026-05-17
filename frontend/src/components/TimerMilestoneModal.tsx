import { useEffect, useState } from 'react';
import { useTimerMilestones } from '../hooks/useTimerMilestones';
import styles from './TimerMilestoneModal.module.css';

const MODAL_DURATION_MS = 3_000;

function formatRemaining(ms: number): string {
  if (ms < 60_000) {
    const seconds = Math.round(ms / 1000);
    return `Il vous reste ${seconds} secondes.`;
  }
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const minuteWord = minutes > 1 ? 'minutes' : 'minute';
  if (seconds === 0) {
    return `Il vous reste ${minutes} ${minuteWord}.`;
  }
  return `Il vous reste ${minutes} ${minuteWord} ${seconds}.`;
}

/**
 * Mounted at the root of the authenticated layout. Listens for timer
 * milestones and renders a page-blocking banner for 3 seconds with no dismiss
 * control. Fires every ~90 seconds plus close-to-end warnings. Steals
 * interaction time at the worst possible moments — by design.
 */
export function TimerMilestoneModal() {
  const [active, setActive] = useState<number | null>(null);

  useTimerMilestones((remainingMs) => {
    setActive(remainingMs);
  });

  useEffect(() => {
    if (active === null) return;
    const id = window.setTimeout(() => setActive(null), MODAL_DURATION_MS);
    return () => {
      window.clearTimeout(id);
    };
  }, [active]);

  if (active === null) return null;

  return (
    <div className="colnet-modal-overlay colnet-modal-overlay--milestone">
      <div className={styles.banner}>
        <h2 className={styles.title}>RAPPEL DE TEMPS</h2>
        <p className={styles.message}>{formatRemaining(active)}</p>
        <p className={styles.subtitle}>
          Pour vous aider à gérer votre temps, voici un rappel.
        </p>
      </div>
    </div>
  );
}
