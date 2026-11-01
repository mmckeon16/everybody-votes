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
no users, votes, or provider messages.

## Website and remaining release work

The refreshed website is published through its existing Netlify/GitHub connection.
Its build settings pin the Render URL/public identifier. Real production-browser
requests for positive and empty historical results returned HTTP 200, alongside
sample/navigation/mobile-layout checks. Practice poll choices are illustrative
and submit no real responses.

Apple's app record remains `PREPARE_FOR_SUBMISSION`, with an internal TestFlight
group and no public link. The website therefore shows an iOS preparation status.
Native archive completion, installation, real-device Apple/OAuth login, and push
subscription/delivery must be verified before announcing a release. Signups remain
disabled; other provider callbacks, Discord, email delivery, current poll content,
and database upgrade are tracked in [TODO.md](../TODO.md).
