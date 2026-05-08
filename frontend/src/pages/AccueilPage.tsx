import { useGetMessagesQuery, useGetWelcomeQuery } from '../store/api';
import { useAuth } from '../store/hooks';
import { PageShell } from '../layout/PageShell';
import styles from './AccueilPage.module.css';

export function AccueilPage() {
  const { userName } = useAuth();
  const { data: messages } = useGetMessagesQuery();
  const { data: welcome } = useGetWelcomeQuery();

  return (
    <PageShell title="Accueil">
      <section className={`colnet-panel ${styles.welcomePanel}`}>
        <div className="colnet-panel__header">Bienvenue !</div>
        <div className={`colnet-panel__body ${styles.welcomePanelBody}`}>
          <div className={styles.photoPlaceholder}>Photo</div>
          <p>{userName ?? ''}</p>
          {welcome && (
            <a href="#">
              Vous avez {welcome.newMessageCount} nouveaux messages !
            </a>
          )}
        </div>
      </section>

      <section className="colnet-panel">
        <div className="colnet-panel__header">Message(s) de l&apos;administration</div>
        <table className="colnet-table">
          <thead>
            <tr>
              <th className={styles.dateColumn}>Date</th>
              <th>Objet</th>
              <th className={styles.fromColumn}>De</th>
            </tr>
          </thead>
          <tbody>
            {messages?.map((message) => (
              <tr key={`${message.date}-${message.objet}`}>
                <td>{message.date}</td>
                <td>
                  <a href="#">{message.objet}</a>
                </td>
                <td>{message.from ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageShell>
  );
}
