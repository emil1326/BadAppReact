export type BourseBalance = {
  balance: number;
};

export function createBourseBalance(overrides: Partial<BourseBalance> = {}): BourseBalance {
  return { balance: 0, ...overrides };
}

export type BourseFormFields = {
  studentNumber: string;
  code1: string;
  code2: string;
  code3: string;
};

export type FieldStatus = 'OK' | 'WRONG';

export type BourseFormError = {
  error: 'INVALID_FIELDS';
  fields: Record<keyof BourseFormFields, FieldStatus>;
};
