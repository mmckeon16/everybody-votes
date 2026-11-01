# Everybody Votes

Make your voice heard!

This is an app to vote on questions and see the results. See results based on demographics.

This repository contains the React Native Expo app and its Render backend. The
original Supabase Edge Functions remain as historical reference.

The app uses [Expo](https://expo.dev). Render hosts its Node API, PostgreSQL,
private Supabase Auth, and scheduled poll jobs. Start with
[server/README.md](server/README.md) for the deployed backend and
[deploy/ios-render.md](deploy/ios-render.md) for the iOS configuration.

## Project Structure

- `/app` - React Native Expo application
- `/server` - Render API, migrations, recovery importer, and jobs
- `/deploy` - Deployment settings and recovery/runbooks
- `/supabase/functions` - Historical Supabase Edge Functions

## Get started

1. Install dependencies

   ```bash
   npm ci
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Historical Supabase local development

These commands are for the original local backend. The deployed application uses
Render; they are not the production deployment path.

1. Install Supabase CLI

   ```bash
   # macOS
   brew install supabase/tap/supabase

   # Windows (requires scoop)
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

2. Login to Supabase

   ```bash
   supabase login
   ```

3. Initialize Supabase (if not already done)

   ```bash
   supabase init
   ```

4. Start Supabase locally
   ```bash
   supabase start
   ```

## Environment Setup

1. Copy the environment template

   ```bash
   cp .env.sample .env
   ```

2. The template uses the current Render API and public application identifier.
   For release builds, use the matching EAS project environment and build profile.
   Keep provider credentials, database URLs, and Sentry upload tokens out of
   `EXPO_PUBLIC_*` values and app `extra`.

## Historical Supabase Edge Functions

To develop and deploy Edge Functions:

1. Create a new function

   ```bash
   supabase functions new my-function
   ```

2. Serve functions locally

   ```bash
   supabase functions serve
   ```

3. Deploy functions
   ```bash
   supabase functions deploy my-function
   ```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

NOTE: we've done this, and removed the sample project code

## Generating Builds

### iOS

Everybody Polls is already linked to `@collectsoftware/everybody-polls`.
Preview/production builds target the Render backend. See
[the iOS runbook](deploy/ios-render.md) for signing, runtime compatibility, and
verification details.

```bash
eas build --platform ios --profile production
```

Use `ios-simulator` for a simulator archive. Store distribution and real-device
provider testing are separate from producing the native archive.

### Android

```bash
npx eas build --platform android --profile preview
```

or

```bash
eas build --platform android
```

For locally testing the build

```bash
eas build --profile development --platform android --local
```

## Learn more

To learn more about developing your project, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
- [Supabase documentation](https://supabase.com/docs): Learn about Supabase features and Edge Functions.

## Join the community

Join our community of developers:

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
- [Supabase on GitHub](https://github.com/supabase/supabase): View Supabase's open source platform.

## Add prettier to your vscode setup

Modify your settings.json to have the following:

```
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
```

## Render backend

The Render recreation is configured in `render.yaml`. See [server/README.md](server/README.md) for deployment, database migrations, authentication, notification hooks, and local verification. The original `supabase/` sources remain as migration history and reference.

Remaining setup and release work is tracked in [TODO.md](TODO.md).
