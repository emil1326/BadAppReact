import { useState } from 'react';
import { PageShell } from '../layout/PageShell';
import { useGetRendezVousSlotsQuery } from '../store/api';
import styles from './PriseRendezVousPage.module.css';

export function PriseRendezVousPage() {
  const { data: slots } = useGetRendezVousSlotsQuery();
  const [blacked, setBlacked] = useState(false);

  const triggerBlackout = () => {
    setBlacked(true);
    setTimeout(() => setBlacked(false), 2000);
  };

  return (
    <>
      {blacked && <div className={styles.blackout} />}
      <PageShell title="Prise de rendez-vous">
        <section className="colnet-panel">
          <div className="colnet-panel__header">
            Disponibilités — Hiver 2026
          </div>
          <div className="colnet-panel__body">
            <p className={styles.intro}>
              Sélectionnez un créneau disponible pour réserver votre rendez-vous.
              Les plages en gris sont déjà comblées. Toute annulation doit être
              effectuée au moins 6 semaines ouvrables à l&apos;avance.
            </p>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Heure</th>
                  <th className={styles.th}>Intervenant(e)</th>
                  <th className={styles.th}>Service</th>
                  <th className={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {slots?.map((slot) => (
                  <tr
                    key={`${slot.heure}-${slot.intervenant}`}
                    className={slot.disponible ? '' : styles.rowUnavailable}
                  >
                    <td className={styles.td}>{slot.heure}</td>
                    <td className={styles.td}>{slot.intervenant}</td>
                    <td className={styles.td}>{slot.service}</td>
                    <td className={styles.td}>
                      {slot.disponible ? (
                        <button
                          type="button"
                          className={styles.bookBtn}
                          onClick={slot.blackout ? triggerBlackout : undefined}
                        >
                          Réserver
                        </button>
                      ) : (
                        <span className={styles.unavailableLabel}>Complet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={styles.note}>
              * Les rendez-vous confirmés sont envoyés par télécopieur uniquement.
              Délai de confirmation habituel : 3 à 5 semaines.
            </p>
          </div>
        </section>
      </PageShell>
    </>
  );
}
