# Recovered Supabase hook behavior

Evidence checked on November 1, 2026: all fetched Git branches/history, 901
historical source/config blobs, Expo project/account variables across production,
preview, and development, and GitHub Actions secret names. Secret values are
not recorded here.

| Event | Recovered behavior | Render equivalent |
| --- | --- | --- |
| Scheduled poll rotation | Original SQL ran daily at 12:00 UTC, deactivated expired questions, and logged actual changes | Cron checks every minute against poll timestamps and records only actual changes or failures |
| Rotation log created | `question-rotation-notification` sent a Discord report containing execution time, deactivation count, new question text/period, or an error | Durable `question.rotation` events with a snapshot of the activated question; delivery uses `DISCORD_WEBHOOK_URL` |
| Question becomes active | Earlier versions invoked `push-notifications` and sent “New Poll!” through Expo to saved push tokens | Durable `question.activated` event; current sender uses the app's latest OneSignal integration |
| Authentication hooks | No enabled custom Auth hook or custom SMTP configuration found in the repo | Dashboard-only Auth settings remain unverified |

The rotation-log-to-Discord dashboard binding is inferred from the Edge Function
reading the newest rotation log and reporting its outcome. The source proves the
sender and payload; the exact dashboard webhook definition remains unverified.

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

The old Supabase hostname `nkaenbgnlfcqzjqnforj.supabase.co` did not resolve during
initial access checks. No Supabase account is currently connected. Account access
is needed to inspect remaining project/dashboard metadata; installing/connecting
the Supabase integration is the available recovery path. Function secret APIs
may expose only names/digests rather than recoverable values, so project access
does not guarantee the original secret values can be retrieved.

The Render triggers and delivery logic are implemented. External delivery stays
unconfigured until a verified Discord webhook URL and/or OneSignal REST API key
are available. Old Expo push support is not re-enabled: it was deliberately
removed from the latest mobile app. No real notification was sent during recovery
tests. Receivers deduplicate generic events by event ID; OneSignal requests retain
the same idempotency key during retries.

Validation: four unit tests and nine integration tests pass against disposable
PostgreSQL 17 and Supabase Auth, including migration reruns, rotation snapshots,
provider payloads, HTTP-200 rejection receipts, and independent delivery retries.
All provider calls in the integration tests are mocked.
