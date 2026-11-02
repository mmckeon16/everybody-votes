# Everybody Polls on Render

This is a replacement backend for the Expo application, using Render Postgres
and a private, self-hosted Supabase Auth service. The app can keep its existing
Supabase authentication SDK and `/functions/v1/*` API paths. PostgREST and the
hosted Supabase Edge Runtime are no longer required.

## Services

- `everybody-polls-api`: Node HTTP API and `/auth/v1/*` gateway.
- `everybody-polls-auth`: private Supabase Auth container. It owns `auth.users`,
  sessions, refresh tokens, email/password login, and configured OAuth providers.
- `everybody-polls-db`: PostgreSQL 17, with external access disabled.
- `everybody-polls-jobs`: runs every minute, rotates eligible polls according to
  their start/end timestamps, and delivers queued hook events.

The initial Blueprint uses the smallest available plans. **Free Render Postgres
expires after 30 days.** Upgrade to a paid database before launching or accepting
new production votes; keep the private recovery backup until that is complete. A free API also sleeps when idle. Auth and cron have paid plans;
review Render's current pricing before applying the Blueprint.

## Current Render deployment

The Everybody Polls project has a Production environment in the existing
workspace. Resource IDs and the public API URL are recorded in
`deploy/render-production.json`; client configuration is in
`deploy/mobile.env.example`.

The resources were provisioned through the Render API because the connected
connector cannot create private services or apply this complete Blueprint.
They are not currently managed by a Blueprint. Use the existing resource IDs
for updates; do not apply the Blueprint as a second stack. `render.yaml` remains
the validated template for recreating the same architecture in a new environment.
Changes to that file do not automatically update these live resources.

Auto-deploy is disabled. Push the deployment branch, then deploy the affected
existing service explicitly. The cron runs `node jobs.mjs`, which applies
pending migrations before rotating polls and delivering configured hooks.
The free database expires on **December 1, 2026**; upgrade it before then to
retain the data. Authentication signups remain disabled until email delivery
and provider configuration are supplied. OneSignal has a dedicated app API key
on the cron service and uses the verified `Total Subscriptions` segment. Discord
still needs its webhook URL. The non-sending audience estimate currently reports
zero reachable push subscriptions; devices must subscribe before delivery can
reach anyone.

## Deploy a new environment

1. Push the `codex/render-backend` branch, which contains `render.yaml`.
2. Create a Render Blueprint from that branch in the intended workspace.
3. Review the database, Auth, API, and cron resources, then apply it.
4. Auth bootstraps its schema and runs its own migrations. The API waits for
   `auth.users`, then runs `server/migrations/` transactionally. Concurrent
   releases are serialized with an advisory lock; applied file checksums are
   verified on every startup. Never edit an already applied migration.
5. Check the API's `/healthz` and the migrations/deploy logs.
6. Configure email delivery or an Auth send-email hook, then enable signups.
7. Update the mobile environment using `deploy/mobile.env.example` and rebuild
   the Expo app. Update the frontpage's `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` to the same API URL and public identifier.

The recovered Supabase snapshot was selectively restored on November 1, 2026.
Original user/application IDs and poll responses are preserved. The four known
seed accounts, old sessions, challenge tokens, platform objects, legacy push
tokens, and historical notification logs were excluded; the private backup
retains the original archive. Notification queues stayed empty.

`import-backup.mjs` validates the exact inspected backup, derives vote and
prediction question IDs through their options, and requires an empty destination.
It refuses to run again on the restored database. See
`deploy/recovery-import.md` for the restore evidence and safeguards.

## Authentication and provider setup

The paused project's Auth configuration was recovered through a single-project
Auth Config Read token, then that token was revoked. All custom Auth hooks were
disabled and no custom SMTP was configured. Private provider settings are archived
outside Git with the recovery backup; secret values are stored on Render.

Native Apple is configured with the original accepted client IDs, including the
app's iOS bundle ID, `GOTRUE_EXTERNAL_APPLE_ENABLED=true`, and normal nonce checking.
The app uses `signInWithIdToken`, which needs no Apple client secret. The pinned
Auth image passed configuration and invalid-token checks locally; deployed
settings confirm Apple enabled. A real device login has not been tested. Browser Apple OAuth would need separate credentials.

Google, GitHub, and legacy Twitter client IDs/secrets are staged on the existing
Auth service with their `GOTRUE_EXTERNAL_<PROVIDER>_ENABLED=false` flags. Register
`https://everybody-polls-api.onrender.com/auth/v1/callback` in each provider's app,
then enable and deploy the appropriate provider. Google's Render callback is now
registered and reread on the original `web client prod` in project
`everybody-votes-444721`, accessed through the Collect Software browser profile.
Its original origins, callback, and credentials are preserved. Google remains
disabled pending the targeted enable/deploy and controlled login check. See
[the sanitized Google configuration evidence](../deploy/google-auth.json).
Do not replace or rotate the recovered app credentials.

Add the Render callback while retaining existing provider callback entries. The
original GitHub OAuth app is not listed under the current personal account; its
owning account or organization still needs to be located. Keep legacy Twitter
OAuth 1.0a (`twitter`, `GOTRUE_EXTERNAL_TWITTER_*`, API Key/API Secret) rather than
replacing it with X OAuth 2.0 credentials. See the provider settings guides for
[GitHub](https://docs.github.com/en/apps/oauth-apps/maintaining-oauth-apps/modifying-an-oauth-app)
and [Twitter/X](https://supabase.com/docs/guides/auth/social-sign-in/auth-twitter).

`GOTRUE_URI_ALLOW_LIST` accepts the matching native `com.everybody.polls://index`
callback, `http://localhost:8081`, and the production website origins. Add any
additional web deployment origin deliberately before using it for login.

Signups remain disabled. To enable email workflows, supply SMTP settings on Auth
(`GOTRUE_SMTP_HOST`, `GOTRUE_SMTP_PORT`, `GOTRUE_SMTP_USER`, `GOTRUE_SMTP_PASS`,
`GOTRUE_SMTP_ADMIN_EMAIL`, and `GOTRUE_SMTP_SENDER_NAME`), or configure an email
sending hook. Keep `GOTRUE_MAILER_AUTOCONFIRM=false` for production. Enable
`GOTRUE_DISABLE_SIGNUP=false` only after required provider/email delivery setup
is complete; deploy the existing Auth service to apply it.

Do not change the generated `GOTRUE_JWT_SECRET` after users have signed in unless
you intentionally want to invalidate their sessions.

## Recreated hooks

The database triggers in `migrations/002_hooks.sql` atomically enqueue:

- `question.activated`: a question is inserted active, or changes from inactive
  to active. Payload retains the Supabase webhook fields `type`, `table`,
  `schema`, `record`, and `old_record`.
- `question.rotation`: a rotation log is inserted.

The scheduled worker delivers events using the following optional cron-service
environment variables. Leave them unset until the correct destinations are
known. No external messages are sent without configuration.

| Setting | Effect |
| --- | --- |
| `QUESTION_ACTIVATED_WEBHOOK_URL` | POST activation payloads to the original replacement webhook |
| `HOOK_SIGNING_SECRET` | HMAC-SHA256 of the raw body in `X-Hook-Signature` |
| `DISCORD_WEBHOOK_URL` | Send rotation success/failure notifications to Discord |
| `ONESIGNAL_REST_API_KEY` + `ONESIGNAL_APP_ID` | Notify subscribed push subscriptions when a question becomes active |
| `ONESIGNAL_SEGMENT` | Exact existing segment name; this app uses `Total Subscriptions` |

The sender uses `ONESIGNAL_SEGMENT` when supplied and retains `Subscribed Users`
as a compatibility fallback. The current app has no segment with that fallback
name. `Total Subscriptions` was verified as active, default, and unfiltered;
`target_channel: push` keeps delivery scoped to subscribed push endpoints.
Credential and recipient-estimate checks create no messages.

Secrets go in Render environment variables, never source or the Blueprint.
Optional settings omitted from `render.yaml` can be added to the cron service
without conflicting with the Blueprint's owned keys. Do not put webhook URLs or
keys in commits, output, or logs.

Each destination has its own persisted retry state, exponential backoff, and a
maximum of 10 attempts. Delivery is at least once: receivers must deduplicate by
event ID (`Idempotency-Key`). OneSignal receives the same event UUID as its
idempotency key. Successfully delivered destinations are not retried when a
different destination fails. Unconfigured destinations keep their events, so
configuring a destination later can deliver older events; review the queue
before enabling it on an imported database.

Inspect failed deliveries with:

```sql
SELECT event_id, destination, attempts, last_error, available_at
FROM public.hook_deliveries
WHERE delivered_at IS NULL
ORDER BY available_at;
```

Additional dashboard-only Auth hooks or database webhooks require their original
trigger, destination, and signing settings. The deleted `push-notifications` implementation was recovered from Git history.
It originally sent Expo pushes and was removed when the mobile app switched to
OneSignal. See `deploy/hook-recovery.md` for source evidence and recovery results.
Discord reports preserve the original question text, question period, execution
time, and failure fields using a snapshot captured with each rotation event.

## API behavior

Existing active/last-question, onboarding, vote, prediction, results, and
notification function paths are preserved. Writes verify a real Auth session
and use its user ID; a caller-supplied user ID cannot impersonate someone else.
Votes and predictions are unique per user/question at the database level.
Options must belong to an open question. Results expose aggregates rather than
respondent IDs or individual demographic records.

The manual notification path requires `X-Hook-Token` matching
`INTERNAL_HOOK_TOKEN`. It only drains configured hooks. Scheduled delivery uses
the cron service directly and needs no public privileged endpoint.

## Local verification

With Docker available, the isolated runner creates a fresh stack under a unique
project name and always removes only its own containers and volumes afterward:

```sh
cd server
npm ci
npm test
npm run test:integration:local
```

For manual inspection of the disposable stack:

```sh
docker compose -p everybody-render-check -f deploy/compose.test.yaml up -d --build --wait
cd server
npm ci
npm test
# Set these to the isolated compose stack's loopback ports:
TEST_DATABASE_URL=postgres://render_owner:local-test-owner-password@127.0.0.1:DB_PORT/polls_test \
TEST_AUTH_URL=http://127.0.0.1:AUTH_PORT npm run test:integration
```

Find ports with `docker compose -p everybody-render-check -f
deploy/compose.test.yaml port database 5432` and `port auth 9999`. The integration
suite requires a fresh disposable database and tests real Auth signup/login,
migration reruns, impersonation rejection, concurrent votes, results filters,
rotation events, and persisted webhook retries. It sends only to a local test
HTTP server. It never resets an existing database.

Remove only the disposable test resources when finished:

```sh
docker compose -p everybody-render-check -f deploy/compose.test.yaml down -v
```
