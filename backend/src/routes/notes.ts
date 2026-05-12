import type { FastifyInstance } from 'fastify';
import { getRequiredSession, requireSession } from '../services/auth.js';
import { saveSession, type NotesSnapshot } from '../state/store.js';

function generateSnapshot(): NotesSnapshot {
  const reference = `REQ-2026-${Math.floor(1_000_000 + Math.random() * 9_000_000)}`;
  const queueTotal = 89_400 + Math.floor(Math.random() * 200);
  const queuePosition = queueTotal - Math.floor(Math.random() * 3);
  const delayDays = 47_000 + Math.floor(Math.random() * 1_000);
  return { reference, queuePosition, queueTotal, delayDays };
}

export async function notesRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/api/notes/status',
    { preHandler: requireSession },
    async (request) => {
      const { state } = getRequiredSession(request);
      return state.notes;
    },
  );

  app.post(
    '/api/notes/request',
    { preHandler: requireSession },
    async (request) => {
      const { id, state } = getRequiredSession(request);
      const snapshot = generateSnapshot();
      state.notes = { snapshot };
      await saveSession(id);
      return snapshot;
    },
  );
}
