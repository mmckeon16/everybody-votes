# Recovered Supabase hook behavior

Evidence checked on November 1, 2026: all fetched Git branches/history, 901
historical source/config blobs, Expo project/account variables across production,
preview, and development, and GitHub Actions secret names. Secret values are
not recorded here.

| Event | Recovered behavior | Render equivalent |
| --- | --- | --- |
| Scheduled poll rotation | Repo migration says 12:00 UTC; recovered database actually scheduled 15:00 UTC and inserted a rotation log after deactivation | Cron checks every minute against poll timestamps and records only actual changes or failures |
| Rotation log created | `question-rotation-notification` sent a Discord report containing execution time, deactivation count, new question text/period, or an error | Durable `question.rotation` events with a snapshot of the activated question; delivery uses `DISCORD_WEBHOOK_URL` |
| Question becomes active | Earlier versions invoked `push-notifications` and sent “New Poll!” through Expo to saved push tokens | Durable `question.activated` event; current sender uses the app's latest OneSignal integration |
| Authentication hooks | Paused-project Auth export confirms all seven custom Auth hooks disabled and no custom SMTP | No custom Auth hooks to recreate; native Apple configured, other recovered providers staged pending callback registration |

The downloaded May 4, 2025 database backup confirms the installed binding:
`question_rotation_logs_hook` fires AFTER INSERT on
`public.question_rotation_logs` with no row filter. It POSTs to the original
`question-rotation-notification` Edge Function with a five-second timeout.
The request body contained the inserted row and standard Supabase webhook
metadata (`type`, `table`, `schema`, `record`, and `old_record`). The trigger's
`{}` argument supplied query parameters, not an empty POST body.
This was the only outgoing database webhook in the backup. The other application
triggers maintained timestamps; no direct question-activation webhook was
installed in this snapshot.

The active `rotate-questions` cron used `0 15 * * *`; all 118 recovered run records
started at hour 15 with UTC timestamps. This differs from the noon schedule in
the source migration. Render checks eligibility every minute so it follows each
poll's stored start/end timestamps and can retry deliveries promptly. The old
rotation function's future-question selection bug is corrected in Render.

`deploy/recovered-hook-manifest.json` records sanitized trigger and cron details.

Sources:

- [Original rotation/Discord implementation](https://github.com/mmckeon16/everybody-votes/commit/6e477daf4e524fdf8d8b29454fb041017245a014)
- [Activation trigger and Expo push sender](https://github.com/mmckeon16/everybody-votes/commit/db89e3a30bbffcf3fe722cf5de9203f07aeeb750)
- [Retained notification branch](https://github.com/mmckeon16/everybody-votes/tree/test-notification-push)
- [Removal of Expo sender and switch to OneSignal](https://github.com/mmckeon16/everybody-votes/commit/2eabe9be05c6982d207dc8d00f1a984906084908)

The latest app uses OneSignal app ID `fe9857fe-f9b3-4424-b7d5-ba920dfff980`.
That public ID is configured on the Render cron. Its REST API key and the Discord
webhook URL were not found in source/history, Expo environments, or GitHub secret
metadata. Expo environments contain Supabase client settings, Google client ID,
and Sentry settings; none contains notification credentials. The Discord URL was
read from a Supabase Edge Function secret in the original implementation.

The Supabase connection is now working and confirms the original project still
exists in **Collect Software** (Free), with ref `nkaenbgnlfcqzjqnforj` and status
`INACTIVE`. The platform lists eight deployed functions, including
`question-rotation-notification` version 8 and `push-notifications` version 5,
both last updated January 24, 2025. The deployed Expo sender therefore remained
listed even after its source was removed from the app repository.

Database queries and migration listing fail because the inactive database is
unavailable. Function-source download returned an internal MCP error on two
attempts. Supabase rejected restoration with: “Project has been paused for more
than 400 days and cannot be restored.” No Supabase project restore or configuration change occurred.

The database backup was downloaded successfully through the authenticated
Dashboard and inspected as SQL text without executing or restoring it. A private
compressed copy is saved outside the app's Git checkout. A subsequent selective
restore imported the real user accounts, identities, polls, demographic profiles,
votes, and predictions into Render while preserving their IDs. Four verified
seed accounts and legacy sessions/tokens were excluded. Old push tokens and
rotation logs remain archived only in the private backup. The restore generated
zero hook events or deliveries; see `deploy/recovery-import.md`.

The backup contains no Discord webhook URL, no OneSignal reference or API key,
and no Vault secret rows. It does contain the original Edge Function invocation
credential; that old service-role JWT remains private and is not reused by the
Render backend. Notification-provider secrets were kept outside the database
and required recovery/replacement through provider account access. A replacement
app-scoped OneSignal key named `Render Everybody Polls` is now saved directly in
the Render cron environment. The Discord webhook URL remains unrecovered.

The Render triggers and delivery logic are implemented. OneSignal is configured
on the cron with its dedicated key, existing app ID, and `ONESIGNAL_SEGMENT=Total
Subscriptions`. The segment is active, default, and has no filters. The former
`Subscribed Users` name is absent in this app, so the sender now accepts an exact
segment name from configuration. A non-sending recipient estimate returned HTTP
200 with zero reachable push subscriptions. Read-only checks also confirmed no
pending hook events, deliveries, active polls, or currently eligible polls before
enabling the key. Discord remains unconfigured.

Old Expo push support is not re-enabled: it was deliberately
removed from the latest mobile app. No real notification was sent during recovery
tests. Receivers must deduplicate generic events by event ID; OneSignal requests retain
the same idempotency key during retries.

Validation: four unit tests and nine integration tests pass against disposable
PostgreSQL 17 and Supabase Auth, including migration reruns, rotation snapshots,
provider payloads, HTTP-200 rejection receipts, and independent delivery retries.
All provider calls in the integration tests are mocked.

The selective-import tests also passed against the private backup fixture. A
fresh PostgreSQL 17/GoTrue rehearsal verified rollback, trigger restoration,
repeat-import refusal, Auth account/identity reads, API aggregates, and zero
notification side effects. Live post-import checks returned HTTP 200 for health,
all 13 historical polls, and a sampled result whose aggregate matched the source.

OneSignal credential verification used only app/segment metadata and the
non-sending recipient-estimate endpoint; no notification was created. The key
value was transferred directly to Render without logging or saving it locally.
Existing keys were not rotated. The payload integration test uses the verified
segment name and retains push targeting, recovered content, and idempotency.

## Recovered Auth configuration

The Management API successfully exported the paused project's Auth configuration
on November 1, 2026. Access used a temporary token restricted to this single
project and Auth Config Read. The token was deleted immediately after export and
verified absent from the account token list. The private configuration is archived
outside Git with the original backup; no signing key or session was reused.

All seven custom Auth hooks were disabled. The source had no custom SMTP, so
there is no custom signup-email hook or SMTP credential to recover. Google,
GitHub, Twitter, and native Apple were enabled in the original app. Google,
GitHub, and legacy Twitter credentials were transferred into Render with those
providers disabled pending registration of the new callback. Google's public
OAuth endpoint confirms `redirect_uri_mismatch` for that new callback; Cloud
requires fresh identity verification before access to the existing project/client
can be checked.

Native Apple uses the recovered accepted-client-ID list, which includes the
current iOS bundle ID, with nonce checking retained and no Apple secret. A
disposable instance of the pinned GoTrue 2.195.0 confirmed Apple enabled in
settings and rejected dummy ID tokens at validation, creating no users/sessions.
The deployed Auth settings also return Apple enabled and Google/GitHub/Twitter
disabled. Real device login remains untested. Signups stay disabled.

The exact app-return allowlist now includes `com.everybody.polls://index`,
localhost's web origin, and the production website origins. Client callback
changes reconcile the native URL scheme with app configuration and keep callback
codes/credentials out of logs. Cloud/provider callback registration and native
app rebuilding remain separate requirements before cutover.

On November 1, the original Google OAuth project was opened directly after the
iOS cutover. Google reported that the current browser account lacks project
access. Use the owning account before completing any verification and adding the
Render callback. Discord recovery is deferred at the user's request.

A follow-up through the signed-in Collect Software browser profile reached the
original Google Cloud project `everybody-votes-444721`. Render's callback was
added to the existing `web client prod`, saved, and verified after reopening the
client. The original origins, Supabase callback, and credentials are preserved.
Render's staged client/secret/redirect match the recovered source; live settings
still show Google disabled, Apple enabled, and signups disabled. Google enable
and Auth deploy remain pending explicit approval; no real provider login was
performed. See [google-auth.json](google-auth.json).
