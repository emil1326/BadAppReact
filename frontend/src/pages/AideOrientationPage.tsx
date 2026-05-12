import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { PageShell } from '../layout/PageShell';
import styles from './AideOrientationPage.module.css';

// Real coordinates of Collège Lionel-Groulx (100 rue Duquet, Sainte-Thérèse,
// Rive-Nord), which the fictional in-game institution borrows the name from.
const CAMPUS_COORDS: [number, number] = [45.643909, -73.841011];

export function AideOrientationPage() {
  return (
    <PageShell title="Aide à l'orientation">
      <section className="colnet-panel">
        <div className="colnet-panel__header">
          Outil cartographique — situation géographique
        </div>
        <div className="colnet-panel__body">
          <p className={styles.intro}>
            Afin de faciliter votre cheminement, le Service d&apos;aide à
            l&apos;orientation met à votre disposition l&apos;outil
            cartographique ci-dessous. Veuillez vous situer avant d&apos;entamer
            toute démarche d&apos;orientation académique ou professionnelle.
          </p>
          <MapContainer
            center={CAMPUS_COORDS}
            zoom={11}
            scrollWheelZoom={false}
            className={styles.map}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <CircleMarker
              center={CAMPUS_COORDS}
              radius={9}
              pathOptions={{
                color: '#6b1313',
                fillColor: '#b22222',
                fillOpacity: 0.7,
              }}
            >
              <Popup>
                <strong>Pavillon A (principal)</strong>
                <br />
                Bureau 14-B accessible par escalier de secours.
                <br />
                Stationnement : voir module Vignette Auto.
              </Popup>
            </CircleMarker>
          </MapContainer>
          <p className={styles.disclaimer}>
            Cartographie fournie par OpenStreetMap. L&apos;emplacement exact du
            campus peut varier selon la saison administrative en cours.
          </p>
        </div>
      </section>

      <section className="colnet-panel">
        <div className="colnet-panel__header">Prochaines étapes</div>
        <div className="colnet-panel__body">
          <p className={styles.steps}>
            Une fois votre position géographique confirmée, vous pouvez
            poursuivre votre orientation en prenant rendez-vous avec un(e)
            conseiller(ère) du Service d&apos;aide à l&apos;orientation via la
            section « Prise de rendez-vous » du présent portail. Les
            disponibilités sont limitées et les annulations doivent être
            transmises au moins 6 semaines ouvrables à l&apos;avance.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
