import type { FastifyInstance } from 'fastify';
import { getRequiredSession, requireSession } from '../services/auth.js';
import {
  burnCode,
  getFlowSnapshot,
  regenerateCode,
  startFlow,
} from '../services/timer.js';

type CheckTimerBody = { code?: string };

export async function sessionRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/api/session/start-bourse-flow',
    { preHandler: requireSession },
    async (request) => {
      const { state } = getRequiredSession(request);
      const { endTime, code } = startFlow(state);
      return { endTime, code };
    },
  );

  app.post<{ Body: CheckTimerBody }>(
    '/api/session/check-timer',
    { preHandler: requireSession },
    async (request, reply) => {
      const { state } = getRequiredSession(request);
      const code = request.body?.code?.trim();
      if (!code) {
        return reply.code(400).send({ error: 'CODE_REQUIRED' });
      }
      const result = burnCode(state, code);
      if (!result.ok) {
        return reply.code(400).send({ error: result.reason });
      }
      return { ok: true, remainingMs: result.remainingMs };
    },
  );

  app.post(
    '/api/session/regenerate-code',
    { preHandler: requireSession },
    async (request, reply) => {
      const { state } = getRequiredSession(request);
      if (!state.flow) {
        return reply.code(400).send({ error: 'NO_ACTIVE_FLOW' });
      }
      if (state.flow.endTime <= Date.now()) {
        return reply.code(400).send({ error: 'FLOW_EXPIRED' });
      }
      const code = regenerateCode(state);
      return { code };
    },
  );

  app.get(
    '/api/session/recover',
    { preHandler: requireSession },
    async (request) => {
      const { state } = getRequiredSession(request);
      return getFlowSnapshot(state);
    },
  );
}
