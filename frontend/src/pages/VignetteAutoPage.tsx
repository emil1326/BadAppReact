import { useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import { PageShell } from '../layout/PageShell';
import { useLogoutAndRedirect } from '../hooks/useLogoutAndRedirect';
import {
  useGetVignetteStatusQuery,
  useRecordVignetteSpinMutation,
  useResetVignetteMutation,
  useGetVignetteContentQuery,
} from '../store/api';
import styles from './VignetteAutoPage.module.css';

type WarningKind = 'wheel-click' | 'double-spin';

const WHEEL_COLORS = ['#b22222', '#2f3a4a', '#6b1313', '#555555'] as const;

export function VignetteAutoPage() {
  const { data: content } = useGetVignetteContentQuery();
  const { data: vignetteStatus } = useGetVignetteStatusQuery();
  const [recordSpin] = useRecordVignetteSpinMutation();
  const [resetVignette, { isLoading: isResetting }] = useResetVignetteMutation();

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [localRevealedIndex, setLocalRevealedIndex] = useState<number | null>(null);
  const [warning, setWarning] = useState<WarningKind | null>(null);

  const { logoutAndRedirect } = useLogoutAndRedirect();

  const outcomes = content?.outcomes ?? [];
  const warnings = content?.warnings ?? {};

  const wheelData = outcomes.map((outcome, index) => ({
    option: outcome.label,
    style: {
      backgroundColor: WHEEL_COLORS[index % WHEEL_COLORS.length],
      textColor: '#ffffff',
    },
  }));

  const hasSpun = vignetteStatus?.spun ?? false;

  const revealedIndex =
    localRevealedIndex ?? (vignetteStatus?.prizeIndex ?? null);
  const revealed = revealedIndex != null ? (outcomes[revealedIndex] ?? null) : null;

  const handleSpin = () => {
    if (mustSpin || outcomes.length === 0) return;
    if (hasSpun) {
      setWarning('double-spin');
      return;
    }
    setLocalRevealedIndex(null);
    setPrizeNumber(Math.floor(Math.random() * outcomes.length));
    setMustSpin(true);
  };

  const handleStopSpin = async () => {
    setMustSpin(false);
    const outcome = outcomes[prizeNumber];
    setLocalRevealedIndex(prizeNumber);
    try {
      await recordSpin({ prizeIndex: prizeNumber, result: outcome?.result ?? '' }).unwrap();
    } catch {
      // Spin is already shown locally — a save failure doesn't break the UX.
    }
  };

  const handleWheelClick = () => {
    setWarning('wheel-click');
  };

  const handleConfirmLogout = async () => {
    setWarning(null);
    await logoutAndRedirect();
  };

  const handleReset = async () => {
    setLocalRevealedIndex(null);
    setMustSpin(false);
    setPrizeNumber(0);
    try {
      await resetVignette().unwrap();
    } catch {
      // No-op.
    }
  };

  const activeWarning = warning ? (warnings[warning] ?? null) : null;

  return (
    <PageShell title="Vignette auto">
      <p className={styles.intro}>
        Pour obtenir votre vignette de stationnement annuelle, veuillez tourner
        la roue d&apos;attribution officielle.{' '}
        <strong>Une seule tentative par année académique.</strong> Le résultat
        est non-modifiable et non-remboursable.
      </p>

      <div className={styles.wheelArea}>
        <div
          className={styles.wheelHolder}
          onClick={handleWheelClick}
          role="presentation"
        >
          {wheelData.length > 0 && (
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={wheelData}
              onStopSpinning={handleStopSpin}
              outerBorderColor="#6b1313"
              outerBorderWidth={4}
              innerBorderColor="#6b1313"
              innerBorderWidth={2}
              radiusLineColor="#ffffff"
              radiusLineWidth={1}
              fontSize={14}
              spinDuration={0.8}
            />
          )}
        </div>
        <button
          type="button"
          className={styles.spinButton}
          onClick={handleSpin}
          disabled={mustSpin || isResetting || wheelData.length === 0}
        >
          {mustSpin ? 'EN COURS...' : 'TOURNER LA ROUE'}
        </button>
      </div>

      {revealed && (
        <section className={`colnet-panel ${styles.resultPanel}`}>
          <div className="colnet-panel__header">Résultat de l&apos;attribution</div>
          <div className="colnet-panel__body">
            <p className={styles.resultLabel}>{revealed.result}</p>
            <p>{revealed.description}</p>
            <p className={styles.disclaimer}>
              Conformément à la politique #PV-2003-14, ce résultat est définitif.
              Aucun changement, échange ni remboursement ne sera accordé.
            </p>
          </div>
        </section>
      )}

      <p className={styles.resetLine}>
        <button
          type="button"
          className={styles.resetBtn}
          onClick={handleReset}
          disabled={isResetting}
        >
          id:{vignetteStatus?.result ?? 'null'}-réf-2026
        </button>
      </p>

      {activeWarning && (
        <div
          className="colnet-modal-overlay colnet-modal-overlay--page"
          role="alertdialog"
          aria-modal="true"
        >
          <div className={`colnet-panel ${styles.modal}`}>
            <div className="colnet-panel__header">{activeWarning.title}</div>
            <div className="colnet-panel__body">
              {activeWarning.paragraphs.map((paragraph) => (
                <p key={paragraph} className={styles.modalText}>
                  {paragraph}
                </p>
              ))}
              <button
                type="button"
                className={styles.modalButton}
                onClick={handleConfirmLogout}
              >
                OK - DÉCONNEXION IMMÉDIATE
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
