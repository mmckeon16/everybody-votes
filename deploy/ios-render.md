# iOS and Render

Everybody Polls already belongs to `collectsoftware`, the same Expo account as
Better Saunum, Guitar Rudiments, and Recollect. The original project is retained;
no transfer or duplicate project was needed.

| Setting | Value |
| --- | --- |
| Expo project | [@collectsoftware/everybody-polls](https://expo.dev/accounts/collectsoftware/projects/everybody-polls) |
| Project ID | `3812e77d-32fd-47d2-98a0-5b3426e1d1d1` |
| iOS bundle and URL scheme | `com.everybody.polls` |
| Apple team | `KF8643NB33` |
| App Store Connect app ID | `6740153201` |
| API and Auth gateway | `https://everybody-polls-api.onrender.com` |
| Website | https://www.everybodypolls.com |

## Build configuration

The iOS configuration targets Expo SDK 54 and the explicit EAS image
`macos-sequoia-15.6-xcode-26.0`, with Node `22.22.0` for the resolved client
dependencies. The prior SDK 52 dependency range no longer
resolved cleanly, and Apple's current App Store Connect upload requirements need
Xcode 26/iOS 26 SDK or later. This selects a compatible build environment without
using a moving `latest` image. See [Expo's infrastructure reference](https://docs.expo.dev/build-reference/infrastructure/)
and [Apple's upload requirements](https://developer.apple.com/news/upcoming-requirements/?id=02032026a).

`runtimeVersion` uses the fingerprint policy to keep SDK 54 updates separate from
older native binaries. Production uses remote build numbers and automatic
incrementing; the last completed historical iOS build was `1.0.8`.

Each build profile sets `APP_VARIANT` explicitly. The same value controls release
backend checks and OneSignal mode locally and on EAS, so runtime fingerprints
match. The default is production; use `APP_VARIANT=development` when running a
custom local backend. The simulator profile inherits preview settings.

```sh
npm ci
npm run typecheck
npx expo export --platform ios --output-dir /tmp/everybody-polls-ios-export
eas build --platform ios --profile production
# A simulator archive does not need device distribution signing:
eas build --platform ios --profile ios-simulator
```

The local Xcode 16.3 installation cannot produce a current submission archive;
use the configured EAS image for that archive. Existing installed binaries keep
their old compiled environment until a compatible new native build is installed.

## Backend cutover

The existing Expo project's development, preview, and production environments
were updated and reread on November 1, 2026:

- `EXPO_PUBLIC_SUPABASE_URL=https://everybody-polls-api.onrender.com`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY=everybody-polls-public`

The second value is a public application identifier. Real sessions are validated
by the Auth gateway. Auth and function requests share the same resolved backend
URL. The legacy development flag no longer silently sends function requests to
loopback. Release profiles reject a different backend/identifier.

Provider secrets and database credentials stay on Render. Sentry upload-token
literals and public app-config references were removed; rotating the previously
exposed token and replacing the EAS build secret remain required.

## iOS signing

The expired app and OneSignal notification-extension App Store profiles were
renewed using the account's existing valid team certificate. Both EAS bindings
were reread and verified; signing expires May 11, 2027. Entitlements match the old
profiles exactly, and Apple capabilities remain unchanged. Original profiles and
the old certificate were retained for rollback. No shared certificate was revoked.

The notification extension retains
`com.everybody.polls.OneSignalNotificationServiceExtension` and the shared group
`group.com.everybody.polls.onesignal`. Production push and Sign in with Apple
remain configured on the main target.

## Local verification

The SDK 54 source passes full TypeScript checking, Expo's compatible-dependency
check, Expo doctor 18/18, the iOS Metro/Hermes export, and production iOS native
generation. Generated bundle IDs and entitlements match the renewed profiles.
Resolved public configuration and the exported bundle were checked in memory
for the previous upload-token literals; none were present. These checks create
no users, votes, or provider messages. Production and simulator configurations
also produce matching local/cloud-equivalent fingerprints; release backend
guards reject loopback and other overrides.

## Current app flow archives

The signed [iOS build 1.0.12](https://expo.dev/accounts/collectsoftware/projects/everybody-polls/builds/45f6aef3-39d9-4d70-b1d2-3ce0a0d85521)
and matching [simulator archive](https://expo.dev/accounts/collectsoftware/projects/everybody-polls/builds/db2cd52e-c1a6-4e88-8542-342d27f45b1d)
finished successfully on November 2, 2026 (local time), from source
`fa3f61d14f4aa6472eda86a1595e51228a4b6414`. Both use runtime
`4552604ec675f0cd2cf12f262b242d01162e48ba`, the existing SDK 54/Xcode 26 setup,
and the Render backend. The simulator's native bundle version remains `1.0.0`;
EAS reports the paired remote build as `1.0.12`. No App Store submission was made.

These archives include authenticated account deletion, deliberate notification
opt-in, protected/recoverable prediction states and deadlines, actual map labels,
account-scoped cached results, prediction resumption, server-backed profile
refresh, and native Share results. Full TypeScript, 50 app tests across eleven
suites, and iOS Metro/Hermes export pass. The actual app/browser flow also passed
against disposable real PostgreSQL/Auth; see [poll-flow.md](poll-flow.md).

The new simulator archive was installed over the previous task-owned app,
preserving its guest data and denied notification permission. Cold launch loaded
the new embedded update, the no-current-poll home, and a recovered historical poll.
Notification denial shows the explicit Open device Settings button without an
automatic permission/Settings prompt. The compiled bundle contains Render's URL,
the public identifier, and the new account/Settings/share code. Expo records a
two successful embedded launches with zero failed launches. Evidence is in
[expo-ios.json](expo-ios.json).

Simulator input automation could not activate the window or deliver synthetic
clicks. The Settings-link and native share-chooser open/cancel checks therefore
remain on the controlled-device checklist; their focused app regressions pass.
Real-provider login, physical-device push delivery, and OTA transport remain
unverified. The following initial-cutover evidence is retained for reference.

## Initial cutover archives and native smoke test

The signed production [iOS build 1.0.11](https://expo.dev/accounts/collectsoftware/projects/everybody-polls/builds/95d07cf6-436e-43d5-a790-0ac0bbe9ec82)
and matching [simulator archive](https://expo.dev/accounts/collectsoftware/projects/everybody-polls/builds/84180e77-1baf-4355-ba11-1ced7c818aaa)
finished successfully on November 1, 2026, from commit
`9876d683d098bd78ffa2ed7e54bb50836576f607`. Both use SDK 54/Xcode 26,
the Render backend, and runtime `4552604ec675f0cd2cf12f262b242d01162e48ba`.
No App Store submission was made.

A clean install on a dedicated iPhone 16 Pro simulator (iOS 18.4) verified cold
launch, the no-current-poll home state, restored historical results, the native
Explore button, zero-vote totals, and map fallback. Its compiled bundle contains
the Render URL/public identifier and the empty-poll fix. Expo records one
successful embedded launch and zero failed launches. The simulator's native
bundle version remains `1.0.0`; EAS reports the paired remote build as `1.0.11`.
The signed production archive uses remote build numbering.

The smoke test caught the API's normal no-active-poll response being shown as an
error. The client now treats only the explicit `404 No active question found`
response as empty data; eight regression checks preserve other HTTP, session,
and network errors. The final archives embed this correction.

An iOS-only preview update was also published for the matching runtime. Host
manifest and bundle downloads returned HTTP 200, but the simulator's update
transport timed out. The final native smoke test used the fixed embedded archive.
Physical-device update delivery remains on the release checklist.

## Website and remaining release work

The refreshed website is published through its existing Netlify/GitHub connection.
Its build settings pin the Render URL/public identifier. Real production-browser
requests for positive and empty historical results returned HTTP 200, alongside
sample/navigation/mobile-layout checks. Practice poll choices are illustrative
and submit no real responses.

Apple's app record remains `PREPARE_FOR_SUBMISSION`, with an internal TestFlight
group and no public link. The website therefore shows an iOS preparation status.
Real-device Apple/OAuth login, update delivery, and push
subscription/delivery must be verified before announcing a release. Signups remain
disabled; other provider callbacks, Discord, email delivery, current poll content,
draft publication, and database upgrade are tracked in [TODO.md](../TODO.md).
