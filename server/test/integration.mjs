import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { createPool } from '../db.mjs';
import { migrate } from '../migrate.mjs';
import { createApi } from '../api.mjs';
import { deliverHooks, runJobs } from '../jobs.mjs';

if (!process.env.TEST_DATABASE_URL || !process.env.TEST_AUTH_URL) throw new Error('Use an isolated test database and Auth service');
const pool = createPool(process.env.TEST_DATABASE_URL);
let api, baseUrl, token, userId, questionId, optionId, hookServer, hookUrl;
const headers = () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });
const post = (path, body, authenticated = true) => fetch(baseUrl + '/functions/v1/' + path, { method: 'POST', headers: authenticated ? headers() : { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const profile = () => ({ user_id: userId, age: 30, gender: 'female', state: 'NY', race_ethnicity: 'asian', income_bracket: '50k-75k', occupation: 'engineer', political_party: 'independent', political_leaning: 'moderate', employment_status: 'employed', citizenship_status: 'citizen' });

before(async () => {
  // The test runner never resets a database: it requires a fresh one and proves migrations can rerun.
  await migrate(pool, { waitMs: 60000 });
  await migrate(pool, { waitMs: 0 });
  api = createApi({ pool, authUrl: process.env.TEST_AUTH_URL, env: { PUBLIC_API_KEY: 'everybody-polls-public' } });
  api.listen(0, '127.0.0.1'); await once(api, 'listening');
  baseUrl = `http://127.0.0.1:${api.address().port}`;
  const signup = await fetch(baseUrl + '/auth/v1/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `render-${randomUUID()}@example.com`, password: 'local-test-password-123' }) });
  const session = await signup.json();
  assert.equal(signup.status, 200, JSON.stringify(session));
  token = session.access_token; userId = session.user.id;
  assert.ok(token);
  questionId = randomUUID(); optionId = randomUUID();
  await pool.query(`INSERT INTO questions(id, text, start_date, end_date, is_active) VALUES ($1, 'Integration question', now() - interval '1 hour', now() + interval '1 day', true)`, [questionId]);
  await pool.query('INSERT INTO options(id, question_id, text) VALUES ($1, $2, $3)', [optionId, questionId, 'Yes']);
});
after(async () => {
  if (api) { const closed = once(api, 'close'); api.close(); api.closeAllConnections(); await closed; }
  if (hookServer) { hookServer.closeAllConnections(); hookServer.close(); }
  await pool.end();
});

test('migrations are tracked once and readiness checks both database and auth', async () => {
  assert.equal((await pool.query('SELECT count(*)::integer AS n FROM render_schema_migrations')).rows[0].n, 4);
  assert.equal((await fetch(baseUrl + '/healthz')).status, 200);
});
test('Supabase-compatible signup, password login and user lookup work through gateway', async () => {
  const me = await fetch(baseUrl + '/auth/v1/user', { headers: headers() });
  const user = await me.json();
  assert.equal(user.id, userId);
  const login = await fetch(baseUrl + '/auth/v1/token?grant_type=password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, password: 'local-test-password-123' }) });
  assert.equal(login.status, 200);
  assert.ok((await login.json()).refresh_token);
  assert.equal((await fetch(baseUrl + '/auth/v1/admin/users', { headers: headers() })).status, 404);
});
test('public reads work, supplied user IDs cannot impersonate another account', async () => {
  const result = await fetch(baseUrl + '/functions/v1/active-question');
  assert.equal(result.status, 200);
  assert.equal((await result.json()).id, questionId);
  assert.equal((await fetch(baseUrl + '/functions/v1/active-question?userId=' + userId)).status, 401);
  assert.equal((await fetch(baseUrl + '/functions/v1/active-question?userId=' + randomUUID(), { headers: headers() })).status, 403);
  assert.equal((await post('submit-vote', { questionId, optionId, userId }, false)).status, 401);
  assert.equal((await post('submit-vote', { questionId, optionId, userId: randomUUID() })).status, 403);
  assert.equal((await post('submit-vote', { questionId, optionId, userId })).status, 403);
});
test('onboarding saves only the session owner and updates GoTrue metadata', async () => {
  assert.equal((await post('submit-onboarding', { onboarding: { ...profile(), user_id: randomUUID() } })).status, 403);
  assert.equal((await post('submit-onboarding', { onboarding: profile() })).status, 200);
  const user = await (await fetch(baseUrl + '/auth/v1/user', { headers: headers() })).json();
  assert.equal(user.user_metadata.completed_profile, true);
});
test('database constraints prevent concurrent duplicate votes and cross-question options', async () => {
  const invalid = await post('submit-vote', { questionId, optionId: randomUUID(), userId });
  assert.equal(invalid.status, 400);
  const results = await Promise.all([post('submit-vote', { questionId, optionId, userId }), post('submit-vote', { questionId, optionId, userId })]);
  assert.deepEqual(results.map(response => response.status).sort(), [200, 409]);
  assert.equal((await post('submit-prediction', { questionId, optionId, userId })).status, 200);
  assert.equal((await post('submit-prediction', { questionId, optionId, userId })).status, 409);
});
test('filtered aggregates preserve contract and never expose respondents', async () => {
  const response = await fetch(`${baseUrl}/functions/v1/result-data/${questionId}?state=NY&age=26-35`, { headers: headers() });
  const data = await response.json();
  assert.equal(data.totalVotes, 1);
  assert.equal(data.user_vote, optionId);
  assert.equal(data.user_prediction, optionId);
  assert.equal(data.results[0].percentage, 100);
  assert.deepEqual(data.results[0].responses, []);
  assert.equal(data.stateResults[0].state, 'NY');
  const none = await (await fetch(`${baseUrl}/functions/v1/result-data/${questionId}?state=CA`)).json();
  assert.equal(none.totalVotes, 0);
});
test('rotation deactivates expired polls, activates a due poll, and queues hooks exactly once', async () => {
  await pool.query("UPDATE questions SET end_date = now() - interval '1 minute' WHERE id = $1", [questionId]);
  assert.equal((await post('submit-vote', { questionId, optionId, userId })).status, 400);
  const dueId = randomUUID();
  await pool.query(`INSERT INTO questions(id, text, start_date, end_date) VALUES ($1, 'Next poll', now() - interval '1 minute', now() + interval '1 day')`, [dueId]);
  await runJobs(pool, {});
  await runJobs(pool, {});
  assert.equal((await pool.query('SELECT id FROM questions WHERE is_active')).rows[0].id, dueId);
  assert.equal((await pool.query("SELECT count(*)::integer AS n FROM hook_events WHERE event_type = 'question.activated' AND payload->'record'->>'id' = $1", [dueId])).rows[0].n, 1);
  assert.equal((await pool.query('SELECT count(*)::integer AS n FROM question_rotation_logs')).rows[0].n, 1);
  const event = (await pool.query("SELECT payload FROM hook_events WHERE event_type = 'question.rotation'")).rows[0];
  assert.equal(event.payload.questions.id, dueId);
  assert.equal(event.payload.questions.text, 'Next poll');
  assert.ok(event.payload.questions.start_date);
  assert.ok(event.payload.questions.end_date);
});
test('failed hooks retry from persisted delivery state without repeating successful deliveries', async () => {
  let accepted = false, calls = 0;
  hookServer = createServer(async (req, res) => {
    for await (const chunk of req) { void chunk; }
    calls++;
    assert.ok(req.headers['idempotency-key']);
    assert.match(req.headers['x-hook-signature'], /^sha256=[a-f0-9]{64}$/);
    res.writeHead(accepted ? 204 : 503); res.end();
  });
  hookServer.listen(0, '127.0.0.1'); await once(hookServer, 'listening');
  hookUrl = `http://127.0.0.1:${hookServer.address().port}`;
  const env = { QUESTION_ACTIVATED_WEBHOOK_URL: hookUrl, HOOK_SIGNING_SECRET: 'local-test-signing-key' };
  const first = await deliverHooks(pool, env);
  assert.equal(first.failed, 2);
  assert.equal(first.delivered, 0);
  await deliverHooks(pool, env);
  assert.equal(calls, 2);
  await pool.query('UPDATE hook_deliveries SET available_at = now()');
  accepted = true;
  const retried = await deliverHooks(pool, env);
  assert.equal(retried.delivered, 2);
  await deliverHooks(pool, env);
  assert.equal(calls, 4);
});

test('recovered Discord reports and OneSignal pushes retry rejected receipts independently', async () => {
  const env = { DISCORD_WEBHOOK_URL: 'https://discord.invalid/local-test', ONESIGNAL_REST_API_KEY: 'local-test-key', ONESIGNAL_APP_ID: randomUUID(), ONESIGNAL_SEGMENT: 'Total Subscriptions' };
  let rejectPush = true, discordCalls = 0, pushCalls = 0;
  const send = async (url, request) => {
    const body = JSON.parse(request.body);
    if (url === env.DISCORD_WEBHOOK_URL) {
      discordCalls++;
      const fields = Object.fromEntries(body.embeds[0].fields.map(field => [field.name, field.value]));
      assert.equal(fields['New Active Question'], 'Next poll');
      assert.match(fields['Question Period'], /^From .* to /);
      assert.ok(fields['Execution Time']);
      assert.deepEqual(body.allowed_mentions.parse, []);
      return new Response(null, { status: 204 });
    }
    assert.equal(url, 'https://api.onesignal.com/notifications');
    pushCalls++;
    assert.equal(request.headers.Authorization, 'Key local-test-key');
    assert.equal(body.app_id, env.ONESIGNAL_APP_ID);
    assert.deepEqual(body.included_segments, ['Total Subscriptions']);
    assert.equal(body.target_channel, 'push');
    assert.equal(body.headings.en, 'New Poll!');
    assert.match(body.contents.en, /^New question available: ".*". Available until /);
    assert.equal(body.idempotency_key, request.headers['Idempotency-Key']);
    return new Response(JSON.stringify(rejectPush ? { errors: ['No subscribed devices'] } : { id: randomUUID() }), { status: 200 });
  };
  assert.deepEqual(await deliverHooks(pool, env, send), { delivered: 1, failed: 2 });
  assert.equal(discordCalls, 1);
  assert.equal(pushCalls, 2);
  await pool.query("UPDATE hook_deliveries SET available_at = now() WHERE destination = 'onesignal'");
  rejectPush = false;
  assert.deepEqual(await deliverHooks(pool, env, send), { delivered: 2, failed: 0 });
  assert.equal(discordCalls, 1);
  assert.equal(pushCalls, 4);
  assert.deepEqual(await deliverHooks(pool, env, send), { delivered: 0, failed: 0 });
});


test('self-delete removes only the authenticated account and rejects all old sessions and in-flight writes', { timeout: 20000 }, async () => {
  const signup = await fetch(baseUrl + '/auth/v1/signup', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `delete-${randomUUID()}@example.com`, password: 'local-delete-test-password-123' }),
  });
  assert.equal(signup.status, 200);
  const first = await signup.json();
  const ownId = first.user.id;
  const ownHeaders = { Authorization: `Bearer ${first.access_token}`, 'Content-Type': 'application/json' };
  const login = await fetch(baseUrl + '/auth/v1/token?grant_type=password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: first.user.email, password: 'local-delete-test-password-123' }),
  });
  assert.equal(login.status, 200);
  const second = await login.json();
  const ownProfile = { ...profile(), user_id: ownId };
  assert.equal((await fetch(baseUrl + '/functions/v1/submit-onboarding', { method: 'POST', headers: ownHeaders, body: JSON.stringify({ onboarding: ownProfile }) })).status, 200);
  await pool.query('INSERT INTO public.answers(user_id, question_id, option_id) VALUES ($1, $2, $3)', [ownId, questionId, optionId]);
  await pool.query('INSERT INTO public.predictions(user_id, question_id, option_id) VALUES ($1, $2, $3)', [ownId, questionId, optionId]);
  await pool.query('INSERT INTO public.push_tokens(user_id, token) VALUES ($1, $2)', [ownId, 'local-test-' + randomUUID()]);
  await pool.query('INSERT INTO auth.refresh_tokens(user_id, token, revoked, created_at, updated_at) VALUES ($1, $2, false, now(), now())', [ownId, randomUUID()]);
  assert.ok((await pool.query('SELECT count(*)::integer AS n FROM auth.sessions WHERE user_id = $1', [ownId])).rows[0].n >= 2);
  assert.ok((await pool.query('SELECT count(*)::integer AS n FROM auth.identities WHERE user_id = $1', [ownId])).rows[0].n > 0);
  const survivorAuditId = randomUUID();
  for (const [id, payload] of [
    [randomUUID(), { actor_id: ownId, actor_username: first.user.email, action: 'test-own-account' }],
    [randomUUID(), { actor_id: userId, traits: { user_id: ownId, user_email: first.user.email }, action: 'test-admin-target' }],
    [survivorAuditId, { actor_id: userId, action: 'test-survivor' }],
  ]) await pool.query('INSERT INTO auth.audit_log_entries(id, payload, created_at) VALUES ($1, $2::json, now())', [id, JSON.stringify(payload)]);
  const last = await (await fetch(baseUrl + '/functions/v1/last-active-question', { headers: ownHeaders })).json();
  assert.equal(last.user_vote, optionId);
  assert.equal(last.user_prediction, optionId);

  const remove = (body, requestHeaders = ownHeaders) => fetch(baseUrl + '/functions/v1/account', { method: 'DELETE', headers: requestHeaders, body: JSON.stringify(body) });
  assert.equal((await remove({ confirmation: 'DELETE' }, { 'Content-Type': 'application/json', Authorization: 'Bearer everybody-polls-public' })).status, 401);
  assert.equal((await remove({ confirmation: 'delete' })).status, 400);
  assert.equal((await remove({ confirmation: 'DELETE', userId })).status, 400);
  assert.equal((await pool.query('SELECT count(*)::integer AS n FROM auth.users WHERE id IN ($1, $2)', [ownId, userId])).rows[0].n, 2);

  let validated, release;
  const authValidated = new Promise(resolve => { validated = resolve; });
  const holdAuthResult = new Promise(resolve => { release = resolve; });
  const delayed = createApi({ pool, authUrl: process.env.TEST_AUTH_URL, env: {}, fetchImpl: async (url, options) => {
    const result = await fetch(url, options);
    if (url.endsWith('/user') && result.ok) { validated(); await holdAuthResult; }
    return result;
  } });
  delayed.listen(0, '127.0.0.1'); await once(delayed, 'listening');
  let pendingWrite;
  try {
    pendingWrite = fetch(`http://127.0.0.1:${delayed.address().port}/functions/v1/submit-onboarding`, {
      method: 'POST', headers: ownHeaders, body: JSON.stringify({ onboarding: ownProfile }), signal: AbortSignal.timeout(10000),
    });
    await authValidated;
    const deleted = await remove({ confirmation: 'DELETE' });
    assert.equal(deleted.status, 200);
    assert.deepEqual(await deleted.json(), { deleted: true });
    release();
    assert.equal((await pendingWrite).status, 401);
  } finally {
    release();
    if (pendingWrite) await pendingWrite.catch(() => {});
    delayed.closeAllConnections();
    await new Promise(resolve => delayed.close(resolve));
  }

  for (const table of ['users', 'identities', 'sessions']) {
    const column = table === 'users' ? 'id' : 'user_id';
    assert.equal((await pool.query(`SELECT count(*)::integer AS n FROM auth.${table} WHERE ${column} = $1`, [ownId])).rows[0].n, 0);
  }
  assert.equal((await pool.query('SELECT count(*)::integer AS n FROM auth.refresh_tokens WHERE user_id = $1', [ownId])).rows[0].n, 0);
  assert.equal((await pool.query(`SELECT count(*)::integer AS n FROM auth.audit_log_entries
    WHERE payload->>'actor_id' = $1 OR payload->'traits'->>'user_id' = $1`, [ownId])).rows[0].n, 0);
  assert.equal((await pool.query('SELECT count(*)::integer AS n FROM auth.audit_log_entries WHERE id = $1', [survivorAuditId])).rows[0].n, 1);
  for (const table of ['demographics', 'answers', 'predictions', 'push_tokens']) {
    assert.equal((await pool.query(`SELECT count(*)::integer AS n FROM public.${table} WHERE user_id = $1`, [ownId])).rows[0].n, 0);
  }
  for (const accessToken of [first.access_token, second.access_token]) {
    const staleHeaders = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
    assert.equal((await fetch(baseUrl + '/functions/v1/submit-onboarding', { method: 'POST', headers: staleHeaders, body: JSON.stringify({ onboarding: ownProfile }) })).status, 401);
    assert.equal((await fetch(baseUrl + '/functions/v1/submit-vote', { method: 'POST', headers: staleHeaders, body: JSON.stringify({ questionId, optionId }) })).status, 401);
    assert.equal((await fetch(baseUrl + '/functions/v1/submit-prediction', { method: 'POST', headers: staleHeaders, body: JSON.stringify({ questionId, optionId }) })).status, 401);
    assert.equal((await fetch(baseUrl + '/functions/v1/account', { method: 'DELETE', headers: staleHeaders, body: JSON.stringify({ confirmation: 'DELETE' }) })).status, 401);
    assert.notEqual((await fetch(baseUrl + '/auth/v1/user', { headers: staleHeaders })).status, 200);
  }
  for (const refreshToken of [first.refresh_token, second.refresh_token]) {
    assert.equal((await fetch(baseUrl + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: refreshToken }) })).status, 400);
  }
  assert.equal((await fetch(baseUrl + '/auth/v1/user', { headers: headers() })).status, 200);
  assert.equal((await pool.query('SELECT count(*)::integer AS n FROM public.answers WHERE user_id = $1', [userId])).rows[0].n, 1);
});
