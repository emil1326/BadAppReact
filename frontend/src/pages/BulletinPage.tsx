import { PageShell } from '../layout/PageShell';
import { COLLEGE_NAME_LONG } from '../config/branding';
import styles from './BulletinPage.module.css';

const BULLETIN_URL = 'http://localhost:3001/api/bulletin.pdf';

export function BulletinPage() {
  return (
    <PageShell title="Bulletin">
      <section className="colnet-panel">
        <div className="colnet-panel__header">Bulletin de notes — Hiver 2026</div>
        <div className="colnet-panel__body">
          <p>
            Votre bulletin officiel de l&apos;session Hiver 2026 est disponible en
            format PDF. Ce document contient vos résultats définitifs ainsi que vos
            codes de référence personnels requis pour toute procédure administrative.
          </p>
          <p className={styles.notice}>
            <strong>Note :</strong> le bulletin est un document numérisé. Les
            informations qu&apos;il contient ne peuvent pas être copiées
            directement — veuillez les saisir manuellement dans les formulaires
            concernés.
          </p>
          <a
            href={BULLETIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.downloadLink}
          >
            Ouvrir le bulletin (PDF)
          </a>
        </div>
      </section>

      <section className="colnet-panel">
        <div className="colnet-panel__header">Avertissements</div>
        <div className="colnet-panel__body">
          <p className={styles.warning}>
            Ce bulletin est confidentiel et destiné exclusivement à
            l&apos;étudiant(e) concerné(e). Toute reproduction ou diffusion non
            autorisée est interdite en vertu de la{' '}
            <em>Loi sur l&apos;accès aux documents des organismes publics</em>.
          </p>
          <p className={styles.warning}>
            Les codes de référence inscrits sur ce bulletin sont à usage unique
            et liés à votre dossier. Ils expirent à la fin de la session en cours.
          </p>
          <p className={styles.smallPrint}>
            Pour toute question relative à votre bulletin, veuillez contacter le
            Service du registrariat du {COLLEGE_NAME_LONG} aux heures
            d&apos;ouverture (lun.–ven., 8h30–16h00, sauf jours fériés).
            Délai de réponse habituel : 6 à 8 semaines ouvrables.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
