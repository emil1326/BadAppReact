import { useFlow } from '../store/hooks';

/**
 * Source of truth for the bourse-flow timer.
 *
 * `endTime` is cached in Redux when the flow starts and read locally on every
 * call — no polling. Callers that need to refresh their visual representation
 * (e.g. countdown displays) should run their own short-lived setInterval.
 */
export function useTimer() {
  const flow = useFlow();
  const endTime = flow.endTime;

  const remainingMs = () => {
    if (endTime === null) return 0;
    return Math.max(0, endTime - Date.now());
  };

  const now = Date.now();
  const isActive = endTime !== null && endTime > now;
  const isExpired = endTime !== null && endTime <= now;

  return { endTime, isActive, isExpired, remainingMs };
}
