export type VignetteOutcome = {
  label: string;
  result: string;
  description: string;
};

export type VignetteWarning = {
  title: string;
  paragraphs: string[];
};

export type VignetteContent = {
  outcomes: VignetteOutcome[];
  warnings: Record<string, VignetteWarning>;
};

export type ModeHelp = {
  title: string;
  paragraphs: string[];
};

export type CasierEntree = {
  ref: string;
  date: string;
  objet: string;
  statut: string;
};

export type Casier = {
  id: string;
  nom: string;
  sousTitre: string;
  intro: string;
  entrees: CasierEntree[];
};
