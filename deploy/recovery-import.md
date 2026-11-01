# Selective Supabase recovery

The original paused project could not be resumed. Its May 4, 2025 database backup
was downloaded through the authenticated Dashboard and inspected without running
its SQL. The compressed original, sanitized hook evidence, metadata, and private
Render import report are preserved outside Git in the local
`everybody-votes-backups` directory alongside the app checkout.

The decompressed SQL SHA-256 is
`bef922fd45dd2064a3190fc4c05e6e1cf5e50a0f3fc9230900e5a2fba613d3b1`.
`server/import-backup.mjs` is bound to that exact source and the four seed-user
IDs in the committed seed file. It parses only allowlisted COPY data; it never
executes source SQL or restores Supabase platform DDL.

## Imported on November 1, 2026

| Data | Rows |
| --- | ---: |
| Auth users | 12 |
| Auth identities | 14 |
| Polls | 13 |
| Options | 24 |
| Demographic profiles | 12 |
| Votes | 23 |
| Predictions | 23 |

All 13 recovered polls are historical and inactive. A new/current poll must be
scheduled before live voting; the restore did not invent one.

IDs and relationships are preserved. The old votes/predictions had no question
ID column; each question ID was derived from its option. Four seed accounts were
excluded only after verifying their known IDs, expected seed state, and absence
of linked application data. No replacement accounts or passwords were created.

Old sessions, refresh tokens, pending Auth challenges, platform objects, cron,
and HTTP hooks were not restored. Two legacy Expo push tokens and 30 historical
rotation logs remain in the private archive. The source had no MFA or SSO state.
Provider credentials were not copied from identity claims. OAuth providers and
email delivery still need configuration before client cutover/signups.

## Transaction and verification

The importer defaults to a read-only destination check. Applying requires an
explicit option, a prepared validated plan, and empty destination tables. It
locks rotation/delivery jobs and destination tables, keeps foreign keys enabled,
and disables only the question notification trigger within its transaction.
Any failure rolls back both imported rows and the trigger change. It refuses a
second import into the populated database.

The operation used the existing Render database. Connection credentials stayed
in memory. External access was temporarily limited to this computer's IPv4 /32;
the TLS certificate was verified, and the original empty IP allow list was
restored and checked afterward. The free database still expires December 1,
2026; upgrade it before launch/accepting new production data.

The completed restore and the private report confirm the table counts above,
zero sessions/refresh tokens, zero hook events/deliveries, and enabled application
notification triggers. No email or real push/webhook delivery was sent.

A disposable PostgreSQL 17/GoTrue 2.195.0 rehearsal verified dry-run emptiness,
injected-failure rollback, trigger restoration, foreign keys, repeat-import
refusal, Auth reads of all users/identities, API history and vote aggregates, and
zero scheduled-job side effects. Its containers and volumes were removed.
Importer tests passed with the private fixture; no private source rows are in
Git. Live health, history, and sampled aggregate-result checks returned HTTP 200;
history contained all 13 polls and the result matched the original vote count.

For future recovery review, import the exported functions with an already
connected dedicated PostgreSQL Client. `parseBackup(path)` and
`prepareImport(parsed)` validate locally; `importBackup(client, prepared)` checks
the destination read-only. `{ apply: true }` is reserved for an empty replacement
database. Do not rerun it against the now-restored production database.
