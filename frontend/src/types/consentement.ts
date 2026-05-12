export type ConsentementRenvoi = {
  label: string;
  to: string;
};

export type Consentement = {
  id: string;
  titre: string;
  description: string;
  reference?: string;
  renvoi?: ConsentementRenvoi;
} & ({ dateConsenti: string } | { enAttente: true });
