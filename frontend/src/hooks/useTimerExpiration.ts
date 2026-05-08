import { useEffect, useRef } from 'react';
import { useTimer } from './useTimer';

/**
 * Schedules `onExpire` to fire exactly when the cached `endTime` elapses, or
 * on the next tick if the timer is already past expiry. Like
 * `useTimerMilestones`, the callback is read from a ref so callers can pass
 * inline functions without re-scheduling.
 */
export function useTimerExpiration(onExpire: () => void): void {
  const { endTime } = useTimer();
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (endTime === null) return;
    const remaining = endTime - Date.now();
    const fireInMs = Math.max(0, remaining);
    const id = window.setTimeout(() => {
      onExpireRef.current();
    }, fireInMs);
    return () => {
      window.clearTimeout(id);
    };
  }, [endTime]);
}
