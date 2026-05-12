import type { FastifyInstance } from 'fastify';
import { getRequiredSession, requireSession } from '../services/auth.js';
import { saveSession } from '../state/store.js';

type SpinBody = { prizeIndex?: number; result?: string };

export async function vignetteRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/api/vignette/status',
    { preHandler: requireSession },
    async (request) => {
      const { state } = getRequiredSession(request);
      return state.vignette;
    },
  );

  app.post<{ Body: SpinBody }>(
    '/api/vignette/spin',
    { preHandler: requireSession },
    async (request, reply) => {
      const { id, state } = getRequiredSession(request);
      const { prizeIndex, result } = request.body ?? {};
      if (typeof prizeIndex !== 'number' || typeof result !== 'string') {
        return reply.code(400).send({ error: 'INVALID_SPIN_DATA' });
      }
      state.vignette = { spun: true, prizeIndex, result };
      await saveSession(id);
      return state.vignette;
    },
  );

  app.post(
    '/api/vignette/reset',
    { preHandler: requireSession },
    async (request) => {
      const { id, state } = getRequiredSession(request);
      state.vignette = { spun: false, prizeIndex: null, result: null };
      await saveSession(id);
      return { ok: true };
    },
  );
}
