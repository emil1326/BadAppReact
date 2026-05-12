import { useState } from 'react';
import { PageShell } from '../layout/PageShell';
import { useSubmitBourseFormMutation } from '../store/api';
import { useTimer } from '../hooks/useTimer';
import { useSubmitGate } from '../hooks/useSubmitGate';
import type { BourseFormFields, BourseFormError, FieldStatus } from '../types/bourse';
import styles from './BourseFormulairePage.module.css';

type FormState = BourseFormFields;

type FieldErrors = Partial<Record<keyof BourseFormFields, FieldStatus>>;

const INITIAL_FORM: FormState = {
  studentNumber: '',
  code1: '',
  code2: '',
  code3: '',
};

function isBourseFormError(value: unknown): value is BourseFormError {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as BourseFormError).error === 'INVALID_FIELDS'
  );
}

export function BourseFormulairePage() {
  const { isActive } = useTimer();
  const { canSubmit } = useSubmitGate();
  const [submitForm, { isLoading, isSuccess }] = useSubmitBourseFormMutation();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setGlobalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError(null);

    try {
      await submitForm(form).unwrap();
    } catch (err: unknown) {
      const data = (err as { data?: unknown })?.data;
      if (isBourseFormError(data)) {
        setFieldErrors(data.fields);
      } else if (
        typeof data === 'object' &&
        data !== null &&
        'error' in data
      ) {
        const errorCode = (data as { error: string }).error;
        if (errorCode === 'PROFILE_MODE_BLOCKS_SUBMIT') {
          setGlobalError(
            'Vous êtes en mode Observation. Passez en mode Soumission dans Options avant de soumettre.',
          );
        } else if (errorCode === 'NO_ACTIVE_FLOW' || errorCode === 'FLOW_EXPIRED') {
          setGlobalError(
            "Votre session de procédure est expirée ou inexistante. Veuillez retourner à l'État de compte.",
          );
        } else if (errorCode === 'MISSING_FIELDS') {
          setGlobalError('Tous les champs sont obligatoires.');
        } else {
          setGlobalError("Une erreur inattendue s'est produite. Veuillez réessayer.");
        }
      }
    }
  };

  if (!isActive) {
    return (
      <PageShell title="Formulaire de demande de bourse">
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

  if (isSuccess) {
    return (
      <PageShell title="Formulaire de demande de bourse">
        <section className="colnet-panel">
          <div className="colnet-panel__header">Formulaire soumis</div>
          <div className="colnet-panel__body">
            <p className={styles.successMsg}>
              Vos informations ont été validées avec succès. Veuillez poursuivre
              la procédure selon les étapes indiquées.
            </p>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell title="Formulaire de demande de bourse">
      <section className="colnet-panel">
        <div className="colnet-panel__header">
          Identification de l&apos;étudiant(e)
        </div>
        <div className="colnet-panel__body">
          <p className={styles.instructions}>
            Remplissez les champs ci-dessous à partir des informations figurant
            dans votre bulletin de notes officiel. Les codes de référence se
            trouvent en page 2 du bulletin, section « Codes administratifs ».
            Toute saisie incorrecte entraîne le rejet du formulaire.
          </p>
          <p className={styles.instructions}>
            Votre numéro d&apos;étudiant est accessible en mode Observation dans
            la page Options.
          </p>

          {globalError && (
            <p className={styles.globalError}>{globalError}</p>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.row}>
              <label htmlFor="studentNumber" className={styles.label}>
                Numéro d&apos;étudiant
              </label>
              <input
                id="studentNumber"
                type="text"
                value={form.studentNumber}
                onChange={handleChange('studentNumber')}
                className={`${styles.input} ${fieldErrors.studentNumber === 'WRONG' ? styles.inputError : ''}`}
                autoComplete="off"
                spellCheck={false}
              />
              {fieldErrors.studentNumber === 'WRONG' && (
                <span className={styles.fieldError}>Numéro incorrect.</span>
              )}
            </div>

            <div className={styles.row}>
              <label htmlFor="code1" className={styles.label}>
                Code de référence 1
              </label>
              <input
                id="code1"
                type="text"
                value={form.code1}
                onChange={handleChange('code1')}
                className={`${styles.input} ${fieldErrors.code1 === 'WRONG' ? styles.inputError : ''}`}
                autoComplete="off"
                spellCheck={false}
              />
              {fieldErrors.code1 === 'WRONG' && (
                <span className={styles.fieldError}>Code incorrect.</span>
              )}
            </div>

            <div className={styles.row}>
              <label htmlFor="code2" className={styles.label}>
                Code de référence 2
              </label>
              <input
                id="code2"
                type="text"
                value={form.code2}
                onChange={handleChange('code2')}
                className={`${styles.input} ${fieldErrors.code2 === 'WRONG' ? styles.inputError : ''}`}
                autoComplete="off"
                spellCheck={false}
              />
              {fieldErrors.code2 === 'WRONG' && (
                <span className={styles.fieldError}>Code incorrect.</span>
              )}
            </div>

            <div className={styles.row}>
              <label htmlFor="code3" className={styles.label}>
                Code de référence 3
              </label>
              <input
                id="code3"
                type="text"
                value={form.code3}
                onChange={handleChange('code3')}
                className={`${styles.input} ${fieldErrors.code3 === 'WRONG' ? styles.inputError : ''}`}
                autoComplete="off"
                spellCheck={false}
              />
              {fieldErrors.code3 === 'WRONG' && (
                <span className={styles.fieldError}>Code incorrect.</span>
              )}
            </div>

            <div className={styles.submitRow}>
              <button
                type="submit"
                className="colnet-form__submit"
                disabled={isLoading || !canSubmit}
              >
                {isLoading ? 'Vérification...' : 'Soumettre le formulaire'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="colnet-panel">
        <div className="colnet-panel__header">Rappel de procédure</div>
        <div className="colnet-panel__body">
          <p className={styles.reminder}>
            Les codes de référence figurent uniquement sur la version PDF imprimée
            de votre bulletin. Assurez-vous d&apos;être en mode{' '}
            <strong>Soumission</strong> avant de valider ce formulaire.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
