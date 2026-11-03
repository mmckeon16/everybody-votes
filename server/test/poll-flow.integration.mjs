import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { createPool } from '../db.mjs';
import { migrate } from '../migrate.mjs';
import { createApi } from '../api.mjs';
import { createPollDraft, publishPoll } from '../polls.mjs';

if (!process.env.TEST_DATABASE_URL || !process.env.TEST_AUTH_URL) throw new Error('Use the disposable local integration runner');

test('community poll: draft → publish → profile → vote → predict → close → filtered reveal', async () => {
  const pool = createPool(process.env.TEST_DATABASE_URL);
  let api;
  try {
    await migrate(pool);
    // A preceding suite leaves its Next poll active. Never alter an unknown poll.
    const previous = (await pool.query('SELECT id, text FROM public.questions WHERE is_active')).rows[0];
    if (previous) {
      assert.equal(previous.text, 'Next poll');
      await pool.query("UPDATE public.questions SET end_date = now() - interval '1 second' WHERE id = $1", [previous.id]);
      await pool.query('SELECT public.rotate_active_question()');
    }
    api = createApi({ pool, authUrl: process.env.TEST_AUTH_URL, env: {} });
    api.listen(0, '127.0.0.1'); await once(api, 'listening');
    const base = `http://127.0.0.1:${api.address().port}`;
    const get = (path, session) => fetch(base + '/functions/v1/' + path, { headers: session ? { Authorization: `Bearer ${session.access_token}` } : {} });
    const post = (path, body, session) => fetch(base + '/functions/v1/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify(body) });
    const id = randomUUID();
    const draft = { id, text: 'A free day: beach or mountains?', options: ['Beach', 'Mountains'] };
    const hookCount = Number((await pool.query('SELECT count(*) FROM public.hook_events')).rows[0].count);
    await createPollDraft(pool, draft);
    await createPollDraft(pool, draft); // Retry is safe and does not duplicate choices.
    await assert.rejects(createPollDraft(pool, { ...draft, options: ['Beach', 'Other'] }));
    await pool.query('SELECT public.rotate_active_question()');
    assert.equal((await get('active-question')).status, 404);
    assert.equal((await get('result-data/' + id)).status, 404);
    assert.equal(Number((await pool.query('SELECT count(*) FROM public.hook_events')).rows[0].count), hookCount);
    await assert.rejects(pool.query('UPDATE public.questions SET is_active = true WHERE id = $1', [id]), { code: '23514' });
    await assert.rejects(publishPoll(pool, { id, startDate: 'invalid', endDate: 'invalid' }));
    await publishPoll(pool, { id, startDate: new Date(Date.now() - 3600000).toISOString(), endDate: new Date(Date.now() + 86400000).toISOString() });
    await assert.rejects(publishPoll(pool, { id, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000).toISOString() }));
    const question = await (await get('active-question')).json();
    assert.equal(question.id, id);
    assert.deepEqual(question.options.map(option => option.text).sort(), ['Beach', 'Mountains']);
    const choices = Object.fromEntries(question.options.map(option => [option.text, option.id]));
    const followingId = randomUUID();
    await createPollDraft(pool, { id: followingId, text: 'Next community poll?', options: ['One', 'Two'] });
    await assert.rejects(publishPoll(pool, { id: followingId, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 3600000).toISOString() }), /overlaps a published poll/);
    const unpublished = (await pool.query('SELECT is_draft, start_date, end_date FROM public.questions WHERE id = $1', [followingId])).rows[0];
    assert.deepEqual(unpublished, { is_draft: true, start_date: null, end_date: null });
    // Adjacent windows are valid; only overlap can silently prevent activation.
    await publishPoll(pool, { id: followingId, startDate: question.end_date, endDate: new Date(Date.parse(question.end_date) + 86400000).toISOString() });
    const sessions = [];
    for (const [index, state] of ['NY', 'CA', 'NY'].entries()) {
      const signup = await fetch(base + '/auth/v1/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `render-community-${randomUUID()}@example.com`, password: 'local-test-password-123' }) });
      assert.equal(signup.status, 200);
      const session = await signup.json(); sessions.push(session);
      const userId = session.user.id;
      const onboarding = { user_id: userId, age: 30, gender: 'female', state, race_ethnicity: 'asian', income_bracket: '50k-75k', occupation: 'engineer', political_party: 'independent', political_leaning: 'moderate', employment_status: 'employed', citizenship_status: 'citizen' };
      assert.equal((await post('submit-vote', { questionId: id, optionId: choices.Beach, userId }, session)).status, 403);
      assert.equal((await post('submit-onboarding', { onboarding }, session)).status, 200);
      assert.equal((await post('submit-prediction', { questionId: id, optionId: choices.Beach, userId }, session)).status, 400);
      const selected = index === 1 ? choices.Mountains : choices.Beach;
      assert.equal((await post('submit-vote', { questionId: id, optionId: selected, userId }, session)).status, 200);
      assert.equal((await post('submit-vote', { questionId: id, optionId: selected, userId }, session)).status, 409);
      const afterVote = await (await get('active-question', session)).json();
      assert.equal(afterVote.user_vote, selected); assert.equal(afterVote.user_prediction, null);
      assert.equal((await post('submit-prediction', { questionId: id, optionId: choices.Beach, userId }, session)).status, 200);
      assert.equal((await post('submit-prediction', { questionId: id, optionId: choices.Beach, userId }, session)).status, 409);
      assert.equal((await (await get('active-question', session)).json()).user_prediction, choices.Beach);
    }
    await pool.query("UPDATE public.questions SET end_date = now() - interval '1 second' WHERE id = $1", [id]);
    await pool.query('SELECT public.rotate_active_question()');
    assert.equal((await get('active-question')).status, 404);
    assert.equal((await (await get('last-active-question')).json()).id, id);
    const reveal = await (await get('result-data/' + id, sessions[0])).json();
    assert.equal(reveal.totalVotes, 3);
    assert.equal(reveal.voteCounts[choices.Beach], 2);
    assert.equal(reveal.voteCounts[choices.Mountains], 1);
    assert.equal(reveal.user_vote, choices.Beach); assert.equal(reveal.user_prediction, choices.Beach);
    const filtered = await (await get(`result-data/${id}?state=CA&age=26-35`, sessions[1])).json();
    assert.equal(filtered.totalVotes, 1); assert.equal(filtered.results.find(option => option.optionText === 'Mountains').percentage, 100);
    const empty = await (await get(`result-data/${id}?state=TX`)).json(); assert.equal(empty.totalVotes, 0);
    const shared = await (await get('result-data/' + id)).json();
    assert.equal(shared.totalVotes, 3); assert.equal(shared.user_vote, null); assert.equal(shared.user_prediction, null);
    assert.ok(shared.results.every(option => option.responses.length === 0));
    assert.equal((await post('submit-prediction', { questionId: id, optionId: choices.Beach, userId: sessions[0].user.id }, sessions[0])).status, 400);
    assert.equal(Number((await pool.query("SELECT count(*) FROM public.hook_events WHERE event_type = 'question.activated' AND payload->'record'->>'id' = $1", [id])).rows[0].count), 1);
    // No sender is configured or called: all data exists only in the disposable Docker volume.
  } finally {
    if (api) { const closed = once(api, 'close'); api.close(); api.closeAllConnections(); await closed; }
    await pool.end();
  }
});
