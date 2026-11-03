# Everybody Polls todo

Updated November 2, 2026. The Render backend is running and the original data is
restored. Remaining work covers provider setup, client cutover, and release
verification. Deployment details are in [server/README.md](server/README.md);
recovery evidence is in [deploy/hook-recovery.md](deploy/hook-recovery.md) and
[deploy/recovery-import.md](deploy/recovery-import.md).

## Provider setup

- [x] Access the original Google Cloud project through the Collect Software
  browser profile and register Render's callback on the existing `web client prod`.
  The saved callback was reread; original origins, callbacks, and credentials
  were preserved. Evidence: [deploy/google-auth.json](deploy/google-auth.json).
- [ ] Enable the staged Google provider on the existing Render Auth service,
  deploy only Auth, and verify its settings and login with a controlled existing
  account. Include the website's `/delete` OAuth return path in the Auth redirect
  allowlist and test the browser return as part of that enablement. Production
  enable/deploy is awaiting explicit approval. Google is currently disabled;
  Apple remains enabled and signups remain disabled.
- [ ] Locate the owning account or organization for the original GitHub and
  Twitter apps, register the same Render callback, then enable/deploy and verify
  each provider. The current personal GitHub account does not list the source
  OAuth app. Keep Twitter on its recovered OAuth 1.0a API Key/API Secret setup.
- [ ] Discord is deferred at the user's request. Complete Discord sign-in and
  recover or recreate the poll-rotation webhook
  in its intended channel. Store `DISCORD_WEBHOOK_URL` on the existing cron
  service. Review queued events before enabling delivery; use a designated test
  channel for any delivery check.
- [ ] Configure email delivery for signup confirmations and other email Auth
  workflows. The original project had no custom SMTP or enabled custom Auth
  hooks to recover. Verify delivery to a controlled address.
- [ ] Enable new signups only after the required provider/email setup is ready,
  then verify signup and profile completion. Signups are currently disabled.

## App and website cutover

- [x] Point Expo/EAS build environments at Render using
  [deploy/mobile.env.example](deploy/mobile.env.example). Check build-profile
  inheritance and release configuration. Development, preview, and production
  now use Render; the legacy development flag no longer changes the API host.
- [x] Complete signed iOS build `1.0.12` and its matching simulator archive from
  source `fa3f61d`, including the account/notification/poll-flow fixes. Both
  succeeded on SDK 54/Xcode 26; [deploy/ios-render.md](deploy/ios-render.md).
- [x] Install the matching updated simulator archive while preserving app data.
  Verify the new embedded update launches, no-active-poll home/historical card,
  and denied notifications without an automatic prompt. The initial cutover
  archive also passed native Explore/results/map smoke; details retain both runs.
- [ ] On a controlled iOS device, verify Open device Settings and native Share
  results opening/cancellation. The new simulator launches correctly, but native
  input automation could not deliver clicks; focused app regressions pass.
- [ ] Verify real-device Apple login, each enabled OAuth provider, cold/warm
  callback handling, session refresh, sign-out, and profile completion against
  Render. Native configuration checks do not replace real-provider login.
- [ ] Rebuild and verify Android after the iOS pass; Android validation is deferred.
- [x] Update the sibling `everybody-polls-frontpage` deployment's
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, build/deploy it, and verify
  shared result links against Render. The refreshed site is live at
  https://www.everybodypolls.com; real positive/empty results and production
  browser-to-Render requests passed checks. Further filter coverage remains in
  the complete app-flow task below.
- [x] Respect denied notification permission without an automatic Settings
  prompt on home-screen mount. Enable notifications and Open device Settings
  are explicit actions; SDK permission requests use `fallbackToSettings=false`.
  Mounted/denied/cleanup behavior passes rendered regression tests. Physical
  device permission and delivery checks remain below.
- [ ] Verify EAS update download/relaunch on a controlled physical iOS device.
  Host preview manifest/bundle delivery passed; the local simulator timed out,
  so native smoke testing uses the fixed embedded archive.
- [ ] Register a controlled device with OneSignal and verify permission,
  subscription, APNs/FCM setup, and delivery to that test device. The non-sending estimate
  currently reports zero reachable push subscriptions. Avoid a test broadcast
  to the production audience.
- [x] Create the first new community poll on Render as a draft: **A free day:
  beach or mountains?** Choices: Beach / Mountains. It has no dates, is excluded
  from the public API/rotation, and queues no notifications. The 13 recovered
  polls and all original responses remain unchanged. Evidence:
  [deploy/community-poll.json](deploy/community-poll.json).
- [ ] Publish that draft with approved opening/closing dates after provider
  login, database retention, and device/release checks are ready. The operator
  tool rejects conflicting open/future voting windows; publishing can notify
  the production push audience.
- [x] Run the controlled app/API/Auth flow in a disposable real PostgreSQL/GoTrue
  stack: seven-step profile, vote, home/resume prediction, completion, close,
  reveal, demographic filtering, and actual map labels. A fresh account verifies
  server-backed profile refresh and viewing results without another account's
  vote. Fifty app regressions cover cache/account boundaries and native share
  payload/confirmation/error behavior; eleven real backend integration tests pass.
  The local fixture containers, volumes, and session file were removed afterward.
- [ ] Repeat authenticated voting/prediction on a controlled physical iOS device
  against Render after provider, database, and release prerequisites are ready.
  Use the draft's approved schedule and avoid test broadcasts to real users.
- [ ] Add a verified iOS App Store/TestFlight link when a public release is ready.
  The refreshed website now uses honest sample links and an iOS preparation
  status. Apple's existing app record has no public TestFlight link.

## Production and release

- [ ] Upgrade the existing Render database before launch/new production votes
  and before its **December 1, 2026** expiry. Verify backup retention and recovery
  for newly collected Render data; preserve the private original recovery archive.
- [ ] Rotate the Sentry upload token previously committed in `eas.json` and
  replace the stored EAS build secret. Its current literals and public app-config
  references have been removed; historical exposure still requires rotation.
  Never copy token values into issues or this checklist.
- [ ] Review and merge [PR #7](https://github.com/mmckeon16/everybody-votes/pull/7),
  confirm the intended release/deploy branch, and document the release procedure.
  Auto-deploy is currently off; the existing resources are managed through the
  Render API. Applying `render.yaml` as another stack would create duplicates.
- [ ] Verify production health/error and hook-failure monitoring, and decide
  whether the API's current idle sleep is acceptable for launch.

## App fixes and documentation

- [x] Treat the API's explicit no-active-poll response as empty data rather than
  an error, so the home screen shows the next-question state. Preserve other
  HTTP, session, and network failures; eight focused regression checks pass.

- [x] Pass actual ordered answer labels to the native results map, including
  zero-state data and arbitrary Beach/Mountains choices.
- [x] Handle missing, ended, failed, already-predicted, and vote-first states
  on the prediction screen. Protect authenticated/profile-complete routes,
  stop submissions at the deadline, and offer recovery navigation.
- [x] Move OneSignal initialization/permission setup out of the home screen's
  render body (`app/index.tsx`) and reduce verbose production logging.
- [x] Implement authenticated self-deletion on Render and the website, plus
  the app's Account menu (available before profile completion). Require explicit
  permanent-deletion confirmation; remove only the session owner's data, sessions,
  legacy refresh tokens, and user-linked Auth audit rows. Disposable real-Auth
  tests verify old-session rejection, an in-flight write race, and another
  account's preservation. The website's real local-backend browser flow passes;
  the live page has verified mobile layout/current sign-in options.
- [x] Scope app query caches to the signed-in account, refresh vote/prediction
  data after submission, and allow prediction resumption from home. Keep profile
  errors retryable, guard pending actions, and remove demographic debug logs.
  Verification and remaining release limits: [deploy/poll-flow.md](deploy/poll-flow.md).
- [x] Refresh the root development instructions so Render is the current backend
  path and the original Supabase setup is clearly historical/local reference.

## Completed

- [x] Upgrade the iOS app to Expo SDK 54 with compatible tracked dependencies,
  an Xcode 26 EAS image, a simulator profile, and fingerprinted runtime updates.
  Type checking, Expo doctor 18/18, iOS export, and native generation pass.
- [x] Remove the upload-token literals from current tracked config and public
  Expo configuration; scan the iOS export for the old literals. Token rotation
  remains pending above.
- [x] Confirm Everybody Polls already belongs to `collectsoftware`, alongside
  Better Saunum, Guitar Rudiments, and Recollect. Preserve the existing project
  and iOS bundle identifiers.
- [x] Renew the app and OneSignal extension App Store signing profiles using the
  existing valid team certificate. Entitlements/capabilities are unchanged;
  signing expires May 11, 2027.
- [x] Refresh and publish the community polling website, including a clearly
  labeled vote/predict/reveal sample and Render-backed shared results.
- [x] Create a separate Render project with API, private Auth, Postgres, and cron.
- [x] Apply Auth/application migrations and pass backend integration checks.
- [x] Recover and selectively restore the original accounts, identities, polls,
  profiles, votes, and predictions; preserve private backups outside Git.
- [x] Recreate durable poll activation/rotation events, retries, and sender logic.
- [x] Connect the dedicated OneSignal app key and verified push audience on Render.
- [x] Recover original Auth settings, configure native Apple, and stage the other
  provider credentials disabled. Native Apple configuration is verified; real
  device login remains on the list above.
- [x] Fix native/web OAuth return URLs and native cold-start code exchange; pass
  focused syntax/lifecycle checks and push the changes in PR #7.
