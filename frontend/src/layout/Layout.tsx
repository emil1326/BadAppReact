import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { InfoStrip } from './InfoStrip';
import { TimerMilestoneModal } from '../components/TimerMilestoneModal';
import { useTimerExpiration } from '../hooks/useTimerExpiration';
import { useGetProfileQuery } from '../store/api';

const TIMEOUT_PATH = '/timeout';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  useGetProfileQuery();

  useTimerExpiration(() => {
    if (location.pathname !== TIMEOUT_PATH) {
      navigate(TIMEOUT_PATH, { replace: true });
    }
  });

  return (
    <div className="colnet-app">
      <Header />
      <InfoStrip pathname={location.pathname} />
      <div className="colnet-body">
        <Sidebar />
        <main className="colnet-main">
          <Outlet />
        </main>
      </div>
      <TimerMilestoneModal />
    </div>
  );
}
