import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../layout/PageShell';
import {
  useSubmitBourseMutation,
  useCancelBourseMutation,
  useGetBalanceQuery,
} from '../store/api';
import { useTimer } from '../hooks/useTimer';
import { useAppDispatch } from '../store/hooks';
import { resetFlow } from '../store/slices/flowSlice';
import { formatNumberFr } from '../utils/format';
import styles from './BourseSubmitPage.module.css';

type Phase =
  | 'codeB'
  | 'modal1'
  | 'modal2'
  | 'modal3'
  | 'submitting'
  | 'success'
  | 'fail';

const AUTO_SUBMIT_MS = 10_000;

export function BourseSubmitPage() {
  const { isActive } = useTimer();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: balanceData, refetch: refetchBalance } = useGetBalanceQuery();
  const [submitBourse] = useSubmitBourseMutation();
  const [cancelBourse] = useCancelBourseMutation();

  const [phase, setPhase] = useState<Phase>('codeB');
  const [codeB, setCodeB] = useState('');
  const [codeBError, setCodeBError] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const hasActedRef = useRef(false);

  useEffect(() => {
    if (phase !== 'modal3') return;
    const id = window.setTimeout(async () => {
      if (hasActedRef.current) return;
      hasActedRef.current = true;
      setPhase('submitting');
      try {
        await submitBourse({ codeB }).unwrap();
        dispatch(resetFlow());
        await refetchBalance();
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 500);
        setPhase('success');
      } catch (err: unknown) {
        const errorCode = (err as { data?: { error?: string } })?.data?.error;
        if (errorCode === 'INVALID_CODE_B' || errorCode === 'CODE_B_REQUIRED') {
          setCodeBError('Le Code B est invalide ou manquant. Veuillez recommencer.');
        }
        dispatch(resetFlow());
        setPhase('fail');
      }
    }, AUTO_SUBMIT_MS);
    return () => window.clearTimeout(id);
  }, [phase, codeB, submitBourse, cancelBourse, dispatch, refetchBalance]);

  const handleCancel = async () => {
    if (hasActedRef.current) return;
    hasActedRef.current = true;
    setPhase('submitting');
    try {
      await cancelBourse().unwrap();
    } catch {
      // best-effort
    }
    dispatch(resetFlow());
    setPhase('fail');
  };

  if (!isActive && phase === 'codeB') {
    return (
      <PageShell title="Soumission de la demande">
        <section className="colnet-panel">
          <div className="colnet-panel__header">Procédure non initialisée</div>
          <div className="colnet-panel__body">
            <p>
              Aucune procédure de remboursement n&apos;est en cours. Veuillez
              démarrer la procédure depuis la page{' '}
              <a href="/etat-de-compte" className={styles.link}>
                État de compte
              </a>
              .
            </p>
          </div>
        </section>
      </PageShell>
    );
  }

  if (phase === 'success') {
    return (
      <PageShell title="Soumission de la demande">
        {showFlash && <div className={styles.successFlash} />}
        <section className="colnet-panel">
          <div className="colnet-panel__header">Demande approuvée</div>
          <div className="colnet-panel__body">
            <p className={styles.successMsg}>
              Votre demande de remboursement a été traitée avec succès.
            </p>
            <p className={styles.balanceNote}>
              Solde actuel :{' '}
              <strong>
                {balanceData !== undefined ? formatNumberFr(balanceData.balance) : '0,00'} $ CA
              </strong>
            </p>
            <button
              type="button"
              className="colnet-form__submit"
              onClick={() => navigate('/etat-de-compte')}
            >
              Retourner à l&apos;État de compte
            </button>
          </div>
        </section>
      </PageShell>
    );
  }

  if (phase === 'fail') {
    return (
      <PageShell title="Soumission de la demande">
        <section className="colnet-panel">
          <div className="colnet-panel__header">Demande annulée</div>
          <div className="colnet-panel__body">
            <p className={styles.failMsg}>
              Demande annulée. Veuillez recommencer la procédure depuis le début.
            </p>
            <button
              type="button"
              className="colnet-form__submit"
              onClick={() => navigate('/etat-de-compte')}
            >
              Retourner à l&apos;État de compte
            </button>
          </div>
        </section>
      </PageShell>
    );
  }

  if (phase === 'submitting') {
    return (
      <PageShell title="Soumission de la demande">
        <section className="colnet-panel">
          <div className="colnet-panel__header">Traitement en cours</div>
          <div className="colnet-panel__body">
            <p className={styles.pending}>Traitement de votre demande en cours...</p>
          </div>
        </section>
      </PageShell>
    );
  }

  if (phase === 'codeB') {
    return (
      <PageShell title="Soumission de la demande">
        <section className="colnet-panel">
          <div className="colnet-panel__header">
            Code de confirmation de choix de cours requis
          </div>
          <div className="colnet-panel__body">
            <p className={styles.instructions}>
              Avant de procéder à la soumission finale, vous devez entrer le{' '}
              <strong>Code de confirmation de choix de cours (Code B)</strong> obtenu lors de
              l&apos;étape précédente.
            </p>
            <p className={styles.reminder}>
              Rappel : Le Code B a été généré après avoir échangé votre Code A dans la section{' '}
              <em>Mon dossier → Documents → Confirmations → Codes → Validation → Sélection</em>.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (codeB.trim().length < 5) {
                  setCodeBError('Le Code B doit contenir au moins 5 caractères.');
                  return;
                }
                setCodeBError(null);
                setPhase('modal1');
              }}
              className={styles.codeBForm}
              noValidate
            >
              <div className={styles.row}>
                <label htmlFor="codeB" className={styles.label}>
                  Code B (alphanumérique)
                </label>
                <input
                  id="codeB"
                  type="text"
                  value={codeB}
                  onChange={(e) => {
                    setCodeB(e.target.value.toUpperCase());
                    setCodeBError(null);
                  }}
                  className={`${styles.input} ${codeBError ? styles.inputError : ''}`}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="XXXX123456"
                />
              </div>

              {codeBError && <div className={styles.error}>{codeBError}</div>}

              <div className={styles.actions}>
                <button
                  type="submit"
                  className="colnet-form__submit"
                  disabled={!codeB.trim()}
                >
                  Continuer vers la confirmation
                </button>
              </div>
            </form>

            <div className={styles.notice}>
              <p>
                <strong>Important :</strong>
              </p>
              <ul>
                <li>Le Code B est valide pour une seule soumission.</li>
                <li>
                  Si vous n&apos;avez pas encore obtenu votre Code B, retournez à la page de
                  validation des codes.
                </li>
                <li>Votre timer de session continue de s&apos;écouler.</li>
              </ul>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell title="Soumission de la demande">
      <section className="colnet-panel">
        <div className="colnet-panel__header">
          Récapitulatif de la demande
        </div>
        <div className="colnet-panel__body">
          <p className={styles.recapText}>
            Votre demande de remboursement de bourse pour la session Hiver 2026
            est prête à être soumise. Veuillez confirmer pour transmettre votre
            dossier aux services administratifs compétents.
          </p>
        </div>
      </section>

      {phase === 'modal1' && (
        <div
          className="colnet-modal-overlay colnet-modal-overlay--page"
          role="dialog"
          aria-modal="true"
        >
          <div className={`colnet-panel ${styles.modal}`}>
            <div className="colnet-panel__header">Confirmation requise</div>
            <div className="colnet-panel__body">
              <p className={styles.modalText}>
                Êtes-vous sûr(e) de vouloir soumettre votre demande de remboursement
                de bourse pour la session Hiver 2026 ? Cette action déclenchera
                le traitement administratif de votre dossier.
              </p>
              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className="colnet-form__submit"
                  onClick={() => setPhase('modal2')}
                >
                  Confirmer
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => navigate('/bourse-cours')}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'modal2' && (
        <div
          className="colnet-modal-overlay colnet-modal-overlay--page"
          role="dialog"
          aria-modal="true"
        >
          <div className={`colnet-panel ${styles.modal}`}>
            <div className="colnet-panel__header">ATTENTION — Action irréversible</div>
            <div className="colnet-panel__body">
              <p className={styles.modalText}>
                Cette action est <strong>irréversible</strong>. Votre demande sera
                transmise immédiatement aux services administratifs du Cégep et ne
                pourra pas être modifiée ou annulée après confirmation. Assurez-vous
                que toutes les informations fournies sont exactes et complètes.
              </p>
              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className="colnet-form__submit"
                  onClick={() => {
                    hasActedRef.current = false;
                    setPhase('modal3');
                  }}
                >
                  Confirmer
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => navigate('/bourse-cours')}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'modal3' && (
        <div
          className="colnet-modal-overlay colnet-modal-overlay--page"
          role="dialog"
          aria-modal="true"
        >
          <div className={`colnet-panel ${styles.modal}`}>
            <div className="colnet-panel__header">Validation finale</div>
            <div className="colnet-panel__body">
              <p className={styles.modalText}>
                Veuillez <strong>NE PAS confirmer</strong> cette demande si vous
                n&apos;êtes pas certain(e) des renseignements fournis. Votre compte
                sera débité immédiatement et de manière permanente. En cas de doute,
                utilisez le bouton Annuler.
              </p>
              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className="colnet-form__submit"
                  onClick={handleCancel}
                >
                  Confirmer
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleCancel}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
