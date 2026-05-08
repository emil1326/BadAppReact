import { useGetWelcomeQuery } from '../store/api';
import { PageShell } from '../layout/PageShell';
import styles from './CoursPage.module.css';

export function CoursPage() {
  const { data: welcome } = useGetWelcomeQuery();

  return (
    <PageShell title="Cours">
      <section className="colnet-panel">
        <div className="colnet-panel__header">
          Mes cours - {welcome?.semester ?? ''}
        </div>
        <div className="colnet-panel__body">
          {welcome && (
            <>
              <p>
                Programme{' '}
                <a href="#">
                  {welcome.program.code} {welcome.program.name}
                </a>
              </p>
              <ul className={styles.coursesList}>
                {welcome.courses.map((course) => (
                  <li key={course.code}>
                    <a href="#">
                      {course.code} {course.title}
                    </a>
                  </li>
                ))}
              </ul>
              <p className={styles.deadline}>
                Désinscription possible jusqu&apos;au {welcome.deinscriptionDate}
              </p>
              <p className={styles.deadline}>
                Abandon possible jusqu&apos;au {welcome.abandonDate}
              </p>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
