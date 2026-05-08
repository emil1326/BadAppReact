import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticPlugin from '@fastify/static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? '127.0.0.1';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
});

// Serve everything under backend/data at /data/*
// e.g. backend/data/courses.json -> GET http://localhost:3001/data/courses.json
await app.register(staticPlugin, {
  root: path.resolve(__dirname, '..', 'data'),
  prefix: '/data/',
});

app.get('/api/health', async () => ({ status: 'ok', uptime: process.uptime() }));

const startedAt = performance.now();
try {
  const address = await app.listen({ port: PORT, host: HOST });
  const bootMs = (performance.now() - startedAt).toFixed(1);
  console.log(`\n  Fastify ready at ${address}  (boot: ${bootMs}ms)\n`);
  console.log(`  Static data served at ${address}/data/*\n`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
