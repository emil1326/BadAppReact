import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Layout } from './layout/Layout';
import { AccueilPage } from './pages/AccueilPage';
import { BourseFormulairePage } from './pages/BourseFormulairePage';
import { BulletinPage } from './pages/BulletinPage';
import { CarteEtudiantePage } from './pages/CarteEtudiantePage';
import { CoursPage } from './pages/CoursPage';
import { EtatDeComptePage } from './pages/EtatDeComptePage';
import { LoginPage } from './pages/LoginPage';
import { NotesPersonnellesPage } from './pages/NotesPersonnellesPage';
import { OffresEmploiPage } from './pages/OffresEmploiPage';
import { OptionsPage } from './pages/OptionsPage';
import { SecuritePage } from './pages/SecuritePage';
import { StubPage } from './pages/StubPage';
import { TimeoutPage } from './pages/TimeoutPage';
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
          <Route path="bourse-formulaire" element={<BourseFormulairePage />} />
          <Route path="bulletin" element={<BulletinPage />} />
          <Route path="carte-etudiante" element={<CarteEtudiantePage />} />
          <Route path="cours" element={<CoursPage />} />
          <Route path="etat-de-compte" element={<EtatDeComptePage />} />
          <Route path="notes-personnelles" element={<NotesPersonnellesPage />} />
          <Route path="offres-emploi" element={<OffresEmploiPage />} />
          <Route path="options" element={<OptionsPage />} />
          <Route path="securite" element={<SecuritePage />} />
          <Route path="timeout" element={<TimeoutPage />} />
          <Route path="vignette-auto" element={<VignetteAutoPage />} />
          <Route path=":slug" element={<StubPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
