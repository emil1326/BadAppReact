import type { FastifyInstance } from 'fastify';
import { getRequiredSession, requireSession } from '../services/auth.js';
import {
  getPublicProfile,
  setProfileMode,
} from '../services/profile.js';
import type { ProfileMode } from '../state/store.js';

type ModeBody = { mode?: string };

function isProfileMode(value: unknown): value is ProfileMode {
  return value === 'OBSERVATION' || value === 'SOUMISSION';
}

export async function profileRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/api/profile',
    { preHandler: requireSession },
    async (request) => {
      const { state } = getRequiredSession(request);
      return getPublicProfile(state);
    },
  );

  app.post<{ Body: ModeBody }>(
    '/api/profile/mode',
    { preHandler: requireSession },
    async (request, reply) => {
      const { state } = getRequiredSession(request);
      const mode = request.body?.mode;
      if (!isProfileMode(mode)) {
        return reply.code(400).send({ error: 'INVALID_MODE' });
      }
      return setProfileMode(state, mode);
    },
  );
}
