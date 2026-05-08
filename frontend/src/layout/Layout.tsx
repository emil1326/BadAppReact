import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { InfoStrip } from './InfoStrip';

export function Layout() {
  const location = useLocation();
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
    </div>
  );
}
