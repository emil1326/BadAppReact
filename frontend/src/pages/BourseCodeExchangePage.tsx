import { useState } from 'react';
import { PageShell } from '../layout/PageShell';
import { useExchangeCodeAMutation } from '../store/api';
import { useTimer } from '../hooks/useTimer';
import styles from './BourseCodeExchangePage.module.css';

export function BourseCodeExchangePage() {
  const { isActive } = useTimer();
  const [exchangeCodeA, { isLoading }] = useExchangeCodeAMutation();

  const [codeA, setCodeA] = useState('');
  const [codeB, setCodeB] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCodeB(null);

    if (!codeA.trim()) {
      setError('Veuillez entrer le Code A reçu par courriel.');
      return;
    }

    try {
      const result = await exchangeCodeA({ codeA: codeA.trim() }).unwrap();
      setCodeB(result.codeB);
    } catch (err: unknown) {
      const errorCode = (err as { data?: { error?: string } })?.data?.error;
      if (errorCode === 'NO_CODE') {
        setError(
          "Aucun Code A n'a été généré. Veuillez compléter la vérification 2FA d'abord.",
        );
      } else if (errorCode === 'INVALID_CODE') {
        setError('Code A invalide. Veuillez vérifier le code reçu par courriel.');
      } else if (errorCode === 'ALREADY_USED') {
        setError(
          'Le Code A a déjà été utilisé pour générer un Code B. Vous ne pouvez pas le réutiliser.',
        );
      } else if (errorCode === 'NO_ACTIVE_FLOW' || errorCode === 'FLOW_EXPIRED') {
        setError(
          "Votre session de procédure est expirée ou inexistante. Veuillez retourner à l'État de compte.",
        );
      } else {
        setError("Une erreur inattendue s'est produite.");
      }
    }
  };

  if (!isActive) {
    return (
      <PageShell title="Validation de sélection de cours">
        <section className="colnet-panel">
          <div className="colnet-panel__header">Procédure non initialisée</div>
          <div className="colnet-panel__body">
            <p>
              Aucune procédure de remboursement n&apos;est en cours. Veuillez démarrer la
              procédure depuis la page{' '}
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

  if (codeB) {
    return (
      <PageShell title="Validation de sélection de cours">
        <section className="colnet-panel">
          <div className="colnet-panel__header">Code B généré</div>
          <div className="colnet-panel__body">
            <p className={styles.success}>
              ✓ Le Code de confirmation de choix de cours (Code B) a été généré avec succès.
            </p>

            <div className={styles.codeBox}>
              <p className={styles.codeLabel}>Code B</p>
              <div className={styles.codeValue}>{codeB}</div>
            </div>

            <div className={styles.instructionsBox}>
              <p className={styles.instructionsTitle}>
                <strong>Prochaines étapes :</strong>
              </p>
              <ol className={styles.steps}>
                <li>
                  <strong>Notez ce code immédiatement.</strong> Il ne sera plus accessible après
                  avoir quitté cette page.
                </li>
                <li>
                  Retournez à la page de soumission finale de votre demande de remboursement.
                </li>
                <li>
                  Entrez le Code B dans le champ prévu à cet effet pour finaliser votre demande.
                </li>
              </ol>
            </div>

            <p className={styles.warning}>
              <strong>Attention :</strong> Votre timer de session continue de s&apos;écouler.
              Procédez rapidement à la soumission finale.
            </p>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell title="Validation de sélection de cours">
      <section className="colnet-panel">
        <div className="colnet-panel__header">
          Échange de code — Code A → Code B
        </div>
        <div className="colnet-panel__body">
          <p className={styles.breadcrumb}>
            Mon dossier → Valid. sélection confirm.
          </p>

          <p className={styles.instructions}>
            Entrez le <strong>Code de confirmation de sélection de confirmation de cours (Code A)</strong>{' '}
            que vous avez reçu par courriel suite à votre vérification 2FA.
          </p>
          <p className={styles.instructions}>
            Ce code sera échangé contre le{' '}
            <strong>Code de confirmation de choix de cours (Code B)</strong>, nécessaire pour la
            soumission finale de votre demande.
          </p>

          <form onSubmit={handleExchange} className={styles.form} noValidate>
            <div className={styles.row}>
              <label htmlFor="codeA" className={styles.label}>
                Code A (alphanumérique, ~10 caractères)
              </label>
              <input
                id="codeA"
                type="text"
                value={codeA}
                onChange={(e) => {
                  setCodeA(e.target.value.toUpperCase());
                  setError(null);
                }}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                autoComplete="off"
                spellCheck={false}
                placeholder="ABC123XYZ9"
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.button}
                disabled={isLoading || !codeA.trim()}
              >
                {isLoading ? 'Génération du Code B...' : 'Générer le Code B'}
              </button>
            </div>
          </form>

          <div className={styles.notice}>
            <p>
              <strong>Rappel important :</strong>
            </p>
            <ul>
              <li>Le Code A ne peut être utilisé qu&apos;une seule fois.</li>
              <li>
                Une fois le Code B généré, conservez-le en lieu sûr — il ne sera plus accessible
                après avoir quitté cette page.
              </li>
              <li>Votre timer de session continue de s&apos;écouler pendant cette opération.</li>
            </ul>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
