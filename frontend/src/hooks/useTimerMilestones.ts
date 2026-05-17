import { useEffect, useRef } from 'react';
import { useTimer } from './useTimer';

const MILESTONES_MS: readonly number[] = [
  13.5 * 60_000,
  12 * 60_000,
  10.5 * 60_000,
  9 * 60_000,
  7.5 * 60_000,
  6 * 60_000,
  4.5 * 60_000,
  3 * 60_000,
  1.5 * 60_000,
  30_000,
  10_000,
];

export function useTimerMilestones(
  onMilestone: (remainingMs: number) => void,
): void {
  const { endTime } = useTimer();
  const onMilestoneRef = useRef(onMilestone);

  useEffect(() => {
    onMilestoneRef.current = onMilestone;
  });

  useEffect(() => {
    if (endTime === null) return;

    const remainingMs = endTime - Date.now();
    const timeouts: number[] = [];

    for (const offsetMs of MILESTONES_MS) {
      const fireInMs = remainingMs - offsetMs;
      if (fireInMs <= 0) continue;
      const id = window.setTimeout(() => {
        onMilestoneRef.current(offsetMs);
      }, fireInMs);
      timeouts.push(id);
    }

    return () => {
      for (const id of timeouts) {
        window.clearTimeout(id);
      }
    };
  }, [endTime]);
}
