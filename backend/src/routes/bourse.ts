import type { FastifyInstance } from 'fastify';
import { getRequiredSession, requireSession } from '../services/auth.js';
import { validateBourseForm, type FormFields } from '../services/bourse.js';
import { convertBulletinCode } from '../services/courseCodes.js';
import { getActiveFlow } from '../services/timer.js';
import { saveSession } from '../state/store.js';

type FormBody = Partial<FormFields>;
type ConvertBody = { bulletinCode?: string };

export async function bourseRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/api/bourse/balance',
    { preHandler: requireSession },
    async (request) => {
      const { state } = getRequiredSession(request);
      return { balance: state.bourse.balance };
    },
  );

  app.post<{ Body: FormBody }>(
    '/api/bourse/form',
    { preHandler: requireSession },
    async (request, reply) => {
      const { id, state } = getRequiredSession(request);

      if (state.profile.mode !== 'SOUMISSION') {
        return reply.code(403).send({ error: 'PROFILE_MODE_BLOCKS_SUBMIT' });
      }

      const flow = getActiveFlow(state);
      if (!flow.ok) {
        return reply.code(400).send({ error: flow.reason });
      }

      const { studentNumber, code1, code2, code3 } = request.body ?? {};
      if (!studentNumber || !code1 || !code2 || !code3) {
        return reply.code(400).send({ error: 'MISSING_FIELDS' });
      }

      const result = validateBourseForm(state, { studentNumber, code1, code2, code3 });
      if (!result.ok) {
        return reply.code(400).send({ error: 'INVALID_FIELDS', fields: result.fields });
      }

      await saveSession(id);
      return { ok: true };
    },
  );

  app.post<{ Body: ConvertBody }>(
    '/api/bourse/convert-code',
    { preHandler: requireSession },
    async (request, reply) => {
      const { id, state } = getRequiredSession(request);

      const flow = getActiveFlow(state);
      if (!flow.ok) {
        return reply.code(400).send({ error: flow.reason });
      }

      const { bulletinCode } = request.body ?? {};
      if (!bulletinCode) {
        return reply.code(400).send({ error: 'MISSING_CODE' });
      }

      const result = convertBulletinCode(bulletinCode.trim());
      if (result.kind === 'INVALID_SYNTAX') {
        return reply.code(400).send({ error: 'INVALID_SYNTAX' });
      }

      await new Promise<void>((resolve) => setTimeout(resolve, 1500));

      // Only "REAL" conversions persist in convertedCodes — decoys are not
      // recorded server-side, so course-selection later will reject them as
      // "pas inscrit à ce cours". The player sees a course code, doesn't
      // realize it's wrong, and only discovers the lie at submission time.
      if (result.kind === 'REAL' && !state.bourse.convertedCodes.includes(result.courseCode)) {
        state.bourse.convertedCodes.push(result.courseCode);
        await saveSession(id);
      }

      return { courseCode: result.courseCode };
    },
  );
}
