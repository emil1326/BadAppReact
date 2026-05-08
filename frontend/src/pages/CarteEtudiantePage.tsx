import { PageShell } from '../layout/PageShell';
import { COLLEGE_NAME_LONG } from '../config/branding';
import styles from './CarteEtudiantePage.module.css';

const CARDHOLDER = {
  name: 'Bob L’ÉPONGE Carrépant',
  studentNumber: '0000001',
  program: '240.A0 - INFORMATIQUE DE GESTION',
  issued: '2024-09-01',
  expires: '2099-12-31',
  address: '124, rue Conque, Bikini Bottom',
};

const BARCODE_PATTERN = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2, 1, 4, 1];

function SpongebobPortrait() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Photo de Bob l’Éponge">
      <rect x="6" y="6" width="88" height="88" fill="#FCE03A" stroke="#000000" strokeWidth="2" />
      <circle cx="18" cy="22" r="3" fill="#D0B020" />
      <circle cx="78" cy="18" r="2.5" fill="#D0B020" />
      <circle cx="84" cy="78" r="2.5" fill="#D0B020" />
      <circle cx="22" cy="80" r="2" fill="#D0B020" />
      <circle cx="50" cy="14" r="1.5" fill="#D0B020" />
      <circle cx="35" cy="42" r="11" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
      <circle cx="65" cy="42" r="11" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
      <circle cx="35" cy="44" r="3.5" fill="#3a8fff" />
      <circle cx="65" cy="44" r="3.5" fill="#3a8fff" />
      <circle cx="35" cy="44" r="1.5" fill="#000000" />
      <circle cx="65" cy="44" r="1.5" fill="#000000" />
      <ellipse cx="50" cy="68" rx="22" ry="11" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
      <line x1="50" y1="60" x2="50" y2="73" stroke="#000000" strokeWidth="1" />
      <line x1="44" y1="60" x2="44" y2="73" stroke="#000000" strokeWidth="0.6" />
      <line x1="56" y1="60" x2="56" y2="73" stroke="#000000" strokeWidth="0.6" />
      <circle cx="18" cy="58" r="4.5" fill="#ff8888" opacity="0.55" />
      <circle cx="82" cy="58" r="4.5" fill="#ff8888" opacity="0.55" />
    </svg>
  );
}

function Barcode() {
  return (
    <div className={styles.barcode} aria-hidden="true">
      {BARCODE_PATTERN.map((width, index) => (
        <span key={index} style={{ width: `${width}px` }} />
      ))}
    </div>
  );
}

export function CarteEtudiantePage() {
  return (
    <PageShell title="Carte étudiante">
      <p className={styles.intro}>
        Carte étudiante officielle. Présentez-la sur demande au comptoir, à la
        bibliothèque, à la cafétéria et dans les locaux contrôlés.
      </p>

      <article className={styles.card}>
        <header className={styles.cardHeader}>{COLLEGE_NAME_LONG}</header>

        <div className={styles.cardBody}>
          <div className={styles.photoFrame}>
            <SpongebobPortrait />
          </div>
          <div className={styles.fields}>
            <p className={styles.fieldLabel}>Nom complet</p>
            <p className={styles.fieldValue}>{CARDHOLDER.name}</p>

            <p className={styles.fieldLabel}>Numéro étudiant</p>
            <p className={styles.fieldValue}>{CARDHOLDER.studentNumber}</p>

            <p className={styles.fieldLabel}>Programme</p>
            <p className={styles.fieldValue}>{CARDHOLDER.program}</p>

            <p className={styles.fieldLabel}>Adresse</p>
            <p className={styles.fieldValue}>{CARDHOLDER.address}</p>

            <p className={styles.fieldLabel}>Émise / Expire</p>
            <p className={styles.fieldValue}>
              {CARDHOLDER.issued} / {CARDHOLDER.expires}
            </p>
          </div>
        </div>

        <footer className={styles.cardFooter}>
          <Barcode />
          <span className={styles.stamp}>VALIDE</span>
        </footer>
      </article>

      <p className={styles.disclaimer}>
        En cas de perte ou de vol, signalez-le immédiatement au comptoir des
        services aux étudiants. Toute carte falsifiée entraîne une procédure
        disciplinaire conformément à la politique #PV-2003-14.
      </p>
    </PageShell>
  );
}
