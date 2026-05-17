import { useMemo, useState } from 'react';
import { useGetJobsQuery } from '../store/api';
import { PageShell } from '../layout/PageShell';
import styles from './OffresEmploiPage.module.css';

function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let s = seed | 0;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) | 0;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function OffresEmploiPage() {
  const { data: jobs } = useGetJobsQuery();
  const [seed] = useState(() => (Math.random() * 0x7fffffff) | 0);

  const shuffledJobs = useMemo(() => {
    if (!jobs) return undefined;
    return shuffleWithSeed(jobs, seed);
  }, [jobs, seed]);

  return (
    <PageShell title="Offres d'emploi">
      <p className={styles.intro}>
        Offres d&apos;emploi étudiantes - Ordre déterminé par notre algorithme
        propriétaire de pertinence
      </p>

      <section className="colnet-panel">
        <div className="colnet-panel__header">
          Offres disponibles ({shuffledJobs?.length ?? 0})
        </div>
        <table className="colnet-table">
          <thead>
            <tr>
              <th className={styles.dateColumn}>Date</th>
              <th className={styles.titleColumn}>Poste</th>
              <th className={styles.employerColumn}>Employeur</th>
              <th className={styles.locationColumn}>Lieu</th>
              <th className={styles.salaryColumn}>Salaire</th>
              <th>Exigences</th>
            </tr>
          </thead>
          <tbody>
            {shuffledJobs?.map((job) => (
              <tr key={job.id}>
                <td>{job.datePosted}</td>
                <td>
                  <a href="#">{job.title}</a>
                </td>
                <td>{job.employer}</td>
                <td>{job.location}</td>
                <td>{job.salary}</td>
                <td className={styles.requirements}>{job.requirements}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageShell>
  );
}
