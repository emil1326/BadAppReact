import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticPlugin from '@fastify/static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authRoutes } from './routes/auth.js';
import { bourseRoutes } from './routes/bourse.js';
import { bulletinRoutes } from './routes/bulletin.js';
import { codesRoutes } from './routes/codes.js';
import { notesRoutes } from './routes/notes.js';
import { profileRoutes } from './routes/profile.js';
import { sessionRoutes } from './routes/session.js';
import { vignetteRoutes } from './routes/vignette.js';
import { closeBulletinBrowser } from './services/bulletin.js';
import { loadSessions } from './state/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? '127.0.0.1';

const app = Fastify({ logger: true });

// Accept any localhost origin so the Vite dev server works regardless of which
// port it picks (5173 / 5174 / 5175 if previous instances are still running).
const LOCALHOST_DEV_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

await app.register(cors, {
  origin: LOCALHOST_DEV_ORIGIN,
  allowedHeaders: ['Content-Type', 'X-Session-Id'],
});

await app.register(staticPlugin, {
  root: path.resolve(__dirname, '..', 'data'),
  prefix: '/data/',
});

await app.register(authRoutes);
await app.register(bourseRoutes);
await app.register(bulletinRoutes);
await app.register(codesRoutes);
await app.register(notesRoutes);
await app.register(profileRoutes);
await app.register(sessionRoutes);
await app.register(vignetteRoutes);

app.addHook('onClose', async () => {
  await closeBulletinBrowser();
});

app.get('/api/health', async () => ({ status: 'ok', uptime: process.uptime() }));

loadSessions();

const startedAt = performance.now();
try {
  const address = await app.listen({ port: PORT, host: HOST });
  const bootMs = (performance.now() - startedAt).toFixed(1);
  console.log(`\n  Fastify ready at ${address}  (boot: ${bootMs}ms)`);
  console.log(`  Static data served at ${address}/data/*\n`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
