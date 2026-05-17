import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAuth, useUi } from '../store/hooks';
import { useLogoutAndRedirect } from '../hooks/useLogoutAndRedirect';
import { updateUi } from '../store/slices/uiSlice';
import { COLLEGE_NAME } from '../config/branding';

const dateFormatter = new Intl.DateTimeFormat('fr-CA', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const RELOCK_DELAY_MS = 2000;
const RELOCK_TICK_MS = 100;

function formatTodayInFrench(): string {
  return `Le ${dateFormatter.format(new Date())}`;
}

export function Header() {
  const { userName } = useAuth();
  const { logoutLocked } = useUi();
  const dispatch = useAppDispatch();
  const { logoutAndRedirect, isLoggingOut } = useLogoutAndRedirect();

  const today = useMemo(() => formatTodayInFrench(), []);

  const relockIntervalRef = useRef<number | null>(null);
  const [relockTenthsLeft, setRelockTenthsLeft] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (relockIntervalRef.current !== null) {
        window.clearInterval(relockIntervalRef.current);
      }
    };
  }, []);

  const cancelPendingRelock = () => {
    if (relockIntervalRef.current !== null) {
      window.clearInterval(relockIntervalRef.current);
      relockIntervalRef.current = null;
    }
    setRelockTenthsLeft(null);
  };

  const startRelockCountdown = () => {
    const startedAt = performance.now();
    relockIntervalRef.current = window.setInterval(() => {
      const elapsedMs = performance.now() - startedAt;
      const remainingMs = RELOCK_DELAY_MS - elapsedMs;
      if (remainingMs <= 0) {
        cancelPendingRelock();
        dispatch(updateUi({ logoutLocked: true }));
        return;
      }
      const tenths = Math.ceil(remainingMs / 100);
      setRelockTenthsLeft((previous) =>
        previous === tenths ? previous : tenths,
      );
    }, RELOCK_TICK_MS);
  };

  const handleToggleLock = () => {
    cancelPendingRelock();

    if (logoutLocked) {
      dispatch(updateUi({ logoutLocked: false }));
      setRelockTenthsLeft(Math.ceil(RELOCK_DELAY_MS / 100));
      startRelockCountdown();
    } else {
      dispatch(updateUi({ logoutLocked: true }));
    }
  };

  const handleLogout = async () => {
    if (logoutLocked) return;
    cancelPendingRelock();
    await logoutAndRedirect();
  };

  const lockLabel = logoutLocked
    ? 'DÉBLOQUER'
    : relockTenthsLeft !== null
      ? `BLOQUER (${(relockTenthsLeft / 10).toFixed(1)}s)`
      : 'BLOQUER';

  return (
    <header className="colnet-header">
      <div className="colnet-header__logo">{COLLEGE_NAME}</div>
      <div className="colnet-header__user">
        <div className="colnet-header__user-info">
          <div className="colnet-header__user-name">{userName ?? ''}</div>
          <div className="colnet-header__user-date">{today}</div>
        </div>
        <button
          type="button"
          className={`colnet-header__action${
            logoutLocked ? ' colnet-header__action--locked' : ''
          }`}
          onClick={handleToggleLock}
        >
          {lockLabel}
        </button>
        <button
          type="button"
          className="colnet-header__action"
          onClick={handleLogout}
          disabled={isLoggingOut || logoutLocked}
        >
          DÉCONNECTER
        </button>
      </div>
    </header>
  );
}
