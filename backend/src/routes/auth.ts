import type { FastifyInstance } from 'fastify';
import { createSession, destroySession, saveSession } from '../state/store.js';
import { getRequiredSession, requireSession } from '../services/auth.js';

type LoginBody = { userName?: string };
const ALLOWED_USER_NAME = "un nom d'utilisateur";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: LoginBody }>('/api/auth/login', async (request, reply) => {
    const userName = request.body?.userName?.trim();
    if (!userName) {
      return reply.code(400).send({ error: 'USERNAME_REQUIRED' });
    }

    if (userName !== ALLOWED_USER_NAME) {
      return reply.code(401).send({ error: 'INVALID_USERNAME' });
    }

    const sessionId = createSession({ userName });
    await saveSession(sessionId);
    return { sessionId, userName };
  });

  app.post('/api/auth/logout', { preHandler: requireSession }, async (request) => {
    const session = getRequiredSession(request);
    destroySession(session.id);
    return { ok: true };
  });
}
