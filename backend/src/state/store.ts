import { randomUUID } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
} from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSIONS_DIR = path.resolve(__dirname, '..', '..', 'sessions');

export type ProfileMode = 'OBSERVATION' | 'SOUMISSION';

export type ProfileState = {
  mode: ProfileMode;
  studentNumber: string;
};

export type FlowState = {
  endTime: number;
};

export type CodesState = {
  active: string | null;
};

export type EmailCodesState = {
  code2FA: string | null;
  codeA: string | null;
  codeB: string | null;
  used2FA: boolean;
  usedA: boolean;
};

export type BourseState = {
  balance: number;
  formDone: boolean;
  convertedCodes: string[];
  coursesSelected: boolean;
};

export type VignetteState = {
  spun: boolean;
  prizeIndex: number | null;
  result: string | null;
};

export type NotesSnapshot = {
  reference: string;
  queuePosition: number;
  queueTotal: number;
  delayDays: number;
};

export type NotesState = {
  snapshot: NotesSnapshot | null;
};

export type GameState = {
  userName: string;
  profile: ProfileState;
  flow: FlowState | null;
  codes: CodesState;
  emailCodes?: EmailCodesState;
  bourse: BourseState;
  vignette: VignetteState;
  notes: NotesState;
};

const sessions = new Map<string, GameState>();

function sessionFilePath(id: string): string {
  return path.join(SESSIONS_DIR, `${id}.json`);
}

export function loadSessions(): void {
  if (!existsSync(SESSIONS_DIR)) {
    mkdirSync(SESSIONS_DIR, { recursive: true });
    return;
  }
  const files = readdirSync(SESSIONS_DIR).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    try {
      const raw = readFileSync(path.join(SESSIONS_DIR, file), 'utf-8');
      const state = JSON.parse(raw) as GameState;
      const id = file.slice(0, -5);
      sessions.set(id, state);
    } catch {
      // Corrupted file skip.
    }
  }
  if (sessions.size > 0) {
    console.log(`  Loaded ${sessions.size} session(s) from disk`);
  }
}

export async function saveSession(id: string): Promise<void> {
  const state = sessions.get(id);
  if (!state) return;
  if (!existsSync(SESSIONS_DIR)) mkdirSync(SESSIONS_DIR, { recursive: true });
  await writeFile(sessionFilePath(id), JSON.stringify(state, null, 2), 'utf-8');
}

function generateStudentNumber(): string {
  const value = Math.floor(1_000_000 + Math.random() * 9_000_000);
  return value.toString();
}

export function createSession(initial: { userName: string }): string {
  const sessionId = randomUUID();
  sessions.set(sessionId, {
    userName: initial.userName,
    profile: {
      mode: 'OBSERVATION',
      studentNumber: generateStudentNumber(),
    },
    flow: null,
    codes: { active: null },
    bourse: { balance: 13486, formDone: false, convertedCodes: [], coursesSelected: false },
    vignette: { spun: false, prizeIndex: null, result: null },
    notes: { snapshot: null },
  });
  return sessionId;
}

export function getSession(sessionId: string): GameState | undefined {
  return sessions.get(sessionId);
}

export function destroySession(sessionId: string): boolean {
  const deleted = sessions.delete(sessionId);
  if (deleted) {
    try {
      unlinkSync(sessionFilePath(sessionId));
    } catch {
      // Already gone fine.
    }
  }
  return deleted;
}
