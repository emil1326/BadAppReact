import { useState } from 'react';
import { PageShell } from '../layout/PageShell';
import { useInit2FAMutation, useVerify2FAMutation } from '../store/api';
import { useTimer } from '../hooks/useTimer';
import styles from './Bourse2FAPage.module.css';

type Phase = 'email' | 'code' | 'success';

export function Bourse2FAPage() {
  const { isActive } = useTimer();
  const [init2FA, { isLoading: isInitializing }] = useInit2FAMutation();
  const [verify2FA, { isLoading: isVerifying }] = useVerify2FAMutation();

  const [phase, setPhase] = useState<Phase>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleInitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Veuillez entrer une adresse courriel valide.');
      return;
    }

    try {
      await init2FA({ email: email.trim() }).unwrap();
      setPhase('code');
    } catch (err: unknown) {
      const errorCode = (err as { data?: { error?: string } })?.data?.error;
      if (errorCode === 'NO_ACTIVE_FLOW' || errorCode === 'FLOW_EXPIRED') {
        setError(
          "Votre session de procédure est expirée ou inexistante. Veuillez retourner à l'État de compte.",
        );
      } else if (errorCode === 'EMAIL_SEND_FAILED') {
        setError(
          "L'envoi du courriel a échoué. Veuillez vérifier votre connexion et réessayer.",
        );
      } else {
        setError("Une erreur inattendue s'est produite.");
      }
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError('Veuillez entrer le code reçu par courriel.');
      return;
    }

    try {
      await verify2FA({ code: code.trim(), email }).unwrap();
      setPhase('success');
    } catch (err: unknown) {
      const errorCode = (err as { data?: { error?: string } })?.data?.error;
      if (errorCode === 'NO_CODE') {
        setError("Aucun code n'a été généré. Veuillez recommencer le processus.");
      } else if (errorCode === 'INVALID_CODE') {
        setError('Code invalide. Veuillez vérifier le code reçu par courriel.');
      } else if (errorCode === 'ALREADY_USED') {
        setError('Ce code a déjà été utilisé. Veuillez recommencer le processus.');
      } else if (errorCode === 'EMAIL_SEND_FAILED') {
        setError(
          "La vérification a réussi mais l'envoi du Code A a échoué. Contactez le support.",
        );
      } else {
        setError("Une erreur inattendue s'est produite.");
      }
    }
  };

  if (!isActive) {
    return (
      <PageShell title="Vérification de sécurité 2FA">
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

  if (phase === 'success') {
    return (
      <PageShell title="Vérification de sécurité 2FA">
        <section className="colnet-panel">
          <div className="colnet-panel__header">Vérification complétée</div>
          <div className="colnet-panel__body">
            <p className={styles.success}>
              ✓ Votre vérification 2FA a été complétée avec succès.
            </p>
            <p>
              Un courriel contenant le <strong>Code de confirmation de sélection de
              confirmation de cours (Code A)</strong> vous a été envoyé à l&apos;adresse{' '}
              <strong>{email}</strong>.
            </p>
            <p className={styles.instructions}>
              Pour obtenir votre <strong>Code de confirmation de choix de cours (Code B)</strong>,
              veuillez :
            </p>
            <ol className={styles.steps}>
              <li>Consulter le courriel reçu et noter le Code A</li>
              <li>
                Accéder à la section{' '}
                <span className={styles.pathHighlight}>
                  Mon dossier → Documents → Confirmations → Codes → Validation → Sélection
                </span>
              </li>
              <li>Entrer le Code A dans le champ prévu à cet effet</li>
              <li>Le système générera alors votre Code B nécessaire à la soumission finale</li>
            </ol>
            <p className={styles.warning}>
              <strong>Important :</strong> Le Code A ne peut être utilisé qu&apos;une seule fois.
              Conservez le Code B en lieu sûr pour la dernière étape.
            </p>
          </div>
        </section>
      </PageShell>
    );
  }

  if (phase === 'code') {
    return (
      <PageShell title="Vérification de sécurité 2FA">
        <section className="colnet-panel">
          <div className="colnet-panel__header">Vérification en cours — Étape 2/2</div>
          <div className="colnet-panel__body">
            <p className={styles.instructions}>
              Un code de vérification à six (6) chiffres a été envoyé à l&apos;adresse{' '}
              <strong>{email}</strong>.
            </p>
            <p className={styles.warning}>
              <strong>Attention :</strong> La livraison du courriel peut prendre entre 1 et 30
              secondes. Votre timer continue de s&apos;écouler pendant ce délai.
            </p>

            <form onSubmit={handleVerifyCode} className={styles.form} noValidate>
              <div className={styles.row}>
                <label htmlFor="code" className={styles.label}>
                  Code de vérification (6 chiffres)
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError(null);
                  }}
                  className={`${styles.input} ${error ? styles.inputError : ''}`}
                  autoComplete="off"
                  maxLength={6}
                  placeholder="000000"
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.button}
                  disabled={isVerifying || !code.trim()}
                >
                  {isVerifying ? 'Vérification en cours...' : 'Vérifier le code'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell title="Vérification de sécurité 2FA">
      <section className="colnet-panel">
        <div className="colnet-panel__header">Vérification requise — Étape 1/2</div>
        <div className="colnet-panel__body">
          <p className={styles.instructions}>
            Pour des raisons de sécurité, une vérification en deux étapes (2FA) est requise avant
            de poursuivre votre demande de remboursement.
          </p>
          <p>Veuillez entrer votre adresse courriel institutionnelle.</p>

          <form onSubmit={handleInitEmail} className={styles.form} noValidate>
            <div className={styles.row}>
              <label htmlFor="email" className={styles.label}>
                Adresse courriel
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                autoComplete="email"
                placeholder="votre.nom@college.example.ca"
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.button}
                disabled={isInitializing || !email.trim()}
              >
                {isInitializing ? 'Envoi en cours...' : 'Envoyer le code de vérification'}
              </button>
            </div>
          </form>

          <p className={styles.notice}>
            <strong>Note :</strong> Vous recevrez un code à usage unique par courriel. Ce code
            expirera à la fin de votre session de procédure.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
