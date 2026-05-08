import type { FastifyReply, FastifyRequest } from 'fastify';
import { getSession, type GameState } from '../state/store.js';

declare module 'fastify' {
  interface FastifyRequest {
    session?: { id: string; state: GameState };
  }
}

export async function requireSession(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const sessionId = request.headers['x-session-id'];
  if (typeof sessionId !== 'string' || sessionId === '') {
    return reply.code(401).send({ error: 'MISSING_SESSION' });
  }

  const state = getSession(sessionId);
  if (!state) {
    return reply.code(401).send({ error: 'INVALID_SESSION' });
  }

  request.session = { id: sessionId, state };
}

export function getRequiredSession(request: FastifyRequest) {
  if (!request.session) {
    throw new Error('requireSession preHandler not registered for this route');
  }
  return request.session;
}
