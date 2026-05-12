import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { GameState } from '../state/store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const secretsPath = path.resolve(__dirname, '..', '..', 'data', 'bulletin-secrets.json');

type BulletinSecrets = { code1: string; code2: string; code3: string };
const secrets = JSON.parse(readFileSync(secretsPath, 'utf-8')) as BulletinSecrets;

export type FormFields = {
  studentNumber: string;
  code1: string;
  code2: string;
  code3: string;
};

export type FieldStatus = 'OK' | 'WRONG';

export type FormValidationResult =
  | { ok: true }
  | {
      ok: false;
      fields: Record<keyof FormFields, FieldStatus>;
    };

export function validateBourseForm(
  state: GameState,
  fields: FormFields,
): FormValidationResult {
  const studentNumberOk = fields.studentNumber === state.profile.studentNumber;
  const code1Ok = fields.code1 === secrets.code1;
  const code2Ok = fields.code2 === secrets.code2;
  const code3Ok = fields.code3 === secrets.code3;

  if (studentNumberOk && code1Ok && code2Ok && code3Ok) {
    state.bourse.formDone = true;
    return { ok: true };
  }

  return {
    ok: false,
    fields: {
      studentNumber: studentNumberOk ? 'OK' : 'WRONG',
      code1: code1Ok ? 'OK' : 'WRONG',
      code2: code2Ok ? 'OK' : 'WRONG',
      code3: code3Ok ? 'OK' : 'WRONG',
    },
  };
}
