import type { FastifyInstance } from 'fastify';
import { createSession, destroySession } from '../state/store.js';
import { getRequiredSession, requireSession } from '../services/auth.js';

type LoginBody = { userName?: string };

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: LoginBody }>('/api/auth/login', async (request, reply) => {
    const userName = request.body?.userName?.trim();
    if (!userName) {
      return reply.code(400).send({ error: 'USERNAME_REQUIRED' });
    }

    const sessionId = createSession({ userName });
    return { sessionId, userName };
  });

  app.post('/api/auth/logout', { preHandler: requireSession }, async (request) => {
    const session = getRequiredSession(request);
    destroySession(session.id);
    return { ok: true };
  });
}
