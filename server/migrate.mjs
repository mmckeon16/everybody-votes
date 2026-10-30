import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createPool } from './db.mjs';

export async function migrate(pool, { waitMs = 180000 } = {}) {
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock(18271101)');
    const deadline = Date.now() + waitMs;
    while (!(await client.query("SELECT to_regclass('auth.users') IS NOT NULL AS ready")).rows[0].ready) {
      if (Date.now() >= deadline) throw new Error('Supabase Auth must initialize auth.users before application migrations');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    await client.query(`CREATE TABLE IF NOT EXISTS public.render_schema_migrations (
      name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const directory = new URL('./migrations/', import.meta.url);
    for (const name of (await readdir(directory)).filter(name => name.endsWith('.sql')).sort()) {
      const sql = await readFile(new URL(name, directory), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const existing = (await client.query('SELECT checksum FROM public.render_schema_migrations WHERE name = $1', [name])).rows[0];
      if (existing) {
        if (existing.checksum !== checksum) throw new Error(`Applied migration was modified: ${name}`);
        continue;
      }
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO public.render_schema_migrations(name, checksum) VALUES ($1, $2)', [name, checksum]);
        await client.query('COMMIT');
        console.log(`Applied ${name}`);
      } catch (error) { await client.query('ROLLBACK'); throw error; }
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock(18271101)');
    client.release();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pool = createPool();
  try { await migrate(pool); } finally { await pool.end(); }
}
