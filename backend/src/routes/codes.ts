import type { FastifyInstance } from 'fastify';
import { getRequiredSession, requireSession } from '../services/auth.js';
import { init2FA, verify2FA, exchangeCodeA } from '../services/codes.js';
import { getActiveFlow } from '../services/timer.js';
import { sendEmail } from '../services/email.js';
import { saveSession } from '../state/store.js';

type Init2FABody = { email?: string };
type Verify2FABody = { code?: string; email?: string };
type ExchangeCodeABody = { codeA?: string };

const TEMPLATE_2FA = process.env.EMAILJS_TEMPLATE_2FA ?? 'template_2fa';
const TEMPLATE_CODE_A = process.env.EMAILJS_TEMPLATE_CODE_A ?? 'template_code_a';

export async function codesRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: Init2FABody }>(
    '/api/codes/init-2fa',
    { preHandler: requireSession },
    async (request, reply) => {
      const { id, state } = getRequiredSession(request);

      const flow = getActiveFlow(state);
      if (!flow.ok) {
        return reply.code(400).send({ error: flow.reason });
      }

      const { email } = request.body ?? {};
      if (!email) {
        return reply.code(400).send({ error: 'EMAIL_REQUIRED' });
      }

      const { code2FA } = init2FA(state);

      try {
        await sendEmail({
          templateId: TEMPLATE_2FA,
          to: email.trim(),
          vars: { code: code2FA },
        });
      } catch (err) {
        console.error('[codes] Failed to send 2FA email:', err);
        return reply.code(500).send({ error: 'EMAIL_SEND_FAILED' });
      }

      await saveSession(id);
      return { ok: true };
    },
  );

  app.post<{ Body: Verify2FABody }>(
    '/api/codes/verify-2fa',
    { preHandler: requireSession },
    async (request, reply) => {
      const { id, state } = getRequiredSession(request);

      const flow = getActiveFlow(state);
      if (!flow.ok) {
        return reply.code(400).send({ error: flow.reason });
      }

      const { code } = request.body ?? {};
      if (!code) {
        return reply.code(400).send({ error: 'CODE_REQUIRED' });
      }

      const result = verify2FA(state, code);
      if (!result.ok) {
        return reply.code(400).send({ error: result.reason });
      }

      const email = request.body.email ?? 'student@example.com';

      try {
        await sendEmail({
          templateId: TEMPLATE_CODE_A,
          to: email.trim(),
          vars: { codeA: result.codeA },
        });
      } catch (err) {
        console.error('[codes] Failed to send Code A email:', err);
        return reply.code(500).send({ error: 'EMAIL_SEND_FAILED' });
      }

      await saveSession(id);
      return { ok: true };
    },
  );

  app.post<{ Body: ExchangeCodeABody }>(
    '/api/codes/exchange-a-for-b',
    { preHandler: requireSession },
    async (request, reply) => {
      const { id, state } = getRequiredSession(request);

      const flow = getActiveFlow(state);
      if (!flow.ok) {
        return reply.code(400).send({ error: flow.reason });
      }

      const { codeA } = request.body ?? {};
      if (!codeA) {
        return reply.code(400).send({ error: 'CODE_A_REQUIRED' });
      }

      const result = exchangeCodeA(state, codeA);
      if (!result.ok) {
        return reply.code(400).send({ error: result.reason });
      }

      await saveSession(id);
      return { codeB: result.codeB };
    },
  );
}
