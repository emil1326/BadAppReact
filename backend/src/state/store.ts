import { randomUUID } from 'node:crypto';

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

export type GameState = {
  userName: string;
  profile: ProfileState;
  flow: FlowState | null;
  codes: CodesState;
};

const sessions = new Map<string, GameState>();

function generateStudentNumber(): string {
  const value = Math.floor(1_000_000 + Math.random() * 9_000_000);
  return value.toString();
}

export function createSession(initial: { userName: string }): string {
  const sessionId = randomUUID();
  sessions.set(sessionId, {
    userName: initial.userName,
    profile: {
      mode: 'SOUMISSION',
      studentNumber: generateStudentNumber(),
    },
    flow: null,
    codes: { active: null },
  });
  return sessionId;
}

export function getSession(sessionId: string): GameState | undefined {
  return sessions.get(sessionId);
}

export function destroySession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}
