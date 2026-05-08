import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Layout } from './layout/Layout';
import { AccueilPage } from './pages/AccueilPage';
import { CoursPage } from './pages/CoursPage';
import { LoginPage } from './pages/LoginPage';
import { OffresEmploiPage } from './pages/OffresEmploiPage';
import { StubPage } from './pages/StubPage';
import { VignetteAutoPage } from './pages/VignetteAutoPage';
import { useAuth } from './store/hooks';

function RequireAuth({ children }: { children: ReactNode }) {
  const { sessionId } = useAuth();
  return sessionId ? <>{children}</> : <Navigate to="/login" replace />;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { sessionId } = useAuth();
  return sessionId ? <Navigate to="/accueil" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/accueil" replace />} />
          <Route path="accueil" element={<AccueilPage />} />
          <Route path="cours" element={<CoursPage />} />
          <Route path="offres-emploi" element={<OffresEmploiPage />} />
          <Route path="vignette-auto" element={<VignetteAutoPage />} />
          <Route path=":slug" element={<StubPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
