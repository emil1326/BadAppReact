import { useState } from 'react';
import { PageShell } from '../layout/PageShell';
import { CaptchaCode } from '../components/CaptchaCode';
import captchaStyles from '../components/CaptchaCode.module.css';
import { VerificationDialog } from '../components/VerificationDialog';
import { useRegenerateCodeMutation } from '../store/api';
import { useFlow } from '../store/hooks';
import { useTimer } from '../hooks/useTimer';
import styles from './SecuritePage.module.css';

export function SecuritePage() {
  const { isActive } = useTimer();
  const { latestCodeSvg } = useFlow();
  const [regenerateCode, { isLoading: isRegenerating }] = useRegenerateCodeMutation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRegenerate = async () => {
    try {
      await regenerateCode().unwrap();
    } catch {
      void 0;
    }
  };

  return (
    <PageShell title="Sécurité">
      <p className={styles.intro}>
        Codes de vérification de session. Chaque code à 6 chiffres permet
        d&apos;afficher le temps restant de votre session pendant 10 secondes.
        Un code utilisé est définitivement brûlé et ne peut être réutilisé.
      </p>

      <section className="colnet-panel">
        <div className="colnet-panel__header">Code actif</div>
        <div className="colnet-panel__body">
          {!isActive ? (
            <p className={styles.inactive}>
              Aucune session active. Vous devez démarrer une procédure depuis
              la page « État de compte » pour générer un code de vérification.
            </p>
          ) : (
            <>
              {latestCodeSvg === null ? (
                <div className={`${styles.codeBox} ${styles.codeBoxEmpty}`}>
                  Aucun code disponible — veuillez en régénérer un.
                </div>
              ) : (
                <CaptchaCode
                  svgMarkup={latestCodeSvg}
                  className={captchaStyles.captcha}
                />
              )}
              <div className={styles.actions}>
                <button
                  type="button"
                  className="colnet-form__submit"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? 'Génération...' : 'Régénérer un nouveau code'}
                </button>
                <button
                  type="button"
                  className="colnet-form__submit"
                  onClick={() => setDialogOpen(true)}
                >
                  Vérifier le temps restant
                </button>
              </div>
              <p className={styles.disclaimer}>
                La régénération d&apos;un code brûle automatiquement le précédent.
                Tout code affiché ici doit être saisi manuellement dans la
                fenêtre de vérification.
              </p>
            </>
          )}
        </div>
      </section>

      {dialogOpen && (
        <VerificationDialog onClose={() => setDialogOpen(false)} />
      )}
    </PageShell>
  );
}
