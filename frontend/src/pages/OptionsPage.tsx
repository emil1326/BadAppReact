import { useEffect, useState } from 'react';
import { PageShell } from '../layout/PageShell';
import {
  useGetProfileQuery,
  useSetProfileModeMutation,
} from '../store/api';
import { useProfile } from '../store/hooks';
import type { ProfileMode } from '../types/profile';
import styles from './OptionsPage.module.css';

type DecoyField =
  | {
      kind: 'text';
      id: string;
      label: string;
      defaultValue: string;
    }
  | {
      kind: 'select';
      id: string;
      label: string;
      defaultValue: string;
      options: readonly string[];
    }
  | {
      kind: 'toggle';
      id: string;
      label: string;
      defaultValue: boolean;
    };

type SpecialRow = { kind: 'mode-toggle' } | { kind: 'student-number' };

type Section = {
  title: string;
  rows: ReadonlyArray<DecoyField | SpecialRow>;
};

const SECTIONS: readonly Section[] = [
  {
    title: 'Compte',
    rows: [
      { kind: 'student-number' },
      { kind: 'text', id: 'fullName', label: 'Nom complet', defaultValue: '' },
      { kind: 'text', id: 'email', label: 'Courriel', defaultValue: '' },
      { kind: 'text', id: 'phone', label: 'Téléphone', defaultValue: '' },
      { kind: 'text', id: 'address', label: 'Adresse postale', defaultValue: '' },
    ],
  },
  {
    title: 'Préférences',
    rows: [
      {
        kind: 'select',
        id: 'language',
        label: 'Langue de communication',
        defaultValue: 'Français',
        options: ['Français', 'English', 'Non spécifié'],
      },
      {
        kind: 'select',
        id: 'timezone',
        label: 'Fuseau horaire',
        defaultValue: 'Non spécifié',
        options: [
          'America/Montreal',
          'America/Toronto',
          'America/Halifax',
          'Non spécifié',
        ],
      },
      {
        kind: 'select',
        id: 'dateFormat',
        label: 'Format des dates',
        defaultValue: 'AAAA-MM-JJ',
        options: ['AAAA-MM-JJ', 'JJ/MM/AAAA', 'MM/JJ/AAAA'],
      },
      {
        kind: 'select',
        id: 'timeFormat',
        label: 'Format de l’heure',
        defaultValue: '24h',
        options: ['12h', '24h'],
      },
    ],
  },
  {
    title: 'Notifications',
    rows: [
      {
        kind: 'toggle',
        id: 'notifEmail',
        label: 'Notifications par courriel',
        defaultValue: true,
      },
      {
        kind: 'toggle',
        id: 'notifSms',
        label: 'Notifications par SMS',
        defaultValue: false,
      },
      {
        kind: 'toggle',
        id: 'notifPush',
        label: 'Notifications push',
        defaultValue: false,
      },
      {
        kind: 'toggle',
        id: 'notifMarketing',
        label: 'Communications promotionnelles',
        defaultValue: false,
      },
    ],
  },
  {
    title: 'Confidentialité',
    rows: [
      {
        kind: 'toggle',
        id: 'consentMarketing',
        label: 'Consentement à l’usage marketing des données',
        defaultValue: false,
      },
      {
        kind: 'toggle',
        id: 'consentAnalytics',
        label: 'Consentement aux analyses comportementales',
        defaultValue: false,
      },
      {
        kind: 'toggle',
        id: 'consentThirdParty',
        label: 'Partage avec partenaires tiers',
        defaultValue: false,
      },
      {
        kind: 'select',
        id: 'profileVisibility',
        label: 'Visibilité du profil interne',
        defaultValue: 'Personnel',
        options: ['Personnel', 'Membres du collège', 'Public'],
      },
      // Buried here, between two unrelated privacy toggles, with a label that
      // gives no hint about what this actually controls.
      { kind: 'mode-toggle' },
      {
        kind: 'toggle',
        id: 'consentNewsletter',
        label: 'Réception de l’infolettre administrative',
        defaultValue: true,
      },
    ],
  },
  {
    title: 'Accessibilité',
    rows: [
      {
        kind: 'select',
        id: 'fontSize',
        label: 'Taille de la police',
        defaultValue: 'Normale',
        options: ['Petite', 'Normale', 'Grande', 'Très grande'],
      },
      {
        kind: 'toggle',
        id: 'highContrast',
        label: 'Contraste élevé',
        defaultValue: false,
      },
      {
        kind: 'toggle',
        id: 'reduceMotion',
        label: 'Réduire les animations',
        defaultValue: false,
      },
      {
        kind: 'toggle',
        id: 'screenReader',
        label: 'Mode lecteur d’écran amélioré',
        defaultValue: false,
      },
    ],
  },
  {
    title: 'Sécurité',
    rows: [
      {
        kind: 'toggle',
        id: 'twoFactor',
        label: 'Authentification à deux facteurs',
        defaultValue: true,
      },
      {
        kind: 'toggle',
        id: 'loginAlerts',
        label: 'Alertes de connexion',
        defaultValue: true,
      },
      {
        kind: 'select',
        id: 'sessionDuration',
        label: 'Durée des sessions inactives',
        defaultValue: '30 minutes',
        options: ['15 minutes', '30 minutes', '1 heure', '2 heures'],
      },
    ],
  },
] as const;

const MODE_LABELS: Record<ProfileMode, string> = {
  OBSERVATION: 'Consultation',
  SOUMISSION: 'Soumission',
};

const MODES: readonly ProfileMode[] = ['OBSERVATION', 'SOUMISSION'];

function buildInitialDecoyState(): Record<string, string | boolean> {
  const initial: Record<string, string | boolean> = {};
  for (const section of SECTIONS) {
    for (const row of section.rows) {
      if (row.kind === 'mode-toggle' || row.kind === 'student-number') continue;
      initial[row.id] = row.defaultValue;
    }
  }
  return initial;
}

export function OptionsPage() {
  // Pull profile from server on mount so the mode toggle reflects reality
  // even if Redux was empty (first visit) or out of sync.
  useGetProfileQuery();
  const { mode, studentNumber } = useProfile();
  const [setProfileMode, { isLoading: isUpdatingMode }] =
    useSetProfileModeMutation();

  const [decoys, setDecoys] = useState<Record<string, string | boolean>>(
    buildInitialDecoyState,
  );
  const [dirtyIds, setDirtyIds] = useState<ReadonlySet<string>>(new Set());

  // Decoys never get persisted. We pretend to "save" them after a beat so the
  // UI feels real — institutional bad-UX without forcing the user to click
  // "Save" on every row.
  useEffect(() => {
    if (dirtyIds.size === 0) return;
    const id = window.setTimeout(() => setDirtyIds(new Set()), 1500);
    return () => window.clearTimeout(id);
  }, [dirtyIds]);

  const updateDecoy = (id: string, value: string | boolean) => {
    setDecoys((previous) => ({ ...previous, [id]: value }));
    setDirtyIds((previous) => {
      const next = new Set(previous);
      next.add(id);
      return next;
    });
  };

  const handleModeClick = async (next: ProfileMode) => {
    if (next === mode || isUpdatingMode) return;
    try {
      await setProfileMode({ mode: next }).unwrap();
    } catch {
      // Backend currently always accepts the toggle; nothing to surface.
    }
  };

  return (
    <PageShell title="Options">
      <p className={styles.intro}>
        Paramètres du dossier étudiant. Toute modification est enregistrée
        automatiquement. Certains paramètres requièrent une approbation
        administrative supplémentaire.
      </p>

      {SECTIONS.map((section) => (
        <section key={section.title} className={`colnet-panel ${styles.section}`}>
          <div className="colnet-panel__header">{section.title}</div>
          <div className="colnet-panel__body">
            {section.rows.map((row) => {
              if (row.kind === 'student-number') {
                return (
                  <div key="student-number" className={styles.row}>
                    <span className={styles.label}>Numéro étudiant</span>
                    {studentNumber !== null ? (
                      <span className={styles.readOnlyValue}>
                        {studentNumber}
                      </span>
                    ) : (
                      <span className={styles.maskedValue}>•••••••</span>
                    )}
                    <span className={styles.saveIndicator}>Lecture seule</span>
                  </div>
                );
              }
              if (row.kind === 'mode-toggle') {
                return (
                  <div key="mode-toggle" className={`${styles.row} ${styles.modeRow}`}>
                    <span className={styles.label}>
                      Mode opérationnel du dossier
                    </span>
                    <div className={styles.modeButtons}>
                      {MODES.map((modeOption) => (
                        <button
                          key={modeOption}
                          type="button"
                          className={`${styles.modeButton}${
                            mode === modeOption ? ' ' + styles.active : ''
                          }`}
                          onClick={() => handleModeClick(modeOption)}
                          disabled={isUpdatingMode}
                        >
                          {MODE_LABELS[modeOption]}
                        </button>
                      ))}
                    </div>
                    <span className={styles.saveIndicator}>
                      {isUpdatingMode ? 'En cours...' : 'Synchronisé'}
                    </span>
                  </div>
                );
              }

              const value = decoys[row.id];
              const isDirty = dirtyIds.has(row.id);

              return (
                <div key={row.id} className={styles.row}>
                  <label className={styles.label} htmlFor={`opt-${row.id}`}>
                    {row.label}
                  </label>
                  {row.kind === 'text' ? (
                    <input
                      id={`opt-${row.id}`}
                      type="text"
                      className={styles.input}
                      value={typeof value === 'string' ? value : ''}
                      onChange={(event) => updateDecoy(row.id, event.target.value)}
                    />
                  ) : row.kind === 'select' ? (
                    <select
                      id={`opt-${row.id}`}
                      className={styles.select}
                      value={typeof value === 'string' ? value : ''}
                      onChange={(event) => updateDecoy(row.id, event.target.value)}
                    >
                      {row.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={styles.toggle}>
                      <input
                        id={`opt-${row.id}`}
                        type="checkbox"
                        checked={typeof value === 'boolean' ? value : false}
                        onChange={(event) =>
                          updateDecoy(row.id, event.target.checked)
                        }
                      />
                      <span>{value ? 'Activé' : 'Désactivé'}</span>
                    </span>
                  )}
                  <span
                    className={`${styles.saveIndicator}${
                      isDirty ? ' ' + styles.dirty : ''
                    }`}
                  >
                    {isDirty ? 'En cours...' : 'Enregistré'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </PageShell>
  );
}
