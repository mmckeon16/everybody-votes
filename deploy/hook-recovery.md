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
| Authentication hooks | No enabled custom Auth hook or custom SMTP configuration found in the repo | Dashboard-only Auth settings remain unverified |

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
than 400 days and cannot be restored.” No Supabase hosted restore or state change occurred.

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
and still require recovery/replacement through Discord/OneSignal account access.

The Render triggers and delivery logic are implemented. External delivery stays
unconfigured until a verified Discord webhook URL and/or OneSignal REST API key
are available. Old Expo push support is not re-enabled: it was deliberately
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
