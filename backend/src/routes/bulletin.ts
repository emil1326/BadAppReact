import type { FastifyInstance } from 'fastify';
import { generateBulletinPdf } from '../services/bulletin.js';

export async function bulletinRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/bulletin.pdf', async (_request, reply) => {
    const pdf = await generateBulletinPdf();
    return reply
      .header('Content-Type', 'application/pdf')
      .header(
        'Content-Disposition',
        'inline; filename="bulletin_hiver_2026.pdf"',
      )
      .header('Cache-Control', 'no-store')
      .send(pdf);
  });
}
