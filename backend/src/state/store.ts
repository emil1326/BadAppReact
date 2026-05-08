import { randomUUID } from 'node:crypto';

export type GameState = {
  userName: string;
};

const sessions = new Map<string, GameState>();

export function createSession(initial: GameState): string {
  const sessionId = randomUUID();
  sessions.set(sessionId, initial);
  return sessionId;
}

export function getSession(sessionId: string): GameState | undefined {
  return sessions.get(sessionId);
}

export function updateSession(
  sessionId: string,
  patch: Partial<GameState>,
): GameState | undefined {
  const current = sessions.get(sessionId);
  if (!current) return undefined;
  const updated = { ...current, ...patch };
  sessions.set(sessionId, updated);
  return updated;
}

export function destroySession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}
