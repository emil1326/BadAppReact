import { randomUUID } from 'node:crypto';

export type FlowState = {
  endTime: number;
};

export type CodesState = {
  active: string | null;
  burned: string[];
};

export type GameState = {
  userName: string;
  flow: FlowState | null;
  codes: CodesState;
};

const sessions = new Map<string, GameState>();

export function createSession(initial: { userName: string }): string {
  const sessionId = randomUUID();
  sessions.set(sessionId, {
    userName: initial.userName,
    flow: null,
    codes: { active: null, burned: [] },
  });
  return sessionId;
}

export function getSession(sessionId: string): GameState | undefined {
  return sessions.get(sessionId);
}

export function destroySession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}
