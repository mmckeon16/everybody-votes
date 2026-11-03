# Community poll and account deletion verification

The first new community poll is saved on Render as a draft:

- Question: **A free day: beach or mountains?**
- Choices: **Beach**, **Mountains**.
- ID: `c7d112d0-3e20-4e44-8da6-5be82714899a`.
- No voting dates, public exposure, activation event, or notification delivery.
- The 12 recovered accounts/profiles, 23 votes, and 23 predictions are unchanged.
- Database external access was restored to the original empty allowlist.

The sanitized database evidence is in [community-poll.json](community-poll.json).
The draft and publish operator commands are documented in
[server/README.md](../server/README.md#community-poll-drafts). Choose the opening
and closing times after launch prerequisites are ready; publishing queues the
configured activation/rotation notifications.

## Verification

`npm run test:integration:local` in `server/` builds a unique disposable Docker
stack with PostgreSQL 17 and the pinned GoTrue v2.195.0 image. It applies all four
migrations twice safely and removes only its own containers and volumes afterward.
Its community flow uses three controlled accounts with Beach/Mountains choices,
profile completion, vote-before-prediction checks, duplicate rejection, poll
closure, personal/public results, state/age filters, an empty filter result,
hook idempotency, draft invisibility, and conflicting/adjacent schedule checks.
No real notifications are sent.

Deletion tests create disposable accounts with two sessions, identities, legacy
refresh tokens, profiles, votes, predictions, push tokens, and user-linked Auth
audit rows. They verify self-only cleanup, preservation of another account,
rejection of old access/refresh tokens, and rejection of a previously authenticated
write that resumes after deletion. API deletion does not erase historical
recovery backups or platform logs; those follow their separate retention policy.

The website deletion page passed eight intercepted browser scenarios plus a
real local API/Auth browser flow: email/password sign-in, explicit confirmation,
deletion, scoped browser sign-out, and rejection of old credentials. The separate
fourth fixture account used by that check was removed; no production account or
provider configuration was touched. The published deletion page was also checked
at 390 px with real read-only Auth settings requests, native Apple instructions,
and disabled Google hidden. Website source: `6d32037e472436bef5cc20489b92785a604bb60c`.

Real-provider login, physical-device push delivery, and the release checklist
remain in [TODO.md](../TODO.md).
