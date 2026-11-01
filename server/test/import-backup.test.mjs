import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBackup, prepareImport, importBackup, RecoveryError } from '../import-backup.mjs';

test('COPY parser handles nulls, escaped delimiters and literal backslashes once', async () => {
  const parsed = await parseBackup('COPY public.options (id, question_id, text) FROM stdin;\nfirst\\tvalue\t\\N\tline\\nsecond\\tword\\\\n\\040\\x21\n\\.\n', { isText: true });
  const row = parsed.tables['public.options'].rows[0];
  assert.equal(row.id, 'first\tvalue');
  assert.equal(row.question_id, null);
  assert.equal(row.text, 'line\nsecond\tword\\n !');
});

test('COPY parser never returns surrounding SQL or nonallowlisted secret rows', async () => {
  const parsed = await parseBackup('DROP TABLE auth.users;\nCOPY vault.secrets (id, secret) FROM stdin;\nexample\tprivate-test-placeholder\n\\.\nCOPY public.options (id, question_id, text) FROM stdin;\na\tb\tc\n\\.\n', { isText: true });
  assert.deepEqual(Object.keys(parsed.tables), ['public.options']);
  assert.equal(parsed.counts['vault.secrets'], 1);
  assert.ok(!JSON.stringify(parsed).includes('private-test-placeholder'));
  assert.ok(!JSON.stringify(parsed).includes('DROP TABLE'));
});

test('COPY parser handles empty tables without consuming the next table', async () => {
  const parsed = await parseBackup('COPY auth.instances (id) FROM stdin;\n\\.\nCOPY public.options (id, question_id, text) FROM stdin;\na\tb\tc\n\\.\n', { isText: true });
  assert.equal(parsed.counts['auth.instances'], 0);
  assert.equal(parsed.counts['public.options'], 1);
});

test('COPY parser fails on truncated blocks, duplicate tables and wrong row width', async () => {
  for (const source of [
    'COPY public.options (id, text) FROM stdin;\na\tb\n',
    'COPY public.options (id) FROM stdin;\n\\.\nCOPY public.options (id) FROM stdin;\n\\.\n',
    'COPY public.options (id, text) FROM stdin;\none-field\n\\.\n',
  ]) await assert.rejects(() => parseBackup(source, { isText: true }), RecoveryError);
});

test('unknown source checksum is rejected before seed or database access', async () => {
  const parsed = await parseBackup('-- unrelated backup\n', { isText: true });
  await assert.rejects(() => prepareImport(parsed, { seedFile: '/does-not-exist' }), error => error.code === 'UNRECOGNIZED_BACKUP_CHECKSUM');
});

test('database caller requires a prepared in-process plan before any query', async () => {
  let queried = false;
  await assert.rejects(() => importBackup({ query() { queried = true; } }, {}), error => error.code === 'UNPREPARED_IMPORT');
  assert.equal(queried, false);
});

const backup = process.env.RECOVERY_BACKUP_FILE;
test('private source validates exact recovery counts, exclusions and FK reconstruction', { skip: !backup }, async () => {
  const prepared = await prepareImport(await parseBackup(backup));
  assert.equal(prepared.summary.excludedSeedAccounts, 4);
  assert.equal(prepared.tables['auth.users'].length, 12);
  assert.equal(prepared.tables['auth.identities'].length, 14);
  assert.ok(Object.isFrozen(prepared.tables['auth.users'][0]));
  assert.ok(!Object.hasOwn(prepared.tables, 'public.push_tokens'));
  assert.ok(!Object.hasOwn(prepared.tables, 'public.question_rotation_logs'));
  const options = new Map(prepared.tables['public.options'].map(row => [row.id, row.question_id]));
  for (const table of ['public.answers', 'public.predictions']) assert.ok(prepared.tables[table].every(row => row.question_id === options.get(row.option_id)));
  assert.ok(prepared.tables['auth.users'].every(row => row.confirmation_token === '' && row.recovery_token === '' && row.reauthentication_token === ''));
});

test('database errors are sanitized and trigger a rollback', { skip: !backup }, async () => {
  const prepared = await prepareImport(await parseBackup(backup));
  const calls = [];
  const client = { async query(sql) {
    calls.push(sql);
    if (sql.startsWith('SET LOCAL lock_timeout')) {
      const error = new Error('sensitive-test-placeholder');
      error.detail = 'row-value-test-placeholder';
      throw error;
    }
    return { rows: [] };
  } };
  await assert.rejects(() => importBackup(client, prepared), error => {
    assert.equal(error.code, 'IMPORT_DATABASE_OPERATION_FAILED');
    assert.ok(!error.cause);
    assert.ok(!String(error).includes('sensitive-test-placeholder'));
    assert.ok(!JSON.stringify(error).includes('row-value-test-placeholder'));
    return true;
  });
  assert.equal(calls[0], 'BEGIN READ ONLY');
  assert.equal(calls.at(-1), 'ROLLBACK');
  assert.ok(!calls.some(sql => /^(INSERT|ALTER|DELETE|UPDATE)/.test(sql)));
});
