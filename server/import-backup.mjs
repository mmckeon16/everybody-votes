import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Bound to the inspected db_cluster-04-05-2025@16-09-28.backup.gz export.
export const EXPECTED_BACKUP_SHA256 = 'bef922fd45dd2064a3190fc4c05e6e1cf5e50a0f3fc9230900e5a2fba613d3b1';
const EXPECTED_SEED_IDS_SHA256 = '4a7c1066b9335420a7213116da9e8f862ffce793d3de68488d91c1b670d2573c';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const preparedImports = new WeakSet();
const columns = {
  'auth.users': 'instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,invited_at,confirmation_token,confirmation_sent_at,recovery_token,recovery_sent_at,email_change_token_new,email_change,email_change_sent_at,last_sign_in_at,raw_app_meta_data,raw_user_meta_data,is_super_admin,created_at,updated_at,phone,phone_confirmed_at,phone_change,phone_change_token,phone_change_sent_at,email_change_token_current,email_change_confirm_status,banned_until,reauthentication_token,reauthentication_sent_at,is_sso_user,deleted_at,is_anonymous'.split(','),
  'auth.identities': 'provider_id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at,id'.split(','),
  'public.questions': 'id,text,start_date,end_date,is_active'.split(','),
  'public.options': 'id,question_id,text'.split(','),
  'public.demographics': 'id,user_id,age,gender,state,race_ethnicity,income_bracket,occupation,political_party,political_leaning,employment_status,citizenship_status,created_at,updated_at'.split(','),
  'public.answers': 'id,created_at,user_id,option_id'.split(','),
  'public.predictions': 'id,created_at,user_id,option_id'.split(','),
  'public.push_tokens': 'id,user_id,token,created_at,updated_at'.split(','),
  'public.question_rotation_logs': 'id,executed_at,deactivated_questions,activated_question_id,success,error_message'.split(','),
};
const expectedCounts = {
  'auth.users': 16, 'auth.identities': 14, 'public.questions': 13, 'public.options': 24,
  'public.demographics': 12, 'public.answers': 23, 'public.predictions': 23,
  'public.push_tokens': 2, 'public.question_rotation_logs': 30,
};
const importOrder = ['auth.users', 'auth.identities', 'public.questions', 'public.options', 'public.demographics', 'public.answers', 'public.predictions'];
const destinationTables = [...importOrder, 'public.push_tokens', 'public.question_rotation_logs', 'public.hook_events', 'public.hook_deliveries', 'auth.sessions', 'auth.refresh_tokens', 'auth.mfa_factors', 'auth.flow_state', 'auth.one_time_tokens'];

export class RecoveryError extends Error {
  constructor(code) { super(code); this.name = 'RecoveryError'; this.code = code; }
}
function requireCondition(condition, code) { if (!condition) throw new RecoveryError(code); }
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
function copyValue(value) {
  if (value === '\\N') return null;
  // PostgreSQL text COPY escaping; process once so a literal \\n stays literal.
  return value.replace(/\\([0-7]{1,3}|x[0-9a-fA-F]{1,2}|.)/g, (_, escape) => {
    if (/^[0-7]+$/.test(escape)) return String.fromCharCode(parseInt(escape, 8));
    if (/^x[0-9a-f]+$/i.test(escape)) return String.fromCharCode(parseInt(escape.slice(1), 16));
    return ({ b: '\b', f: '\f', n: '\n', r: '\r', t: '\t', v: '\v', '\\': '\\' })[escape] ?? escape;
  });
}

/** Parse a file path, or text with { isText: true }. Never execute dump SQL. */
export async function parseBackup(input, { isText = false } = {}) {
  let source;
  try { source = isText ? String(input) : await readFile(input, 'utf8'); }
  catch { throw new RecoveryError('BACKUP_READ_FAILED'); }
  requireCondition(Buffer.byteLength(source) <= 5 * 1024 * 1024, 'BACKUP_TOO_LARGE');
  const tables = Object.create(null), counts = Object.create(null);
  const lines = source.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const header = /^COPY ([a-z_][a-z_0-9]*\.[a-z_][a-z_0-9]*) \(([a-z_0-9, ]+)\) FROM stdin;$/.exec(lines[index]);
    if (!header) continue;
    const [, table, names] = header, fields = names.split(', ');
    requireCondition(!(table in counts), 'DUPLICATE_COPY_TABLE');
    requireCondition(new Set(fields).size === fields.length && fields.every(field => /^[a-z_][a-z_0-9]*$/.test(field)), 'INVALID_COPY_COLUMNS');
    const rows = [];
    let count = 0;
    while (++index < lines.length && lines[index] !== '\\.') {
      const values = lines[index].split('\t');
      requireCondition(values.length === fields.length, 'INVALID_COPY_ROW_WIDTH');
      // Retain only allowlisted tables. Sessions, tokens, keys and platform rows
      // never enter the prepared import or a SQL statement.
      if (Object.hasOwn(columns, table)) rows.push(Object.fromEntries(fields.map((field, position) => [field, copyValue(values[position])])));
      count++;
    }
    requireCondition(index < lines.length, 'UNTERMINATED_COPY');
    counts[table] = count;
    if (Object.hasOwn(columns, table)) tables[table] = { columns: fields, rows };
  }
  return { sha256: sha256(source), tables, counts };
}

async function seedAccountIds(seedFile) {
  let text;
  try { text = await readFile(seedFile, 'utf8'); }
  catch { throw new RecoveryError('SEED_REFERENCE_READ_FAILED'); }
  const block = /INSERT INTO auth\.users \(id,[^;]+?VALUES([\s\S]*?);/.exec(text);
  requireCondition(block, 'SEED_REFERENCE_CHANGED');
  const ids = [...block[1].matchAll(/^\s*\('([0-9a-f-]{36})',/gm)].map(match => match[1]);
  requireCondition(ids.length === 4 && new Set(ids).size === 4 && sha256(ids.sort().join('\n')) === EXPECTED_SEED_IDS_SHA256, 'SEED_REFERENCE_CHANGED');
  return new Set(ids);
}
function unique(rows, fields, code) {
  const keys = rows.map(row => JSON.stringify(fields.map(field => row[field])));
  requireCondition(new Set(keys).size === keys.length, code);
}
function validDate(value) { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }
function jsonObject(value) {
  try {
    const parsed = JSON.parse(value);
    requireCondition(parsed && typeof parsed === 'object' && !Array.isArray(parsed), 'INVALID_JSON_OBJECT');
    return parsed;
  } catch { throw new RecoveryError('INVALID_JSON_OBJECT'); }
}
function deepFreeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(deepFreeze); Object.freeze(value); }
  return value;
}
function containsProviderSecret(value) {
  if (Array.isArray(value)) return value.some(containsProviderSecret);
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, child]) => /(?:access|refresh|id)[_-]?token|authorization|client_secret|password/i.test(key) || containsProviderSecret(child));
}

/** Validate the known source, exclude exactly its four committed seed accounts,
 * and produce a frozen, allowlisted import plan. No database connection used. */
export async function prepareImport(parsed, { seedFile = new URL('../supabase/seed.sql', import.meta.url) } = {}) {
  requireCondition(parsed?.sha256 === EXPECTED_BACKUP_SHA256, 'UNRECOGNIZED_BACKUP_CHECKSUM');
  const tables = Object.create(null);
  for (const [table, expected] of Object.entries(columns)) {
    const found = parsed.tables[table];
    requireCondition(found && JSON.stringify(found.columns) === JSON.stringify(expected), 'SOURCE_COLUMNS_CHANGED');
    requireCondition(found.rows.length === expectedCounts[table], 'SOURCE_COUNTS_CHANGED');
    tables[table] = found.rows.map(row => ({ ...row }));
    for (const row of tables[table]) requireCondition(uuid.test(row.id ?? ''), 'INVALID_SOURCE_ID');
    unique(tables[table], ['id'], 'DUPLICATE_SOURCE_ID');
  }
  const seedIds = await seedAccountIds(seedFile);
  const seeds = tables['auth.users'].filter(row => seedIds.has(row.id));
  requireCondition(seeds.length === 4 && seeds.every(row => row.aud === null && row.role === null && /^\$2[aby]\$/.test(row.encrypted_password ?? '') && row.raw_app_meta_data === null && row.raw_user_meta_data === null), 'SEED_ACCOUNT_MISMATCH');
  for (const [table, rows] of Object.entries(tables)) {
    if (table !== 'auth.users') requireCondition(rows.every(row => !seedIds.has(row.user_id)), 'SEED_ACCOUNT_HAS_LINKED_DATA');
  }
  tables['auth.users'] = tables['auth.users'].filter(row => !seedIds.has(row.id));
  requireCondition(tables['auth.users'].length === 12, 'REAL_USER_COUNT_CHANGED');
  const users = new Set(tables['auth.users'].map(row => row.id));
  unique(tables['auth.users'], ['email'], 'DUPLICATE_USER_EMAIL');
  for (const row of tables['auth.users']) {
    requireCondition(row.aud === 'authenticated' && row.role === 'authenticated' && row.is_super_admin !== 't' && row.is_sso_user === 'f' && row.is_anonymous === 'f' && row.deleted_at === null && row.banned_until === null, 'UNEXPECTED_AUTH_ACCOUNT_STATE');
    requireCondition(row.instance_id === '00000000-0000-0000-0000-000000000000', 'UNEXPECTED_AUTH_INSTANCE');
    requireCondition(row.email && row.email_confirmed_at && validDate(row.created_at) && validDate(row.updated_at), 'INVALID_AUTH_ACCOUNT');
    // Invalidate pending legacy confirmation/recovery/change challenges. Never
    // copy active sessions, refresh tokens, MFA state or the original JWT secret.
    for (const field of ['confirmation_token', 'recovery_token', 'email_change_token_new', 'email_change', 'phone_change', 'phone_change_token', 'email_change_token_current', 'reauthentication_token']) row[field] = '';
    for (const field of ['confirmation_sent_at', 'recovery_sent_at', 'email_change_sent_at', 'phone_change_sent_at', 'reauthentication_sent_at']) row[field] = null;
    row.email_change_confirm_status = 0;
    row.raw_app_meta_data = jsonObject(row.raw_app_meta_data ?? '{}');
    row.raw_user_meta_data = jsonObject(row.raw_user_meta_data ?? '{}');
  }
  const userReferences = ['auth.identities', 'public.demographics', 'public.answers', 'public.predictions', 'public.push_tokens'];
  for (const table of userReferences) requireCondition(tables[table].every(row => users.has(row.user_id)), 'MISSING_REFERENCED_USER');
  const identityUsers = new Set(tables['auth.identities'].map(row => row.user_id));
  requireCondition(identityUsers.size === users.size, 'REAL_USER_MISSING_IDENTITY');
  unique(tables['auth.identities'], ['provider', 'provider_id'], 'DUPLICATE_IDENTITY');
  for (const row of tables['auth.identities']) {
    requireCondition(['apple', 'google', 'github', 'twitter'].includes(row.provider) && row.provider_id, 'UNEXPECTED_IDENTITY_PROVIDER');
    row.identity_data = jsonObject(row.identity_data);
    requireCondition(!containsProviderSecret(row.identity_data), 'IDENTITY_CONTAINS_PROVIDER_SECRET');
  }
  const questions = new Map(tables['public.questions'].map(row => [row.id, row]));
  const options = new Map(tables['public.options'].map(row => [row.id, row]));
  requireCondition(tables['public.questions'].every(row => row.text?.trim() && validDate(row.start_date) && validDate(row.end_date) && Date.parse(row.end_date) > Date.parse(row.start_date) && row.is_active === 'f'), 'INVALID_OR_ACTIVE_HISTORICAL_QUESTION');
  requireCondition(tables['public.questions'].every(row => Date.parse(row.end_date) <= Date.now()), 'HISTORICAL_QUESTION_NOT_ENDED');
  requireCondition(tables['public.options'].every(row => questions.has(row.question_id) && typeof row.text === 'string'), 'INVALID_OPTION_REFERENCE');
  const demographics = tables['public.demographics'];
  unique(demographics, ['user_id'], 'DUPLICATE_DEMOGRAPHICS');
  for (const row of demographics) {
    row.age = Number(row.age);
    requireCondition(Number.isInteger(row.age) && row.age >= 1 && row.age <= 115 && columns['public.demographics'].every(field => row[field] !== null), 'INVALID_DEMOGRAPHICS');
  }
  for (const table of ['public.answers', 'public.predictions']) {
    for (const row of tables[table]) {
      requireCondition(options.has(row.option_id) && validDate(row.created_at), 'INVALID_VOTE_REFERENCE');
      row.question_id = options.get(row.option_id).question_id;
    }
    unique(tables[table], ['user_id', 'question_id'], 'DUPLICATE_USER_QUESTION');
  }
  requireCondition(tables['public.question_rotation_logs'].every(row => row.activated_question_id === null || questions.has(row.activated_question_id)), 'INVALID_ARCHIVED_ROTATION_REFERENCE');
  // Drop archived legacy rows from memory as well as from the destination plan.
  const selected = Object.fromEntries(importOrder.map(table => [table, tables[table]]));
  const summary = {
    sourceSha256: parsed.sha256,
    importedCounts: Object.fromEntries(importOrder.map(table => [table, selected[table].length])),
    excludedSeedAccounts: 4,
    archivedOnly: { pushTokens: tables['public.push_tokens'].length, rotationLogs: tables['public.question_rotation_logs'].length },
    restoredHistoricalActiveQuestions: 0,
  };
  const prepared = deepFreeze({ tables: selected, summary });
  preparedImports.add(prepared);
  return prepared;
}

async function inspectDestination(client, prepared) {
  for (const table of destinationTables) {
    const exists = (await client.query('SELECT to_regclass($1) IS NOT NULL AS present', [table])).rows[0]?.present;
    requireCondition(exists, 'DESTINATION_SCHEMA_NOT_READY');
    // Identifiers come solely from the constant allowlist above.
    const count = (await client.query(`SELECT count(*)::integer AS count FROM ${table}`)).rows[0]?.count;
    requireCondition(count === 0, 'DESTINATION_NOT_EMPTY');
  }
  const metadata = (await client.query(`SELECT table_schema || '.' || table_name AS table_name, column_name, is_generated
    FROM information_schema.columns WHERE table_schema IN ('auth','public')`)).rows;
  for (const table of importOrder) {
    const byName = new Map(metadata.filter(row => row.table_name === table).map(row => [row.column_name, row]));
    const fields = Object.keys(prepared.tables[table][0]);
    requireCondition(fields.every(field => byName.has(field) && byName.get(field).is_generated === 'NEVER'), 'DESTINATION_COLUMN_MISMATCH');
  }
  const triggers = (await client.query(`SELECT n.nspname || '.' || c.relname AS table_name, t.tgname, t.tgenabled
    FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE NOT t.tgisinternal AND n.nspname || '.' || c.relname = ANY($1::text[])`, [importOrder])).rows;
  const expectedTriggers = new Set(['public.questions:question_activation_hook', 'public.demographics:demographics_updated_at']);
  requireCondition(triggers.length === expectedTriggers.size && triggers.every(row => expectedTriggers.has(`${row.table_name}:${row.tgname}`) && row.tgenabled === 'O'), 'DESTINATION_TRIGGERS_CHANGED');
}

/** Use an already connected pg Client. Default is a READ ONLY transaction with
 * schema/count checks; { apply: true } is required to insert and commit. */
export async function importBackup(client, prepared, { apply = false } = {}) {
  requireCondition(preparedImports.has(prepared), 'UNPREPARED_IMPORT');
  requireCondition(typeof apply === 'boolean', 'INVALID_APPLY_OPTION');
  let begun = false;
  try {
    await client.query(apply ? 'BEGIN' : 'BEGIN READ ONLY');
    begun = true;
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SET LOCAL statement_timeout = '30s'");
    if (apply) {
      // Serialize against the minute rotation job and hook-delivery worker.
      await client.query('SELECT pg_advisory_xact_lock(18271102)');
      await client.query('SELECT pg_advisory_xact_lock(18271103)');
      await client.query(`LOCK TABLE ${destinationTables.join(', ')} IN ACCESS EXCLUSIVE MODE`);
    }
    await inspectDestination(client, prepared);
    if (!apply) {
      await client.query('ROLLBACK');
      begun = false;
      return { mode: 'dry-run', destinationEmpty: true, ...prepared.summary };
    }
    // Disable only the application notification trigger. FK and all native Auth
    // constraints remain enabled. Rollback also restores trigger state on error.
    await client.query('ALTER TABLE public.questions DISABLE TRIGGER question_activation_hook');
    for (const table of importOrder) {
      const rows = prepared.tables[table], fields = Object.keys(rows[0]);
      const values = rows.flatMap(row => fields.map(field => row[field]));
      const placeholders = rows.map((_, rowIndex) => `(${fields.map((_, columnIndex) => '$' + (rowIndex * fields.length + columnIndex + 1)).join(',')})`).join(',');
      await client.query(`INSERT INTO ${table} (${fields.join(',')}) VALUES ${placeholders}`, values);
      const count = (await client.query(`SELECT count(*)::integer AS count FROM ${table}`)).rows[0].count;
      requireCondition(count === rows.length, 'DESTINATION_COUNT_MISMATCH');
    }
    await client.query('ALTER TABLE public.questions ENABLE TRIGGER question_activation_hook');
    for (const table of destinationTables.filter(table => !importOrder.includes(table))) {
      const count = (await client.query(`SELECT count(*)::integer AS count FROM ${table}`)).rows[0].count;
      requireCondition(count === 0, 'UNEXPECTED_IMPORT_SIDE_EFFECT');
    }
    await client.query('COMMIT');
    begun = false;
    return { mode: 'applied', ...prepared.summary, hookEvents: 0, hookDeliveries: 0 };
  } catch (error) {
    if (begun) try { await client.query('ROLLBACK'); } catch { /* no row values in errors */ }
    if (error instanceof RecoveryError) throw error;
    // pg error detail can include complete rows, hashes and credentials.
    throw new RecoveryError('IMPORT_DATABASE_OPERATION_FAILED');
  }
}

async function main() {
  const args = process.argv.slice(2);
  requireCondition(args.every((arg, index) => ['--backup', '--execute', '--inspect-only'].includes(arg) || (index > 0 && args[index - 1] === '--backup')), 'USAGE_BACKUP_PATH_REQUIRED');
  const backupIndex = args.indexOf('--backup'), backup = args[backupIndex + 1];
  requireCondition(backupIndex >= 0 && backup && !backup.startsWith('--'), 'USAGE_BACKUP_PATH_REQUIRED');
  requireCondition(!(args.includes('--execute') && args.includes('--inspect-only')), 'CONFLICTING_OPTIONS');
  const prepared = await prepareImport(await parseBackup(backup));
  if (args.includes('--inspect-only')) return console.log(JSON.stringify({ mode: 'source-inspection', ...prepared.summary }));
  // Operational callers should use the exported functions and pass a Client
  // created from an in-memory credential. CLI also permits an existing env var.
  const { createPool } = await import('./db.mjs');
  const pool = createPool();
  let client;
  try { client = await pool.connect(); console.log(JSON.stringify(await importBackup(client, prepared, { apply: args.includes('--execute') }))); }
  finally { client?.release(); await pool.end(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(JSON.stringify({ error: error instanceof RecoveryError ? error.code : 'RECOVERY_FAILED' }));
    process.exitCode = 1;
  });
}
