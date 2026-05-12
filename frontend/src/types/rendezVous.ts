export type RendezVousSlot = {
  heure: string;
  intervenant: string;
  service: string;
  disponible: boolean;
  blackout?: true;
};
