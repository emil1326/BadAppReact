import { useEffect, useRef } from 'react';
import { useTimer } from './useTimer';

export type TimerMilestone = '1min' | '30s' | '10s';

const MILESTONE_OFFSETS_MS: Record<TimerMilestone, number> = {
  '1min': 60_000,
  '30s': 30_000,
  '10s': 10_000,
};

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

    const now = Date.now();
    const remaining = endTime - now;
    const timeouts: number[] = [];

    for (const [key, offset] of Object.entries(MILESTONE_OFFSETS_MS)) {
      const fireInMs = remaining - offset;
      if (fireInMs <= 0) continue;
      const milestone = key as TimerMilestone;
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
