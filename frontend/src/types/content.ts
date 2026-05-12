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
