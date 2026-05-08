import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAuth, useUi } from '../store/hooks';
import { useLogoutMutation } from '../store/api';
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
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const navigate = useNavigate();

  const relockIntervalRef = useRef<number | null>(null);
  const [relockSecondsLeft, setRelockSecondsLeft] = useState<number | null>(null);

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
    setRelockSecondsLeft(null);
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
      setRelockSecondsLeft(remainingMs / 1000);
    }, RELOCK_TICK_MS);
  };

  const handleToggleLock = () => {
    cancelPendingRelock();

    if (logoutLocked) {
      // Unlocking — start the visible 2s countdown that auto-relocks at zero.
      dispatch(updateUi({ logoutLocked: false }));
      setRelockSecondsLeft(RELOCK_DELAY_MS / 1000);
      startRelockCountdown();
    } else {
      dispatch(updateUi({ logoutLocked: true }));
    }
  };

  const handleLogout = async () => {
    if (logoutLocked) return;
    cancelPendingRelock();
    await logout();
    navigate('/login');
  };

  const lockLabel = logoutLocked
    ? 'DÉBLOQUER'
    : relockSecondsLeft !== null
      ? `BLOQUER (${relockSecondsLeft.toFixed(1)}s)`
      : 'BLOQUER';

  return (
    <header className="colnet-header">
      <div className="colnet-header__logo">{COLLEGE_NAME}</div>
      <div className="colnet-header__user">
        <div className="colnet-header__user-info">
          <div className="colnet-header__user-name">{userName ?? ''}</div>
          <div className="colnet-header__user-date">{formatTodayInFrench()}</div>
        </div>
        <button
          type="button"
          className={`colnet-header__action${
            logoutLocked ? ' colnet-header__action--locked' : ''
          }`}
          onClick={handleToggleLock}
          aria-pressed={logoutLocked}
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
