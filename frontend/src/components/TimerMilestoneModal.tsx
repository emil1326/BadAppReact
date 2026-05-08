import { useEffect, useState } from 'react';
import {
  useTimerMilestones,
  type TimerMilestone,
} from '../hooks/useTimerMilestones';
import styles from './TimerMilestoneModal.module.css';

const MODAL_DURATION_MS = 3_000;

const MILESTONE_LABELS: Record<TimerMilestone, string> = {
  '1min': 'Il vous reste 1 minute.',
  '30s': 'Il vous reste 30 secondes.',
  '10s': 'Il vous reste 10 secondes.',
};

/**
 * Mounted at the root of the authenticated layout. Listens for timer
 * milestones (1min / 30s / 10s remaining) and renders a 80%-page blocking
 * banner for 3 seconds with no dismiss control. Steals interaction time at
 * the worst possible moments — by design.
 */
export function TimerMilestoneModal() {
  const [active, setActive] = useState<TimerMilestone | null>(null);

  useTimerMilestones((milestone) => {
    setActive(milestone);
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
    <div
      className="colnet-modal-overlay colnet-modal-overlay--milestone"
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.banner}>
        <h2 className={styles.title}>RAPPEL DE TEMPS</h2>
        <p className={styles.message}>{MILESTONE_LABELS[active]}</p>
        <p className={styles.subtitle}>
          Pour vous aider à gérer votre temps, voici un rappel.
        </p>
      </div>
    </div>
  );
}
