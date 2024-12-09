# Everybody Votes

This is a mono repo containing both a React Native Expo application and Supabase Edge Functions.

The project uses [Expo](https://expo.dev) for the mobile app (created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app)) and Supabase for the backend services.

## Project Structure

- `/app` - React Native Expo application
- `/supabase/functions` - Supabase Edge Functions

## Get started

1. Install dependencies

   ```bash
   npm install
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

## Supabase Setup

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

2. Update `.env` with your Supabase credentials:
   - Find your credentials in the Supabase dashboard under Project Settings > API
   - Update the following values:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## Supabase Edge Functions

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
