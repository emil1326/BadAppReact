import { useAppSelector } from '../store/hooks';

/**
 * Source of truth for the bourse-flow timer.
 *
 * Subscribes only to `flow.endTime` (not the full slice) so consumers don't
 * re-render when unrelated flow state — like the captcha SVG — changes.
 *
 * `endTime` is cached in Redux when the flow starts and read locally on every
 * call; no polling. Components that need a moving display (e.g. countdown UIs)
 * run their own short-lived setInterval.
 */
export function useTimer() {
  const endTime = useAppSelector((state) => state.flow.endTime);

  const remainingMs = () => {
    if (endTime === null) return 0;
    return Math.max(0, endTime - Date.now());
  };

  if (endTime === null) {
    return { endTime, isActive: false, isExpired: false, remainingMs };
  }

  const now = Date.now();
  return {
    endTime,
    isActive: endTime > now,
    isExpired: endTime <= now,
    remainingMs,
  };
}
