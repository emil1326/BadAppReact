import { useState } from 'react';
import { useGetMessagesQuery, useGetWelcomeQuery } from '../store/api';
import { useAuth } from '../store/hooks';
import { PageShell } from '../layout/PageShell';
import type { AdminMessage } from '../types/message';
import styles from './AccueilPage.module.css';

export function AccueilPage() {
  const { userName } = useAuth();
  const { data: messages } = useGetMessagesQuery();
  const { data: welcome } = useGetWelcomeQuery();
  const [selected, setSelected] = useState<AdminMessage | null>(null);

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
                  <button
                    type="button"
                    className={styles.msgLink}
                    onClick={() => setSelected(message)}
                  >
                    {message.objet}
                  </button>
                </td>
                <td>{message.from ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selected && (
        <div
          className="colnet-modal-overlay colnet-modal-overlay--page"
          onClick={() => setSelected(null)}
        >
          <div
            className={`colnet-panel ${styles.modal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="colnet-panel__header">
              {selected.objet}
            </div>
            <div className="colnet-panel__body">
              {selected.from && (
                <p className={styles.modalMeta}>
                  De&nbsp;: {selected.from} &nbsp;|&nbsp; Date&nbsp;: {selected.date}
                </p>
              )}
              {!selected.from && (
                <p className={styles.modalMeta}>
                  De&nbsp;: (expéditeur inconnu) &nbsp;|&nbsp; Date&nbsp;: {selected.date}
                </p>
              )}
              <p className={styles.modalBody}>{selected.body}</p>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setSelected(null)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
