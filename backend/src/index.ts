import Fastify from 'fastify';
import cors from '@fastify/cors';

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? '127.0.0.1';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
});

app.get('/api/health', async () => ({ status: 'ok', uptime: process.uptime() }));

app.get('/api/hello', async (req) => {
  const name = (req.query as { name?: string }).name ?? 'world';
  return { message: `hello, ${name}!` };
});

const startedAt = performance.now();
try {
  const address = await app.listen({ port: PORT, host: HOST });
  const bootMs = (performance.now() - startedAt).toFixed(1);
  console.log(`\n  Fastify ready at ${address}  (boot: ${bootMs}ms)\n`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
