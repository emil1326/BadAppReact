import { useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import { PageShell } from '../layout/PageShell';
import { useLogoutAndRedirect } from '../hooks/useLogoutAndRedirect';
import styles from './VignetteAutoPage.module.css';

type WheelOutcome = {
  label: string;
  result: string;
  description: string;
};

const OUTCOMES: WheelOutcome[] = [
  {
    label: 'Aucune',
    result: 'Aucune vignette assignée',
    description: 'Veuillez recommencer la procédure l’année prochaine.',
  },
  {
    label: 'Sibérie',
    result: 'Vignette zone Sibérie',
    description: '5 km de marche depuis le stationnement. Aller-retour quotidien obligatoire.',
  },
  {
    label: 'Antarctique',
    result: 'Vignette zone Antarctique',
    description: '8 km de marche. Vêtements isothermes recommandés en tout temps.',
  },
  {
    label: 'Lune',
    result: 'Vignette zone Lune',
    description: 'Stationnement disponible uniquement les soirs de pleine lune (calendrier lunaire fourni).',
  },
  {
    label: 'EXPIRÉE',
    result: 'Vignette EXPIRÉE le jour même',
    description: 'Félicitations, vous avez gagné une vignette. Elle expire dans 24 heures.',
  },
  {
    label: 'Toit',
    result: 'Vignette zone Toit',
    description: '14 étages d’escaliers à monter. Ascenseur en panne depuis 2018.',
  },
  {
    label: 'Sous-marin',
    result: 'Vignette zone Sous-Marin',
    description: 'Niveau B-7. Permis de plongée requis pour certaines journées (pluie/dégel).',
  },
  {
    label: 'Vélo',
    result: 'Vignette vélo seulement',
    description: 'Aucune voiture acceptée. Vélo obligatoire en toute saison, incluant tempêtes.',
  },
  {
    label: 'Covoit',
    result: 'Vignette covoiturage obligatoire',
    description: 'Minimum 3 personnes par véhicule. Liste à valider chaque matin avant 7h00.',
  },
  {
    label: 'Chantier',
    result: 'Vignette zone Chantier permanent',
    description: 'Stationnement sur dalle de béton fraîchement coulée. Casque exigé.',
  },
  {
    label: 'VIP refusé',
    result: 'Demande de vignette VIP refusée',
    description: 'Réservé exclusivement au directeur général. Veuillez ne plus présenter de demande VIP.',
  },
  {
    label: '→ 2027',
    result: 'Réessayez en 2027',
    description: 'Le système est saturé. Votre demande sera retraitée dans 14 mois.',
  },
];

const WHEEL_COLORS = ['#b22222', '#2f3a4a', '#6b1313', '#555555'];

const WHEEL_DATA = OUTCOMES.map((outcome, index) => ({
  option: outcome.label,
  style: {
    backgroundColor: WHEEL_COLORS[index % WHEEL_COLORS.length],
    textColor: '#ffffff',
  },
}));

type WarningKind = 'wheel-click' | 'double-spin';

const WARNINGS: Record<WarningKind, { title: string; paragraphs: string[] }> = {
  'wheel-click': {
    title: 'AVERTISSEMENT DE SÉCURITÉ',
    paragraphs: [
      'Toute interaction directe avec le composant rotatif est strictement interdite et déclenche une déconnexion immédiate de votre session pour des raisons de sécurité.',
      'Pour utiliser le module d’attribution, veuillez utiliser exclusivement le bouton « TOURNER LA ROUE ».',
    ],
  },
  'double-spin': {
    title: 'TENTATIVE ANNUELLE DÉJÀ UTILISÉE',
    paragraphs: [
      'Vous avez déjà utilisé votre tentative d’attribution pour l’année académique en cours.',
      'Toute tentative supplémentaire déclenche une déconnexion immédiate de votre session conformément à la politique #PV-2003-14.',
    ],
  },
};

export function VignetteAutoPage() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [revealed, setRevealed] = useState<WheelOutcome | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [warning, setWarning] = useState<WarningKind | null>(null);

  const { logoutAndRedirect } = useLogoutAndRedirect();

  const handleSpin = () => {
    if (mustSpin) return;
    if (hasSpun) {
      setWarning('double-spin');
      return;
    }
    setRevealed(null);
    setPrizeNumber(Math.floor(Math.random() * OUTCOMES.length));
    setMustSpin(true);
  };

  const handleStopSpin = () => {
    setMustSpin(false);
    setRevealed(OUTCOMES[prizeNumber]);
    setHasSpun(true);
  };

  const handleWheelClick = () => {
    setWarning('wheel-click');
  };

  const handleConfirmLogout = async () => {
    setWarning(null);
    await logoutAndRedirect();
  };

  const activeWarning = warning ? WARNINGS[warning] : null;

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
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={WHEEL_DATA}
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
        </div>
        <button
          type="button"
          className={styles.spinButton}
          onClick={handleSpin}
          disabled={mustSpin}
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
