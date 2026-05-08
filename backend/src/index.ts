import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticPlugin from '@fastify/static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authRoutes } from './routes/auth.js';
import { sessionRoutes } from './routes/session.js';

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
await app.register(sessionRoutes);

app.get('/api/health', async () => ({ status: 'ok', uptime: process.uptime() }));

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
