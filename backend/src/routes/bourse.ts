import type { FastifyInstance } from 'fastify';
import { getRequiredSession, requireSession } from '../services/auth.js';
import { validateBourseForm, type FormFields } from '../services/bourse.js';
import { validateCodeB } from '../services/codes.js';
import { convertBulletinCode } from '../services/courseCodes.js';
import { getActiveFlow } from '../services/timer.js';
import { saveSession } from '../state/store.js';

type FormBody = Partial<FormFields>;
type ConvertBody = { bulletinCode?: string };
type CourseSelectionBody = { courseCodes?: unknown };
type SubmitBody = { codeB?: string };

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

  app.post<{ Body: CourseSelectionBody }>(
    '/api/bourse/course-selection',
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

      const { courseCodes } = request.body ?? {};
      if (!Array.isArray(courseCodes) || courseCodes.length !== 3) {
        return reply.code(400).send({ error: 'MISSING_CODES' });
      }

      for (const code of courseCodes) {
        if (typeof code !== 'string' || !state.bourse.convertedCodes.includes(code)) {
          return reply.code(400).send({ error: 'NOT_ENROLLED', courseCode: code });
        }
      }

      state.bourse.coursesSelected = true;
      await saveSession(id);
      return { ok: true };
    },
  );

  app.post<{ Body: SubmitBody }>(
    '/api/bourse/submit',
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

      if (!state.bourse.coursesSelected) {
        return reply.code(400).send({ error: 'COURSES_NOT_SELECTED' });
      }

      // Validate Code B
      const { codeB } = request.body ?? {};
      if (!codeB) {
        return reply.code(400).send({ error: 'CODE_B_REQUIRED' });
      }

      if (!validateCodeB(state, codeB)) {
        return reply.code(400).send({ error: 'INVALID_CODE_B' });
      }

      state.bourse.balance = 0;
      state.flow = null;
      await saveSession(id);
      return { ok: true };
    },
  );

  app.post(
    '/api/bourse/cancel',
    { preHandler: requireSession },
    async (request, reply) => {
      const { id, state } = getRequiredSession(request);
      state.flow = null;
      await saveSession(id);
      return { ok: true };
    },
  );
}
