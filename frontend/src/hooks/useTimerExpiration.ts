import { useEffect, useRef } from 'react';
import { useTimer } from './useTimer';

export function useTimerExpiration(onExpire: () => void): void {
  const { endTime } = useTimer();
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

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
