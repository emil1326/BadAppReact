import { useMemo, useState } from 'react';
import { PageShell } from '../layout/PageShell';
import { useGetCasiersQuery } from '../store/api';
import type { Casier } from '../types/content';
import styles from './CasierPage.module.css';

function sortByName(a: Casier, b: Casier): number {
  return a.nom.localeCompare(b.nom, 'fr');
}

function CasierContent({ casier }: { casier: Casier }) {
  return (
    <section className="colnet-panel">
      <div className="colnet-panel__header">{casier.nom}</div>
      <div className="colnet-panel__body">
        <p className={styles.sousTitre}>{casier.sousTitre}</p>
        <p className={styles.intro}>{casier.intro}</p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Date</th>
              <th>Objet</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {casier.entrees.map((entree, idx) => (
              <tr key={`${casier.id}-${idx}`}>
                <td className={styles.refCol}>{entree.ref}</td>
                <td className={styles.dateCol}>{entree.date}</td>
                <td>{entree.objet}</td>
                <td className={styles.statutCol}>{entree.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function CasierPage() {
  const { data: casiers } = useGetCasiersQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    if (!casiers) return [];
    return [...casiers].sort(sortByName);
  }, [casiers]);

  const active = sorted.find((c) => c.id === selectedId) ?? sorted[0] ?? null;

  return (
    <PageShell title="Casier">
      <section className="colnet-panel">
        <div className="colnet-panel__header">
          Sélection du casier — Service du registrariat
        </div>
        <div className="colnet-panel__body">
          <p className={styles.intro}>
            Vos casiers institutionnels sont regroupés ci-dessous. Sélectionnez
            l&apos;entrée souhaitée pour en consulter le contenu. Toute
            consultation est enregistrée au registre d&apos;audit conformément
            à la directive SI-2007-14.
          </p>
          <div className={styles.tabs}>
            {sorted.map((c) => {
              const isActive = active?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                  onClick={() => setSelectedId(c.id)}
                >
                  {c.nom}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {active && <CasierContent casier={active} />}
    </PageShell>
  );
}
