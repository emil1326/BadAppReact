import { useEffect, useRef } from 'react';
import { useTimer } from './useTimer';

export type TimerMilestone = '1min' | '30s' | '10s';

type MilestoneSpec = { milestone: TimerMilestone; offsetMs: number };

const MILESTONES: readonly MilestoneSpec[] = [
  { milestone: '1min', offsetMs: 60_000 },
  { milestone: '30s', offsetMs: 30_000 },
  { milestone: '10s', offsetMs: 10_000 },
];

/**
 * Schedules local setTimeout calls so that `onMilestone` fires when the active
 * flow has 1 minute / 30 seconds / 10 seconds left. The callback is read from
 * a ref so callers don't have to memoize it; only `endTime` changes re-schedule.
 */
export function useTimerMilestones(
  onMilestone: (milestone: TimerMilestone) => void,
): void {
  const { endTime } = useTimer();
  const onMilestoneRef = useRef(onMilestone);
  onMilestoneRef.current = onMilestone;

  useEffect(() => {
    if (endTime === null) return;

    const remainingMs = endTime - Date.now();
    const timeouts: number[] = [];

    for (const { milestone, offsetMs } of MILESTONES) {
      const fireInMs = remainingMs - offsetMs;
      if (fireInMs <= 0) continue;
      const id = window.setTimeout(() => {
        onMilestoneRef.current(milestone);
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
