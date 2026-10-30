import { createHmac } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPool } from './db.mjs';

export function destinations(env) {
  const list = [];
  if (env.QUESTION_ACTIVATED_WEBHOOK_URL) list.push({ name: 'question-webhook', event: 'question.activated', url: env.QUESTION_ACTIVATED_WEBHOOK_URL });
  if (env.DISCORD_WEBHOOK_URL) list.push({ name: 'discord', event: 'question.rotation', url: env.DISCORD_WEBHOOK_URL });
  if (env.ONESIGNAL_REST_API_KEY && env.ONESIGNAL_APP_ID) list.push({ name: 'onesignal', event: 'question.activated', url: 'https://api.onesignal.com/notifications' });
  return list;
}

export async function deliverHooks(pool, env = process.env, fetchImpl = fetch) {
  const client = await pool.connect();
  let locked = false;
  let delivered = 0, failed = 0;
  try {
    locked = (await client.query('SELECT pg_try_advisory_lock(18271103) AS locked')).rows[0].locked;
    if (!locked) return { delivered, failed, busy: true };
    for (const target of destinations(env)) {
      const url = new URL(target.url);
      if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname))) throw new Error('Hook destinations require HTTPS');
      await client.query(`INSERT INTO public.hook_deliveries(event_id, destination)
        SELECT id, $1 FROM public.hook_events WHERE event_type = $2 ON CONFLICT DO NOTHING`, [target.name, target.event]);
      const pending = (await client.query(`SELECT e.*, d.attempts FROM public.hook_deliveries d JOIN public.hook_events e ON e.id = d.event_id
        WHERE d.destination = $1 AND d.delivered_at IS NULL AND d.available_at <= now() AND d.attempts < 10
        ORDER BY e.created_at, e.id LIMIT 50`, [target.name])).rows;
      for (const event of pending) {
        const headers = { 'Content-Type': 'application/json', 'Idempotency-Key': event.id };
        let payload = { id: event.id, event: event.event_type, created_at: event.created_at, ...event.payload };
        if (target.name === 'discord') {
          payload = { username: 'Question Rotation Bot', embeds: [{
            title: event.payload.success ? 'Question Rotation Successful' : 'Question Rotation Failed',
            color: event.payload.success ? 5763719 : 15548997,
            fields: [{ name: 'Questions Deactivated', value: String(event.payload.deactivated_questions), inline: true },
              { name: 'Activated Question', value: event.payload.activated_question_id ?? 'None', inline: true }],
            timestamp: event.created_at,
          }] };
        } else if (target.name === 'onesignal') {
          headers.Authorization = `Key ${env.ONESIGNAL_REST_API_KEY}`;
          payload = { app_id: env.ONESIGNAL_APP_ID, included_segments: ['Subscribed Users'], target_channel: 'push',
            headings: { en: 'New poll available' }, contents: { en: event.payload.record.text },
            data: { questionId: event.payload.record.id }, idempotency_key: event.id };
        }
        const body = JSON.stringify(payload);
        if (env.HOOK_SIGNING_SECRET && target.name === 'question-webhook') headers['X-Hook-Signature'] = 'sha256=' + createHmac('sha256', env.HOOK_SIGNING_SECRET).update(body).digest('hex');
        try {
          const result = await fetchImpl(target.url, { method: 'POST', headers, body, redirect: 'error', signal: AbortSignal.timeout(10000) });
          if (!result.ok) throw new Error(`HTTP ${result.status}`);
          // Drain the body before releasing the HTTP connection.
          await result.arrayBuffer();
          await client.query(`UPDATE public.hook_deliveries SET delivered_at = now(), attempts = attempts + 1, last_error = NULL
            WHERE event_id = $1 AND destination = $2`, [event.id, target.name]);
          delivered++;
        } catch (error) {
          await client.query(`UPDATE public.hook_deliveries SET attempts = attempts + 1,
            available_at = now() + make_interval(secs => least(3600, (30 * power(2, attempts))::integer)), last_error = $3
            WHERE event_id = $1 AND destination = $2`, [event.id, target.name, /^HTTP \d+$/.test(error.message) ? error.message : 'Delivery failed']);
          failed++;
        }
      }
    }
    return { delivered, failed };
  } finally {
    if (locked) await client.query('SELECT pg_advisory_unlock(18271103)');
    client.release();
  }
}

export async function runJobs(pool, env = process.env) {
  try { await pool.query('SELECT public.rotate_active_question()'); }
  catch (error) {
    await pool.query(`INSERT INTO public.question_rotation_logs(success, error_message) VALUES (false, 'Rotation failed')`);
    throw error;
  }
  return deliverHooks(pool, env);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pool = createPool();
  try {
    const result = await runJobs(pool);
    console.log(JSON.stringify({ event: 'scheduled_jobs', ...result }));
    if (result.failed) process.exitCode = 1;
  } finally { await pool.end(); }
}
