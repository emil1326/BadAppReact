import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../layout/PageShell';
import { useSelectCoursesMutation } from '../store/api';
import { useGetCourseListQuery } from '../store/api';
import { useTimer } from '../hooks/useTimer';
import { useSubmitGate } from '../hooks/useSubmitGate';
import type { CourseSelectionError } from '../types/bourse';
import styles from './BourseCoursPage.module.css';

const EMPTY = '';

function isCourseSelectionError(value: unknown): value is CourseSelectionError {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as CourseSelectionError).error === 'NOT_ENROLLED'
  );
}

export function BourseCoursPage() {
  const { isActive } = useTimer();
  const { canSubmit } = useSubmitGate();
  const { data: courseList } = useGetCourseListQuery();
  const [selectCourses, { isLoading }] = useSelectCoursesMutation();
  const navigate = useNavigate();

  const [code1, setCode1] = useState(EMPTY);
  const [code2, setCode2] = useState(EMPTY);
  const [code3, setCode3] = useState(EMPTY);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const allCodes = courseList?.allCodes ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!code1 || !code2 || !code3) {
      setGlobalError('Veuillez sélectionner un code de cours pour chaque champ.');
      return;
    }

    try {
      await selectCourses({ courseCodes: [code1, code2, code3] }).unwrap();
      navigate('/bourse-soumission');
    } catch (err: unknown) {
      const data = (err as { data?: unknown })?.data;
      if (isCourseSelectionError(data)) {
        setGlobalError(
          `Vous n'êtes pas inscrit(e) au cours ${data.courseCode}. Vérifiez vos codes de bulletin et recommencez la conversion.`,
        );
      } else if (typeof data === 'object' && data !== null && 'error' in data) {
        const errorCode = (data as { error: string }).error;
        if (errorCode === 'PROFILE_MODE_BLOCKS_SUBMIT') {
          setGlobalError(
            'Vous êtes en mode Observation. Passez en mode Soumission dans Options avant de soumettre.',
          );
        } else if (errorCode === 'NO_ACTIVE_FLOW' || errorCode === 'FLOW_EXPIRED') {
          setGlobalError(
            "Votre session de procédure est expirée ou inexistante. Veuillez retourner à l'État de compte.",
          );
        } else {
          setGlobalError("Une erreur inattendue s'est produite. Veuillez réessayer.");
        }
      }
    }
  };

  if (!isActive) {
    return (
      <PageShell title="Sélection de cours">
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
    <PageShell title="Sélection de cours">
      <section className="colnet-panel">
        <div className="colnet-panel__header">
          Confirmation des cours — Bourse Hiver 2026
        </div>
        <div className="colnet-panel__body">
          <p className={styles.instructions}>
            Sélectionnez les trois codes de cours obtenus via le convertisseur.
            Les codes doivent correspondre exactement à ceux générés lors de la
            conversion. Toute sélection incorrecte entraîne le rejet de la demande.
          </p>

          {globalError && (
            <p className={styles.globalError}>{globalError}</p>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.row}>
              <label htmlFor="course1" className={styles.label}>
                Code de cours 1
              </label>
              <select
                id="course1"
                value={code1}
                onChange={(e) => { setCode1(e.target.value); setGlobalError(null); }}
                className={styles.dropdown}
                disabled={isLoading || allCodes.length === 0}
              >
                <option value="">-- Sélectionner --</option>
                {allCodes.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

            <div className={styles.row}>
              <label htmlFor="course2" className={styles.label}>
                Code de cours 2
              </label>
              <select
                id="course2"
                value={code2}
                onChange={(e) => { setCode2(e.target.value); setGlobalError(null); }}
                className={styles.dropdown}
                disabled={isLoading || allCodes.length === 0}
              >
                <option value="">-- Sélectionner --</option>
                {allCodes.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

            <div className={styles.row}>
              <label htmlFor="course3" className={styles.label}>
                Code de cours 3
              </label>
              <select
                id="course3"
                value={code3}
                onChange={(e) => { setCode3(e.target.value); setGlobalError(null); }}
                className={styles.dropdown}
                disabled={isLoading || allCodes.length === 0}
              >
                <option value="">-- Sélectionner --</option>
                {allCodes.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

            <div className={styles.submitRow}>
              <button
                type="submit"
                className="colnet-form__submit"
                disabled={isLoading || !canSubmit}
              >
                {isLoading ? 'Validation...' : 'Confirmer la sélection'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="colnet-panel">
        <div className="colnet-panel__header">Rappel de procédure</div>
        <div className="colnet-panel__body">
          <p className={styles.reminder}>
            Les codes de cours doivent avoir été préalablement obtenus via le
            Convertisseur de codes. Aucun historique de conversion n&apos;est
            affiché ici. Assurez-vous d&apos;être en mode <strong>Soumission</strong> avant
            de confirmer.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
