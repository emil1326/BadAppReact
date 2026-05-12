import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../layout/PageShell';
import { useGetSignalementsFantomesQuery } from '../store/api';
import styles from './FantomesNonInscritsPage.module.css';

type FormState = {
  lieu: string;
  comportement: string;
  description: string;
};

const INITIAL_FORM: FormState = {
  lieu: '',
  comportement: '',
  description: '',
};

const LIEUX = [
  'Pavillon A',
  'Pavillon B',
  'Pavillon C (non-applicable)',
  'Sous-sol Pavillon A',
  'Sous-sol Pavillon B (niveau B-7)',
  'Ascenseur B (en panne)',
  'Stationnement zone Sibérie',
  'Stationnement zone Lune',
  'Bibliothèque',
  'Bureau 14-B',
  'Autre (à préciser dans la description)',
];

const COMPORTEMENTS = [
  'Vagabondage diurne',
  'Vagabondage nocturne',
  'Chuchotements',
  'Déplacement d\'objets',
  'Présence non-corporelle',
  'Mastication',
  'Plaintes en français du 19e siècle',
  'Autres manifestations',
];

function generateRefNumber(): string {
  const year = new Date().getFullYear();
  const n = Math.floor(10000 + Math.random() * 90000);
  return `SIG-${year}-${n.toString().padStart(5, '0')}`;
}

export function FantomesNonInscritsPage() {
  const { data: signalements } = useGetSignalementsFantomesQuery();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleField =
    <K extends keyof FormState>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value as FormState[K] }));
      setConfirmation(null);
    };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    setConfirmation(null);
    const file = e.target.files?.[0];
    if (!file) {
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setPhotoError('Seuls les fichiers image sont acceptés (les entités sonores doivent faire l\'objet d\'un signalement distinct).');
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!photo || !form.lieu || !form.comportement || !form.description.trim()) {
      setPhotoError('Tous les champs sont obligatoires, incluant la photo.');
      return;
    }
    const ref = generateRefNumber();
    setConfirmation(
      `Signalement n° ${ref} transmis au Fantôme du Pavillon B. Délai d'ingestion estimé : 6 à 8 semaines ouvrables. Aucun accusé de réception ne sera émis. La photo a été conservée 47 ans aux archives paranormales (sous-sol Pavillon A, classeur non-réfrigéré).`,
    );
    setForm(INITIAL_FORM);
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <PageShell title="Signalement de fantômes non-inscrits">
      <section className="colnet-panel">
        <div className="colnet-panel__header">
          Cadre administratif et autorisation
        </div>
        <div className="colnet-panel__body">
          <p className={styles.intro}>
            La présente section permet aux étudiant(e)s de signaler toute
            entité paranormale <strong>non-inscrite au registre officiel</strong>
            {' '}observée sur le campus. Les signalements sont automatiquement
            transmis au Fantôme du Pavillon B, qui en assure la disposition
            (typiquement par <em>ingestion</em>, mais d&apos;autres dispositions
            sont possibles à sa seule discrétion).
          </p>
          <p className={styles.intro}>
            Conformément à votre consentement administratif n° 4 — Divulgation
            du dossier au Fantôme du Pavillon B (voir{' '}
            <Link to="/consentements" className={styles.link}>page Consentements</Link>),
            vos signalements sont traités sans préavis et sans possibilité de
            retrait. Le Fantôme du Pavillon B (officiellement inscrit au
            registre paranormal du collège depuis 1991) demeure l&apos;unique
            autorité d&apos;ingestion habilitée sur le campus.
          </p>
          <p className={styles.intro}>
            Les entités déjà inscrites au registre officiel ne doivent
            <strong> en aucun cas</strong> être signalées via le présent
            formulaire. La liste des entités inscrites est disponible au
            bureau 14-B (mardis impairs entre 10 h 12 et 10 h 47 — voir{' '}
            <Link to="/prise-rendez-vous" className={styles.link}>Prise de rendez-vous</Link>).
          </p>
        </div>
      </section>

      <section className="colnet-panel">
        <div className="colnet-panel__header">
          Nouveau signalement
        </div>
        <div className="colnet-panel__body">
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.formRow}>
              <label htmlFor="photo" className={styles.label}>
                Photographie de l&apos;entité (.jpg, .png, .gif)
              </label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                className={styles.fileInput}
              />
              <p className={styles.hint}>
                Note : les entités translucides ou non-corporelles peuvent être
                difficiles à capter. Une photo floue, blanche, ou totalement
                vide est néanmoins recevable et constitue souvent la preuve la
                plus convaincante.
              </p>
              {photoPreview && (
                <div className={styles.previewBox}>
                  <img src={photoPreview} alt="Aperçu de l'entité signalée" className={styles.preview} />
                  <p className={styles.previewLabel}>
                    Aperçu — {photo?.name} ({photo ? Math.round(photo.size / 1024) : 0} Ko)
                  </p>
                </div>
              )}
            </div>

            <div className={styles.formRow}>
              <label htmlFor="lieu" className={styles.label}>
                Lieu d&apos;observation
              </label>
              <select
                id="lieu"
                value={form.lieu}
                onChange={handleField('lieu')}
                className={styles.input}
              >
                <option value="">— Sélectionnez —</option>
                {LIEUX.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <label htmlFor="comportement" className={styles.label}>
                Comportement observé
              </label>
              <select
                id="comportement"
                value={form.comportement}
                onChange={handleField('comportement')}
                className={styles.input}
              >
                <option value="">— Sélectionnez —</option>
                {COMPORTEMENTS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <label htmlFor="description" className={styles.label}>
                Description complémentaire
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={handleField('description')}
                className={styles.textarea}
                rows={4}
                placeholder="Décrivez l'entité, sa tenue vestimentaire, son langage, l'heure approximative, et tout détail susceptible de faciliter l'identification (ou l'ingestion)."
              />
            </div>

            {photoError && <p className={styles.errorMsg}>{photoError}</p>}
            {confirmation && <p className={styles.confirmMsg}>{confirmation}</p>}

            <button type="submit" className={styles.submitBtn}>
              Transmettre au Fantôme du Pavillon B
            </button>
          </form>
        </div>
      </section>

      <section className="colnet-panel">
        <div className="colnet-panel__header">
          Signalements précédents et dispositions
        </div>
        <div className="colnet-panel__body">
          <p className={styles.tableIntro}>
            Historique des signalements traités depuis Automne 2024. Les
            dispositions « ingéré » sont définitives. Les autres dispositions
            relèvent de l&apos;appréciation du Fantôme du Pavillon B et ne
            peuvent faire l&apos;objet d&apos;aucun recours.
          </p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Référence</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Lieu</th>
                <th className={styles.th}>Comportement</th>
                <th className={styles.th}>Description</th>
                <th className={styles.th}>Disposition</th>
              </tr>
            </thead>
            <tbody>
              {signalements?.map((s) => (
                <tr key={s.id}>
                  <td className={styles.td}>{s.id}</td>
                  <td className={styles.td}>{s.date}</td>
                  <td className={styles.td}>{s.lieu}</td>
                  <td className={styles.td}>{s.comportement}</td>
                  <td className={styles.td}>{s.description}</td>
                  <td className={styles.td}>{s.disposition}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.legalFooter}>
            Politique #PV-2003-14, art. 38 — « Les entités signalées ne
            disposent d&apos;aucun droit de réponse, conformément à leur
            statut non-inscrit. »
          </p>
        </div>
      </section>
    </PageShell>
  );
}
