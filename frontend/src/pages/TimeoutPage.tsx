import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../layout/PageShell';
import { resetFlow } from '../store/slices/flowSlice';
import { useAppDispatch } from '../store/hooks';
import styles from './TimeoutPage.module.css';

export function TimeoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(resetFlow());
  }, [dispatch]);

  return (
    <PageShell title="Session expirée">
      <section className={`colnet-panel ${styles.expiredPanel}`}>
        <div className="colnet-panel__header">
          Votre session a expiré pour des raisons de sécurité
        </div>
        <div className="colnet-panel__body">
          <p className={styles.message}>
            Le délai imparti pour compléter votre procédure est écoulé. Toute
            progression non soumise a été perdue.
          </p>
          <p className={styles.message}>
            Conformément à la politique #PV-2003-14 de gestion des sessions
            sensibles, vous devez recommencer la procédure depuis le début si
            vous souhaitez la compléter.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className="colnet-form__submit"
              onClick={() => navigate('/accueil')}
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
