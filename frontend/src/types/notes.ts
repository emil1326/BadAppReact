export type NotesSnapshot = {
  reference: string;
  queuePosition: number;
  queueTotal: number;
  delayDays: number;
};

export type NotesStatus = {
  snapshot: NotesSnapshot | null;
};
