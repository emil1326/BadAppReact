import { useState, useRef, useEffect } from 'react';
import { PageShell } from '../layout/PageShell';
import { useConvertCodeMutation } from '../store/api';
import { useTimer } from '../hooks/useTimer';
import styles from './BourseConverterPage.module.css';

const RESULT_DISPLAY_MS = 8000;

export function BourseConverterPage() {
  const { isActive } = useTimer();
  const [convertCode, { isLoading }] = useConvertCodeMutation();

  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const disappearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (disappearTimer.current) clearTimeout(disappearTimer.current);
    };
  }, []);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (disappearTimer.current) clearTimeout(disappearTimer.current);

    try {
      const { courseCode } = await convertCode({ bulletinCode: input.trim() }).unwrap();
      setInput('');
      setResult(courseCode);
      disappearTimer.current = setTimeout(() => setResult(null), RESULT_DISPLAY_MS);
    } catch (err: unknown) {
      const errorCode = (err as { data?: { error?: string } })?.data?.error;
      if (errorCode === 'INVALID_SYNTAX') {
        setError(
          'Format de code invalide. Le code doit comporter trois (3) groupes séparés par des tirets.',
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
      <PageShell title="Convertisseur de codes de cours">
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

  return (
    <PageShell title="Convertisseur de codes de cours">
      <section className="colnet-panel">
        <div className="colnet-panel__header">
          Conversion de codes — Bourse Hiver 2026
        </div>
        <div className="colnet-panel__body">
          <p className={styles.instructions}>
            Entrez un code de référence de votre bulletin de notes pour obtenir le
            code de cours correspondant. Effectuez cette opération pour chacun de
            vos trois codes. Notez le résultat immédiatement — il ne s&apos;affiche
            que quelques secondes.
          </p>

          <form onSubmit={handleConvert} className={styles.form} noValidate>
            <div className={styles.row}>
              <label htmlFor="bulletinCode" className={styles.label}>
                Code de bulletin
              </label>
              <input
                id="bulletinCode"
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(null);
                }}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                autoComplete="off"
                spellCheck={false}
                disabled={isLoading}
              />
              <button
                type="submit"
                className={styles.convertBtn}
                disabled={isLoading || input.trim().length === 0}
              >
                {isLoading ? 'Conversion...' : 'Convertir'}
              </button>
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}
          </form>

          <div className={styles.resultArea}>
            {result !== null && (
              <p className={styles.resultValue}>
                Code de cours&nbsp;: <strong>{result}</strong>
              </p>
            )}
            {result === null && !isLoading && (
              <p className={styles.resultPlaceholder}>
                — en attente de conversion —
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="colnet-panel">
        <div className="colnet-panel__header">Rappel de procédure</div>
        <div className="colnet-panel__body">
          <p className={styles.reminder}>
            Vous devez convertir les trois codes figurant sur votre bulletin
            officiel (page Bulletin, section « Codes administratifs »).
            Une fois vos codes de cours obtenus, accédez à la page
            « Sélection de cours » pour finaliser cette étape.
            Aucun historique des conversions n&apos;est conservé.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
