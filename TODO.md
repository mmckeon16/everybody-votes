# Everybody Polls todo

Updated November 1, 2026. The Render backend is running and the original data is
restored. Remaining work covers provider setup, client cutover, and release
verification. Deployment details are in [server/README.md](server/README.md);
recovery evidence is in [deploy/hook-recovery.md](deploy/hook-recovery.md) and
[deploy/recovery-import.md](deploy/recovery-import.md).

## Provider setup

- [ ] Complete Google Cloud's fresh identity verification, confirm access to the
  original OAuth project/client, and register
  `https://everybody-polls-api.onrender.com/auth/v1/callback`. Google currently
  rejects this callback. Preserve existing callback entries, then enable Google
  on Auth, deploy, and verify login with a controlled account.
- [ ] Locate the owning account or organization for the original GitHub and
  Twitter apps, register the same Render callback, then enable/deploy and verify
  each provider. The current personal GitHub account does not list the source
  OAuth app. Keep Twitter on its recovered OAuth 1.0a API Key/API Secret setup.
- [ ] Complete Discord sign-in and recover or recreate the poll-rotation webhook
  in its intended channel. Store `DISCORD_WEBHOOK_URL` on the existing cron
  service. Review queued events before enabling delivery; use a designated test
  channel for any delivery check.
- [ ] Configure email delivery for signup confirmations and other email Auth
  workflows. The original project had no custom SMTP or enabled custom Auth
  hooks to recover. Verify delivery to a controlled address.
- [ ] Enable new signups only after the required provider/email setup is ready,
  then verify signup and profile completion. Signups are currently disabled.

## App and website cutover

- [ ] Point Expo/EAS build environments at Render using
  [deploy/mobile.env.example](deploy/mobile.env.example). Check build-profile
  inheritance and development URL overrides before producing a release;
  `EXPO_PUBLIC_ENV=development` forces API requests to loopback.
- [ ] Build and install iOS and Android clients. Verify real-device Apple login,
  each enabled OAuth provider, cold/warm callback handling, session refresh,
  sign-out, and profile completion against the Render backend. Full app type
  checking and native builds remain pending; focused callback checks passed.
- [ ] Update the sibling `everybody-polls-frontpage` deployment's
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, build/deploy it, and verify
  shared result links and demographic filters against Render.
- [ ] Register a controlled device with OneSignal and verify permission,
  subscription, APNs/FCM setup, and delivery to that test device. The non-sending estimate
  currently reports zero reachable push subscriptions. Avoid a test broadcast
  to the production audience.
- [ ] Schedule an approved current poll before live voting. All 13 recovered
  polls are historical/inactive. Check activation, close time, prediction
  eligibility, and rotation with controlled test data first.
- [ ] Run the complete app flow: login/signup, profile, vote, prediction, results,
  demographic filters, sharing, and poll rotation. Backend integration tests
  already pass; client-to-Render verification is still pending. Include account
  switching and post-vote UI refresh to check session-scoped cached data.
- [ ] Wire the website's iOS/Android download buttons in
  `src/components/sections/HeroSection.tsx` to the released app store pages.

## Production and release

- [ ] Upgrade the existing Render database before launch/new production votes
  and before its **December 1, 2026** expiry. Verify backup retention and recovery
  for newly collected Render data; preserve the private original recovery archive.
- [ ] Rotate the Sentry upload token committed in `eas.json`, remove its literals
  from tracked build profiles, and keep the replacement in build secrets. Remove
  `SENTRY_AUTH_TOKEN` from `app.config.ts` public `extra`; it belongs only in the
  build/upload process. Never copy token values into issues or this checklist.
- [ ] Review and merge [PR #7](https://github.com/mmckeon16/everybody-votes/pull/7),
  confirm the intended release/deploy branch, and document the release procedure.
  Auto-deploy is currently off; the existing resources are managed through the
  Render API. Applying `render.yaml` as another stack would create duplicates.
- [ ] Verify production health/error and hook-failure monitoring, and decide
  whether the API's current idle sleep is acceptable for launch.

## App fixes and documentation

- [ ] Add an explicit no-active-poll state to the vote
  and prediction screens (`app/screens/vote/index.tsx` and
  `app/screens/predict/index.tsx`) instead of leaving empty screens between polls.
- [ ] Move OneSignal initialization/permission setup out of the home screen's
  render body (`app/index.tsx`) and reduce verbose production logging.
- [ ] Finish the authenticated account-deletion flow. The website's
  `src/pages/Delete.tsx` currently shows a disabled placeholder; verify the
  backend and app behavior and finish this release gap before relaunch.
- [ ] Refresh the root development instructions so Render is the current backend
  path and the original Supabase setup is clearly historical/local reference.

## Completed

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
