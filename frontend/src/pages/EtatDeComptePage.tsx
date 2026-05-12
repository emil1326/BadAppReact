import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../layout/PageShell';
import { useGetBalanceQuery, useStartBourseFlowMutation, useGetModeHelpQuery } from '../store/api';
import { useTimer } from '../hooks/useTimer';
import { useSubmitGate } from '../hooks/useSubmitGate';
import { formatNumberFr } from '../utils/format';
import { ClothOverlay } from '../components/ClothOverlay';
import styles from './EtatDeComptePage.module.css';

const BALANCE_DUE_DATE = '15 mars 2026';

export function EtatDeComptePage() {
  const { isActive } = useTimer();
  const { canSubmit } = useSubmitGate();
  const [startFlow, { isLoading }] = useStartBourseFlowMutation();
  const { data: balanceData } = useGetBalanceQuery();
  const { data: modeHelp } = useGetModeHelpQuery();
  const navigate = useNavigate();
  const [showModeHelp, setShowModeHelp] = useState(false);

  const handleStart = async () => {
    if (!canSubmit) {
      setShowModeHelp(true);
      return;
    }
    try {
      await startFlow().unwrap();
      navigate('/bourse-formulaire');
    } catch {
      // Silent failure — the button stays available so the user can retry.
    }
  };

  return (
    <PageShell title="État de compte">
      <div className={styles.clothWrapper}>
        <section className="colnet-panel">
          <div className="colnet-panel__header">Solde actuel</div>
          <div className="colnet-panel__body">
            <p className={styles.balanceLabel}>Frais de scolarité — Hiver 2026</p>
            <p className={styles.balance}>
              {balanceData !== undefined ? formatNumberFr(balanceData.balance) : '—'} $ CA
            </p>
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
              disabled={isActive || isLoading}
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

        <ClothOverlay />
      </div>

      {showModeHelp && modeHelp && (
        <div
          className="colnet-modal-overlay colnet-modal-overlay--page"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowModeHelp(false)}
        >
          <div
            className={`colnet-panel ${styles.modal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="colnet-panel__header">{modeHelp.title}</div>
            <div className="colnet-panel__body">
              {modeHelp.paragraphs.map((p) => (
                <p key={p.slice(0, 40)} className={styles.modalPara}>{p}</p>
              ))}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setShowModeHelp(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
