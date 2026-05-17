import { PageShell } from '../layout/PageShell';
import { useGetNotesStatusQuery, useRequestNotesMutation } from '../store/api';
import { formatNumberFr } from '../utils/format';
import styles from './NotesPersonnellesPage.module.css';

function approxYears(days: number): string {
  return formatNumberFr(Math.round(days / 365));
}

export function NotesPersonnellesPage() {
  const { data: notesStatus } = useGetNotesStatusQuery();
  const [requestNotes, { isLoading }] = useRequestNotesMutation();

  const snapshot = notesStatus?.snapshot ?? null;

  const handleRequest = async () => {
    try {
      await requestNotes().unwrap();
    } catch {
    }
  };

  if (snapshot) {
    return (
      <PageShell title="Notes personnelles">
        <section className="colnet-panel">
          <div className="colnet-panel__header">
            Demande d&apos;accès enregistrée
          </div>
          <div className="colnet-panel__body">
            <p className={styles.intro}>
              Votre demande a bien été soumise au service d&apos;administration
              centralisée. Veuillez conserver les informations suivantes pour
              tout suivi ultérieur.
            </p>
            <p className={styles.referenceLine}>
              <strong>Numéro de référence :</strong> {snapshot.reference}
            </p>
            <p className={styles.referenceLine}>
              <strong>Position dans la file d&apos;attente :</strong>{' '}
              {formatNumberFr(snapshot.queuePosition)} sur{' '}
              {formatNumberFr(snapshot.queueTotal)}
            </p>
            <p className={styles.referenceLine}>
              <strong>Délai estimé de traitement :</strong>{' '}
              <span className={styles.delayHighlight}>
                {formatNumberFr(snapshot.delayDays)} jours ouvrables
              </span>{' '}
              (≈ {approxYears(snapshot.delayDays)} années)
            </p>
            <p className={styles.smallNote}>
              Vous serez avisé par courriel à l&apos;adresse au dossier dès
              qu&apos;un administrateur prendra connaissance de votre dossier.
              Veuillez ne pas soumettre de seconde demande, ceci replacerait
              automatiquement votre dossier en bas de la file.
            </p>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell title="Notes personnelles">
      <section className="colnet-panel">
        <div className="colnet-panel__header">
          Accès aux notes personnelles
        </div>
        <div className="colnet-panel__body">
          <p className={styles.intro}>
            Cette section est protégée et nécessite une autorisation explicite
            d&apos;un administrateur du système avant que vous ne puissiez
            consulter ou modifier vos notes personnelles.
          </p>
          <p className={styles.intro}>
            Conformément à la politique #PV-2003-14, toute demande d&apos;accès
            est traitée dans l&apos;ordre de réception et ne peut être
            accélérée.
          </p>
          <div className={styles.requestActions}>
            <button
              type="button"
              className="colnet-form__submit"
              onClick={handleRequest}
              disabled={isLoading}
            >
              {isLoading ? 'Envoi...' : "Demander l'accès à un administrateur"}
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
