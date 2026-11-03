import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPool, transaction } from './db.mjs';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Operator-only code. No public route or notification request is exposed here.
export async function createPollDraft(pool, { id = randomUUID(), text, options }) {
  if (!uuid.test(id) || typeof text !== 'string' || !text.trim() || text.length > 300) throw new Error('A valid ID and question (1–300 characters) are required');
  if (!Array.isArray(options) || options.length !== 2 || options.some(value => typeof value !== 'string' || !value.trim() || value.length > 100) || new Set(options.map(value => value.trim().toLowerCase())).size !== 2) throw new Error('Two distinct choices (1–100 characters each) are required');
  text = text.trim(); options = options.map(value => value.trim());
  return transaction(pool, async client => {
    await client.query('SELECT pg_advisory_xact_lock(18271102)');
    const existing = (await client.query('SELECT id, text, is_draft FROM public.questions WHERE id = $1 FOR UPDATE', [id])).rows[0];
    if (existing) {
      const choices = (await client.query('SELECT text FROM public.options WHERE question_id = $1 ORDER BY text', [id])).rows.map(row => row.text).sort();
      if (!existing.is_draft || existing.text !== text || JSON.stringify(choices) !== JSON.stringify([...options].sort())) throw new Error('This ID already belongs to a different or published poll');
      return { ...existing, options: choices };
    }
    await client.query('INSERT INTO public.questions(id, text, is_draft) VALUES ($1, $2, true)', [id, text]);
    for (const choice of options) await client.query('INSERT INTO public.options(question_id, text) VALUES ($1, $2)', [id, choice]);
    return { id, text, is_draft: true, options };
  });
}

export async function publishPoll(pool, { id, startDate, endDate }) {
  const start = new Date(startDate), end = new Date(endDate);
  if (!uuid.test(id) || !Number.isFinite(+start) || !Number.isFinite(+end) || end <= start) throw new Error('A valid poll ID and increasing start/end timestamps are required');
  return transaction(pool, async client => {
    await client.query('SELECT pg_advisory_xact_lock(18271102)');
    const question = (await client.query('SELECT id, is_draft FROM public.questions WHERE id = $1 FOR UPDATE', [id])).rows[0];
    if (!question?.is_draft) throw new Error('Only an existing draft can be published');
    const choices = await client.query('SELECT id FROM public.options WHERE question_id = $1', [id]);
    if (choices.rowCount !== 2) throw new Error('A community poll needs exactly two choices');
    const conflict = await client.query(`SELECT id FROM public.questions
      WHERE NOT is_draft AND id <> $1 AND end_date > now()
        AND start_date < $3::timestamptz AND end_date > $2::timestamptz
      LIMIT 1 FOR SHARE`, [id, start.toISOString(), end.toISOString()]);
    if (conflict.rowCount) throw new Error('The voting window overlaps a published poll');
    const scheduled = await client.query(`UPDATE public.questions SET is_draft = false, start_date = $2, end_date = $3
      WHERE id = $1 AND $3::timestamptz > now() RETURNING id, text, start_date, end_date, is_draft`, [id, start.toISOString(), end.toISOString()]);
    if (!scheduled.rowCount) throw new Error('The poll must close in the future');
    await client.query('SELECT public.rotate_active_question()');
    return scheduled.rows[0];
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, ...args] = process.argv.slice(2);
  if (!['draft', 'publish'].includes(command) || (command === 'draft' && args.length !== 4) || (command === 'publish' && args.length !== 3)) {
    throw new Error('Usage: node polls.mjs draft UUID "Question?" "Choice one" "Choice two" | publish UUID START_ISO END_ISO. Publishing queues configured activation/rotation notifications.');
  }
  const pool = createPool();
  try {
    const result = command === 'draft'
      ? await createPollDraft(pool, { id: args[0], text: args[1], options: args.slice(2) })
      : await publishPoll(pool, { id: args[0], startDate: args[1], endDate: args[2] });
    console.log(JSON.stringify(result));
  } finally { await pool.end(); }
}
