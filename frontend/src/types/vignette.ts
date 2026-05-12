export type VignetteStatus = {
  spun: boolean;
  prizeIndex: number | null;
  result: string | null;
};

export type RecordSpinPayload = {
  prizeIndex: number;
  result: string;
};
