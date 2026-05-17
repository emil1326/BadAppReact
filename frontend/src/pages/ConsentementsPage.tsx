import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../layout/PageShell';
import { useGetConsentementsQuery } from '../store/api';
import type { Consentement } from '../types/consentement';
import styles from './ConsentementsPage.module.css';

type FormState = {
  nomGrandMere: string;
  couleurNuages: string;
  boutonsAscenseur: string;
  nomTemoin: string;
  pavillonConseiller: string;
  appareils: string;
  revoqueArchivageNonCulturel: boolean;
};

const INITIAL_FORM: FormState = {
  nomGrandMere: '',
  couleurNuages: '',
  boutonsAscenseur: '',
  nomTemoin: '',
  pavillonConseiller: '',
  appareils: '',
  revoqueArchivageNonCulturel: false,
};

function isPending(c: Consentement): c is Consentement & { enAttente: true } {
  return 'enAttente' in c && c.enAttente === true;
}

function ConsentementRow({ consentement }: { consentement: Consentement }) {
  const pending = isPending(consentement);
  const checkboxId = `consent-${consentement.id}`;

  return (
    <li className={`${styles.row} ${pending ? styles.rowPending : ''}`}>
      <input
        id={checkboxId}
        type="checkbox"
        checked={!pending}
        disabled
        className={styles.checkbox}
      />
      <div className={styles.body}>
        <label htmlFor={checkboxId} className={styles.title}>{consentement.titre}</label>
        <div className={styles.description}>{consentement.description}</div>
        <div className={styles.meta}>
          {pending ? (
            <span className={styles.pendingTag}>
              ⚠ ACTION REQUISE — formulaire à compléter ci-dessous
            </span>
          ) : (
            <span>
              Consenti le {(consentement as { dateConsenti: string }).dateConsenti} —
              irrévocable
            </span>
          )}
          {consentement.reference && (
            <span className={styles.reference}>
              {' '}· Réf.&nbsp;: {consentement.reference}
            </span>
          )}
          {consentement.renvoi && (
            <span className={styles.renvoi}>
              {' '}· Voir aussi&nbsp;:{' '}
              <Link to={consentement.renvoi.to} className={styles.renvoiLink}>
                {consentement.renvoi.label}
              </Link>
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

function PendingForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);

  const handleField =
    <K extends keyof FormState>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const target = e.target as HTMLInputElement;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      setForm((prev) => ({ ...prev, [field]: value as FormState[K] }));
      setError(null);
    };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Always fails -> th epoint
    setError(
      "Erreur : la couleur des nuages saisie ne correspond pas aux archives météorologiques internes pour la date d'admission indiquée. Veuillez vérifier auprès du bureau 14-B (mardis impairs entre 10 h 12 et 10 h 47) avant de soumettre à nouveau.",
    );
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <h4 className={styles.formTitle}>
        Formulaire de complétion — Consentement à la rétention post-mortem
      </h4>
      <p className={styles.formIntro}>
        Veuillez compléter l&apos;ensemble des champs ci-dessous. Tout champ
        laissé vide entraîne le rejet automatique de la demande et un délai
        de carence de 14 jours ouvrables avant nouvelle tentative.
      </p>

      <div className={styles.formRow}>
        <label className={styles.label} htmlFor="nomGrandMere">
          Nom de jeune fille de votre grand-mère paternelle
        </label>
        <input
          id="nomGrandMere"
          type="text"
          value={form.nomGrandMere}
          onChange={handleField('nomGrandMere')}
          className={styles.input}
          autoComplete="off"
        />
      </div>

      <div className={styles.formRow}>
        <label className={styles.label} htmlFor="couleurNuages">
          Couleur dominante des nuages le jour de votre admission
        </label>
        <select
          id="couleurNuages"
          value={form.couleurNuages}
          onChange={handleField('couleurNuages')}
          className={styles.input}
        >
          <option value="">— Sélectionnez —</option>
          <option value="gris-pale">Gris pâle</option>
          <option value="gris-fonce">Gris foncé</option>
          <option value="gris-bleu">Gris-bleu</option>
          <option value="blanc-casse">Blanc cassé</option>
          <option value="ne-souviens-pas">Je ne me souviens pas</option>
        </select>
      </div>

      <div className={styles.formRow}>
        <label className={styles.label} htmlFor="boutonsAscenseur">
          Nombre de boutons d&apos;ascenseur B que vous avez personnellement
          actionnés depuis votre admission
        </label>
        <input
          id="boutonsAscenseur"
          type="number"
          min="0"
          max="9999"
          value={form.boutonsAscenseur}
          onChange={handleField('boutonsAscenseur')}
          className={styles.input}
        />
      </div>

      <div className={styles.formRow}>
        <label className={styles.label} htmlFor="nomTemoin">
          Nom et signature de témoin (de préférence&nbsp;: Fantôme du Pavillon B)
        </label>
        <input
          id="nomTemoin"
          type="text"
          value={form.nomTemoin}
          onChange={handleField('nomTemoin')}
          className={styles.input}
          autoComplete="off"
        />
      </div>

      <div className={styles.formRow}>
        <label className={styles.label} htmlFor="pavillonConseiller">
          Pavillon de naissance de votre conseiller pédagogique en 2019
        </label>
        <select
          id="pavillonConseiller"
          value={form.pavillonConseiller}
          onChange={handleField('pavillonConseiller')}
          className={styles.input}
        >
          <option value="">— Sélectionnez —</option>
          <option value="A">Pavillon A</option>
          <option value="B">Pavillon B</option>
          <option value="C">Pavillon C</option>
          <option value="sans-enseignant">Cours sans enseignant depuis 2019</option>
          <option value="prefere-pas">Préfère ne pas répondre</option>
        </select>
      </div>

      <div className={styles.formRow}>
        <label className={styles.label} htmlFor="appareils">
          Liste de mes appareils électroniques susceptibles de me survivre
          (un par ligne)
        </label>
        <textarea
          id="appareils"
          value={form.appareils}
          onChange={handleField('appareils')}
          className={styles.textarea}
          rows={3}
        />
      </div>

      <div className={styles.formCheckRow}>
        <input
          type="checkbox"
          id="perpetuite"
          checked
          disabled
          className={styles.checkbox}
        />
        <label htmlFor="perpetuite" className={styles.checkLabel}>
          J&apos;autorise la cession à perpétuité de mes notes personnelles
          au service d&apos;archivage culturel (case verrouillée — voir
          consentement n° 13 ci-dessus).
        </label>
      </div>

      <div className={styles.formCheckRow}>
        <input
          type="checkbox"
          id="revoque"
          checked={form.revoqueArchivageNonCulturel}
          onChange={handleField('revoqueArchivageNonCulturel')}
          className={styles.checkbox}
        />
        <label htmlFor="revoque" className={styles.checkLabel}>
          Je révoque tout consentement précédent à des fins d&apos;archivage
          non-culturel (l&apos;effet de cette révocation dépend des
          interprétations rétroactives de la politique #PV-2003-14).
        </label>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <button type="submit" className={styles.submitBtn}>
        Confirmer le consentement à perpétuité
      </button>
    </form>
  );
}

export function ConsentementsPage() {
  const { data: consentements } = useGetConsentementsQuery();
  const pending = consentements?.find(isPending);

  return (
    <PageShell title="Consentements">
      <section className="colnet-panel">
        <div className="colnet-panel__header">
          Consentements administratifs — Hiver 2026
        </div>
        <div className="colnet-panel__body">
          <p className={styles.intro}>
            La liste ci-dessous regroupe l&apos;ensemble des consentements
            administratifs liés à votre dossier étudiant. Tous les
            consentements consignés sont <strong>irrévocables</strong> et
            automatiquement reconduits à chaque session, sauf indication
            contraire prévue à la politique #PV-2003-14.
          </p>
          {pending && (
            <p className={styles.actionBanner}>
              ⚠ <strong>1 consentement en attente</strong> nécessite votre
              attention. Voir le formulaire au bas de la présente page.
            </p>
          )}
          <ul className={styles.list}>
            {consentements?.map((c) => (
              <ConsentementRow key={c.id} consentement={c} />
            ))}
          </ul>
        </div>
      </section>

      {pending && (
        <section className="colnet-panel">
          <div className="colnet-panel__header">
            Complétion du consentement n° {pending.id.replace('c', '')}
          </div>
          <div className="colnet-panel__body">
            <PendingForm />
          </div>
        </section>
      )}

      <section className="colnet-panel">
        <div className="colnet-panel__header">Avis légal</div>
        <div className="colnet-panel__body">
          <p className={styles.legalNote}>
            La signature de votre formulaire d&apos;admission au collège
            constitue, en vertu de la politique #PV-2003-14 (art. 41), votre
            acceptation tacite de tout consentement futur ajouté à la
            présente liste, y compris ceux non encore rédigés. La présente
            page est strictement informative et n&apos;offre aucun mécanisme
            de révocation. Pour toute question, veuillez consulter la{' '}
            <Link to="/aide-orientation" className={styles.renvoiLink}>
              section Aide à l&apos;orientation
            </Link>
            .
          </p>
        </div>
      </section>
    </PageShell>
  );
}
