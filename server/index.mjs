import { createPool } from './db.mjs';
import { createApi } from './api.mjs';

const authUrl = process.env.AUTH_URL ?? (process.env.AUTH_HOSTPORT ? `http://${process.env.AUTH_HOSTPORT}` : '');
if (!authUrl) throw new Error('AUTH_URL or AUTH_HOSTPORT is required');
const pool = createPool();
const server = createApi({ pool, authUrl: authUrl.replace(/\/$/, '') });
server.listen(Number(process.env.PORT ?? 10000), '0.0.0.0', () => console.log('Everybody Polls API ready'));
for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => {
  server.close(async () => { await pool.end(); process.exit(0); });
  setTimeout(() => process.exit(1), 25000).unref();
});
