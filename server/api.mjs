import { createServer } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { transaction } from './db.mjs';
import { deliverHooks } from './jobs.mjs';

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const profileFields = ['gender', 'state', 'race_ethnicity', 'income_bracket', 'occupation', 'political_party', 'political_leaning', 'employment_status', 'citizenship_status'];
const filterAliases = { citizenship: 'citizenship_status', employment: 'employment_status' };
function uuid(value) {
  if (!uuidPattern.test(value ?? '')) throw new HttpError(400, 'Invalid identifier');
  return value;
}
async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > 65536) throw new HttpError(413, 'Request body too large');
  }
  return body;
}
async function readJson(request) {
  try { return JSON.parse(await readBody(request)); }
  catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, 'Invalid JSON'); }
}
function equalSecret(actual, expected) {
  if (!expected || typeof actual !== 'string') return false;
  const provided = Buffer.from(actual), configured = Buffer.from(expected);
  return provided.length === configured.length && timingSafeEqual(provided, configured);
}
export function buildFilters(params, values) {
  const clauses = [];
  for (const key of new Set(params.keys())) {
    if (key === 'userId') continue;
    const field = filterAliases[key] ?? key;
    if (field !== 'age' && !profileFields.includes(field)) throw new HttpError(400, `Unsupported demographic filter: ${key}`);
    const requested = params.getAll(key);
    if (requested.length > 120 || requested.some(value => value.length > 200)) throw new HttpError(400, 'Too many filter values');
    if (field === 'age') {
      const ranges = requested.map(value => {
        let min, max;
        if (/^\d+$/.test(value)) min = max = Number(value);
        else if (/^<\d+$/.test(value)) { min = 1; max = Number(value.slice(1)) - 1; }
        else if (/^\d+\+$/.test(value)) { min = Number(value.slice(0, -1)); max = 115; }
        else if (/^\d+-\d+$/.test(value)) [min, max] = value.split('-').map(Number);
        else throw new HttpError(400, 'Invalid age filter');
        if (min < 1 || max > 115 || min > max) throw new HttpError(400, 'Invalid age filter');
        values.push(min, max);
        return `d.age BETWEEN $${values.length - 1} AND $${values.length}`;
      });
      clauses.push(`(${ranges.join(' OR ')})`);
    } else {
      values.push(requested);
      clauses.push(`d.${field} = ANY($${values.length}::text[])`);
    }
  }
  return clauses.length ? ' AND ' + clauses.join(' AND ') : '';
}

export function createApi({ pool, authUrl, env = process.env, fetchImpl = fetch }) {
  const allowedOrigins = new Set((env.CORS_ORIGINS ?? 'https://everybodypolls.com,https://www.everybodypolls.com').split(',').map(value => value.trim()));
  const send = (response, status, body) => {
    response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify(body));
  };
  async function userFor(request, requestedId, required = false) {
    const header = request.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token || token === (env.PUBLIC_API_KEY ?? 'everybody-polls-public')) {
      if (required || requestedId) throw new HttpError(401, 'Authentication required');
      return null;
    }
    let result;
    try { result = await fetchImpl(`${authUrl}/user`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) }); }
    catch { throw new HttpError(503, 'Authentication service unavailable'); }
    if (!result.ok) throw new HttpError(result.status >= 500 ? 503 : 401, 'Invalid or expired session');
    const user = await result.json();
    uuid(user.id);
    if (requestedId && requestedId !== user.id) throw new HttpError(403, 'Cannot act for another user');
    return user;
  }
  async function lockUserForWrite(client, userId) {
    // Serialize writes with account deletion, including requests authenticated before deletion began.
    const current = await client.query('SELECT id FROM auth.users WHERE id = $1 FOR KEY SHARE', [userId]);
    if (!current.rowCount) throw new HttpError(401, 'Invalid or expired session');
  }
  async function questionData(client, question, user) {
    const options = (await client.query('SELECT id, text FROM public.options WHERE question_id = $1 ORDER BY id', [question.id])).rows;
    const mine = user ? (await client.query(`SELECT
      (SELECT option_id FROM public.answers WHERE question_id = $1 AND user_id = $2) AS user_vote,
      (SELECT option_id FROM public.predictions WHERE question_id = $1 AND user_id = $2) AS user_prediction`, [question.id, user.id])).rows[0] : null;
    return { ...question, options, user_vote: mine?.user_vote ?? null, user_prediction: mine?.user_prediction ?? null };
  }

  return createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    const origin = request.headers.origin;
    if (origin && !allowedOrigins.has(origin)) return send(response, 403, { error: 'Origin not allowed' });
    if (origin) { response.setHeader('Access-Control-Allow-Origin', origin); response.setHeader('Vary', 'Origin'); }
    response.setHeader('Access-Control-Allow-Headers', 'authorization, apikey, content-type, x-client-info, x-supabase-api-version, x-hook-token');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (request.method === 'OPTIONS') { response.writeHead(204); return response.end(); }
    const url = new URL(request.url, 'http://api.internal');
    const path = url.pathname.replace(/\/$/, '');
    try {
      if (path === '/healthz' && request.method === 'GET') {
        await pool.query('SELECT 1 FROM public.render_schema_migrations LIMIT 1');
        const auth = await fetchImpl(`${authUrl}/health`, { signal: AbortSignal.timeout(3000) });
        if (!auth.ok) throw new HttpError(503, 'Authentication service unavailable');
        return send(response, 200, { status: 'ok' });
      }
      if (path.startsWith('/auth/v1/')) {
        const authPath = path.slice('/auth/v1'.length);
        // Admin endpoints are private. Public callers cannot supply privileged proxy headers.
        if (!/^\/(health|settings|signup|token|logout|recover|verify|resend|user|authorize|callback|factors|sso|reauthenticate|invite)(\/|$)/.test(authPath) || authPath.startsWith('/invite')) throw new HttpError(404, 'Not found');
        const headers = { 'X-Forwarded-Proto': 'https' };
        for (const key of ['authorization', 'content-type', 'x-client-info', 'x-supabase-api-version', 'accept']) if (request.headers[key]) headers[key] = request.headers[key];
        const upstream = await fetchImpl(`${authUrl}${authPath}${url.search}`, {
          method: request.method, headers, redirect: 'manual', signal: AbortSignal.timeout(15000),
          ...(!['GET', 'HEAD'].includes(request.method) ? { body: await readBody(request) } : {}),
        });
        for (const key of ['content-type', 'location', 'retry-after']) if (upstream.headers.has(key)) response.setHeader(key, upstream.headers.get(key));
        const cookies = upstream.headers.getSetCookie?.();
        if (cookies?.length) response.setHeader('Set-Cookie', cookies);
        const body = Buffer.from(await upstream.arrayBuffer());
        response.setHeader('Cache-Control', 'no-store');
        response.writeHead(upstream.status);
        return response.end(body);
      }
      if (path === '/functions/v1/account' && request.method === 'DELETE') {
        const user = await userFor(request, null, true);
        const body = await readJson(request);
        if (!body || Array.isArray(body) || body.confirmation !== 'DELETE' || Object.keys(body).some(key => key !== 'confirmation')) {
          throw new HttpError(400, 'Confirm account deletion with DELETE');
        }
        await transaction(pool, async client => {
          const current = await client.query('SELECT id FROM auth.users WHERE id = $1 FOR UPDATE', [user.id]);
          if (!current.rowCount) throw new HttpError(401, 'Invalid or expired session');
          // Include legacy refresh tokens without session_id; modern tokens also cascade through sessions.
          await client.query('DELETE FROM auth.refresh_tokens WHERE user_id = $1', [user.id]);
          // GoTrue audit entries have no user FK and may contain email/name or admin target traits.
          await client.query(`DELETE FROM auth.audit_log_entries
            WHERE payload->>'actor_id' = $1 OR payload->'traits'->>'user_id' = $1`, [user.id]);
          // Auth identities/sessions and all owned public data have ON DELETE CASCADE foreign keys.
          await client.query('DELETE FROM auth.users WHERE id = $1', [user.id]);
        });
        return send(response, 200, { deleted: true });
      }
      if (path === '/functions/v1/question-rotation-notification' && request.method === 'POST') {
        if (!equalSecret(request.headers['x-hook-token'], env.INTERNAL_HOOK_TOKEN)) throw new HttpError(401, 'Invalid hook token');
        return send(response, 200, await deliverHooks(pool, env));
      }
      if (['/functions/v1/active-question', '/functions/v1/last-active-question'].includes(path) && request.method === 'GET') {
        const user = await userFor(request, url.searchParams.get('userId'));
        const active = path.endsWith('/active-question');
        const question = (await pool.query(`SELECT * FROM public.questions WHERE ${active ? 'NOT is_draft AND is_active AND start_date <= now() AND end_date > now()' : 'NOT is_draft AND end_date <= now()'} ORDER BY ${active ? 'start_date' : 'end_date DESC'} LIMIT 1`)).rows[0];
        if (!question) throw new HttpError(404, active ? 'No active question found' : 'No previous questions found');
        return send(response, 200, await questionData(pool, question, user));
      }
      if (path === '/functions/v1/questions/history' && request.method === 'GET') {
        const user = await userFor(request, url.searchParams.get('userId'));
        const questions = (await pool.query('SELECT * FROM public.questions WHERE NOT is_draft AND end_date <= now() ORDER BY end_date DESC LIMIT 50')).rows;
        return send(response, 200, await Promise.all(questions.map(question => questionData(pool, question, user))));
      }
      if (path.startsWith('/functions/v1/result-data/') && request.method === 'GET') {
        const questionId = uuid(path.split('/').at(-1));
        const user = await userFor(request, url.searchParams.get('userId'));
        const question = (await pool.query('SELECT id, text FROM public.questions WHERE id = $1 AND NOT is_draft', [questionId])).rows[0];
        if (!question) throw new HttpError(404, 'Question not found');
        const values = [questionId];
        const filters = buildFilters(url.searchParams, values);
        const counts = (await pool.query(`SELECT a.option_id, d.state, count(*)::integer AS votes FROM public.answers a
          LEFT JOIN public.demographics d ON d.user_id = a.user_id
          WHERE a.question_id = $1 ${filters} GROUP BY a.option_id, d.state`, values)).rows;
        const options = (await pool.query('SELECT id, text FROM public.options WHERE question_id = $1 ORDER BY id', [questionId])).rows;
        const voteCounts = Object.fromEntries(options.map(option => [option.id, 0]));
        for (const row of counts) voteCounts[row.option_id] += row.votes;
        const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
        const results = options.map(option => ({ optionId: option.id, optionText: option.text, votes: voteCounts[option.id], percentage: totalVotes ? voteCounts[option.id] / totalVotes * 100 : 0, responses: [] }));
        const states = {};
        for (const row of counts) {
          if (!row.state) continue;
          states[row.state] ??= { state: row.state, totalVotes: 0, ...Object.fromEntries(options.map(option => [option.id, { text: option.text, votes: 0 }])) };
          states[row.state].totalVotes += row.votes;
          states[row.state][row.option_id].votes += row.votes;
        }
        const personal = user ? (await pool.query(`SELECT
          (SELECT option_id FROM public.answers WHERE user_id = $1 AND question_id = $2) AS user_vote,
          (SELECT option_id FROM public.predictions WHERE user_id = $1 AND question_id = $2) AS user_prediction`, [user.id, questionId])).rows[0] : { user_vote: null, user_prediction: null };
        return send(response, 200, { question, results, totalVotes, voteCounts, stateResults: Object.values(states), ...personal });
      }
      if (['/functions/v1/submit-vote', '/functions/v1/submit-prediction'].includes(path) && request.method === 'POST') {
        const body = await readJson(request);
        const user = await userFor(request, body.userId, true);
        const questionId = uuid(body.questionId), optionId = uuid(body.optionId);
        const isVote = path.endsWith('/submit-vote');
        const data = await transaction(pool, async client => {
          await lockUserForWrite(client, user.id);
          const eligible = await client.query(`SELECT q.id FROM public.questions q JOIN public.options o ON o.question_id = q.id
            WHERE q.id = $1 AND o.id = $2 AND NOT q.is_draft AND q.is_active AND q.start_date <= now() AND q.end_date > now() FOR SHARE OF q`, [questionId, optionId]);
          if (!eligible.rowCount) throw new HttpError(400, 'Question is closed or option is invalid');
          if (!(await client.query('SELECT 1 FROM public.demographics WHERE user_id = $1', [user.id])).rowCount) throw new HttpError(403, 'Complete your profile before voting');
          if (!isVote && !(await client.query('SELECT 1 FROM public.answers WHERE user_id = $1 AND question_id = $2', [user.id, questionId])).rowCount) throw new HttpError(400, 'Vote before making a prediction');
          try { return (await client.query(`INSERT INTO public.${isVote ? 'answers' : 'predictions'}(user_id, question_id, option_id) VALUES ($1, $2, $3) RETURNING id`, [user.id, questionId, optionId])).rows[0]; }
          catch (error) { if (error.code === '23505') throw new HttpError(409, isVote ? 'User has already voted on this question' : 'User has already made a prediction for this question'); throw error; }
        });
        return send(response, 200, { data });
      }
      if (path === '/functions/v1/submit-onboarding' && request.method === 'POST') {
        const body = await readJson(request);
        const profile = body.onboarding;
        if (!profile || typeof profile !== 'object') throw new HttpError(400, 'Onboarding profile required');
        const user = await userFor(request, profile.user_id, true);
        if (!Number.isInteger(profile.age) || profile.age < 1 || profile.age > 115 || profileFields.some(field => typeof profile[field] !== 'string' || !profile[field].trim() || profile[field].length > 200)) throw new HttpError(400, 'Invalid demographic profile');
        await transaction(pool, async client => {
          await lockUserForWrite(client, user.id);
          const fields = ['user_id', 'age', ...profileFields];
          const values = [user.id, profile.age, ...profileFields.map(field => profile[field].trim())];
          await client.query(`INSERT INTO public.demographics(${fields.join(',')}) VALUES (${values.map((_, index) => '$' + (index + 1)).join(',')})
            ON CONFLICT (user_id) DO UPDATE SET ${fields.slice(1).map(field => `${field} = EXCLUDED.${field}`).join(',')}`, values);
          await client.query(`UPDATE auth.users SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"completed_profile":true}'::jsonb, updated_at = now() WHERE id = $1`, [user.id]);
        });
        return send(response, 200, { data: { success: true, message: 'Profile completed successfully' } });
      }
      throw new HttpError(404, 'Not found');
    } catch (error) {
      const status = error.status ?? 500;
      if (status >= 500) console.error(JSON.stringify({ event: 'request_failed', path, code: error.code ?? error.name }));
      send(response, status, { error: status === 500 ? 'Internal server error' : error.message });
    }
  });
}
