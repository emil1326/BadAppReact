import { useNavigate } from 'react-router-dom';
import { PageShell } from '../layout/PageShell';
import { useStartBourseFlowMutation } from '../store/api';
import { useTimer } from '../hooks/useTimer';
import { useSubmitGate } from '../hooks/useSubmitGate';
import { formatNumberFr } from '../utils/format';
import styles from './EtatDeComptePage.module.css';

const BALANCE_AMOUNT = 13486;
const BALANCE_DUE_DATE = '15 mars 2026';

export function EtatDeComptePage() {
  const { isActive } = useTimer();
  const { canSubmit } = useSubmitGate();
  const [startFlow, { isLoading }] = useStartBourseFlowMutation();
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      await startFlow().unwrap();
      navigate('/securite');
    } catch {
      // Silent failure — the button stays available so the user can retry.
    }
  };

  return (
    <PageShell title="État de compte">
      <section className="colnet-panel">
        <div className="colnet-panel__header">Solde actuel</div>
        <div className="colnet-panel__body">
          <p className={styles.balanceLabel}>Frais de scolarité — Hiver 2026</p>
          <p className={styles.balance}>{formatNumberFr(BALANCE_AMOUNT)} $ CA</p>
          <p className={styles.helper}>
            Date d&apos;échéance : {BALANCE_DUE_DATE}
          </p>
        </div>
      </section>

      <section className="colnet-panel">
        <div className="colnet-panel__header">
          Demande de remboursement de bourse
        </div>
        <div className="colnet-panel__body">
          <p>
            Si vous éprouvez des difficultés à régler votre solde, vous pouvez
            soumettre une demande de remboursement de bourse via la procédure
            officielle.
          </p>
          <p className={styles.warning}>
            <strong>Avertissement :</strong> la procédure doit être complétée
            dans le délai imparti pour des raisons de sécurité. Aucune
            sauvegarde intermédiaire n&apos;est possible.
          </p>
          <button
            type="button"
            className="colnet-form__submit"
            onClick={handleStart}
            disabled={isActive || isLoading || !canSubmit}
          >
            {isActive
              ? 'Procédure déjà en cours'
              : isLoading
                ? 'Démarrage...'
                : 'Démarrer la procédure de remboursement'}
          </button>
          {isActive && (
            <p className={styles.activeNotice}>
              Une procédure est déjà en cours. Veuillez la compléter ou
              attendre l&apos;expiration de la session.
            </p>
          )}
        </div>
      </section>
    </PageShell>
  );
}
